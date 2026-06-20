const setActiveRelation = (groupsSection: Element | null, relation?: string | null) => {
  groupsSection?.classList.toggle("is-relation-initiation-active", relation === "initiation");
  groupsSection?.classList.toggle("is-relation-competition-active", relation === "competition");
};

export const initializeGroupRelations = () => {
  const groupsSection = document.querySelector(".groups-section");

  document.querySelectorAll<HTMLElement>("[data-relation]").forEach((element) => {
    const relation = element.dataset.relation;

    element.addEventListener("pointerenter", () => setActiveRelation(groupsSection, relation));
    element.addEventListener("focusin", () => setActiveRelation(groupsSection, relation));
    element.addEventListener("pointerleave", () => setActiveRelation(groupsSection, null));
    element.addEventListener("focusout", () => setActiveRelation(groupsSection, null));
  });

  const clearActiveSchedules = () => {
    document.querySelectorAll("[data-location-id]").forEach((location) => {
      location.classList.remove("is-schedule-target");
    });
    document.querySelectorAll("[data-schedule-relation]").forEach((slot) => {
      slot.classList.remove("is-active");
      slot.setAttribute("aria-pressed", "false");
    });
    setActiveRelation(groupsSection, null);
  };

  document.querySelectorAll<HTMLElement>("[data-schedule-relation]").forEach((slot) => {
    const activate = () => {
      clearActiveSchedules();
      slot.classList.add("is-active");
      slot.setAttribute("aria-pressed", "true");
      setActiveRelation(groupsSection, slot.dataset.scheduleRelation);

      slot.dataset.locationIds?.split(" ").forEach((id) => {
        document.querySelector(`[data-location-id="${id}"]`)?.classList.add("is-schedule-target");
      });
    };

    slot.addEventListener("pointerenter", activate);
    slot.addEventListener("focus", activate);
    slot.addEventListener("click", activate);
    slot.addEventListener("pointerleave", clearActiveSchedules);
    slot.addEventListener("blur", clearActiveSchedules);
  });
};
