const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const DESKTOP_QUERY = "(min-width: 541px) and (hover: hover) and (pointer: fine)";

let isInitialized = false;

const isDesktopVersion = () => window.matchMedia(DESKTOP_QUERY).matches;
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollToPresidentCard = () => {
  const card = document.querySelector<HTMLElement>("[data-konami-president-card]");
  if (!card) return;

  card.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "center",
    inline: "nearest",
  });
};

const setBackFaceEnabled = (enabled: boolean) => {
  const shouldEnableControls = enabled && isDesktopVersion();

  document.querySelectorAll<HTMLElement>("[data-konami-back]").forEach((backFace) => {
    backFace.setAttribute("aria-hidden", String(!shouldEnableControls));
  });

  document
    .querySelectorAll<HTMLElement>("[data-konami-reset], [data-konami-expand]")
    .forEach((button) => {
      if (shouldEnableControls) {
        button.removeAttribute("tabindex");
      } else {
        button.setAttribute("tabindex", "-1");
      }
    });
};

const closeLightbox = () => {
  const dialog = document.querySelector<HTMLDialogElement>("[data-konami-dialog]");
  if (dialog?.open) dialog.close();
};

const openLightbox = () => {
  if (!isDesktopVersion()) return;

  const dialog = document.querySelector<HTMLDialogElement>("[data-konami-dialog]");
  if (dialog && !dialog.open && typeof dialog.showModal === "function") {
    dialog.showModal();
  }
};

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest("input, textarea, select") || target.isContentEditable,
  );
};

const unlockPresidentPortrait = () => {
  document.documentElement.classList.add("is-konami-unlocked");
  setBackFaceEnabled(true);
  window.requestAnimationFrame(scrollToPresidentCard);
};

const lockPresidentPortrait = () => {
  document.documentElement.classList.remove("is-konami-unlocked");
  setBackFaceEnabled(false);
  closeLightbox();
};

export const initializeKonamiPresident = () => {
  if (isInitialized) return;
  isInitialized = true;

  let progress = 0;
  const desktopMedia = window.matchMedia(DESKTOP_QUERY);

  setBackFaceEnabled(false);

  desktopMedia.addEventListener("change", () => {
    if (!desktopMedia.matches) {
      lockPresidentPortrait();
      progress = 0;
      return;
    }

    setBackFaceEnabled(
      document.documentElement.classList.contains("is-konami-unlocked"),
    );
  });

  document.querySelectorAll("[data-konami-reset]").forEach((button) => {
    button.addEventListener("click", lockPresidentPortrait);
  });

  document.querySelectorAll("[data-konami-expand]").forEach((button) => {
    button.addEventListener("click", openLightbox);
  });

  document.querySelectorAll("[data-konami-dialog-close]").forEach((button) => {
    button.addEventListener("click", closeLightbox);
  });

  document.querySelectorAll<HTMLDialogElement>("[data-konami-dialog]").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeLightbox();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (!isDesktopVersion()) return;
    if (isTypingTarget(event.target)) return;

    if (event.key === KONAMI_SEQUENCE[progress]) {
      progress += 1;
    } else {
      progress = event.key === KONAMI_SEQUENCE[0] ? 1 : 0;
    }

    if (progress === KONAMI_SEQUENCE.length) {
      unlockPresidentPortrait();
      progress = 0;
    }
  });
};
