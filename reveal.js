/* ==========================================================================
   Path of Grace · Adventskalender 2026
   Shared door reveal: Türchen → Umschlag → Audio / Geschenk / Coupon.
   Used by the real door page (tuer.html) and the preview page (test-gift.html).
   ========================================================================== */

(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const pad = (n) => String(n).padStart(2, "0");
  const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const COLORS = ["#d6b46a", "#cfa6a0", "#b8bfae", "#ecd7a7", "#4b3145", "#f8f3eb"];
  const POG_URL = "https://pathofgrace.de/";

  const DOORS = window.ADVENT_DOORS || [];
  const ENGELSKARTEN = window.ADVENT_ENGELSKARTEN || [];
  const CONTACT = window.ADVENT_CONTACT || {
    whatsapp: "https://api.whatsapp.com/send?phone=4917653620975",
    email: "info@gabriele-storz.de"
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function weekday(day) {
    return WEEKDAYS[new Date(Date.UTC(2026, 11, day)).getUTCDay()];
  }

  /* Placeholder audio for all 12 audio doors.
     When the real MP3s arrive, change ".wav" to ".mp3" and replace the files. */
  function audioSrc(day) {
    return `assets/audio/tuerchen-${pad(day)}.wav`;
  }

  function contactLinks(door) {
    const intro = `Hallo Gabriele, ich habe Türchen ${pad(door.day)} geöffnet und möchte mein Geschenk „${door.title}“ einlösen.`;
    const whatsapp = `${CONTACT.whatsapp}&text=${encodeURIComponent(intro)}`;
    const mailSubject = `Mein Adventskalender-Geschenk – Türchen ${pad(door.day)}`;
    const email = `mailto:${CONTACT.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(intro)}`;
    return { whatsapp, email };
  }

  function typeOf(door) {
    if (!door) return "gift";
    if (door.coupon) return "coupon";
    return door.type || "gift";
  }

  function planLink(door) {
    if (!door.link || !door.button) return "";
    if (door.link === POG_URL && /path of grace/i.test(door.button)) return "";
    return `
      <p class="test-reveal__more">
        <a class="text-link" href="${escapeHtml(door.link)}" target="_blank" rel="noopener">${escapeHtml(door.button)} <span aria-hidden="true">→</span></a>
      </p>`;
  }

  function create(options) {
    const doorEl = options.doorEl;
    const numEl = options.numEl;
    const typeEl = options.typeEl;
    const cardDateEl = options.cardDateEl;
    const envelopeEl = options.envelopeEl;
    const contentEl = options.contentEl;
    const sparklesEl = options.sparklesEl;
    const confettiEl = options.confettiEl;

    let currentDoor = null;
    let playerRunning = false;
    let timers = [];

    function later(fn, ms) {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    }

    function clearTimers() {
      timers.forEach((id) => window.clearTimeout(id));
      timers = [];
    }

    function setDoor(door) {
      currentDoor = door || null;
      if (!currentDoor) return;
      if (numEl) numEl.textContent = pad(currentDoor.day);
      if (typeEl) {
        const type = typeOf(currentDoor);
        typeEl.textContent = type === "coupon" ? "Coupon" : type === "gift" ? "Geschenk" : "Audio";
      }
      if (cardDateEl) cardDateEl.textContent = `${weekday(currentDoor.day)}, ${currentDoor.day}. Dez.`;
    }

    function spawnSparkles(count = 28) {
      if (!sparklesEl) return;
      sparklesEl.innerHTML = "";
      for (let i = 0; i < count; i += 1) {
        const s = document.createElement("span");
        s.className = "test-spark";
        const angle = Math.random() * Math.PI * 2;
        const dist = 90 + Math.random() * 200;
        s.style.left = "50%";
        s.style.top = "50%";
        s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
        s.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
        s.style.animationDelay = `${Math.random() * 0.18}s`;
        sparklesEl.appendChild(s);
      }
      window.setTimeout(() => { sparklesEl.innerHTML = ""; }, 1500);
    }

    function spawnConfetti(count = 70) {
      if (!confettiEl) return;
      confettiEl.innerHTML = "";
      for (let i = 0; i < count; i += 1) {
        const bit = document.createElement("span");
        bit.className = "test-bit";
        const angle = Math.random() * Math.PI * 2;
        const dist = 90 + Math.random() * 260;
        bit.style.left = `${40 + Math.random() * 20}%`;
        bit.style.top = `${38 + Math.random() * 18}%`;
        bit.style.background = COLORS[i % COLORS.length];
        bit.style.setProperty("--cx", `${Math.cos(angle) * dist}px`);
        bit.style.setProperty("--cy", `${Math.sin(angle) * dist + 120}px`);
        bit.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
        bit.style.animationDelay = `${Math.random() * 0.22}s`;
        confettiEl.appendChild(bit);
      }
      window.setTimeout(() => { confettiEl.innerHTML = ""; }, 2000);
    }

    function stopPlayer() {
      const audio = $("#revealAudio");
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      playerRunning = false;
      const btn = $("#revealPlay");
      if (btn) {
        btn.textContent = "▶";
        btn.setAttribute("aria-label", "Abspielen");
      }
      const bar = $("#revealBar");
      if (bar) bar.style.width = "0%";
      const time = $("#revealTime");
      if (time) time.textContent = "0:00";
    }

    function fmtTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    }

    function togglePlayer() {
      const audio = $("#revealAudio");
      const btn = $("#revealPlay");
      if (!audio) return;
      if (audio.paused) {
        audio.play().then(() => {
          playerRunning = true;
          if (btn) {
            btn.textContent = "❚❚";
            btn.setAttribute("aria-label", "Pause");
          }
        }).catch(() => {
          playerRunning = false;
        });
      } else {
        audio.pause();
        playerRunning = false;
        if (btn) {
          btn.textContent = "▶";
          btn.setAttribute("aria-label", "Abspielen");
        }
      }
    }

    function wirePlayer() {
      const audio = $("#revealAudio");
      const bar = $("#revealBar");
      const time = $("#revealTime");
      const btn = $("#revealPlay");
      if (!audio) return;
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
          if (bar) bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
          if (time) time.textContent = fmtTime(audio.currentTime);
        }
      });
      audio.addEventListener("ended", () => {
        playerRunning = false;
        if (btn) {
          btn.textContent = "▶";
          btn.setAttribute("aria-label", "Abspielen");
        }
        if (bar) bar.style.width = "0%";
        if (time) time.textContent = "0:00";
        audio.currentTime = 0;
      });
      if (btn) btn.addEventListener("click", togglePlayer);
    }

    function wireCoupon() {
      const copyBtn = $("#revealCopy");
      const codeEl = $("#revealCode");
      if (!copyBtn || !codeEl) return;
      copyBtn.addEventListener("click", () => {
        const code = codeEl.textContent;
        const done = () => {
          copyBtn.textContent = "Kopiert!";
          window.setTimeout(() => { copyBtn.textContent = "Kopieren"; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(done).catch(done);
        } else {
          done();
        }
      });
    }

    function wireAngel() {
      const btn = $("#revealAngel");
      const card = $("#revealAngelCard");
      const text = $("#revealAngelText");
      if (!btn || !card || !text || !ENGELSKARTEN.length) return;
      btn.addEventListener("click", () => {
        text.textContent = ENGELSKARTEN[Math.floor(Math.random() * ENGELSKARTEN.length)];
        card.hidden = false;
        card.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "nearest"
        });
      });
    }

    function buildContent() {
      if (!contentEl || !currentDoor) return;
      const door = currentDoor;
      const type = typeOf(door);
      const isAudio = type === "audio";
      const isCoupon = type === "coupon";

      const eyebrow = isCoupon ? "Dein Coupon" : isAudio ? "Dein Audio" : "Dein Geschenk";
      let html = `<p class="eyebrow">${eyebrow}</p><h2>${escapeHtml(door.title)}</h2>`;

      if (isAudio) {
        html += `
          <div class="test-player">
            <audio id="revealAudio" src="${escapeHtml(audioSrc(door.day))}" preload="metadata"></audio>
            <button class="test-player__btn" id="revealPlay" type="button" aria-label="Abspielen">▶</button>
            <div class="test-player__info">
              <div class="test-player__bar"><span id="revealBar"></span></div>
              <div class="test-player__meta"><span id="revealTime">0:00</span><span>ca. 5 Min.</span></div>
            </div>
          </div>
          ${planLink(door)}`;
      } else if (isCoupon) {
        const code = door.couponCode || `GRACE-${pad(door.day)}`;
        const links = contactLinks(door);
        html += `
          <div class="test-coupon">
            <span class="test-coupon__label">Dein Code</span>
            <code class="test-coupon__code" id="revealCode">${escapeHtml(code)}</code>
            <button class="test-coupon__copy" id="revealCopy" type="button">Kopieren</button>
          </div>
          <p class="test-reveal__draw">Nenne den Code bei deiner Buchung – ich freue mich auf dich.</p>`;
        if (door.link) {
          html += `<p class="test-coupon__booking"><a class="text-link" href="${escapeHtml(door.link)}" target="_blank" rel="noopener">${escapeHtml(door.button || "Termin buchen")} <span aria-hidden="true">→</span></a></p>`;
        }
        html += `
          <p class="test-contact">Fragen zum Coupon? Schreib mir auf <a href="${escapeHtml(links.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a> oder per <a href="${escapeHtml(links.email)}">E-Mail</a>.</p>`;
      } else {
        const links = contactLinks(door);
        html += `
          <p class="test-reveal__draw">Alle, die angemeldet sind, sind heute automatisch im Lostopf. Ich ziehe heute Abend und melde mich bei der Gewinnerin oder dem Gewinner per Mail.</p>
          <p class="test-contact">So löst du deinen Gewinn ein: Schreib mir auf <a href="${escapeHtml(links.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a> oder per <a href="${escapeHtml(links.email)}">E-Mail</a> – wir finden gemeinsam einen Termin.</p>
          ${planLink(door)}`;
      }

      if (!isAudio) {
        html += `
          <div class="test-reveal__angel">
            <button type="button" class="test-angel-toggle" id="revealAngel">✦ Zieh deine Engelskarte</button>
            <div class="test-angel-card" id="revealAngelCard" hidden><p id="revealAngelText"></p></div>
          </div>`;
      }

      html += `
        <div class="test-reveal__link">
          <a class="button button--light test-pog" href="${POG_URL}" target="_blank" rel="noopener">
            <span>Mehr über Path of Grace</span>
            <svg class="button__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>
          </a>
        </div>`;

      contentEl.innerHTML = html;
      wirePlayer();
      wireCoupon();
      wireAngel();
    }

    function open() {
      if (!currentDoor || !doorEl || !envelopeEl || doorEl.classList.contains("is-open")) return;
      clearTimers();
      doorEl.classList.add("is-open");
      spawnSparkles();
      stopPlayer();
      buildContent();

      later(() => {
        doorEl.hidden = true;
        envelopeEl.hidden = false;
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
          envelopeEl.classList.add("is-visible");
          later(() => {
            envelopeEl.classList.add("is-open");
            spawnConfetti();
            later(() => {
              const rect = envelopeEl.getBoundingClientRect();
              const header = document.querySelector(".site-header");
              const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
              const fits = rect.bottom <= window.innerHeight - 20 && rect.top >= headerBottom + 12;
              if (!fits) {
                const top = Math.max(0, window.scrollY + rect.top - headerBottom - 20);
                window.scrollTo({
                  top,
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
                });
              }
            }, 460);
          }, 120);
        }));
      }, 420);
    }

    function reset() {
      clearTimers();
      stopPlayer();
      if (sparklesEl) sparklesEl.innerHTML = "";
      if (confettiEl) confettiEl.innerHTML = "";
      if (doorEl) {
        doorEl.hidden = false;
        doorEl.classList.remove("is-open");
      }
      if (envelopeEl) {
        envelopeEl.classList.remove("is-visible", "is-open");
        later(() => { envelopeEl.hidden = true; }, 420);
      }
    }

    function isOpen() {
      return Boolean(doorEl && doorEl.classList.contains("is-open"));
    }

    return { setDoor, open, reset, isOpen };
  }

  window.AdventReveal = { create };
})();
