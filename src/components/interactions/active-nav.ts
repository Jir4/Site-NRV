export const initializeActiveNav = () => {
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>("[data-section-link]")];
  const trackedSections = navLinks
    .map((link) => document.querySelector<HTMLElement>(link.getAttribute("href") ?? ""))
    .filter(Boolean);
  const heroSection = document.querySelector<HTMLElement>("#accueil");
  const observedSections = [heroSection, ...trackedSections].filter(Boolean);

  if (navLinks.length === 0 || observedSections.length === 0) return;

  const setActiveLink = (sectionId: string | null) => {
    navLinks.forEach((link) => {
      const isActive = sectionId !== null && link.getAttribute("href") === `#${sectionId}`;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) {
        setActiveLink(visible.target.id === "accueil" ? null : visible.target.id);
      }
    },
    { rootMargin: "-30% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] },
  );

  observedSections.forEach((section) => observer.observe(section));
};
