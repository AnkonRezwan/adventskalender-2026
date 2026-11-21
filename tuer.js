/* ==========================================================================
   Path of Grace · Türchen-Seite
   Rendert ein einzelnes Türchen aus doors.js (via ?nr=).
   ========================================================================== */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const pad = (n) => String(n).padStart(2, "0");

  const DOORS = window.ADVENT_DOORS || [];
  const WEEKDAYS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  function fullDate(day) {
    const d = new Date(Date.UTC(2026, 11, day));
    return `${WEEKDAYS_LONG[d.getUTCDay()]}, ${day}. ${MONTHS[11]} 2026`;
  }

  const params = new URLSearchParams(window.location.search);
  const nr = Number(params.get("nr"));
  const doorData = DOORS.find((d) => d.day === nr);

  const eyebrow = $("#doorEyebrowText");
  const heading = $("#doorHeading");
  const dateEl = $("#doorDate");
  const stage = $("#doorStage");
  const error = $("#doorError");

  if (!doorData || !nr || nr < 1 || nr > 24 || !window.AdventReveal) {
    if (eyebrow) eyebrow.textContent = "Türchen";
    if (heading) heading.textContent = "Dieses Türchen gibt es nicht.";
    if (dateEl) dateEl.textContent = "Der Link ist unvollständig oder dieses Türchen existiert nicht.";
    if (stage) stage.hidden = true;
    if (error) error.hidden = false;
    document.title = "Türchen nicht gefunden | Path of Grace";
    return;
  }

  document.title = `Türchen ${pad(nr)} – ${doorData.title} | Path of Grace`;
  if (eyebrow) eyebrow.textContent = `Türchen ${pad(nr)}`;
  if (heading) heading.textContent = `Türchen ${pad(nr)}`;
  if (dateEl) dateEl.textContent = fullDate(nr);

  const doorButton = $("#doorButton");
  if (doorButton) doorButton.setAttribute("aria-label", `Türchen ${pad(nr)} öffnen`);

  const reveal = window.AdventReveal.create({
    doorEl: doorButton,
    numEl: $("#doorNum"),
    typeEl: $("#doorType"),
    cardDateEl: $("#doorCardDate"),
    envelopeEl: $("#doorEnvelope"),
    contentEl: $("#doorContent"),
    sparklesEl: $("#doorSparkles"),
    confettiEl: $("#doorConfetti")
  });

  reveal.setDoor(doorData);
  if (doorButton) doorButton.addEventListener("click", () => reveal.open());
})();
