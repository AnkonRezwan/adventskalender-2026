/* ==========================================================================
   Testmodus – Geschenk-Öffnung
   Zeigt alle 24 Türchen mit demselben Umschlag wie die echte Türchen-Seite.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const DOORS = window.ADVENT_DOORS || [];

  const daySelect = $("#testDay");
  const door = $("#testDoor");
  const doorNum = $("#testDoorNum");
  const doorType = $("#testDoorType");
  const doorDate = $("#testDoorDate");
  const envelope = $("#testEnvelope");
  const content = $("#testContent");
  const sparkles = $("#testSparkles");
  const confetti = $("#testConfetti");

  if (!daySelect || !door || !envelope || !content || !window.AdventReveal) return;

  const reveal = window.AdventReveal.create({
    doorEl: door,
    numEl: doorNum,
    typeEl: doorType,
    cardDateEl: doorDate,
    envelopeEl: envelope,
    contentEl: content,
    sparklesEl: sparkles,
    confettiEl: confetti
  });

  daySelect.innerHTML = DOORS
    .map((d) => `<option value="${d.day}">${d.day}. Dezember</option>`)
    .join("");

  const requested = Number(new URLSearchParams(window.location.search).get("tag"));
  const initial = DOORS.some((d) => d.day === requested) ? requested : 1;
  daySelect.value = String(initial);

  function findDoor(day) {
    return DOORS.find((d) => d.day === day) || {
      day,
      type: "gift",
      title: "Dein Türchen"
    };
  }

  function sync() {
    reveal.reset();
    reveal.setDoor(findDoor(Number(daySelect.value)));
  }

  sync();
  daySelect.addEventListener("change", sync);
  door.addEventListener("click", () => reveal.open());
})();
