const ROTATION_INTERVAL = 5000;
const FADE_DURATION = 180;

let isInitialized = false;

type GalleryImage = {
  index: number;
  src: string;
  srcset: string;
  sizes: string;
  alt: string;
};

const copyImageAttributes = (target: HTMLImageElement, source: GalleryImage) => {
  target.sizes = source.sizes;
  target.srcset = source.srcset;
  target.src = source.src;
  target.alt = source.alt;
};

const preloadImage = async (source: GalleryImage) => {
  const image = new Image();
  image.sizes = source.sizes;
  image.srcset = source.srcset;
  image.src = source.src;

  if (image.complete) return;

  if (typeof image.decode === "function") {
    await image.decode();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => reject(), { once: true });
  });
};

const getVisibleIndexes = (slots: HTMLButtonElement[]) =>
  new Set(slots.map((slot) => Number(slot.dataset.galleryCurrentIndex)));

export const initializeGallery = () => {
  if (isInitialized) return;
  isInitialized = true;

  const slots = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-gallery-slot]"));
  const sources = Array.from(document.querySelectorAll<HTMLImageElement>("[data-gallery-source]"))
    .map((image) => ({
      index: Number(image.dataset.galleryIndex),
      src: image.currentSrc || image.src,
      srcset: image.srcset,
      sizes: image.sizes,
      alt: image.alt,
    }))
    .filter((image) => Number.isFinite(image.index));

  const dialog = document.querySelector<HTMLDialogElement>("[data-gallery-dialog]");
  const lightboxImage = document.querySelector<HTMLImageElement>("[data-gallery-lightbox-image]");
  const closeButton = document.querySelector<HTMLButtonElement>("[data-gallery-close]");
  const previousButton = document.querySelector<HTMLButtonElement>("[data-gallery-prev]");
  const nextButton = document.querySelector<HTMLButtonElement>("[data-gallery-next]");

  if (!slots.length || !sources.length || !dialog || !lightboxImage) return;

  let slotCursor = 0;
  let sourceCursor = slots.length;
  let activeIndex = 0;
  let isRotating = false;

  const setLightboxImage = (index: number) => {
    const source = sources[index];
    if (!source) return;

    activeIndex = index;
    copyImageAttributes(lightboxImage, source);
  };

  const openLightbox = (index: number) => {
    setLightboxImage(index);

    if (!dialog.open && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  };

  const closeLightbox = () => {
    if (dialog.open) dialog.close();
  };

  const showNextImage = (direction: 1 | -1) => {
    const nextIndex = (activeIndex + direction + sources.length) % sources.length;
    setLightboxImage(nextIndex);
  };

  slots.forEach((slot) => {
    slot.addEventListener("click", () => {
      const index = Number(slot.dataset.galleryCurrentIndex);
      if (Number.isFinite(index)) openLightbox(index);
    });
  });

  closeButton?.addEventListener("click", closeLightbox);
  previousButton?.addEventListener("click", () => showNextImage(-1));
  nextButton?.addEventListener("click", () => showNextImage(1));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLightbox();
  });

  window.addEventListener("keydown", (event) => {
    if (!dialog.open) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showNextImage(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextImage(1);
    }
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches || sources.length <= slots.length) return;

  window.setInterval(async () => {
    if (isRotating) return;

    const slot = slots[slotCursor % slots.length];
    const image = slot.querySelector<HTMLImageElement>("[data-gallery-image]");
    const visibleIndexes = getVisibleIndexes(slots);

    let nextSource = sources[sourceCursor % sources.length];
    let attempts = 0;

    while (visibleIndexes.has(nextSource.index) && attempts < sources.length) {
      sourceCursor += 1;
      attempts += 1;
      nextSource = sources[sourceCursor % sources.length];
    }

    if (!image || visibleIndexes.has(nextSource.index)) return;

    isRotating = true;

    try {
      await preloadImage(nextSource);
    } catch {
      sourceCursor += 1;
      isRotating = false;
      return;
    }

    slot.classList.add("is-changing");

    window.setTimeout(() => {
      copyImageAttributes(image, nextSource);
      slot.dataset.galleryCurrentIndex = String(nextSource.index);
      slot.setAttribute("aria-label", `Agrandir ${nextSource.alt}`);
      slot.classList.remove("is-changing");
      isRotating = false;
    }, FADE_DURATION);

    slotCursor += 1;
    sourceCursor += 1;
  }, ROTATION_INTERVAL);
};
