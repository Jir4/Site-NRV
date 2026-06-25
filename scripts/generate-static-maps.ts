import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { site } from "../src/data/site";

type GeocodingCache = Record<
  string,
  {
    address: string;
    lat: number;
    lon: number;
    displayName?: string;
  }
>;

type MapManifest = Record<string, { signature: string }>;

const TILE_SIZE = 256;
const ZOOM = 15;
const MAP_WIDTH = 800;
const MAP_HEIGHT = 480;
const TILE_STYLE = "carto-light-all";
const MARKER_STYLE = "club-marker-v1";
const OUTPUT_DIR = path.join(process.cwd(), "public", "generated", "maps");
const CACHE_PATH = path.join(process.cwd(), "src", "data", "geocoded-locations.json");
const MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.json");
const SUBDOMAINS = ["a", "b", "c", "d"];
const FORCE_REGENERATE = process.argv.includes("--force");
const CLEAN_ORPHANS = process.argv.includes("--clean");
const LOCATION_ID_PATTERN = /^[a-z0-9-]+$/;

const lonToPixelX = (lon: number, zoom: number) =>
  ((lon + 180) / 360) * TILE_SIZE * 2 ** zoom;

const latToPixelY = (lat: number, zoom: number) => {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return (
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
    TILE_SIZE *
    2 ** zoom
  );
};

const createMarkerSvg = () => `
<svg width="92" height="112" viewBox="0 0 92 112" xmlns="http://www.w3.org/2000/svg">
  <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
    <feDropShadow dx="0" dy="12" stdDeviation="8" flood-color="#101510" flood-opacity="0.28"/>
  </filter>
  <g transform="translate(46 50) rotate(-45)" filter="url(#shadow)">
    <path d="M-19 -19 H19 V19 H-19 Z" rx="19" fill="#95c23d" stroke="#fff" stroke-width="7"/>
    <circle cx="0" cy="0" r="9" fill="#101510" fill-opacity="0.82"/>
  </g>
</svg>`;

const readJsonFile = async <T>(filePath: string, fallback: T) => {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(await readFile(filePath, "utf8")) as T;
};

const writeJsonFile = async (filePath: string, data: unknown) => {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const validateLocations = () => {
  const locationIds = new Set<string>();

  for (const location of site.locations) {
    if (!location.id.trim()) {
      throw new Error(`Location "${location.name}" has an empty id.`);
    }

    if (!LOCATION_ID_PATTERN.test(location.id)) {
      throw new Error(
        `Invalid location id "${location.id}". Use lowercase letters, numbers and hyphens only.`,
      );
    }

    if (!location.address.trim()) {
      throw new Error(`Location "${location.id}" has an empty address.`);
    }

    if (locationIds.has(location.id)) {
      throw new Error(`Duplicate location id "${location.id}".`);
    }

    locationIds.add(location.id);
  }

  for (const group of site.groups) {
    for (const slot of group.schedule) {
      for (const locationId of slot.locationIds) {
        if (!locationIds.has(locationId)) {
          throw new Error(
            `Unknown location id "${locationId}" in ${group.name} schedule (${slot.label}).`,
          );
        }
      }
    }
  }
};

const validateCacheEntry = (locationId: string, entry: unknown) => {
  if (!entry || typeof entry !== "object") {
    throw new Error(`Geocoding cache entry "${locationId}" must be an object.`);
  }

  const coordinates = entry as Partial<GeocodingCache[string]>;

  if (typeof coordinates.address !== "string") {
    throw new Error(`Geocoding cache entry "${locationId}" has an invalid address.`);
  }

  if (!coordinates.address.trim()) {
    throw new Error(`Geocoding cache entry "${locationId}" has an empty address.`);
  }

  if (
    typeof coordinates.lat !== "number" ||
    !Number.isFinite(coordinates.lat) ||
    coordinates.lat < -90 ||
    coordinates.lat > 90
  ) {
    throw new Error(`Geocoding cache entry "${locationId}" has an invalid latitude.`);
  }

  if (
    typeof coordinates.lon !== "number" ||
    !Number.isFinite(coordinates.lon) ||
    coordinates.lon < -180 ||
    coordinates.lon > 180
  ) {
    throw new Error(`Geocoding cache entry "${locationId}" has an invalid longitude.`);
  }
};

const validateCache = (cache: GeocodingCache) => {
  for (const [locationId, entry] of Object.entries(cache)) {
    validateCacheEntry(locationId, entry);
  }
};

const geocodeAddress = async (location: (typeof site.locations)[number]) => {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "fr");
  url.searchParams.set("q", location.address);

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "fr",
      "User-Agent": "NancyRollerVitesse static map generator (nancyrollervitesse@gmail.com)",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed for "${location.id}": HTTP ${response.status}`);
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name?: string;
  }>;
  const result = results[0];

  if (!result) {
    throw new Error(`No geocoding result for "${location.id}" (${location.address}).`);
  }

  console.log(`geocoded ${location.id}: ${result.display_name ?? location.address}`);

  return {
    address: location.address,
    lat: Number(result.lat),
    lon: Number(result.lon),
    displayName: result.display_name,
  };
};

const getCoordinates = async (
  location: (typeof site.locations)[number],
  cache: GeocodingCache,
) => {
  const cached = cache[location.id];

  if (cached?.address === location.address) {
    return cached;
  }

  if (cached) {
    console.log(`address changed for ${location.id}: refreshing geocoding`);
  } else {
    console.log(`missing geocoding for ${location.id}: resolving address`);
  }

  await delay(1100);
  const coordinates = await geocodeAddress(location);
  cache[location.id] = coordinates;
  await writeJsonFile(CACHE_PATH, cache);

  return coordinates;
};

const getTileUrl = (x: number, y: number) => {
  const subdomain = SUBDOMAINS[Math.abs(x + y) % SUBDOMAINS.length];
  return `https://${subdomain}.basemaps.cartocdn.com/light_all/${ZOOM}/${x}/${y}.png`;
};

const fetchTile = async (x: number, y: number) => {
  const url = getTileUrl(x, y);
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await delay(attempt * 400);
      }
    }
  }

  throw new Error(`Unable to fetch tile ${x}/${y} from ${url}: ${String(lastError)}`);
};

const getMapSignature = (
  location: (typeof site.locations)[number],
  coordinates: GeocodingCache[string],
) =>
  createHash("sha256")
    .update(
      JSON.stringify({
        id: location.id,
        name: location.name,
        address: location.address,
        lat: coordinates.lat,
        lon: coordinates.lon,
        zoom: ZOOM,
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        tileStyle: TILE_STYLE,
        markerStyle: MARKER_STYLE,
      }),
    )
    .digest("hex");

const generateMap = async (
  location: (typeof site.locations)[number],
  coordinates: GeocodingCache[string],
  manifest: MapManifest,
) => {
  const outputPath = path.join(OUTPUT_DIR, `${location.id}.webp`);
  const signature = getMapSignature(location, coordinates);

  if (!FORCE_REGENERATE && existsSync(outputPath) && manifest[location.id]?.signature === signature) {
    console.log(`skip ${location.id}: up to date`);
    return;
  }

  const centerX = lonToPixelX(coordinates.lon, ZOOM);
  const centerY = latToPixelY(coordinates.lat, ZOOM);
  const left = centerX - MAP_WIDTH / 2;
  const top = centerY - MAP_HEIGHT / 2;
  const firstTileX = Math.floor(left / TILE_SIZE);
  const firstTileY = Math.floor(top / TILE_SIZE);
  const lastTileX = Math.floor((left + MAP_WIDTH) / TILE_SIZE);
  const lastTileY = Math.floor((top + MAP_HEIGHT) / TILE_SIZE);

  const composites = [];

  for (let tileX = firstTileX; tileX <= lastTileX; tileX += 1) {
    for (let tileY = firstTileY; tileY <= lastTileY; tileY += 1) {
      composites.push({
        input: await fetchTile(tileX, tileY),
        left: Math.round(tileX * TILE_SIZE - left),
        top: Math.round(tileY * TILE_SIZE - top),
      });
    }
  }

  composites.push({
    input: Buffer.from(createMarkerSvg()),
    left: Math.round(MAP_WIDTH / 2 - 46),
    top: Math.round(MAP_HEIGHT / 2 - 96),
  });

  await sharp({
    create: {
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      channels: 4,
      background: "#eef3ec",
    },
  })
    .composite(composites)
    .webp({ quality: 86 })
    .toFile(outputPath);

  manifest[location.id] = { signature };
  console.log(`generated ${path.relative(process.cwd(), outputPath)}`);
};

const handleOrphans = async (cache: GeocodingCache, manifest: MapManifest) => {
  const activeIds = new Set(site.locations.map((location) => location.id));
  const files = await readdir(OUTPUT_DIR);
  const orphanImages = files.filter(
    (file) => file.endsWith(".webp") && !activeIds.has(path.basename(file, ".webp")),
  );

  for (const file of orphanImages) {
    const filePath = path.join(OUTPUT_DIR, file);

    if (CLEAN_ORPHANS) {
      await unlink(filePath);
      console.log(`removed orphan map ${file}`);
    } else {
      console.warn(`orphan map ${file}: use --clean to remove it`);
    }
  }

  for (const cacheId of Object.keys(cache)) {
    if (!activeIds.has(cacheId)) {
      if (CLEAN_ORPHANS) {
        delete cache[cacheId];
        console.log(`removed orphan geocoding cache entry ${cacheId}`);
      } else {
        console.warn(`orphan geocoding cache entry ${cacheId}: use --clean to remove it`);
      }
    }
  }

  for (const manifestId of Object.keys(manifest)) {
    if (!activeIds.has(manifestId)) {
      if (CLEAN_ORPHANS) {
        delete manifest[manifestId];
        console.log(`removed orphan map manifest entry ${manifestId}`);
      } else {
        console.warn(`orphan map manifest entry ${manifestId}: use --clean to remove it`);
      }
    }
  }
};

const main = async () => {
  validateLocations();
  await mkdir(OUTPUT_DIR, { recursive: true });

  const cache = await readJsonFile<GeocodingCache>(CACHE_PATH, {});
  const manifest = await readJsonFile<MapManifest>(MANIFEST_PATH, {});
  validateCache(cache);

  for (const location of site.locations) {
    const coordinates = await getCoordinates(location, cache);
    await generateMap(location, coordinates, manifest);
  }

  await handleOrphans(cache, manifest);
  await writeJsonFile(CACHE_PATH, cache);
  await writeJsonFile(MANIFEST_PATH, manifest);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
