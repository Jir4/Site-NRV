export const initializePhotoStack = (stack: HTMLElement) => {
  const images = Array.from(stack.querySelectorAll<HTMLImageElement>(".photo-stack__image"));

  if (images.length < 2) return;

  const interval = Number(stack.dataset.interval ?? 2500);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let currentIndex = 0;
  let timer: number | undefined;
  let isVisible = true;
  let isDocumentVisible = !document.hidden;

  const updatePositions = () => {
    images.forEach((image, index) => {
      const position = (index - currentIndex + images.length) % images.length;
      const isActive = position === 0;

      image.dataset.position = String(position);
      image.alt = isActive ? (image.dataset.alt ?? "") : "";
      image.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
  };

  const start = () => {
    if (reducedMotion.matches || timer !== undefined || !isVisible || !isDocumentVisible) return;

    timer = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      updatePositions();
    }, interval);
  };

  const stop = () => {
    if (timer === undefined) return;

    window.clearInterval(timer);
    timer = undefined;
  };

  stack.addEventListener("mouseenter", stop);
  stack.addEventListener("mouseleave", start);
  stack.addEventListener("focusin", stop);
  stack.addEventListener("focusout", start);

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      isVisible ? start() : stop();
    });

    visibilityObserver.observe(stack);
  }

  document.addEventListener("visibilitychange", () => {
    isDocumentVisible = !document.hidden;
    isDocumentVisible ? start() : stop();
  });

  reducedMotion.addEventListener("change", () => {
    stop();
    start();
  });

  updatePositions();
  start();
};

export const initializePhotoStacks = () => {
  document.querySelectorAll<HTMLElement>("[data-photo-stack]").forEach(initializePhotoStack);
};
