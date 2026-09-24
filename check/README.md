# Energie-Check

> **Stand 24.09.2026:** Umbau vom Schlaf-Check zum Energie-Check. **Umbau am Abend (Entscheidungen, Nachtrag ~18:00, U1–U3): Werkzeug für Gesunde, kein Symptom-Check.** **Sieben Fragen, 13 Regeln**, Überschrift „Was kostet dich im Alltag Energie?“, Profil nach Lebensbereich (Schlaf / Trinken / Tag), fester Hinweis am Ende, Mail-Block „Deine Energiekurve – 7 Tage“ und die Eintragsseite `../kurve/`. Grundlage im Vault (`03 Projects/TikTok Automation/07 Produkt/`): „(C) Entscheidungen Energie-Check — Liam“, „(C) Abteilung Fach — Energie-Check, Fragen und Regeln“ (Abschnitt 4), „(C) Abteilung Produkt & Text — Energie-Check, 7 Tage, Tag-7-Angebot“ (alle Texte wörtlich). Live unter `https://mein-ruhepuls.de/check/`.

## Wie das Ergebnis zustande kommt

Jede auffällige Antwort löst Regeln aus (`FRAGEN[].ausloeser`). Punkte = Grundschwere + Antwortwert; Gleichstand: erst `schwere`, dann Fragenreihenfolge. Dann `KONFLIKTE`, dann Trennung nach `gruppe`:

- **`hebel`** — die Top 3 ausführlich, der Rest unter „Außerdem aufgefallen“. Paar-Regel: Steht `zuckerTief` in den Top 3, rückt `pauseMachen` direkt dahinter. Die Domäne mit der höchsten Punktsumme in den Top 3 gibt das Profil (Gleichstand: schlaf vor trinken vor tag).
- **`arzt`** — nur noch `vierWochen` / `muedeTrotzSchlaf` (aus `seitWann`), Kasten unten. Keine Warnzeichen-Frage mehr, kein Kasten oben, keine Seelsorge-Box (U1).
- **Mail-Block für alle** (U2): `reihenfolge(e)` in `regeln.js` gibt die Bausteine je Fall zurück, der Mail-Block steht in jedem Fall direkt unter dem Ergebnis. `check.js` zeigt genau diese Reihenfolge.
- **Fester Hinweis** (`#festerHinweis`, U1): höchstens 2 Sätze, Alarmzeichen nur aus der DEGAM-Grundlage. **PEM** steht als Satz im Tipp von `bewegungRegelmaessig`, keine Sperre mehr.
- **HALTEN** (`bewegungRegelmaessig`, `festeAufstehzeit`) nur, wenn Hebel **und** Arzt leer sind.

Bedingungen je Auslöser: `nurWenn`, `undWenn`, `nichtWenn` (Werte), `nurAntwort` (Antwort-Index). Alle sitzen in `ausloeserGilt()`.

Der Teilen-Text nennt nur den Profil-Titel und die Überschrift, beim Arzt-Profil keinen Titel.

## Die Regeln

Jede Regel in `regeln.js` hat `titel`, `tipp`, `kurz` (Quelle in einer Zeile, auf der Karte), `quelle` (volle Angabe, unter „Genaue Stelle“), `link`, `video` (ID oder `null`), `gruppe` und bei Hebeln `domaene`. Was ein Tipp **nicht** darf: mehr behaupten als die Quelle. Keine selbst ausgerechneten Uhrzeiten oder Mengen, keine Wirkversprechen („mehr Energie“, „hilft gegen“, „heilt“).

## Die Energiekurve (`../kurve/`)

Eine Seite, alles im Browser. Speicher: `localStorage`, Schlüssel `ruhepuls.kurve.v1`, höchstens 7 Einträge, einer pro Datum. Kein Netzaufruf, kein fremdes Skript, keine Verbindung zum Check. Der Check selbst speichert weiterhin **nichts**.

## Video-Links

```bash
python3 scripts/baue-videolinks.py
```

Schreibt `videolinks.js` aus `~/tools/ruhepuls-pipeline/public/v<Zahl>/`. Nach jedem Upload einmal laufen lassen.

## Aufbau

| Datei | Zweck |
|---|---|
| `index.html` | Start, Fragen-Gerüst, Ergebnis-Bausteine [A]–[L], Mail-Block, Hinweis |
| `regeln.js` | Fragen, Regeln, Auswertung, Teilen-Text — reine Daten und Logik |
| `videolinks.js` | **Erzeugt.** Nicht von Hand ändern. |
| `check.js` | Anzeige und Ablauf; setzt die Reihenfolge der Bausteine je Fall |
| `mail.js` | Das Mail-Formular, der einzige Netzaufruf (nach Klick) |
| `check.css` | Check-Regeln; Farben aus `../style.css` |

## Die Prüfung

```bash
python3 scripts/pruefe-check.py
```

Zweige a–s (l entfallen), Beschreibung im Kopf des Skripts. Umbau 24.09. abends: p) kein Pfad ohne Mail-Block (alle 20.480 Antwortmuster), q) keine Überschrift mit Symptom-Wort, r) fester Hinweis ≤ 2 Sätze am Ende, s) PEM-Satz in der Bewegungs-Regel, b) Fragenzahl im Text = echte Zahl. Jede davon einmal absichtlich gebrochen (rot) und geheilt (grün). Frühere Zweige: Neu am 24.09.: g) mit PEM-, HALTEN-, Paar-, Hart/weich- und Teilen-Prüfung im Durchlauf aller 81.920 Antwortmuster, h) Check vs. Kurve getrennt, k) Kurve, l) Warnzeichen hart/weich mit Probelauf „weich“, m) die Muster A–F aus Fach 4.7, n) Mail-Block ≤ 60 Wörter und verbotene Wirkwörter. Jede neue Prüfung wurde am 24.09. einmal absichtlich gebrochen (rot) und wieder geheilt (grün).
