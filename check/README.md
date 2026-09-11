# Schlaf-Check

Die kostenlose Eingangstür: sieben Fragen, sofort ein persönliches Ergebnis mit
zwei belegten Regeln, **danach** die E-Mail-Abfrage. Live unter
`https://ruhepuls-de.github.io/check/`.

## Was Liam noch tun muss

### 1. MailerLite-Formular einsetzen (der eine offene Punkt)

1. Konto bei [mailerlite.com](https://www.mailerlite.com) anlegen (Free-Tarif, bis 1.000 Adressen).
2. Unter **Subscribers → Groups** eine Gruppe `Schlaf-Check` anlegen.
3. **Forms → Embedded form** → Gruppe `Schlaf-Check` wählen → Formular benennen.
4. Bei den Formular-Einstellungen **Double-Opt-in einschalten** (in MailerLite:
   *Settings → Subscribe settings → Enable double opt-in*). Ohne Double-Opt-in ist die
   Datenschutzerklärung dieser Seite falsch — sie sagt ausdrücklich, dass eine
   Bestätigungsmail kommt.
5. Auf **Embed form** klicken und den HTML-Block kopieren.
6. In `check/index.html` die Zeile `<!-- MAILERLITE_FORM -->` suchen. Den kopierten Block
   **direkt darunter** einsetzen und das Beispiel-Formular darunter
   (`<form id="mailBeispiel" ...> ... </form>`) löschen.
7. `python3 scripts/pruefe-check.py` laufen lassen — muss GRUEN bleiben. Prüft unter
   anderem, dass das E-Mail-Feld im DOM immer **nach** dem Ergebnis steht.
8. `git add -A && git commit -m "MailerLite-Formular eingesetzt" && git push origin main`.

Das Formular ist der einzige externe Inhalt auf der ganzen Seite. Bis es eingesetzt ist,
steht dort ein sichtbarer Platzhalter — der Check funktioniert trotzdem komplett.

### 2. Bio-Link setzen

`ruhepuls-de.github.io/check/` in die TikTok-, YouTube- und Instagram-Bio.
Das ist die Messstrecke aus der Produktstrategie: Klickrate und Adressen je Klick,
Entscheidungspunkt **26.09. (≥ 50 Adressen)**.

### 3. YouTube-Links nachziehen (klein, nach dem 12.09.)

In `check.js` hat jede Regel ein Feld `youtube`. Öffentlich und daher verlinkt sind
bisher nur v26, v28 und v45. v47, v53, v54 und v56 sind auf YouTube noch nicht
öffentlich (`sicht: private`, geplanter Start 12.09.); ihr Feld steht auf `null`.
Sobald sie live sind, die URL aus `~/tools/ruhepuls-pipeline/public/<id>/YOUTUBE.md`
eintragen. Der TikTok-Link (Kanalprofil) steht bei jeder Regel und geht immer.

## Aufbau

| Datei | Zweck |
|---|---|
| `index.html` | Start, Fragebogen-Gerüst, Ergebnis-Abschnitt, E-Mail-Block, Rechtshinweis |
| `check.js` | Regeln (mit Video-Beleg), Fragen, Muster, Ablauf, Teilen-Knopf |
| `check.css` | Nur die Check-Regeln; Farben und Schrift kommen aus `../style.css` |
| `pruef/` | Screenshots der Abnahme |

Kein Tracking, keine Cookies, kein Server, keine externen Skripte außer dem
MailerLite-Formular. Die Auswertung ist eine feste Regel im Browser. Gespeichert wird
nur das letzte Ergebnis in `localStorage` (`ruhepuls-check-v1`).

## Die Prüfung

```bash
python3 scripts/pruefe-check.py
```

Wird **rot**, wenn

1. eine Regel im Check zu keinem Video-Kommentar passt (Stichwortabgleich gegen
   `~/tools/ruhepuls-pipeline/public/<id>/KOMMENTAR.md`), oder eine definierte Regel
   von keinem Muster gezeigt wird,
2. ein Diagnosewort im Seitentext steht (Insomnie, Schlafstörung als Zuschreibung,
   „du hast", „du leidest", Diagnose, krankhaft),
3. das E-Mail-Feld im DOM **vor** dem Ergebnis steht.

Alle drei Zweige wurden am 11.09.2026 absichtlich gebrochen und wieder zurückgenommen.

## Regel beim Ergänzen

Eine neue Regel kommt nur in den Check, wenn sie in der `KOMMENTAR.md` eines Videos
belegt ist. Neuer Eintrag in `REGELN` braucht `video` und `stichworte`, und die
Stichworte müssen wörtlich in dieser `KOMMENTAR.md` vorkommen. Sonst wird die Prüfung rot.
