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

  function signupFormMarkup(prefix) {
    const emailId = `${prefix}-email`;
    const emailErrorId = `${prefix}-email-error`;
    return `
      <form class="signup-form signup-form--light" data-signup-form novalidate>
        <div class="signup-form__fields">
          <label class="field">
            <span class="field__label">Dein Vorname</span>
            <input class="field__input" type="text" name="firstname" autocomplete="given-name" placeholder="Wie darf ich dich nennen?">
          </label>
          <label class="field">
            <span class="field__label">Deine E-Mail-Adresse</span>
            <input class="field__input" id="${emailId}" type="email" name="email" autocomplete="email" inputmode="email" placeholder="du@beispiel.de" required aria-describedby="${emailErrorId}">
            <span class="field__error" id="${emailErrorId}" role="alert"></span>
          </label>
        </div>
        <button class="button button--primary signup-form__button" type="submit">
          <span>Kostenlos anmelden</span>
          ${arrowIcon()}
        </button>
        <p class="signup-form__consent">Mit deiner Anmeldung bekommst du meinen Adventskalender und bist ab sofort in meinem Newsletter. Du kannst dich jederzeit mit einem Klick abmelden. <a href="https://gabriele-storz.de/privacy/" target="_blank" rel="noopener">Datenschutz</a></p>
        <p class="signup-form__status" role="status" aria-live="polite"></p>
      </form>
      <div class="signup-success" hidden tabindex="-1">
        <span class="signup-success__icon" aria-hidden="true">${checkIcon}</span>
        <p class="signup-success__title">Schau in dein Postfach – auch im Spam-Ordner – und bestätige deine Anmeldung.</p>
        <p class="signup-success__text">Danach bist du dabei. Dein erstes Türchen öffnet sich am 1. Dezember.</p>
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
     Sign-up handling
     The fallback forms validate and show the confirmation state. Replace with
     the real Brevo embed in production (see README.md).
     ------------------------------------------------------------------------ */

  function setFieldError(field, message) {
    if (!field) return;
    const error = field.querySelector(".field__error");
    const input = field.querySelector(".field__input");
    field.classList.toggle("has-error", Boolean(message));
    if (error) error.textContent = message || "";
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearFormState(form) {
    $$(".field", form).forEach((field) => setFieldError(field, ""));
    $$(".check", form).forEach((check) => check.classList.remove("has-error"));
    const status = form.querySelector(".signup-form__status");
    if (status) {
      status.textContent = "";
      status.classList.remove("is-error", "is-info");
    }
  }

  function initForms() {
    document.addEventListener("input", (event) => {
      const form = event.target.closest("[data-signup-form]");
      if (!form) return;
      const field = event.target.closest(".field");
      if (field) setFieldError(field, "");
      if (event.target.matches('input[name="consent"]')) {
        event.target.closest(".check")?.classList.remove("has-error");
      }
      const status = form.querySelector(".signup-form__status");
      if (status && status.classList.contains("is-error")) {
        status.textContent = "";
        status.classList.remove("is-error");
      }
    });

    document.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-signup-form]");
      if (!form) return;

      event.preventDefault();
      clearFormState(form);

      const emailField = form.querySelector('input[type="email"]')?.closest(".field");
      const emailInput = form.querySelector('input[type="email"]');
      const consent = form.querySelector('input[name="consent"]');
      const status = form.querySelector(".signup-form__status");
      const success = form.nextElementSibling?.classList.contains("signup-success")
        ? form.nextElementSibling
        : form.parentElement?.querySelector(".signup-success");
      const submit = form.querySelector('button[type="submit"]');
      const email = emailInput?.value.trim() || "";

      if (!email) {
        setFieldError(emailField, "Bitte gib deine E-Mail-Adresse ein.");
        emailInput?.focus();
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setFieldError(emailField, "Bitte prüfe deine E-Mail-Adresse.");
        emailInput?.focus();
        return;
      }

      if (consent && !consent.checked) {
        consent.closest(".check")?.classList.add("has-error");
        if (status) {
          status.textContent = "Bitte stimme der Datenschutzerklärung zu.";
          status.classList.add("is-error");
        }
        consent.focus();
        return;
      }

      if (submit) {
        submit.disabled = true;
        const label = submit.querySelector("span");
        if (label) label.textContent = "Einen Moment …";
      }

      /* Demo submission: shows the Brevo-style confirmation state.
         The real form is handled by the Brevo embed. */
      window.setTimeout(() => {
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus({ preventScroll: true });
          success.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest" });
        }
      }, 320);
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
    initForms();
    initFaq();
    initNavigation();
    initReveals();
    $$("[data-snow]").forEach(initSnow);
  }

  init();
})();
