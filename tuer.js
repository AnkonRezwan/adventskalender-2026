/* ==========================================================================
   Path of Grace · Türchen-Seite
   Rendert ein einzelnes Türchen aus doors.js (via ?nr=).
   ========================================================================== */

(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const pad = (n) => String(n).padStart(2, "0");
  const escapeHTML = (v) =>
    String(v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const DOORS = (window.ADVENT_DOORS || []);
  const ENGELSKARTEN = (window.ADVENT_ENGELSKARTEN || []);

  const WEEKDAYS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  function fullDate(day) {
    const d = new Date(Date.UTC(2026, 11, day));
    return `${WEEKDAYS_LONG[d.getUTCDay()]}, ${day}. ${MONTHS[11]} 2026`;
  }

  const params = new URLSearchParams(window.location.search);
  const nr = Number(params.get("nr"));
  const door = DOORS.find((d) => d.day === nr);

  const titleEl = $("#doorTitle");
  const eyebrowText = $("#doorEyebrowText");
  const dateEl = $("#doorDate");
  const metaEl = $("#doorMeta");
  const contentEl = $("#doorContent");
  const eyebrowWrap = $("#doorEyebrow");

  if (!door || !nr || nr < 1 || nr > 24) {
    if (titleEl) titleEl.textContent = "Dieses Türchen gibt es nicht.";
    if (contentEl) {
      contentEl.innerHTML = `
        <p>Bitte öffne dein Türchen über den Link in deiner E-Mail.</p>
        <div class="door-actions">
          <a class="button button--primary" href="index.html">
            <span>Zum Adventskalender</span>
          </a>
        </div>`;
    }
    return;
  }

  const typeLabel = door.type === "audio" ? "Audio" : "Geschenk";

  if (titleEl) titleEl.textContent = door.title;
  if (eyebrowText) eyebrowText.textContent = `Türchen ${pad(door.day)}`;
  if (dateEl) dateEl.textContent = fullDate(door.day);
  if (metaEl) {
    metaEl.innerHTML = `
      <span class="door-meta__item">${escapeHTML(typeLabel)}</span>
      <span class="door-meta__item">${escapeHTML(fullDate(door.day))}</span>
      ${door.special ? '<span class="door-meta__item">Besonderes Türchen</span>' : ""}
    `;
  }
  document.title = `Türchen ${pad(door.day)} – ${door.title} | Path of Grace`;

  const isGift = door.type === "gift";

  const audioMarkup = `
    <div class="audio-preview" aria-label="Audio">
      <span class="audio-preview__play" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M8 5.5l11 6.5-11 6.5z"></path></svg>
      </span>
      <div>
        <p class="audio-preview__title">Audio-Einladung</p>
        <p class="audio-preview__meta">Das Audio wird hier eingebunden, sobald es bereit ist.</p>
      </div>
    </div>`;

  const giftDraw = `
    <p class="door-draw">Alle, die angemeldet sind, sind heute automatisch im Lostopf. Ich ziehe heute Abend und melde mich bei der Gewinnerin oder dem Gewinner per Mail.</p>`;

  const engelButton = isGift
    ? `<button type="button" class="button button--gold" id="engelButton">
         <span>Zieh deine Engelskarte</span>
       </button>
       <div class="engel-card" id="engelCard" hidden>
         <p class="engel-card__label">Deine Engelskarte</p>
         <p class="engel-card__text" id="engelText"></p>
       </div>`
    : "";

  if (contentEl) {
    contentEl.innerHTML = `
      ${isGift ? giftDraw : ""}
      ${!isGift ? audioMarkup : ""}
      ${engelButton}
      <div class="door-actions">
        <a class="button button--primary" href="${escapeHTML(door.link)}" target="_blank" rel="noopener">
          <span>${escapeHTML(door.button)}</span>
          <svg class="button__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>
        </a>
        <a class="text-link" href="index.html">Zum Adventskalender <span aria-hidden="true">→</span></a>
      </div>
      ${isGift ? '<p class="door-terms"><a href="https://gabriele-storz.de/terms/" target="_blank" rel="noopener">Teilnahmebedingungen <span aria-hidden="true">↗</span></a></p>' : ""}
    `;
  }

  const engelBtn = $("#engelButton");
  const engelCard = $("#engelCard");
  const engelText = $("#engelText");
  if (engelBtn && engelCard && engelText && ENGELSKARTEN.length) {
    engelBtn.addEventListener("click", () => {
      const saying = ENGELSKARTEN[Math.floor(Math.random() * ENGELSKARTEN.length)];
      engelText.textContent = saying;
      engelCard.hidden = false;
      engelCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
})();