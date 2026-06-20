const setActiveRelation = (groupsSection: Element | null, relation?: string | null) => {
  groupsSection?.classList.toggle("is-relation-initiation-active", relation === "initiation");
  groupsSection?.classList.toggle("is-relation-competition-active", relation === "competition");
};

export const initializeGroupRelations = () => {
  const groupsSection = document.querySelector(".groups-section");

  let activeCardRelation: string | null = null;
  let activeHintRelation: string | null = null;

  const updateRelation = () => {
    setActiveRelation(groupsSection, activeHintRelation ?? activeCardRelation);
  };

  document.querySelectorAll<HTMLElement>("[data-relation]").forEach((element) => {
    const relation = element.dataset.relation ?? null;

    element.addEventListener("pointerenter", () => {
      activeCardRelation = relation;
      updateRelation();
    });
    element.addEventListener("focusin", () => {
      activeCardRelation = relation;
      updateRelation();
    });
    element.addEventListener("pointerleave", () => {
      activeCardRelation = null;
      updateRelation();
    });
    element.addEventListener("focusout", () => {
      activeCardRelation = null;
      updateRelation();
    });
  });

  const clearActiveSchedules = () => {
    document.querySelectorAll("[data-location-id]").forEach((location) => {
      location.classList.remove("is-schedule-target");
    });
    document.querySelectorAll("[data-schedule-relation]").forEach((slot) => {
      slot.classList.remove("is-active");
      slot.setAttribute("aria-pressed", "false");
    });
  };

  document.querySelectorAll<HTMLElement>(".schedule-line__hint").forEach((hint) => {
    const slot = hint.closest<HTMLElement>("[data-schedule-relation]");
    if (!slot) return;

    const activate = () => {
      clearActiveSchedules();
      slot.classList.add("is-active");
      slot.setAttribute("aria-pressed", "true");
      activeHintRelation = slot.dataset.scheduleRelation ?? null;
      updateRelation();

      slot.dataset.locationIds?.split(" ").forEach((id) => {
        document.querySelector(`[data-location-id="${id}"]`)?.classList.add("is-schedule-target");
      });
    };

    const deactivate = () => {
      clearActiveSchedules();
      activeHintRelation = null;
      updateRelation();
    };

    hint.addEventListener("pointerenter", activate);
    hint.addEventListener("focus", activate);
    hint.addEventListener("click", activate);
    hint.addEventListener("pointerleave", deactivate);
    hint.addEventListener("blur", deactivate);
  });
};
