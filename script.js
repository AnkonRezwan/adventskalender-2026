/* ==========================================================================
   Path of Grace · Adventskalender 2026
   Vanilla JavaScript: snowfall, calendar, door dialog, FAQ, forms, navigation.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const pad = (number) => String(number).padStart(2, "0");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const EVENT_YEAR = 2026;
  const EVENT_MONTH = 12;
  const DAY_MS = 86400000;
  const params = new URLSearchParams(window.location.search);
  /* Internal review mode. `?vorschau=1` only works on a local server; the
     token also works on staging, but should be rotated or removed before launch. */
  const PREVIEW_TOKEN = "grace-advent-2026";
  const previewParam = params.get("vorschau");
  const isLocalPreview = ["localhost", "127.0.0.1", "[::1]", ""].includes(window.location.hostname);
  const previewAll = previewParam === PREVIEW_TOKEN || (previewParam === "1" && isLocalPreview);
  const dateOverride = params.get("datum");

  const LINKS = window.ADVENT_LINKS || {};

  const DOORS = window.ADVENT_DOORS || [];
  const ENGELSKARTEN = window.ADVENT_ENGELSKARTEN || [];

  const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const WEEKDAYS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  function berlinToday() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const values = {};
    parts.forEach((part) => {
      if (part.type !== "literal") values[part.type] = Number(part.value);
    });

    return { year: values.year, month: values.month, day: values.day };
  }

  function getToday() {
    if (dateOverride && /^\d{4}-\d{2}-\d{2}$/.test(dateOverride)) {
      const [year, month, day] = dateOverride.split("-").map(Number);
      if (year && month && day) return { year, month, day };
    }
    return berlinToday();
  }

  const today = getToday();
  const todayStamp = Date.UTC(today.year, today.month - 1, today.day);
  const eventStartStamp = Date.UTC(EVENT_YEAR, EVENT_MONTH - 1, 1);
  const eventEndStamp = Date.UTC(EVENT_YEAR, EVENT_MONTH - 1, 24);

  function doorState(day) {
    if (previewAll) return "preview";
    if (todayStamp < eventStartStamp) return "locked";
    if (todayStamp > eventEndStamp) return "open";

    const doorStamp = Date.UTC(EVENT_YEAR, EVENT_MONTH - 1, day);
    if (todayStamp === doorStamp) return "today";
    if (todayStamp > doorStamp) return "open";
    return "locked";
  }

  function isPreviewState(state) {
    return state === "preview";
  }

  function doorByDay(day) {
    return DOORS.find((door) => door.day === day);
  }

  function weekdayFor(day) {
    return new Date(Date.UTC(EVENT_YEAR, EVENT_MONTH - 1, day)).getUTCDay();
  }

  function pluralDays(count) {
    return count === 1 ? "Tag" : "Tage";
  }

  function calendarStatusText() {
    if (previewAll) return "Vorschau: alle 24 Türchen sind geöffnet.";
    if (todayStamp < eventStartStamp) {
      const days = Math.ceil((eventStartStamp - todayStamp) / DAY_MS);
      return days === 1 ? "Morgen öffnet sich Türchen 1." : `Noch ${days} ${pluralDays(days)} bis Türchen 1.`;
    }
    if (todayStamp <= eventEndStamp) {
      const day = Math.floor((todayStamp - eventStartStamp) / DAY_MS) + 1;
      return day === 1 ? "Heute öffnet sich Türchen 1." : `Heute: Türchen ${day}.`;
    }
    return "Alle 24 Türchen sind geöffnet.";
  }

  function stateLabel(state, day) {
    if (state === "preview") return "Vorschau";
    if (state === "today") return "Heute";
    if (state === "open") return "Öffnen";
    return `ab ${day}.12.`;
  }

  const lockIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2"></rect>
      <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
    </svg>`;

  const openIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6"></path>
    </svg>`;

  const checkIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5"></path>
    </svg>`;

  function arrowIcon() {
    return `<svg class="button__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"></path></svg>`;
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function fullDate(day) {
    const weekday = WEEKDAYS_LONG[weekdayFor(day)];
    return `${weekday}, ${day}. Dezember ${EVENT_YEAR}`;
  }

  function shortDate(day) {
    return `${WEEKDAYS[weekdayFor(day)]} · ${day}. Dez.`;
  }

  function typeLabel(door) {
    if (door.special) return "Audio-Reise";
    return door.type === "audio" ? "Audio" : "Geschenk";
  }

  function stateCopy(door, state) {
    if (state === "preview") return `Türchen ${door.day}, ${fullDate(door.day)}, ${typeLabel(door)}. Interne Vorschau öffnen.`;
    if (state === "today") return `Türchen ${door.day}, ${fullDate(door.day)}, ${typeLabel(door)}. Heute öffnen.`;
    if (state === "open") return `Türchen ${door.day}, ${fullDate(door.day)}, ${typeLabel(door)}. Jetzt öffnen.`;
    return `Türchen ${door.day}, ${fullDate(door.day)}, ${typeLabel(door)}. Öffnet sich am ${door.day}. Dezember.`;
  }

  const BREVO_ACTION = "https://dbc2f124.sibforms.com/serve/MUIFAEGaooPHJv6Dvy8S5qlE6VDnQhOZqnqrGLSIyqus3w5L7lLAJ7nEqEbhYZu5WH4Hp0YueNW0wi0tQhUwJerLfcLFw6s9nFgdird03c8yCCgYvSrpef7bo1Co6FfWQEqjRmtU9Q-SHDX_zN9YIbKRr_Dt9nUwPimhZcQatDNaxejFb8rShewl24kZ6ytRnPNtxidT-Cry3--Qsw==";

  function signupFormMarkup(prefix = "dialog") {
    const emailId = `EMAIL-${prefix}`;
    const formId = `sib-form-${prefix}`;
    return `
      <div class="sib-form">
        <div class="sib-form-container">
          <div class="sib-form-message-panel sib-form-message-panel--error" data-brevo-error>
            <div class="sib-form-message-panel__text sib-form-message-panel__text--center">
              <svg viewBox="0 0 512 512" class="sib-icon sib-notification__icon" aria-hidden="true">
                <path d="M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z" />
              </svg>
              <span class="sib-form-message-panel__inner-text">Deine Anmeldung konnte nicht gespeichert werden. Bitte versuche es erneut.</span>
            </div>
          </div>
          <div class="sib-form-message-panel sib-form-message-panel--success" data-brevo-success>
            <div class="sib-form-message-panel__text sib-form-message-panel__text--center">
              <svg viewBox="0 0 512 512" class="sib-icon sib-notification__icon" aria-hidden="true">
                <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z" />
              </svg>
              <span class="sib-form-message-panel__inner-text">Deine Anmeldung war erfolgreich. Bitte bestätige noch die E-Mail in deinem Postfach.</span>
            </div>
          </div>
          <div class="sib-container--large sib-container--vertical">
            <form id="${formId}" method="POST" action="${BREVO_ACTION}" data-type="subscription" data-brevo-extra-form novalidate>
              <div class="sib-input sib-form-block">
                <div class="form__entry entry_block">
                  <div class="form__label-row">
                    <label class="entry__label" for="${emailId}" data-required="*">Gib deine E-Mail-Adresse ein, um dich anzumelden</label>
                    <div class="entry__field">
                      <input class="input" type="email" id="${emailId}" name="EMAIL" autocomplete="email" inputmode="email" value="" placeholder="du@beispiel.de" data-required="true" required>
                    </div>
                  </div>
                  <label class="entry__error entry__error--primary"></label>
                  <label class="entry__specification">Gib bitte deine E-Mail-Adresse für die Anmeldung an, z. B. name@beispiel.de.</label>
                </div>
              </div>
              <div class="consent-field sib-form-block">
                <label class="consent" for="CONSENT-${prefix}">
                  <input class="consent__input" type="checkbox" id="CONSENT-${prefix}" required aria-describedby="consent-error-${prefix}">
                  <span class="consent__box" aria-hidden="true"></span>
                  <span class="consent__text">Yes! Schick mir den Adventskalender und den Newsletter der Laura Seiler Life Coaching GmbH mit Impulsen und Angeboten. Abmelden geht jederzeit mit einem Klick in jeder E-Mail. Mehr in der <a href="https://gabriele-storz.de/privacy/" target="_blank" rel="noopener">Datenschutzerklärung</a>.</span>
                </label>
                <p class="consent__error" id="consent-error-${prefix}" role="alert" hidden></p>
              </div>
              <div class="sib-form__declaration" style="direction:ltr">
                <div class="declaration-block-icon">
                  <svg class="svgIcon-sphere" viewBox="0 0 63 63" width="38" height="38" aria-hidden="true">
                    <path d="M31.54 0l1.05 3.06 3.385-.01-2.735 1.897 1.05 3.042-2.748-1.886-2.738 1.886 1.044-3.05-2.745-1.897h3.393zm13.97 3.019L46.555 6.4l3.384.01-2.743 2.101 1.048 3.387-2.752-2.1-2.752 2.1 1.054-3.382-2.745-2.105h3.385zm9.998 10.056l1.039 3.382h3.38l-2.751 2.1 1.05 3.382-2.744-2.091-2.743 2.091 1.054-3.381-2.754-2.1h3.385zM58.58 27.1l1.04 3.372h3.379l-2.752 2.096 1.05 3.387-2.744-2.091-2.75 2.092 1.054-3.387-2.747-2.097h3.376zm-3.076 14.02l1.044 3.364h3.385l-2.743 2.09 1.05 3.392-2.744-2.097-2.743 2.097 1.052-3.377-2.752-2.117 3.385-.01zm-9.985 9.91l1.045 3.364h3.393l-2.752 2.09 1.05 3.393-2.745-2.097-2.743 2.097 1.05-3.383-2.751-2.1 3.384-.01zM31.45 55.01l1.044 3.043 3.393-.008-2.752 1.9L34.19 63l-2.744-1.895-2.748 1.891 1.054-3.05-2.743-1.9h3.384zm-13.934-3.98l1.036 3.364h3.402l-2.752 2.09 1.053 3.393-2.747-2.097-2.752 2.097 1.053-3.382-2.743-2.1 3.384-.01zm-9.981-9.91l1.045 3.364h3.398l-2.748 2.09 1.05 3.392-2.753-2.1-2.752 2.096 1.053-3.382-2.743-2.102 3.384-.009zM4.466 27.1l1.038 3.372H8.88l-2.752 2.097 1.053 3.387-2.743-2.09-2.748 2.09 1.053-3.387L0 30.472h3.385zm3.069-14.025l1.045 3.382h3.395L9.23 18.56l1.05 3.381-2.752-2.09-2.752 2.09 1.053-3.381-2.744-2.1h3.384zm9.99-10.056L18.57 6.4l3.393.01-2.743 2.1 1.05 3.373-2.754-2.092-2.751 2.092 1.053-3.382-2.744-2.1h3.384zm24.938 19.394l-10-4.22a2.48 2.48 0 00-1.921 0l-10 4.22A2.529 2.529 0 0019 24.75c0 10.47 5.964 17.705 11.537 20.057a2.48 2.48 0 001.921 0C36.921 42.924 44 36.421 44 24.75a2.532 2.532 0 00-1.537-2.336zm-2.46 6.023l-9.583 9.705a.83.83 0 01-1.177 0l-5.416-5.485a.855.855 0 010-1.192l1.177-1.192a.83.83 0 011.177 0l3.65 3.697 7.819-7.916a.83.83 0 011.177 0l1.177 1.191a.843.843 0 010 1.192z" fill="#0092FF"/>
                  </svg>
                </div>
                <div>
                  <p>Wir arbeiten mit Brevo zusammen, um deine Daten zu erfassen und dir unsere Mitteilungen zu senden. <a href="https://www.brevo.com/de/legal/privacypolicy/" target="_blank" rel="nofollow noopener">Datenschutzerklärung von Brevo</a>.</p>
                </div>
              </div>
              <div class="sib-form-block">
                <button class="button button--primary sib-form-block__button sib-form-block__button-with-loader" form="${formId}" type="submit">
                  <span>Jetzt kostenlos anmelden</span>
                  ${arrowIcon()}
                </button>
              </div>
              <input type="text" name="email_address_check" value="" class="input--hidden" tabindex="-1" autocomplete="off" aria-hidden="true">
              <input type="hidden" name="locale" value="de">
            </form>
          </div>
        </div>
      </div>`;
  }

  function audioPreviewMarkup() {
    return `
      <div class="audio-preview" aria-label="Audio-Vorschau">
        <span class="audio-preview__play" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5.5l11 6.5-11 6.5z"></path></svg>
        </span>
        <div>
          <p class="audio-preview__title">Audio-Einladung</p>
          <p class="audio-preview__meta">Das Audio wird in der finalen Version hier eingebunden.</p>
        </div>
      </div>`;
  }

  function previewCopy(door) {
    if (door.day === 1) {
      return "Hinter dem ersten Türchen wartet meine Audio-Reise „Willkommen – Hände aufs Herz“ (ca. 5 Min.).";
    }
    if (door.type === "gift") {
      return `Heute öffnet sich ein Geschenk: ${escapeHTML(door.title)}. Antworte auf die Türchen-Mail mit dem Wort FEUER, um mitzumachen. Heute Abend ziehe ich.`;
    }
    return `Eine Audio-Einladung von mir: ${escapeHTML(door.title)}. Nimm dir ein paar ruhige Minuten, in denen du dich selbst wieder spüren darfst.`;
  }

  function buildDialogContent(door, state) {
    if (state === "locked") {
      return `
        <span class="dialog-lock">${lockIcon} Öffnet am ${door.day}. Dezember</span>
        <p class="eyebrow">Türchen ${pad(door.day)}</p>
        <h2 id="doorDialogTitle">Dieses Türchen öffnet sich am ${door.day}. Dezember.</h2>
        <p>Trag dich ein, dann bekommst du jeden Morgen dein Türchen per E-Mail – kostenlos.</p>
        <div class="dialog-meta">
          <span>${escapeHTML(typeLabel(door))}</span>
          <span>1.–24. Dezember ${EVENT_YEAR}</span>
        </div>
        <div class="door-dialog__actions">
          <a class="button button--primary" href="#anmeldung" data-dialog-signup>
            <span>Jetzt kostenlos anmelden</span>
            ${arrowIcon()}
          </a>
        </div>`;
    }

    if (state === "open" || state === "today") {
      return `
        <span class="dialog-lock">${checkIcon} Türchen ${pad(door.day)} ist geöffnet</span>
        <p class="eyebrow">Dein Türchen wartet</p>
        <h2 id="doorDialogTitle">Melde dich an, um deine Türchen zu bekommen.</h2>
        <p>Über die Türchen-Mail kommst du jeden Morgen direkt zu deinem Inhalt. Wenn du schon dabei bist, öffne einfach die E-Mail von heute.</p>
        <div data-signup-root>
          ${signupFormMarkup(`door-${door.day}`)}
        </div>`;
    }

    const isGift = door.type === "gift";
    return `
      <p class="eyebrow dialog-preview">Interne Vorschau · Türchen ${pad(door.day)}</p>
      <h2 id="doorDialogTitle">${escapeHTML(door.title)}</h2>
      <div class="dialog-meta">
        <span>${escapeHTML(typeLabel(door))}</span>
        <span>${fullDate(door.day)}</span>
        ${door.special ? "<span>Besonderes Türchen</span>" : ""}
      </div>
      <p>${previewCopy(door)}</p>
      ${!isGift ? audioPreviewMarkup() : ""}
      ${
        isGift
          ? `<p><a class="text-link" href="https://gabriele-storz.de/terms/" target="_blank" rel="noopener">Teilnahmebedingungen <span aria-hidden="true">↗</span></a></p>`
          : ""
      }
      <div class="door-dialog__actions">
        <a class="button button--primary" href="${door.link}" target="_blank" rel="noopener">
          <span>${escapeHTML(door.button)}</span>
          ${arrowIcon()}
        </a>
      </div>`;
  }

  function renderCalendar() {
    const grid = $("#calendarGrid");
    if (!grid) return;

    const status = $("#calendarStatus");
    if (status) status.textContent = calendarStatusText();

    const fragment = document.createDocumentFragment();

    DOORS.forEach((door) => {
      const state = doorState(door.day);
      const displayState = isPreviewState(state) ? "open" : state;
      const button = document.createElement("button");

      button.type = "button";
      button.className = `door${door.special ? " door--special" : ""}`;
      button.dataset.day = String(door.day);
      button.dataset.state = displayState;
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-label", stateCopy(door, state));
      if (isPreviewState(state)) button.dataset.preview = "true";

      button.innerHTML = `
        <span class="door__top">
          <span class="door__num">${pad(door.day)}</span>
          <span class="door__type">${escapeHTML(typeLabel(door))}</span>
        </span>
        <span class="door__bottom">
          <span class="door__date">${shortDate(door.day)}</span>
          <span class="door__state">
            ${state === "locked" ? lockIcon : openIcon}
            <span>${escapeHTML(stateLabel(state, door.day))}</span>
          </span>
        </span>
        ${door.special ? '<span class="door__star" aria-hidden="true">✦</span>' : ""}
      `;

      fragment.appendChild(button);
    });

    const endcard = document.createElement("div");
    endcard.className = "calendar-endcard";
    endcard.innerHTML = `
      <div>
        <span class="calendar-endcard__eyebrow">Für dich</span>
        <p>Alle 24 Türchen sind kostenlos.</p>
      </div>
      <a href="#anmeldung">Jetzt anmelden <span aria-hidden="true">→</span></a>`;
    fragment.appendChild(endcard);

    grid.appendChild(fragment);
  }

  function initDoorDialog() {
    const dialog = $("#doorDialog");
    const content = $("#doorDialogContent");
    const number = $("#doorDialogNumber");
    const date = $("#doorDialogDate");
    const stateLabelElement = $("#doorDialogState");
    const eyebrow = $("#doorDialogEyebrow");
    const grid = $("#calendarGrid");

    if (!dialog || !content || !number || !date || !stateLabelElement || !eyebrow) return;

    const openDoor = (day) => {
      const door = doorByDay(day);
      if (!door) return;

      const state = doorState(day);
      number.textContent = pad(day);
      date.textContent = `${day}. Dezember ${EVENT_YEAR}`;
      eyebrow.textContent = `Türchen ${pad(day)}`;
      stateLabelElement.textContent =
        state === "preview" ? "Vorschau" : state === "locked" ? "geschlossen" : state === "today" ? "heute geöffnet" : "geöffnet";
      dialog.dataset.state = state;
      content.innerHTML = buildDialogContent(door, state);

      if (!dialog.open) {
        dialog.showModal();
        document.body.classList.add("dialog-open");
      }

      content.scrollTop = 0;
    };

    if (grid) {
      grid.addEventListener("click", (event) => {
        const doorButton = event.target.closest(".door");
        if (!doorButton) return;
        openDoor(Number(doorButton.dataset.day));
      });
    }

    dialog.addEventListener("click", (event) => {
      const signupLink = event.target.closest("[data-dialog-signup]");
      if (signupLink) {
        event.preventDefault();
        dialog.close();
        window.setTimeout(() => {
          $("#anmeldung")?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
        }, 40);
        return;
      }

      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        const clickedOutside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom;
        if (clickedOutside) dialog.close();
      }
    });

    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
    });

    $(".door-dialog__close")?.addEventListener("click", () => dialog.close());
  }

  /* ------------------------------------------------------------------------
     Secondary Brevo HTML embeds (Hero & Door Dialog)
     ------------------------------------------------------------------------ */

  const CONSENT_ERROR_MESSAGE = "Bitte bestätige die Einwilligung, um dich anzumelden.";

  function setConsentError(input, invalid) {
    const field = input.closest(".consent-field");
    if (!field) return;
    field.classList.toggle("is-invalid", invalid);
    const error = field.querySelector(".consent__error");
    if (error) {
      error.textContent = invalid ? CONSENT_ERROR_MESSAGE : "";
      error.hidden = !invalid;
    }
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function initConsent() {
    document.addEventListener("change", (event) => {
      const input = event.target.closest(".consent__input");
      if (input?.checked) setConsentError(input, false);
    });

    document.addEventListener(
      "invalid",
      (event) => {
        const input = event.target.closest?.(".consent__input");
        if (!input) return;
        event.preventDefault();
        setConsentError(input, true);
      },
      true
    );

    /* Blocks submission (also for Brevo's own form handler) until the box is checked. */
    document.addEventListener(
      "submit",
      (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;
        const input = form.querySelector(".consent__input");
        if (!input || input.checked) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setConsentError(input, true);
        input.focus();
      },
      true
    );
  }

  function initBrevoEmbedForms() {
    const setEntryError = (entry, message) => {
      if (!entry) return;
      const errorLabel = entry.querySelector(".entry__error");
      entry.classList.toggle("entry_errored", Boolean(message));
      if (errorLabel) {
        errorLabel.textContent = message || "";
        errorLabel.style.display = message ? "block" : "none";
      }
    };

    document.addEventListener("input", (event) => {
      const form = event.target.closest("[data-brevo-extra-form]");
      if (!form) return;
      setEntryError(event.target.closest(".form__entry"), "");
    });

    document.addEventListener("submit", async (event) => {
      const form = event.target.closest("[data-brevo-extra-form]");
      if (!form) return;

      event.preventDefault();

      const container = form.closest(".sib-form-container");
      const errorPanel = container?.querySelector("[data-brevo-error]");
      const successPanel = container?.querySelector("[data-brevo-success]");
      const emailInput = form.querySelector('input[name="EMAIL"]');
      const emailEntry = emailInput?.closest(".form__entry");
      const submit = form.querySelector('button[type="submit"]');
      const submitLabel = submit?.querySelector("span");
      const originalLabel = submitLabel?.textContent || "Jetzt kostenlos anmelden";

      errorPanel?.classList.remove("sib-form-message-panel--active");
      successPanel?.classList.remove("sib-form-message-panel--active");
      setEntryError(emailEntry, "");

      const email = emailInput?.value.trim() || "";
      if (!email) {
        setEntryError(emailEntry, "Dieses Feld darf nicht leer sein.");
        emailInput?.focus();
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setEntryError(emailEntry, "Die eingegebenen Informationen sind nicht gültig. Bitte überprüfe das Feldformat und versuche es erneut.");
        emailInput?.focus();
        return;
      }

      if (submit) {
        submit.disabled = true;
        if (submitLabel) submitLabel.textContent = "Einen Moment …";
      }

      const resetSubmit = () => {
        if (submit) submit.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
      };

      const actionUrl = form.getAttribute("action") || BREVO_ACTION;
      const submitUrl = actionUrl.includes("?") ? `${actionUrl}&isAjax=1` : `${actionUrl}?isAjax=1`;

      try {
        const response = await fetch(submitUrl, {
          method: "POST",
          body: new FormData(form)
        });
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        const hasErrors = !response.ok || data?.success === false || (data?.errors && Object.keys(data.errors).length > 0);
        if (hasErrors) {
          if (data?.errors?.EMAIL) {
            setEntryError(emailEntry, data.errors.EMAIL);
          } else if (errorPanel) {
            const textEl = errorPanel.querySelector(".sib-form-message-panel__inner-text");
            if (textEl && data?.message) textEl.textContent = data.message;
            errorPanel.classList.add("sib-form-message-panel--active");
          }
          resetSubmit();
          return;
        }

        form.reset();
        successPanel?.classList.add("sib-form-message-panel--active");
        resetSubmit();
      } catch {
        errorPanel?.classList.add("sib-form-message-panel--active");
        resetSubmit();
      }
    });
  }

  /* ------------------------------------------------------------------------
     FAQ
     ------------------------------------------------------------------------ */

  function initFaq() {
    const questions = $$(".faq-question");
    if (!questions.length) return;

    const setOpen = (item, open) => {
      const button = $(".faq-question", item);
      item.classList.toggle("is-open", open);
      button?.setAttribute("aria-expanded", String(open));
    };

    questions.forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        if (!item) return;
        const shouldOpen = !item.classList.contains("is-open");

        $$(".faq-item.is-open").forEach((openItem) => {
          if (openItem !== item) setOpen(openItem, false);
        });

        setOpen(item, shouldOpen);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Navigation
     ------------------------------------------------------------------------ */

  function initNavigation() {
    const header = $(".site-header");
    const menu = $("#mobileMenu");
    const menuButton = $(".menu-button");
    const menuClose = $(".mobile-menu__close");

    const updateHeader = () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menu && menuButton) {
      const openMenu = () => {
        if (menu.open) return;
        menu.showModal();
        menuButton.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
      };

      const closeMenu = () => {
        if (menu.open) menu.close();
      };

      menuButton.addEventListener("click", openMenu);
      menuClose?.addEventListener("click", closeMenu);
      $$("a", menu).forEach((link) => link.addEventListener("click", closeMenu));

      menu.addEventListener("close", () => {
        menuButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });

      const desktopQuery = window.matchMedia("(min-width: 1021px)");
      const handleBreakpoint = (event) => {
        if (event.matches) closeMenu();
      };

      if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", handleBreakpoint);
      else desktopQuery.addListener(handleBreakpoint);
    }

    const navLinks = $$(".nav-links a");
    const sectionId = (link) => {
      const href = link.getAttribute("href") || "";
      return href.startsWith("#") ? href.slice(1) : null;
    };

    if (navLinks.length && "IntersectionObserver" in window) {
      const bySection = new Map();
      navLinks.forEach((link) => {
        const id = sectionId(link);
        if (id && document.getElementById(id)) bySection.set(id, link);
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => link.classList.remove("is-active"));
            bySection.get(entry.target.id)?.classList.add("is-active");
          });
        },
        { rootMargin: "-38% 0px -55% 0px", threshold: 0 }
      );

      bySection.forEach((_, id) => observer.observe(document.getElementById(id)));
    }
  }

  /* ------------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------------ */

  function initReveals() {
    const elements = $$(".reveal");
    if (!elements.length) return;

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
  }

  /* ------------------------------------------------------------------------
     Snowfall
     ------------------------------------------------------------------------ */

  function initSnow(canvas) {
    const context = canvas.getContext("2d");
    const parent = canvas.parentElement;
    if (!context || !parent) return;

    let width = 0;
    let height = 0;
    let flakes = [];
    let frameId = null;
    let lastTime = 0;
    let visible = true;
    let resizeTimer = null;
    let pointerWind = 0;
    let pointerTarget = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const random = (min, max) => Math.random() * (max - min) + min;

    const makeSprite = () => {
      const sprite = document.createElement("canvas");
      sprite.width = 64;
      sprite.height = 64;
      const spriteContext = sprite.getContext("2d");
      if (!spriteContext) return sprite;
      const gradient = spriteContext.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 253, 247, 1)");
      gradient.addColorStop(0.26, "rgba(250, 241, 222, 0.96)");
      gradient.addColorStop(0.62, "rgba(236, 215, 167, 0.36)");
      gradient.addColorStop(1, "rgba(236, 215, 167, 0)");
      spriteContext.fillStyle = gradient;
      spriteContext.beginPath();
      spriteContext.arc(32, 32, 32, 0, Math.PI * 2);
      spriteContext.fill();
      return sprite;
    };

    const sprite = makeSprite();

    const createFlakes = () => {
      const count = Math.max(34, Math.min(135, Math.round(width / 13)));
      flakes = Array.from({ length: count }, () => {
        const depth = Math.random();
        const radius = 0.55 + depth * 2.1;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          speed: 6 + depth * 24,
          drift: 5 + random(0, 18),
          phase: Math.random() * Math.PI * 2,
          sway: 0.24 + random(0, 0.52),
          alpha: 0.2 + depth * 0.62,
          size: radius * (5.2 + depth * 3.6)
        };
      });
    };

    const drawStatic = () => {
      context.clearRect(0, 0, width, height);
      flakes.forEach((flake) => {
        context.globalAlpha = flake.alpha;
        context.drawImage(sprite, flake.x - flake.size / 2, flake.y - flake.size / 2, flake.size, flake.size);
      });
      context.globalAlpha = 1;
    };

    const frame = (time) => {
      if (!visible || document.hidden) {
        frameId = null;
        return;
      }

      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      pointerWind += (pointerTarget - pointerWind) * 0.04;
      const wind = Math.sin(time * 0.00012) * 7 + pointerWind;

      context.clearRect(0, 0, width, height);

      flakes.forEach((flake) => {
        flake.y += flake.speed * delta;
        flake.x += (Math.sin(time * 0.001 * flake.sway + flake.phase) * flake.drift + wind) * delta;

        if (flake.y > height + 24) {
          flake.y = -24;
          flake.x = Math.random() * width;
        }
        if (flake.x < -30) flake.x = width + 30;
        if (flake.x > width + 30) flake.x = -30;

        context.globalAlpha = flake.alpha;
        context.drawImage(sprite, flake.x - flake.size / 2, flake.y - flake.size / 2, flake.size, flake.size);
      });

      context.globalAlpha = 1;
      frameId = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduceMotion.matches || frameId !== null) return;
      lastTime = performance.now();
      frameId = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createFlakes();
      if (reduceMotion.matches) drawStatic();
      else if (!frameId) start();
    };

    const scheduleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    };

    resize();

    if (reduceMotion.matches) {
      drawStatic();
    } else {
      start();
    }

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(scheduleResize);
      resizeObserver.observe(parent);
    } else {
      window.addEventListener("resize", scheduleResize, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
          if (visible) start();
          else stop();
        },
        { threshold: 0 }
      );
      visibilityObserver.observe(canvas);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (visible) start();
    });

    if (window.matchMedia("(pointer: fine)").matches) {
      parent.addEventListener(
        "pointermove",
        (event) => {
          const rect = parent.getBoundingClientRect();
          pointerTarget = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
        },
        { passive: true }
      );
      parent.addEventListener(
        "pointerleave",
        () => {
          pointerTarget = 0;
        },
        { passive: true }
      );
    }

    const handleMotionPreference = () => {
      if (reduceMotion.matches) {
        stop();
        drawStatic();
      } else {
        start();
      }
    };

    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", handleMotionPreference);
    else reduceMotion.addListener(handleMotionPreference);
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */

  function init() {
    renderCalendar();
    initDoorDialog();
    initConsent();
    initBrevoEmbedForms();
    initFaq();
    initNavigation();
    initReveals();
    $$("[data-snow]").forEach(initSnow);
  }

  init();
})();
