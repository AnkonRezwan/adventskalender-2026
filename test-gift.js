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
  const resetBtn = $("#testReset");
  const door = $("#testDoor");
  const doorNum = $("#testDoorNum");
  const doorType = $("#testDoorType");
  const doorDate = $("#testDoorDate");
  const sparkles = $("#testSparkles");
  const reveal = $("#testReveal");
  const revealEyebrow = $("#testRevealEyebrow");
  const revealTitle = $("#testRevealTitle");
  const revealDraw = $("#testRevealDraw");
  const revealAudio = $("#testRevealAudio");
  const redeemBtn = $("#testRedeem");
  const angelBtn = $("#testAngel");
  const success = $("#testSuccess");
  const successText = $("#testSuccessText");
  const confetti = $("#testConfetti");
  const replayBtn = $("#testReplay");

  let currentDoor = DOORS[0] || { day: 1, type: "gift", title: "Geschenk" };
  let angelCard = null;

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
    doorType.textContent = forcedType === "gift" ? "Geschenk" : "Audio";
    doorDate.textContent = `${weekday(day)}, ${day}. Dez.`;
  }

  function spawnSparkles(count = 26) {
    sparkles.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
      const s = document.createElement("span");
      s.className = "test-spark";
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 190;
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

  function openDoor() {
    if (door.classList.contains("is-open")) return;
    door.classList.add("is-open");
    spawnSparkles();

    const isGift = currentDoor.type === "gift";
    revealEyebrow.textContent = isGift ? "Dein Geschenk" : "Dein Audio";
    revealTitle.textContent = currentDoor.title;
    revealDraw.hidden = !isGift;
    revealAudio.hidden = isGift;
    redeemBtn.querySelector("span").textContent = isGift ? "Jetzt einlösen" : "Audio anhören";
    angelBtn.hidden = !isGift;

    if (angelCard) {
      angelCard.remove();
      angelCard = null;
    }

    window.setTimeout(() => show(reveal), 620);
  }

  function redeem() {
    hide(reveal);
    const isGift = currentDoor.type === "gift";
    successText.textContent = isGift
      ? "Dein Geschenk ist für dich reserviert. Die Details findest du in deiner E-Mail."
      : "Viel Freude beim Hören. Dein Audio bleibt in deinem Postfach verfügbar.";
    success.querySelector("h2").textContent = isGift
      ? "Viel Freude mit deinem Geschenk."
      : "Dein Audio ist bereit.";
    window.setTimeout(() => {
      show(success);
      if (isGift) spawnConfetti();
    }, 420);
  }

  function drawAngelCard() {
    if (!ENGELSKARTEN.length) return;
    if (angelCard) angelCard.remove();
    angelCard = document.createElement("div");
    angelCard.className = "test-angel-card";
    angelCard.innerHTML = `<p>${ENGELSKARTEN[Math.floor(Math.random() * ENGELSKARTEN.length)]}</p>`;
    reveal.appendChild(angelCard);
  }

  function reset() {
    door.classList.remove("is-open");
    hide(reveal);
    hide(success);
    sparkles.innerHTML = "";
    confetti.innerHTML = "";
    if (angelCard) {
      angelCard.remove();
      angelCard = null;
    }
    syncDoor();
  }

  door.addEventListener("click", openDoor);
  redeemBtn.addEventListener("click", redeem);
  angelBtn.addEventListener("click", drawAngelCard);
  replayBtn.addEventListener("click", () => {
    reset();
    window.setTimeout(openDoor, 480);
  });
  resetBtn.addEventListener("click", reset);
  daySelect.addEventListener("change", reset);
  typeSelect.addEventListener("change", reset);

  syncDoor();
})();