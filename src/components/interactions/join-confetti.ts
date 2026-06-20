const confettiColors = ["#95c23d", "#d7ff79", "#ffffff", "#101510"];

const launchClubConfetti = (source: Element, reducedMotion: MediaQueryList) => {
  if (reducedMotion.matches) return;

  const rect = source.getBoundingClientRect();
  const count = 50;

  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    const originX = rect.left + rect.width * (0.25 + Math.random() * 0.5);
    const originY = rect.top + rect.height * (0.25 + Math.random() * 0.5);
    const size = 6 + Math.random() * 7;
    const duration = 1400 + Math.random() * 500;
    const delay = Math.random() * 100;
    const angle = (-135 + Math.random() * 90) * (Math.PI / 180);
    const speed = 380 + Math.random() * 260;

    let x = 0;
    let y = 0;
    let velocityX = Math.cos(angle) * speed;
    let velocityY = Math.sin(angle) * speed;

    const gravity = 950;
    const drag = 1.15 + Math.random() * 0.45;
    const wind = -30 + Math.random() * 60;
    const rotationStart = Math.random() * 360;
    const rotationSpeed = -520 + Math.random() * 1040;
    const flutterSpeed = 3 + Math.random() * 4;
    const flutterPhase = Math.random() * Math.PI * 2;
    const keyframes: Keyframe[] = [];
    const steps = 24;
    const durationSeconds = duration / 1000;
    const deltaTime = durationSeconds / steps;

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const time = progress * durationSeconds;

      if (step > 0) {
        const damping = Math.exp(-drag * deltaTime);
        velocityX += wind * deltaTime;
        velocityY += gravity * deltaTime;
        velocityX *= damping;
        velocityY *= damping;
        x += velocityX * deltaTime;
        y += velocityY * deltaTime;
      }

      const flip = Math.cos(time * Math.PI * 2 * flutterSpeed + flutterPhase);
      const rotation = rotationStart + rotationSpeed * time;

      keyframes.push({
        offset: progress,
        opacity: progress < 0.08 ? progress / 0.08 : progress > 0.72 ? (1 - progress) / 0.28 : 1,
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scaleX(${flip})`,
      });
    }

    piece.className = "club-confetti";
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * (1.2 + Math.random())}px`;
    piece.style.background = confettiColors[index % confettiColors.length];
    document.body.append(piece);

    const animation = piece.animate(keyframes, { duration, delay, easing: "linear", fill: "forwards" });
    animation.onfinish = () => piece.remove();
    animation.oncancel = () => piece.remove();
  }
};

export const initializeJoinConfetti = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll<HTMLElement>("[data-join-cta]").forEach((button) => {
    let lastBurst = 0;

    button.addEventListener("pointerenter", () => {
      const now = Date.now();

      if (now - lastBurst < 900) return;
      lastBurst = now;
      launchClubConfetti(button, reducedMotion);
    });

    button.addEventListener("focus", () => launchClubConfetti(button, reducedMotion));
  });
};
