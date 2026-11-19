# Mein Adventskalender – 31 Türchen zurück zu dir

Statische Landingpage für **Path of Grace · Gabriele Storz** zum Adventskalender
vom **1.–31. Dezember 2026**.

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
| `/?datum=2026-12-05` | Simuliert ein Datum (nur für Tests). Türchen 1–4 sind geöffnet, Türchen 5 ist „heute“, Türchen 6–31 geschlossen. |
| `/?vorschau=1` | Interne Vorschau: alle 31 Türchen zeigen ihren Teaser-Inhalt. Funktioniert **nur auf `localhost`, `127.0.0.1` oder per `file://`**. |
| `/?vorschau=grace-advent-2026` | Derselbe Vorschaumodus auf Staging/Produktion. Der Token steht in `script.js` (`PREVIEW_TOKEN`). |

Der Vorschaumodus zeigt nur die Teaser-Texte aus der `DOORS`-Liste, keine
echten Audios oder Türchen-Seiten. Trotzdem vor dem Launch entscheiden, ob der
Token bestehen bleiben soll. Der Token ist kein echter Schutz (er steht im
Quelltext), sondern nur eine Hürde gegen zufälliges Teilen.

## Was auf der Seite steckt

- **Hero** mit echter Schnee-Animation (Canvas), Portrait, Anmeldeformular und
  Kennzahlen-Leiste.
- **Adventskalender** mit 31 Türchen, Datumssteuerung nach `Europe/Berlin`,
  hervorgehobenem 1. Türchen und responsivem Raster (7 / 5 / 4 Spalten).
- **Türchen-Dialog**: geschlossene Türchen zeigen das Öffnungsdatum,
  geöffnete Türchen den Anmelde-Hinweis und ein Formular. In der Vorschau wird
  der jeweilige Teaser-Inhalt sichtbar.
- **Das erste Türchen** als große Feature-Sektion mit exaktem Briefing-Text.
- **Was dich erwartet**, **Über mich**, **FAQ**, **finale Anmeldung**, Footer.
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
├─ bestaetigung.html          „Schau in dein Postfach“
├─ danke.html                 „Schön, dass du dabei bist“
├─ README.md
└─ assets/
   ├─ fonts/                  lokale woff2-Dateien
   └─ images/                 Portrait, Blume, Markenzeichen, Favicon, OG-Bild
```

### Texte ändern

- Statische Texte: direkt in `index.html`.
- Türchen-Titel, Typen und Ziel-Links: `DOORS` in `script.js` (Zeilen ca. 44–76).
- Bestätigungs-/Danke-Texte: `bestaetigung.html` und `danke.html`.
- Urheberrechtszeile und Footer-Links: Ende von `index.html`.

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

Die Landingpage enthält **bewusst keine fertigen Türchen-Inhalte oder
Audio-Dateien**. Der öffentliche Kalender zeigt nur Teaser; die eigentlichen
Inhalte werden täglich per Brevo-Mail verschickt.

Empfohlenes Modell:

1. 31 nicht erratbare Türchen-Seiten anlegen (z. B. `/tueren/2026/01/`,
   jeweils mit Audio, Text und ggf. Geschenk-Link).
2. Diese Seiten nicht verlinken und nicht in die Sitemap aufnehmen.
3. Pro Tag eine Brevo-Automation mit dem jeweiligen Link versenden.
4. Optional: signierte Links oder ein einfaches Token pro Empfängerin.

Die `DOORS`-Daten in `script.js` enthalten nur die öffentlichen Teaser und die
Ziel-Links für Geschenke. Sie sind **kein** Zugangsschutz.

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
- Nach dem 31. Dezember: alle Türchen gelten als geöffnet.
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

- JavaScript-Syntax: `node --check script.js`
- Keine Konsolenfehler im Browser
- Kein horizontaler Überlauf bei 320, 360, 390, 414, 761, 912, 1020, 1021,
  1120 und 1440 px
- Kalender-Raster: 4 Spalten bis 760 px, 5 Spalten von 761–1020 px,
  7 Spalten ab 1021 px
- Bilder laden, lokale Fonts laden
- Kalender: 31 Türchen, alle Zustände (geschlossen / heute / geöffnet /
  Vorschau) getestet
- Dialog: Öffnen, Schließen, Tastatur, Anmelde-Gate und Formular-Erfolg
- Formulare: leere E-Mail, ungültige E-Mail, fehlende Einwilligung, Erfolg
- Mobile Navigation inkl. Anchor-Sprung und Schließen
- FAQ-Akkordeon
- Bestätigungs- und Danke-Seite auf Desktop und Mobil
- Lighthouse: Accessibility 100, Best Practices 100, SEO 100

## Vor dem Launch abhaken

- [ ] Brevo-Formulare in allen drei Stellen einsetzen und testen.
- [ ] Double-Opt-in-Mail, Absender und Redirects in Brevo prüfen.
- [ ] 31 Türchen-Seiten/Audios erstellen und per Brevo-Automation versenden.
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
- [ ] Datumstest am 1. Dezember und am 31. Dezember durchführen.

## Hinweise zu den Bildern

Die Portrait- und Blumenfotos stammen von den öffentlichen Websites von
Gabriele Storz bzw. Path of Grace und wurden für dieses Projekt lokal
eingebunden. Die Veröffentlichungsrechte liegen bei Gabriele Storz. Das
Markenzeichen wurde aus dem Path-of-Grace-Logo extrahiert und als
CSS-Maske verwendet.
