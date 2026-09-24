# Schlaf-Check

> **Stand 24.09.2026:** Seit der Fachprüfung vom 23.09. hat der Check **zehn Fragen und 22 Regeln**; `pruefe-check.py` wird rot ab der elften. Die Fragentabelle unten beschreibt noch die acht der alten Fassung — maßgeblich ist `regeln.js`. **Das MailerLite-Formular ist eingebaut** (24.09., ohne MailerLite-Skripte, Versand nur nach Klick über `mail.js`, Prüfung Zweig j).


Die kostenlose Eingangstür: acht Fragen, sofort ein Ergebnis, das sich nach den
Antworten richtet, **danach** die E-Mail-Abfrage. Live unter
`https://ruhepuls-de.github.io/check/`.

## Wie das Ergebnis zustande kommt

Es gibt **keine festen Muster** mehr. Jede auffällige Antwort löst ihre eigenen
Regeln aus. Jede ausgelöste Regel bekommt Punkte (Grundschwere der Regel plus
den Wert der Antwort), das Ergebnis zeigt die zwei bis drei mit den meisten
Punkten. Zu jeder Regel steht ein Satz, auf welche Antwort sie sich bezieht
(„Du hast gesagt: …“).

Zwei Sperren sitzen darüber:

- **`nurWenn`** — ein Auslöser kann eine zweite Bedingung mitbringen. Die
  KVT-I (`kvti`) erscheint nur, wenn auch eine der Fragen 1 bis 3 ab Wert 2
  auffällig ist. Sonst bekäme jemand ohne ein einziges Insomnie-Symptom eine
  Insomnie-Therapie empfohlen, nur weil er tagsüber müde ist.
- **`KONFLIKTE`** — Regelpaare, die sich widersprechen, stehen nie zusammen
  im Ergebnis. Es bleibt die mit den mehr Punkten. Heute ein Paar:
  `kvti` gegen `tagIstMassstab`.

Wer nirgends auffällig antwortet, bekommt ein ehrliches „Bei dir ist nichts
auffällig“ und zwei Regeln zum Halten.

## Die acht Fragen — und warum jede drin ist

Die Fragen richten sich danach, was einen Schlaf-Check brauchbar macht, nicht
danach, welche Videos es gibt.

| # | Frage | Warum |
|---|---|---|
| 1 | Einschlafdauer | Erstes Kernsymptom der Insomnie. Die S3-Leitlinie (Empfehlung D1) und der Insomnia Severity Index fragen es als Erstes. |
| 2 | Nachts wach liegen | Zweites Kernsymptom — und in der Bevölkerung das häufigere (Ohayon & Roth 2001: unterbrochener Schlaf 18,0 %, Einschlafprobleme 10,1 %, jeweils mindestens dreimal pro Woche; am Abstract nachgesehen am 21.09.2026). |
| 3 | Zu früh wach | Drittes Kernsymptom. Wird ohne eigene Frage regelmäßig übersehen. |
| 4 | Seit wann, wie oft | Die Grenze zwischen „schlechte Woche“ und chronischer insomnischer Störung: mehrmals pro Woche, länger als drei Monate (ICD-11). Ohne diese Frage lässt sich der ärztliche Hinweis nicht ehrlich geben. |
| 5 | Beeinträchtigung am Tag | Erst das macht aus kurzem Schlaf ein Problem. Die Leitlinie fragt in D1 ausdrücklich danach; im ISI ist es das Item mit dem größten Gewicht. |
| 6 | Was du tust, wenn du wach liegst | Die einzige Frage nach Verhalten im Bett. Sie trifft genau die zwei Anweisungen der Stimuluskontrolle (Tabelle 8 der Leitlinie): nach 15 Minuten aufstehen, das Bett nur zum Schlafen benutzen. |
| 7 | Aufstehzeit am Wochenende | „Stehen Sie jeden Morgen zur gleichen Uhrzeit auf“ steht als Anweisung in derselben Tabelle. Die Frage misst, wie weit jemand davon weg ist. |
| 8 | Wann das letzte Koffein | Die einzige Substanz mit belastbarer Zahl zum Abstand (Gardiner 2023) und zugleich eine Zeile in Tabelle 6 der Leitlinie. |

Weggelassen, bewusst: rezeptfreie Schlafmittel (steht im Rechtshinweis unten auf
der Seite), Schnarchen und Atemaussetzer (ebenda), Alter (wurde in der alten
Fassung erhoben und nie benutzt). Acht Fragen sind die Obergrenze — mehr, und
niemand kommt in zwei Minuten durch. `pruefe-check.py` wird rot ab der neunten.

## Die Regeln

Jede Regel in `check/regeln.js` hat

- `titel` — was zu tun ist, als Satz,
- `tipp` — der Rat, so weit die Quelle ihn hergibt, und nicht weiter,
- `quelle` — Autor, Jahr, Zeitschrift oder Leitlinie samt Abschnitt,
- `link` — DOI oder Leitlinien-URL, wird im Ergebnis angeklickt,
- `video` — eine Video-ID wie `"v43"` **oder `null`**.

**Ein Video ist freiwillig.** Hat eine Regel keins, steht im Ergebnis „Video
dazu folgt.“ Die Regel hängt an der Quelle, nicht am Video. Regeln ohne Video
sind damit zugleich die Liste der Video-Kandidaten — `pruefe-check.py` gibt sie
bei jedem Lauf aus.

Was ein Tipp **nicht** darf: mehr behaupten als die Quelle. Keine selbst
ausgerechneten Uhrzeiten oder Mengen, Beobachtungsdaten nicht als Ursache
formulieren, Studien an einer Spezialgruppe nicht auf „du“ verallgemeinern.

## Die Video-Links kommen aus der Pipeline

```bash
python3 scripts/baue-videolinks.py
```

Das liest `~/tools/ruhepuls-pipeline/public/v<Zahl>/` (nur Ordner, die exakt so
heißen; `.verworfen` wird übersprungen) und schreibt `check/videolinks.js`. Die
Regeln nennen nur die ID, die Links stehen ausschließlich in dieser erzeugten
Datei. **Nach jedem Upload einmal laufen lassen — dann sind die neuen Links da,
ohne dass jemand etwas von Hand pflegt.**

Was dabei gilt:

- **TikTok** — steht in `TIKTOK.md` eine echte Video-URL, wird die genommen.
  Sonst, wenn `auf_tiktok: ja` oder eine Zeile `hochgeladen:` dasteht, das
  Kanalprofil. Sonst gar kein TikTok-Link.
- **YouTube** — die `url` aus `YOUTUBE.md`, aber nur wenn das Video öffentlich
  ist: `sicht: public` oder die geplante Startzeit (`live:`) ist vorbei. Sonst
  kein YouTube-Link.

Damit beantwortet sich Liams Frage von selbst, warum ein Video nur auf TikTok
liegt und ein anderes auf beidem: Es steht so in der Pipeline. Wer eine
TikTok-Video-URL in `TIKTOK.md` schreibt, bekommt sofort einen Link direkt aufs
Video statt aufs Profil.

## Was Liam noch tun muss

### MailerLite-Formular einsetzen (erledigt 24.09.2026 — Anleitung bleibt für einen Neuaufbau)

1. Konto bei [mailerlite.com](https://www.mailerlite.com) anlegen. **Free =
   250 Abonnenten und 2.500 Mails im Monat**, dazu ein MailerLite-Logo unter
   dem Inhalt und höchstens 3 Automationen
   ([Preisseite](https://www.mailerlite.com/pricing), nachgesehen am
   21.09.2026). Für den Entscheidungspunkt am 26.09. (≥ 50 Adressen) reicht
   das dreifach; für ein Bezahlprodukt nicht.
2. **Subscribers → Groups** → Gruppe `Schlaf-Check` anlegen.
3. **Forms → Embedded form** → Gruppe wählen → Formular benennen.
4. **Double-Opt-in einschalten** (*Settings → Subscribe settings*). Ohne
   Double-Opt-in ist die Datenschutzerklärung dieser Seite falsch — sie sagt
   ausdrücklich, dass eine Bestätigungsmail kommt.
5. **Embed form** klicken, den HTML-Block kopieren.
6. In `check/index.html` die Zeile `<!-- MAILERLITE_FORM -->` suchen. Den Block
   **direkt darunter** einsetzen, das Beispiel-Formular
   (`<form id="mailBeispiel" …>`) löschen.
7. `python3 scripts/pruefe-check.py` — muss grün bleiben.

### Bio-Link setzen

`ruhepuls-de.github.io/check/` in die TikTok-, YouTube- und Instagram-Bio.

## Aufbau

| Datei | Zweck |
|---|---|
| `index.html` | Start, Fragen-Gerüst, Ergebnis-Abschnitt, E-Mail-Block, Rechtshinweis |
| `regeln.js` | Fragen, Regeln, Auswertung — reine Daten und Logik, kein DOM |
| `videolinks.js` | **Erzeugt.** Video-Links aus der Pipeline. Nicht von Hand ändern. |
| `check.js` | Anzeige und Ablauf |
| `check.css` | Nur die Check-Regeln; Farben und Schrift aus `../style.css` |
| `pruef/` | Screenshots der Abnahme |

Kein Tracking, keine Cookies, kein Server, keine externen Skripte außer dem
MailerLite-Formular. **Auf dem Gerät wird nichts abgelegt** — kein
`localStorage`, keine Sitzungsdaten. Das Schreiben ohne Lesen war ohne Zweck,
und Speichern ohne Zweck ist nach § 25 Abs. 2 Nr. 2 TDDDG nicht „unbedingt
erforderlich". Wer das Wiederherstellen nach dem Neuladen wirklich will, muss
beides bauen: schreiben **und** lesen — Zweig h) besteht darauf.

## Die Prüfung

```bash
python3 scripts/pruefe-check.py
```

Wird **rot**, wenn

- **a) Quelle** — eine Regel ohne `quelle`, ohne Jahr darin oder ohne gültigen
  Link. Ein Video ist nicht mehr Pflicht.
- **b) Abdeckung** — eine Frage ohne Regel, eine Regel ohne Frage, eine Regel,
  die es nicht gibt, oder mehr als zehn Fragen.
- **c) Ergebnis** — für irgendeine maximal auffällige Antwort fehlt die
  zugehörige Regel im Ergebnis. Dafür läuft die echte Auswertung aus
  `regeln.js` in `node`, nicht eine nachgebaute Kopie.
- **d) Reihenfolge** — das E-Mail-Feld steht im DOM vor dem Ergebnis.
- **e) Video** — eine genannte Video-ID gibt es in der Pipeline nicht, sie ist
  verworfen, oder sie hat keinen Link in `videolinks.js`.
- **f) Ton** — eine Zuschreibung im Seitentext („du hast eine …“, „du leidest“,
  „krankhaft“, „Diagnose“). Fachbegriffe in einer Quellenangabe sind erlaubt.
- **g) Ausschluss** — alle 65.536 Antwortkombinationen laufen durch die echte
  Auswertung. Rot, wenn eine Regel im Ergebnis steht, ohne dass ein Auslöser
  samt `nurWenn` greift, oder wenn ein Paar aus `KONFLIKTE` zusammen erscheint.
- **h) Speicher** — rot, wenn `check.js` auf dem Gerät schreibt, ohne zu lesen,
  oder wenn die Datenschutzerklärung etwas anderes sagt als der Code tut
  (auch: ein Schlüssel, den es im Code nicht gibt).
- **i) Versprechen** — rot, wenn der Mail-Block das Ergebnis per Mail
  verspricht, wenn der ehrliche Satz („kann es dir nicht schicken“) fehlt, oder
  wenn irgendwo im Check ein Netzaufruf auftaucht (`fetch`, `XMLHttpRequest`,
  `sendBeacon`). Ohne Netzaufruf stimmt der Satz, dass die Antworten den
  Browser nie verlassen — mit einem nicht mehr.

Alle neun Zweige wurden am 21.09.2026 absichtlich gebrochen, rot gesehen und
zurückgenommen.

## Regel beim Ergänzen

Eine neue Regel kommt nur in den Check, wenn sie eine **Quelle mit Link** hat
und mindestens eine Frage sie auslöst. Setzt sie etwas voraus, das die
auslösende Frage nicht abfragt, gehört eine `nurWenn`-Bedingung dazu;
widerspricht sie einer bestehenden Regel, ein Eintrag in `KONFLIKTE`. Ein Video ist schön, aber keine
Bedingung. Wer eine Frage hinzufügt, braucht dafür mindestens einen Auslöser —
sonst wird die Prüfung rot.

- **j) Mail** — ein fremdes Skript auf der Seite, mehr als ein Netzaufruf in `mail.js`, ein Netzaufruf anderswo, Speicherzugriff in `mail.js`, oder ein Formularfeld außer der Mailadresse. Bruchgetestet 24.09. (vier Brüche, alle rot).
