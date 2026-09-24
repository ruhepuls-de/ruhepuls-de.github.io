# Energie-Check

> **Stand 24.09.2026:** Umbau vom Schlaf-Check zum Energie-Check. **Acht Fragen, 15 Regeln**, Profil nach Lebensbereich (Schlaf / Trinken / Tag), Arzt-Kasten, Mail-Block „Deine Energiekurve – 7 Tage“ und die Eintragsseite `../kurve/`. Grundlage im Vault (`03 Projects/TikTok Automation/07 Produkt/`): „(C) Entscheidungen Energie-Check — Liam“, „(C) Abteilung Fach — Energie-Check, Fragen und Regeln“ (Abschnitt 4), „(C) Abteilung Produkt & Text — Energie-Check, 7 Tage, Tag-7-Angebot“ (alle Texte wörtlich). Live unter `https://mein-ruhepuls.de/check/`.

## Wie das Ergebnis zustande kommt

Jede auffällige Antwort löst Regeln aus (`FRAGEN[].ausloeser`). Punkte = Grundschwere + Antwortwert; Gleichstand: erst `schwere`, dann Fragenreihenfolge. Dann `KONFLIKTE`, dann Trennung nach `gruppe`:

- **`hebel`** — die Top 3 ausführlich, der Rest unter „Außerdem aufgefallen“. Paar-Regel: Steht `zuckerTief` in den Top 3, rückt `pauseMachen` direkt dahinter. Die Domäne mit der höchsten Punktsumme in den Top 3 gibt das Profil (Gleichstand: schlaf vor trinken vor tag).
- **`arzt`** — ein Kasten. **Hartes Warnzeichen** (Entscheidung T1): Kasten ganz oben, **kein Mail-Block**. Weiches Warnzeichen oder `vierWochen`/`muedeTrotzSchlaf`: Kasten unten. `muedeTrotzSchlaf` blendet den Mail-Block ebenfalls aus.
- **HALTEN** (`bewegungRegelmaessig`, `festeAufstehzeit`) nur, wenn Hebel **und** Arzt leer sind.

Bedingungen je Auslöser: `nurWenn`, `undWenn`, `nichtWenn` (Werte), `nurAntwort`, **`nichtWennAntwort`** (Antwort-Index, Gegenstück zu `nurAntwort`; sperrt Bewegung bei der Anstrengungs-Antwort, PEM). Alle sitzen in `ausloeserGilt()`.

**Hart/weich:** Jeder Punkt der Warnliste trägt `hart: true/false`, jede Antwort von Frage 8 auch. Die Seite weiß nicht, *welcher* Listenpunkt zutrifft — deshalb ist „Mindestens eins aus der Liste“ hart, solange ein harter Punkt in der Liste steht (im Zweifel hart). Einteilung mit Begründung: Produkt & Text, Abschnitt „Einteilung hart/weich“.

Der Teilen-Text nennt nur den Profil-Titel, bei Arzt-Profilen gar keinen.

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

Zweige a–n, Beschreibung im Kopf des Skripts. Neu am 24.09.: g) mit PEM-, HALTEN-, Paar-, Hart/weich- und Teilen-Prüfung im Durchlauf aller 81.920 Antwortmuster, h) Check vs. Kurve getrennt, k) Kurve, l) Warnzeichen hart/weich mit Probelauf „weich“, m) die Muster A–F aus Fach 4.7, n) Mail-Block ≤ 60 Wörter und verbotene Wirkwörter. Jede neue Prüfung wurde am 24.09. einmal absichtlich gebrochen (rot) und wieder geheilt (grün).
