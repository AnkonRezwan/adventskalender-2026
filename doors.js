/* ==========================================================================
   Path of Grace · Adventskalender 2026
   Shared door plan and Engelskarten. Loaded before script.js / door scripts.
   ========================================================================== */

window.ADVENT_LINKS = {
  path: "https://pathofgrace.de/",
  offer: "https://pathofgrace.de/#angebot",
  klar: "https://pathofgrace.de/",
  tief: "https://pathofgrace.de/",
  retreat: "https://pathofgrace.de/retreat-bad-hindelang-2027/",
  gong: "https://pathofgrace.de/programm-gong/",
  klarheits: "https://pathofgrace.de/programm-klarheits-session",
  osteo: "https://gabriele-storz.de/physiotherapie",
  yoga: "https://gabriele-storz.de/yoga",
  soul: "https://gabriele-storz.de/einzelsitzungen",
  praxis: "https://gabriele-storz.de/",
  booking: "https://gabriele-storz.de/booking",
  intro: "https://calendly.com/gabriele-storz/the-path-of-grace-erstgesprach",
  courses: "https://gabriele-storz.de/courses"
};

window.ADVENT_CONTACT = {
  whatsapp: "https://api.whatsapp.com/send?phone=4917653620975",
  email: "info@gabriele-storz.de"
};

window.ADVENT_DOORS = [
  { day: 1, slug: "herz-ankommen", type: "audio", special: true, title: "Willkommen – Hände aufs Herz (ca. 5 Min.)", button: "Mehr über Path of Grace", link: "https://pathofgrace.de/" },
  { day: 2, slug: "goldener-funke", type: "gift", coupon: true, couponCode: "WZA3N268", title: "50 % auf meine 1:1-Begleitung", button: "Orientierungsgespräch buchen", link: "https://calendly.com/gabriele-storz/the-path-of-grace-erstgesprach" },
  { day: 3, slug: "sanfter-atem", type: "audio", title: "Summen und lange Ausatmung", button: "Zu den Online-Räumen", link: "https://pathofgrace.de/#angebot" },
  { day: 4, slug: "weiter-fluss", type: "gift", title: "Yogastunde", button: "Zu meinen Yogastunden", link: "https://gabriele-storz.de/yoga" },
  { day: 5, slug: "klare-grenze", type: "audio", title: "Arme und Schultern halten – Grenzen spüren", button: "Zu „Klar sehen“", link: "https://pathofgrace.de/" },
  { day: 6, slug: "stiller-stern", type: "gift", title: "Nikolaus: Grace Klarheits-Session (55 Min.)", button: "Zur Klarheits-Session", link: "https://pathofgrace.de/programm-klarheits-session" },
  { day: 7, slug: "warme-mitte", type: "audio", title: "Hände auf den Bauch – Beckenraum wärmen", button: "Mehr über Path of Grace", link: "https://pathofgrace.de/" },
  { day: 8, slug: "helles-licht", type: "gift", title: "Ein Platz im Online-Raum „Klar sehen“", button: "Zu „Klar sehen“", link: "https://pathofgrace.de/" },
  { day: 9, slug: "weiche-ruhe", type: "audio", title: "Kiefer und Schultern loslassen", button: "Meine Osteopathie kennenlernen", link: "https://gabriele-storz.de/physiotherapie" },
  { day: 10, slug: "tiefe-seele", type: "gift", title: "Soul Session", button: "Zur Soul Session", link: "https://gabriele-storz.de/einzelsitzungen" },
  { day: 11, slug: "wache-kraft", type: "audio", title: "Yoga-Impuls – die Wirbelsäule wecken", button: "Zu meinen Yogastunden", link: "https://gabriele-storz.de/yoga" },
  { day: 12, slug: "freier-tanz", type: "gift", title: "Vergünstigung für Let It Flow (2.–5. Januar)", button: "Zu meiner Praxis", link: "https://gabriele-storz.de/" },
  { day: 13, slug: "stilles-feuer", type: "audio", title: "Dein inneres Feuer – sanfter Atem", button: "Zu „Tief spüren“", link: "https://pathofgrace.de/" },
  { day: 14, slug: "zarte-hand", type: "gift", title: "Osteopathie-Behandlung", button: "Termin anfragen", link: "https://gabriele-storz.de/booking" },
  { day: 15, slug: "naehrende-zeit", type: "audio", title: "Sinnlichkeit im Alltag – Berührung, die nährt", button: "Zu „Tief spüren“", link: "https://pathofgrace.de/" },
  { day: 16, slug: "ferner-berg", type: "gift", title: "Vergünstigung für einen Retreatplatz", button: "Zum Retreat", link: "https://pathofgrace.de/retreat-bad-hindelang-2027/" },
  { day: 17, slug: "leichtes-los", type: "audio", title: "Loslass-Ritual – was willst du nicht mehr tragen?", button: "Orientierungsgespräch buchen", link: "https://calendly.com/gabriele-storz/the-path-of-grace-erstgesprach" },
  { day: 18, slug: "atem-schwingt", type: "gift", title: "Yogastunde", button: "Zu meinen Yogastunden", link: "https://gabriele-storz.de/yoga" },
  { day: 19, slug: "dankbarer-blick", type: "audio", title: "Rückschau – was hat dich dieses Jahr getragen?", button: "Mehr über Path of Grace", link: "https://pathofgrace.de/" },
  { day: 20, slug: "klarer-raum", type: "gift", title: "Ein Platz im Online-Raum „Klar sehen“", button: "Zu „Klar sehen“", link: "https://pathofgrace.de/" },
  { day: 21, slug: "winters-licht", type: "audio", title: "Wintersonnwende – Licht in der längsten Nacht", button: "Mehr über Path of Grace", link: "https://pathofgrace.de/" },
  { day: 22, slug: "ruhiger-puls", type: "gift", title: "Osteopathie-Behandlung", button: "Termin anfragen", link: "https://gabriele-storz.de/booking" },
  { day: 23, slug: "neuer-wunsch", type: "audio", title: "Rückzug in die Stille – zurück in dein Herz", button: "Zu den Online-Räumen", link: "https://pathofgrace.de/#angebot" },
  { day: 24, slug: "heilige-stille", type: "gift", title: "Heiligabend: Ein Platz im Online-Raum „Klar sehen“", button: "Zu den Online-Räumen", link: "https://pathofgrace.de/#angebot" }
];

window.ADVENT_ENGELSKARTEN = [
  "Du bist schon genug – genau so.",
  "Spüre deinen Atem – gerade jetzt.",
  "Deine Weichheit ist eine Kraft.",
  "Heute reicht es, freundlich zu dir zu sein.",
  "Spüre deinen Körper von den Füßen bis zum Kopf. Lass dir Zeit zum Fühlen.",
  "Was du suchst, ist als Energiesignatur schon in dir. Spüre sie jetzt.",
  "Ein Nein zu anderen kann ein Ja zu dir sein.",
  "Langsam ist auch ein Tempo.",
  "Dein Herz weiß den nächsten Schritt.",
  "Lass los, was nicht mehr deins ist.",
  "Du musst heute nichts beweisen.",
  "In der Stille hörst du dich.",
  "Was macht dich lebendig?",
  "Leg die Hand aufs Herz und bleib ein bisschen.",
  "Was nährt dich?",
  "Freude ist deine Basis. Was bringt dir heute Freude?",
  "Vertrau dem, was du spürst.",
  "Jeder Atemzug bringt dich näher zu dir.",
  "Lass dein Licht leuchten – breite es jetzt aus.",
  "Sei wild, lebe und lache – das Leben ist viel zu kurz.",
  "Deine Wahrheit braucht keine Erlaubnis.",
  "Was dich nährt, ist wichtig.",
  "Nimm dich selbst in den Arm und atme.",
  "Folge deinem Herzen."
];
