export const initializeEasterEgg = () => {
  const trigger = document.querySelector<HTMLElement>("[data-egg]");
  const wheel = document.querySelector<HTMLElement>(".egg");

  trigger?.addEventListener("click", () => {
    wheel?.classList.remove("run");
    void wheel?.clientWidth;
    wheel?.classList.add("run");
  });
};
