export const initializeScrollProgress = () => {
  const progressBar = document.querySelector<HTMLElement>(".scroll-progress");
  let ticking = false;

  if (!progressBar) return;

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

    progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
    ticking = false;
  };

  updateProgress();
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(updateProgress);
    },
    { passive: true },
  );
};
