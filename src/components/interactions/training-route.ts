type RouteConfig = {
  fromSelector: string;
  toSelector: string;
  lineSelector: string;
  shadowSelector: string;
  startSelector: string;
  side?: "left" | "right";
};

export const initializeTrainingRoute = () => {
  const drawTrainingRoute = () => {
    const section = document.querySelector<HTMLElement>(".groups-section .wrap");
    const overlay = document.querySelector<SVGSVGElement>("[data-route-overlay]");

    if (!section || !overlay) return;

    const sectionRect = section.getBoundingClientRect();
    const width = sectionRect.width;
    const height = sectionRect.height;

    overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
    overlay.setAttribute("width", `${width}`);
    overlay.setAttribute("height", `${height}`);

    const drawRoute = ({ fromSelector, toSelector, lineSelector, shadowSelector, startSelector, side = "left" }: RouteConfig) => {
      const from = document.querySelector<HTMLElement>(fromSelector);
      const to = document.querySelector<HTMLElement>(toSelector);
      const line = document.querySelector<SVGPathElement>(lineSelector);
      const shadow = document.querySelector<SVGPathElement>(shadowSelector);
      const start = document.querySelector<SVGCircleElement>(startSelector);

      if (!from || !to || !line || !shadow || !start) return;

      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const startX = (side === "right" ? fromRect.right : fromRect.left) - sectionRect.left;
      const startY = fromRect.top - sectionRect.top + fromRect.height / 2;
      const endX = (side === "right" ? toRect.right : toRect.left) - sectionRect.left;
      const endY = toRect.top - sectionRect.top + toRect.height / 2;
      const offsetX = 70;
      const direction = side === "right" ? 1 : -1;
      const bendX = startX + offsetX * direction;
      const radius = 18;

      const path = [
        `M ${startX} ${startY}`,
        `L ${bendX - radius * direction} ${startY}`,
        `A ${radius} ${radius} 0 0 ${side === "right" ? 1 : 0} ${bendX} ${startY + radius}`,
        `L ${bendX} ${endY - radius}`,
        `A ${radius} ${radius} 0 0 ${side === "right" ? 1 : 0} ${bendX - radius * direction} ${endY}`,
        `L ${endX} ${endY}`,
      ].join(" ");

      line.setAttribute("d", path);
      shadow.setAttribute("d", path);
      start.setAttribute("cx", `${startX}`);
      start.setAttribute("cy", `${startY}`);
    };

    drawRoute({
      fromSelector: "[data-route-from]",
      toSelector: "[data-route-to]",
      lineSelector: "[data-route-line]",
      shadowSelector: "[data-route-shadow]",
      startSelector: "[data-route-start]",
      side: "left",
    });
    drawRoute({
      fromSelector: "[data-route-from-competition]",
      toSelector: "[data-route-to-competition]",
      lineSelector: "[data-route-competition-line]",
      shadowSelector: "[data-route-competition-shadow]",
      startSelector: "[data-route-competition-start]",
      side: "right",
    });
  };

  drawTrainingRoute();
  window.addEventListener("resize", drawTrainingRoute);
};
