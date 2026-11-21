# Mein Adventskalender – 24 Türchen zurück zu dir

Statische Landingpage für **Path of Grace · Gabriele Storz** zum Adventskalender
vom **1.–24. Dezember 2026**.

Die Seite ist ohne Build-Schritt lauffähig: HTML, CSS, JavaScript sowie lokale
Schriften und Bilder. Es werden keine externen CDNs geladen.

## Schnellstart

Im Ordner `adventskalender/` einen lokalen Server starten:

```powershell
python -m http.server 4173
```

Danach öffnen: <http://localhost:4173/>

Ein Server ist nötig, damit Schriftdateien und der Kalender korrekt geladen
werden. Ein direkter Doppelklick auf `index.html` funktioniert ebenfalls, ist
aber nicht zum Testen von Links und Caching gedacht.

## Vorschau- und Testmodi

| URL | Zweck |
| --- | --- |
| `/` | Öffentliche Ansicht. Vor dem 1. Dezember sind alle Türchen geschlossen. |
| `/?datum=2026-12-05` | Simuliert ein Datum (nur für Tests). Türchen 1–4 sind geöffnet, Türchen 5 ist „heute“, Türchen 6-24 geschlossen. |
| `/?vorschau=1` | Interne Vorschau: alle 24 Türchen zeigen ihren Teaser-Inhalt. Funktioniert **nur auf `localhost`, `127.0.0.1` oder per `file://`**. |
| `/?vorschau=grace-advent-2026` | Derselbe Vorschaumodus auf Staging/Produktion. Der Token steht in `script.js` (`PREVIEW_TOKEN`). |
| `/tuer.html?nr=5` | Echtes Türchen 5. Der Link wird pro Tag per Brevo verschickt und ist öffentlich nicht verlinkt. |
| `/test-gift.html` | Testseite für alle 24 Türchen: Tag auswählen, Türchen öffnen, Audio/Geschenk/Coupon prüfen. |

Der Vorschaumodus auf der Startseite zeigt nur die Teaser-Texte aus der
`DOORS`-Liste in `script.js`. Die echten Inhalte liegen auf `tuer.html` und
werden aus `doors.js` aufgebaut.

Die Türchen-URLs sind bewusst einfach (`?nr=5`) und damit erratbar. Für echten
Zugriffsschutz müsste der Link z. B. über einen signierten Token oder eine
serverseitige Prüfung abgesichert werden. Für den aktuellen Ablauf reicht die
Tatsache, dass die Links nur in den Brevo-Mails stehen und `tuer.html` auf
`noindex, nofollow` gesetzt ist.

## Was auf der Seite steckt

- **Hero** mit echter Schnee-Animation (Canvas), Portrait, Anmeldeformular und
  Kennzahlen-Leiste.
- **Adventskalender** mit 24 Türchen, Datumssteuerung nach `Europe/Berlin`,
  hervorgehobenem 1. Türchen und responsivem Raster (7 / 5 / 4 Spalten).
- **Türchen-Dialog**: geschlossene Türchen zeigen das Öffnungsdatum,
  geöffnete Türchen den Anmelde-Hinweis und ein Formular. In der Vorschau wird
  der jeweilige Teaser-Inhalt sichtbar.
- **Das erste Türchen** als große Feature-Sektion mit exaktem Briefing-Text.
- **Was dich erwartet**, **Über mich**, **FAQ**, **finale Anmeldung**, Footer.
- **Türchen-Seite** (`tuer.html?nr=1` bis `?nr=24`): geschlossenes Türchen,
  Öffnungsanimation, Umschlag und Inhalt. Ungerade Tage zeigen einen
  Audio-Player, gerade Tage ein Geschenk. Tag 2 zeigt zusätzlich einen
  Coupon-Code; alle anderen Geschenke werden per WhatsApp oder E-Mail
  eingelöst.
- **Testseite** (`test-gift.html`) mit Tagesauswahl für alle 24 Türchen.
- **Bestätigungsseite** (`bestaetigung.html`) und **Danke-Seite** (`danke.html`)
  im gleichen Design.
- Lokale Fonts (Cormorant Garamond, Lora), lokale Bilder, keine externen
  Requests.
- Barrierefreiheit: Tastaturbedienung, Fokus-Styles, `prefers-reduced-motion`,
  semantische Struktur, Skip-Link und native `<dialog>`-Elemente.

## Dateien

```text
adventskalender/
├─ index.html                 Landingpage
├─ styles.css                 gesamtes Design und Responsive-Regeln
├─ script.js                  Kalender, Dialog, Formulare, FAQ, Schnee
├─ doors.js                   Türchenplan, Links, Kontaktadressen, Engelskarten
├─ tuer.html                  Rahmen der echten Türchen-Seite (?nr=1–24)
├─ tuer.js                    Türchen-Seite: Tag auslesen und rendern
├─ reveal.js                  Türchen-Öffnung, Umschlag, Audio, Coupon, Konfetti
├─ test-gift.html             Testseite mit Tagesauswahl
├─ test-gift.css              Umschlag-, Player- und Testseiten-Styles
├─ test-gift.js               Testseite: Tagesauswahl und Öffnung
├─ bestaetigung.html          „Schau in dein Postfach“
├─ danke.html                 „Schön, dass du dabei bist“
├─ README.md
└─ assets/
   ├─ audio/                  Platzhalter-Audios für die 12 Audio-Türchen
   ├─ fonts/                  lokale woff2-Dateien
   ├─ images/                 Portrait, Blume, Markenzeichen, Favicon, OG-Bild
   └─ ...
```

### Texte ändern

- Statische Texte: direkt in `index.html`.
- Türchen-Titel, Typ, Ziel-Link und Coupon: `ADVENT_DOORS` in `doors.js`.
- WhatsApp- und E-Mail-Adresse für die Einlösung: `ADVENT_CONTACT` in `doors.js`.
- Bestätigungs-/Danke-Texte: `bestaetigung.html` und `danke.html`.
- Urheberrechtszeile und Footer-Links: Ende von `index.html` bzw. `tuer.html`.

### Farben, Schriften, Abstände

Alles zentral in `styles.css` unter `:root`:

```css
--ivory: #f8f3eb;
--champagne: #e6d6bf;
--rose: #cfa6a0;
--sage: #b8bfae;
--plum: #4b3145;
--gold: #d6b46a;
--font-display: "Cormorant Garamond", ...;
--font-body: "Lora", ...;
```

## Brevo-Anbindung (vor dem Launch zwingend)

Die drei Formulare sind aktuell **Prototypen**. Sie validieren die Eingaben und
zeigen die gewünschte Bestätigung, versenden aber keine Daten.

### 1. Brevo-Formular anlegen

In Brevo ein Formular mit mindestens diesen Feldern anlegen:

- `Vorname` → `firstname`
- `E-Mail-Adresse` → `email` (Pflichtfeld)
- Einwilligung/Datenschutz (Pflichtfeld)

Double-Opt-in aktivieren. Als Ziel nach der Bestätigung `danke.html` verwenden.
Die Einwilligung muss für die Dokumentation revisionssicher gespeichert werden.

### 2. Formulare ersetzen

Die Platzhalter sind mit `BREVO-EMBED` markiert:

- **Hero:** `index.html`, ca. Zeile 177
- **Finale Anmeldung:** `index.html`, ca. Zeile 517
- **Geöffnetes Türchen (Dialog):** `script.js`, Funktion
  `signupFormMarkup()` (ca. Zeile 208)

Brevo-HTML dort einsetzen und die jeweiligen Prototyp-Formulare entfernen.
Wichtig: Die echten Brevo-Formulare dürfen **nicht** das Attribut
`data-signup-form` tragen, sonst greift die Demo-Validierung aus `script.js`.
Alternativ `initForms()` aus `script.js` entfernen, sobald keine
Prototyp-Formulare mehr existieren.

Das Design der Brevo-Formulare kann über die vorhandenen Klassen
(`.signup-form`, `.field`, `.field__input`, `.check`, `.button`) angepasst
werden. Brevo liefert eigenes Markup; am einfachsten dessen Wrapper mit den
Klassen versehen oder per CSS auf die Brevo-Klassen zielen.

### 3. Bestätigungs- und Danke-Seite

- `bestaetigung.html` = Zustand direkt nach dem Absenden („Schau in dein
  Postfach …“).
- `danke.html` = Ziel nach Klick auf den Bestätigungslink (Double-Opt-in).

In Brevo die Redirect-URLs entsprechend setzen. Die genaue Bestätigungs-Mail
von Brevo sollte dieselbe Tonalität und denselben Wortlaut wie
`bestaetigung.html` verwenden.

### 4. Türchen-Versand

Alle 24 Türchen liegen in **einer** Vorlage: `tuer.html?nr=1` bis `?nr=24`.
Der öffentliche Kalender verlinkt diese Seiten nicht; sie werden nur über die
tägliche Brevo-Mail verschickt.

1. Pro Tag eine Brevo-Automation mit dem Link
   `https://pathofgrace.de/adventskalender/tuer.html?nr=N` versenden.
2. Die Seiten sind auf `noindex, nofollow` gesetzt und stehen nicht in der
   Sitemap.
3. `doors.js` ist die einzige Quelle für Titel, Typ, Ziel-Link und Coupon.
4. Die Türchen-URLs sind erratbar. Wenn echter Zugriffsschutz gewünscht ist,
   muss ein signierter Token oder eine serverseitige Prüfung ergänzt werden.

### 5. Audios, Geschenke und Coupon

**Audios (ungerade Tage):** In `reveal.js` liefert `audioSrc(day)` den Pfad
`assets/audio/tuerchen-NN.wav`. Aktuell liegen dort 12 Platzhalter mit einem
kurzen Testton (ca. 4 Sekunden). Sobald die echten MP3s von Gabriele vorliegen:

1. Die MP3s als `tuerchen-01.mp3`, `tuerchen-03.mp3`, … ablegen.
2. In `reveal.js` bei `audioSrc()` `.wav` durch `.mp3` ersetzen.
3. Die alten WAV-Dateien entfernen.
4. Die Angabe „ca. 5 Min.“ im Player bei Bedarf an die echte Länge anpassen
   (aktuell statisch im Markup von `reveal.js`).

**Geschenke (gerade Tage):** Jedes Geschenk zeigt den Lostopf-Satz, die
Engelskarte und zwei Textlinks zur Einlösung:

- WhatsApp: `https://api.whatsapp.com/send?phone=4917653620975`
- E-Mail: `info@gabriele-storz.de`

Beides steht zentral in `ADVENT_CONTACT` in `doors.js`. Die WhatsApp-Nummer
stammt von `gabriele-storz.de` und sollte vor dem Launch noch einmal bestätigt
werden.

**Coupon:** Nur Tag 2 ist ein Coupon. Der Code steht in `doors.js` als
`couponCode: "GRACE-1ZU1-50"`. Die Tage 12 und 16 heißen zwar „Vergünstigung“,
werden aber bewusst **nicht** als Coupon dargestellt, sondern wie die übrigen
Geschenke über die Lostopf-/Kontaktlogik eingelöst. Der Code und die
Gültigkeitsdauer müssen noch von Gabriele bestätigt werden.

## Rechtliche Links

Stand jetzt:

- Impressum → <https://gabriele-storz.de/imprint/>
- Datenschutz → <https://gabriele-storz.de/privacy/>
- Teilnahmebedingungen → <https://gabriele-storz.de/terms/> (AGB der Praxis)

Die alten `pathofgrace.de/impressum/`, `/datenschutz/` und
`/teilnahmebedingungen/` liefen ins Leere und wurden ersetzt.

**Offen:** Für den Adventskalender und das Gewinnspiel sollte es eigene
Teilnahmebedingungen geben. Bis dahin zeigt der Footer auf die AGB. Vor dem
Launch entweder eine eigene Seite anlegen und den Link in `index.html`
aktualisieren oder die Bezeichnung im Footer anpassen.

Ebenfalls prüfen: Der Brevo-Versand braucht eine Rechtsgrundlage und einen
Auftragsverarbeitungsvertrag; die Datenschutzerklärung muss Brevo,
Double-Opt-in und die Speicherung der Einwilligung abdecken.

## Datumslogik und Türchen

- Maßgeblich ist `Europe/Berlin` (siehe `berlinToday()` in `script.js`).
- Vor dem 1. Dezember: alle Türchen geschlossen.
- Im Dezember: vergangene Tage und der heutige Tag sind geöffnet; zukünftige
  Tage geschlossen.
- Nach dem 24. Dezember: alle Türchen gelten als geöffnet.
- Öffentlich geöffnete Türchen zeigen immer den Anmelde-Hinweis
  „Melde dich an, um deine Türchen zu bekommen.“ und das Formular.
- Nur der Vorschaumodus zeigt Teaser-Inhalte.

Der Test `/?datum=2026-12-05` ist praktisch, um alle drei Zustände
gleichzeitig zu sehen. `?datum` verrät keine geschützten Inhalte.

## SEO und Social Sharing

- Titel, Description, Canonical und JSON-LD (Event + FAQ) sind gesetzt.
- Social-Preview: `assets/images/og-adventskalender.jpg` (1200 × 630).
- Canonical und OG-URL zeigen auf
  `https://pathofgrace.de/adventskalender/`. Bei anderem Deployment-Pfad
  anpassen (u. a. `index.html` und ggf. `sitemap.xml`).
- Die Bestätigungs- und Danke-Seiten sind auf `noindex, nofollow` gesetzt.

## Qualitätschecks (bereits durchgeführt)

- JavaScript-Syntax: `npm run lint` (inkl. `reveal.js`)
- Keine Konsolenfehler im Browser
- Kein horizontaler Überlauf bei 320, 360, 390, 414, 761, 912, 1020, 1021,
  1120 und 1440 px
- Kalender-Raster: 4 Spalten bis 760 px, 5 Spalten von 761–1020 px,
  7 Spalten ab 1021 px
- Bilder laden, lokale Fonts laden
- Kalender: 24 Türchen, alle Zustände (geschlossen / heute / geöffnet /
  Vorschau) getestet
- Dialog: Öffnen, Schließen, Tastatur, Anmelde-Gate und Formular-Erfolg
- Formulare: leere E-Mail, ungültige E-Mail, fehlende Einwilligung, Erfolg
- Mobile Navigation inkl. Anchor-Sprung und Schließen
- FAQ-Akkordeon
- Bestätigungs- und Danke-Seite auf Desktop und Mobil
- Türchen-Seite: alle 24 Tage automatisiert geöffnet und geprüft
  (Typ, Audio/Coupon, WhatsApp-/E-Mail-Links, POG-Button, Konsole) bei
  320 × 568, 768 × 1024 und 1440 × 900 px
- Testseite: 24 Optionen, Tageswechsel, erneutes Öffnen, Coupon und Audio
- Lighthouse: Accessibility 100, Best Practices 100, SEO 100

## Vor dem Launch abhaken

- [ ] Brevo-Formulare in allen drei Stellen einsetzen und testen.
- [ ] Double-Opt-in-Mail, Absender und Redirects in Brevo prüfen.
- [ ] 12 echte Audios als MP3 liefern und in `reveal.js` auf `.mp3` umstellen.
- [ ] WhatsApp-Nummer und E-Mail-Adresse für die Geschenk-Einlösung bestätigen.
- [ ] Coupon-Code und Gültigkeit für Tag 2 bestätigen.
- [ ] Geschenk-Links final prüfen: `LINKS.klar` und `LINKS.tief` zeigen aktuell
      auf die Startseite; für „Klar sehen“/„Tief spüren“ ggf. eigene Seiten
      einsetzen. Bei „Let It Flow“ ist derzeit die Seminarübersicht verlinkt.
- [ ] Eigene Teilnahmebedingungen anlegen und Footer-Link aktualisieren.
- [ ] Datenschutzerklärung um Brevo, DOI und Gewinnspiel ergänzen.
- [ ] Vorschau-Token entfernen oder rotieren.
- [ ] Canonical/OG-URL an den finalen Pfad anpassen.
- [ ] Impressum-/Datenschutz-Links final gegenprüfen.
- [ ] Auf dem Zielserver unter `/adventskalender/` deployen und alle Links
      erneut testen.
- [ ] Datumstest am 1. Dezember und am 24. Dezember durchführen.

## Hostinger-Import

Die Seite ist statisch und braucht keinen Build. Für Hostinger:

1. Im Hostinger-Dateimanager den Ordner `public_html/adventskalender/` anlegen.
2. Den **Inhalt** von `adventskalender/` hochladen – also `index.html`,
   `styles.css`, `script.js`, `doors.js`, `reveal.js`, `tuer.html`, `tuer.js`,
   `test-gift.html`, `test-gift.css`, `test-gift.js`, `bestaetigung.html`,
   `danke.html` und den kompletten Ordner `assets/`.
3. `server.js`, `package.json`, `README.md`, `.git` und `public/` werden für
   die statische Seite nicht benötigt.
4. Danach `https://pathofgrace.de/adventskalender/` und
   `.../tuer.html?nr=2` testen.
5. Die Brevo-Mails auf dieselbe Domain und denselben Pfad zeigen lassen.

Alternativ kann der Inhalt des Ordners als ZIP hochgeladen und auf Hostinger
entpackt werden. Es sind keine Node.js-Pakete und keine Datenbank nötig.

## Hinweise zu den Bildern

Die Portrait- und Blumenfotos stammen von den öffentlichen Websites von
Gabriele Storz bzw. Path of Grace und wurden für dieses Projekt lokal
eingebunden. Die Veröffentlichungsrechte liegen bei Gabriele Storz. Das
Markenzeichen wurde aus dem Path-of-Grace-Logo extrahiert und als
CSS-Maske verwendet.
