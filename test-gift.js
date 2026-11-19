/* ==========================================================================
   Testmodus – Geschenk-Öffnung
   ========================================================================== */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const pad = (n) => String(n).padStart(2, "0");
  const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const COLORS = ["#d6b46a", "#cfa6a0", "#b8bfae", "#ecd7a7", "#4b3145", "#f8f3eb"];

  const DOORS = window.ADVENT_DOORS || [];
  const ENGELSKARTEN = window.ADVENT_ENGELSKARTEN || [];

  const daySelect = $("#testDay");
  const typeSelect = $("#testType");

  const door = $("#testDoor");
  const doorNum = $("#testDoorNum");
  const doorType = $("#testDoorType");
  const doorDate = $("#testDoorDate");
  const sparkles = $("#testSparkles");
  const envelope = $("#testEnvelope");
  const content = $("#testContent");
  const confetti = $("#testConfetti");
  const success = $("#testSuccess");
  const successTitle = $("#testSuccessTitle");
  const successText = $("#testSuccessText");
  const replayBtn = $("#testReplay");

  let currentDoor = DOORS[0] || { day: 1, type: "gift", title: "Dein Geschenk" };
  let playerRunning = false;

  function weekday(day) {
    return WEEKDAYS[new Date(Date.UTC(2026, 11, day)).getUTCDay()];
  }

  function syncDoor() {
    const day = Number(daySelect.value);
    const forcedType = typeSelect.value;
    const found = DOORS.find((d) => d.day === day);
    currentDoor = found
      ? { ...found, type: forcedType }
      : { day, type: forcedType, title: "Dein Türchen", button: "Mehr erfahren", link: "#" };

    doorNum.textContent = pad(day);
    doorType.textContent =
      forcedType === "gift" ? "Geschenk" : forcedType === "coupon" ? "Coupon" : "Audio";
    doorDate.textContent = `${weekday(day)}, ${day}. Dez.`;
  }

  function spawnSparkles(count = 28) {
    sparkles.innerHTML = "";
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
      sparkles.appendChild(s);
    }
    window.setTimeout(() => { sparkles.innerHTML = ""; }, 1500);
  }

  function spawnConfetti(count = 70) {
    confetti.innerHTML = "";
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
      confetti.appendChild(bit);
    }
    window.setTimeout(() => { confetti.innerHTML = ""; }, 2000);
  }

  function show(element) {
    element.hidden = false;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => element.classList.add("is-visible")));
  }

  function hide(element) {
    element.classList.remove("is-visible");
    window.setTimeout(() => { element.hidden = true; }, 420);
  }

  function stopPlayer() {
    const audio = $("#testAudio");
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    playerRunning = false;
    const btn = $("#testPlayBtn");
    if (btn) btn.innerHTML = "▶";
    const bar = $("#testPlayerBar");
    if (bar) bar.style.width = "0%";
    const time = $("#testPlayerTime");
    if (time) time.textContent = "0:00";
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function togglePlayer() {
    const audio = $("#testAudio");
    const btn = $("#testPlayBtn");
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      playerRunning = true;
      if (btn) btn.innerHTML = "❚❚";
    } else {
      audio.pause();
      playerRunning = false;
      if (btn) btn.innerHTML = "▶";
    }
  }

  function wirePlayer() {
    const audio = $("#testAudio");
    const bar = $("#testPlayerBar");
    const time = $("#testPlayerTime");
    const btn = $("#testPlayBtn");
    if (!audio) return;
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        if (bar) bar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        if (time) time.textContent = fmtTime(audio.currentTime);
      }
    });
    audio.addEventListener("ended", () => {
      playerRunning = false;
      if (btn) btn.innerHTML = "▶";
      if (bar) bar.style.width = "0%";
      if (time) time.textContent = "0:00";
      audio.currentTime = 0;
    });
    if (btn) btn.addEventListener("click", togglePlayer);
  }

  function buildContent() {
    const isGift = currentDoor.type === "gift";
    const isCoupon = currentDoor.type === "coupon";
    const isAudio = currentDoor.type === "audio";

    const eyebrow = isGift ? "Dein Geschenk" : isCoupon ? "Dein Coupon" : "Dein Audio";
    const title = currentDoor.title;

    let html = `<p class="eyebrow">${eyebrow}</p><h2>${escapeHtml(title)}</h2>`;

    if (isAudio) {
      const audioTitle = currentDoor.title;
      html += `
        <div class="test-player" id="testPlayer">
          <audio id="testAudio" src="assets/audio/test-melody.wav" preload="auto"></audio>
          <button class="test-player__btn" id="testPlayBtn" type="button" aria-label="Abspielen">▶</button>
          <div class="test-player__info">
            <div class="test-player__bar"><span id="testPlayerBar"></span></div>
            <div class="test-player__meta"><span id="testPlayerTime">0:00</span><span>ca. 5 Min.</span></div>
          </div>
        </div>
        <p class="test-reveal__draw" style="display:none"></p>`;
    } else if (isCoupon) {
      const code = `GRACE-${String(currentDoor.day).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      html += `
        <div class="test-coupon">
          <span class="test-coupon__label">Dein Code</span>
          <code class="test-coupon__code" id="testCouponCode">${code}</code>
          <button class="test-coupon__copy" id="testCopyBtn" type="button">Kopieren</button>
        </div>`;
    } else {
      html += `
        <p class="test-reveal__draw">Alle, die angemeldet sind, sind heute automatisch im Lostopf. Ich ziehe heute Abend und melde mich bei der Gewinnerin oder dem Gewinner per Mail.</p>`;
    }

    const poGButton = `<a class="button button--light test-pog" href="https://pathofgrace.de/" target="_blank" rel="noopener">
          <span>Mehr über Path of Grace</span>
          <svg class="button__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>
        </a>`;

    if (isGift || isCoupon) {
      html += `
        <div class="test-reveal__actions">
          <button class="button button--primary" id="testRedeem" type="button">
            <span>Jetzt einlösen</span>
            <svg class="button__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>
          </button>
          <button class="button button--gold" id="testAngel" type="button">
            <span>Zieh deine Engelskarte</span>
          </button>
        </div>
        <div class="test-reveal__link">${poGButton}</div>`;
    } else {
      html += `
        <div class="test-reveal__actions">
          <button class="button button--primary" id="testRedeem" type="button">
            <span>Fertig</span>
            <svg class="button__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>
          </button>
          <button class="button button--gold" id="testAngel" type="button">
            <span>Zieh deine Engelskarte</span>
          </button>
        </div>
        <div class="test-reveal__link">${poGButton}</div>`;
    }

    content.innerHTML = html;

    // Wire up interactions
    const redeemBtn = $("#testRedeem");
    const angelBtn = $("#testAngel");
    const playBtn = $("#testPlayBtn");
    const copyBtn = $("#testCopyBtn");

    wirePlayer();
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const code = $("#testCouponCode").textContent;
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.textContent = "Kopiert!";
          setTimeout(() => { copyBtn.textContent = "Kopieren"; }, 1800);
        }).catch(() => {
          copyBtn.textContent = "Kopiert!";
          setTimeout(() => { copyBtn.textContent = "Kopieren"; }, 1800);
        });
      });
    }
    if (redeemBtn) {
      redeemBtn.addEventListener("click", () => {
        stopPlayer();
        hide(envelope);
        const isGift = currentDoor.type === "gift" || currentDoor.type === "coupon";
        successTitle.textContent = isGift ? "Viel Freude mit deinem Geschenk." : "Dein Audio ist bereit.";
        successText.textContent = isGift
          ? "Dein Geschenk ist für dich reserviert. Die Details findest du in deiner E-Mail."
          : "Viel Freude beim Hören. Dein Audio bleibt in deinem Postfach verfügbar.";
        window.setTimeout(() => {
          show(success);
          if (isGift) spawnConfetti();
        }, 420);
      });
    }
    if (angelBtn) {
      angelBtn.addEventListener("click", () => {
        if (ENGELSKARTEN.length) {
          const existing = content.querySelector(".test-angel-card");
          if (existing) existing.remove();
          const card = document.createElement("div");
          card.className = "test-angel-card";
          card.innerHTML = `<p>${escapeHtml(ENGELSKARTEN[Math.floor(Math.random() * ENGELSKARTEN.length)])}</p>`;
          content.appendChild(card);
        }
      });
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function openDoor() {
    if (door.classList.contains("is-open")) return;
    door.classList.add("is-open");
    spawnSparkles();
    stopPlayer();

    window.setTimeout(() => {
      envelope.hidden = false;
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        envelope.classList.add("is-visible");
        window.setTimeout(() => envelope.classList.add("is-open"), 120);
      }));
      buildContent();
    }, 520);
  }

  function reset() {
    door.classList.remove("is-open");
    envelope.classList.remove("is-visible", "is-open");
    window.setTimeout(() => { envelope.hidden = true; }, 420);
    hide(success);
    sparkles.innerHTML = "";
    confetti.innerHTML = "";
    stopPlayer();
    syncDoor();
  }

  door.addEventListener("click", openDoor);
  replayBtn.addEventListener("click", () => {
    reset();
    window.setTimeout(openDoor, 480);
  });
  daySelect.addEventListener("change", reset);
  typeSelect.addEventListener("change", reset);

  syncDoor();
})();