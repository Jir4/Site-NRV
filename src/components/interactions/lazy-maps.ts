type LeafletApi = {
  divIcon: (options: Record<string, unknown>) => unknown;
  map: (container: Element, options: Record<string, unknown>) => {
    setView: (coordinates: [number, number], zoom: number) => unknown;
  };
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: unknown) => void };
  control: { attribution: (options: Record<string, unknown>) => { addTo: (map: unknown) => void } };
  marker: (coordinates: [number, number], options: Record<string, unknown>) => {
    addTo: (map: unknown) => { bindPopup: (title: string) => void };
  };
};

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

let leafletPromise: Promise<unknown> | undefined;

const loadStylesheet = (href: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = reject;
    document.head.append(link);
  });

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.append(script);
  });

const loadLeaflet = () => {
  if (window.L) return Promise.resolve();

  leafletPromise ??= Promise.all([
    loadStylesheet("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"),
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"),
  ]);

  return leafletPromise;
};

export const initializeLazyMaps = () => {
  const mapContainers = [...document.querySelectorAll<HTMLElement>("[data-map]")];
  let mapsInitialized = false;

  const initializeMaps = async () => {
    if (mapsInitialized || mapContainers.length === 0) return;

    mapsInitialized = true;
    await loadLeaflet();

    mapContainers.forEach((container) => {
      if (!window.L) return;

      const lat = Number(container.dataset.lat);
      const lon = Number(container.dataset.lon);
      const title = container.dataset.title || "Lieu d’entraînement";
      const markerIcon = window.L.divIcon({
        className: "club-map-marker",
        html: "<span></span>",
        iconSize: [30, 38],
        iconAnchor: [15, 34],
        popupAnchor: [0, -32],
      });
      const map = window.L.map(container, {
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lon], 15);

      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);

      window.L.control.attribution({ prefix: false }).addTo(map);
      window.L.marker([lat, lon], { icon: markerIcon }).addTo(map).bindPopup(title);
    });
  };

  if ("IntersectionObserver" in window && mapContainers.length > 0) {
    const mapObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        mapObserver.disconnect();
        initializeMaps();
      },
      { rootMargin: "500px 0px" },
    );

    mapContainers.forEach((container) => mapObserver.observe(container));
  } else {
    initializeMaps();
  }
};
