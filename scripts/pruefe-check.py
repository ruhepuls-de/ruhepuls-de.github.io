#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prueft den Schlaf-Check (check/) gegen die drei Regeln, die Liam gesetzt hat.

1. BELEG:     Jede Regel im Check muss in der KOMMENTAR.md ihres Videos belegt
              sein (Stichwortabgleich). Keine Regel ohne Quelle.
2. KEIN DIAGNOSE-TON: Kein Zuschreibungswort im Text der Seite
              (Insomnie, Schlafstoerung als Zuschreibung, "du hast", "du leidest").
3. REIHENFOLGE: Das E-Mail-Feld muss im DOM NACH dem Ergebnis stehen.
              Kein Zwang, kein Tor vor dem Ergebnis.

Aufruf:  python3 scripts/pruefe-check.py
Rot (Exit 1), wenn eine der drei Regeln bricht.
"""
import os
import re
import sys

HIER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECK = os.path.join(HIER, "check")
JS = os.path.join(CHECK, "check.js")
HTML = os.path.join(CHECK, "index.html")
PIPELINE = os.path.expanduser("~/tools/ruhepuls-pipeline/public")

DIAGNOSEWOERTER = [
    "insomnie", "schlafstörung", "schlafstoerung", "du hast ", "du leidest",
    "du bist krank", "diagnose", "krankhaft", "behandlung dieser",
]
# Erlaubt, weil es KEINE Zuschreibung ist, sondern der Rechtshinweis:
ERLAUBTE_STELLEN = ["ersetzt keine ärztliche beratung"]

fehler = []
hinweise = []


def lies(pfad):
    with open(pfad, encoding="utf-8") as f:
        return f.read()


# ---------------------------------------------------------------- 1. BELEG
def regeln_aus_js(js):
    """Zieht die Regel-Eintraege aus dem REGELN-Objekt in check.js."""
    block = re.search(r"var REGELN = \{(.*?)\n  \};", js, re.S)
    if not block:
        fehler.append("BELEG: Das Objekt `var REGELN = {` ist in check.js nicht zu finden.")
        return {}
    roh = block.group(1)
    gefunden = {}
    for treffer in re.finditer(
        r"(\w+):\s*\{(.*?)\n    \}", roh, re.S
    ):
        name, koerper = treffer.group(1), treffer.group(2)
        video = re.search(r'video:\s*"([^"]+)"', koerper)
        stich = re.search(r"stichworte:\s*\[(.*?)\]", koerper, re.S)
        if not video:
            fehler.append("BELEG: Regel `%s` hat kein Feld `video`." % name)
            continue
        if not stich:
            fehler.append("BELEG: Regel `%s` hat kein Feld `stichworte`." % name)
            continue
        worte = re.findall(r'"([^"]+)"', stich.group(1))
        if not worte:
            fehler.append("BELEG: Regel `%s` hat leere `stichworte`." % name)
            continue
        gefunden[name] = {"video": video.group(1), "stichworte": worte}
    if not gefunden:
        fehler.append("BELEG: In check.js steht keine einzige Regel.")
    return gefunden


def pruefe_beleg(regeln):
    for name, r in sorted(regeln.items()):
        kommentar = os.path.join(PIPELINE, r["video"], "KOMMENTAR.md")
        if not os.path.exists(kommentar):
            fehler.append(
                "BELEG: Regel `%s` verweist auf %s — dort gibt es keine KOMMENTAR.md."
                % (name, r["video"])
            )
            continue
        text = lies(kommentar)
        fehlend = [w for w in r["stichworte"] if w not in text]
        if fehlend:
            fehler.append(
                "BELEG: Regel `%s` (%s) — diese Stichworte stehen NICHT in %s/KOMMENTAR.md: %s"
                % (name, r["video"], r["video"], ", ".join(fehlend))
            )
        else:
            hinweise.append(
                "  belegt: %-22s → %s/KOMMENTAR.md (%s)"
                % (name, r["video"], ", ".join(r["stichworte"]))
            )


def pruefe_verdrahtung(js, regeln):
    """Jede von einem Muster benutzte Regel muss existieren, jede Regel benutzt sein."""
    benutzt = set()
    for treffer in re.finditer(r"regeln(?:WennSchlafmittel)?:\s*\[(.*?)\]", js, re.S):
        benutzt.update(re.findall(r'"([^"]+)"', treffer.group(1)))
    for rid in sorted(benutzt):
        if rid not in regeln:
            fehler.append("BELEG: Ein Muster benutzt die Regel `%s`, die es nicht gibt." % rid)
    for rid in sorted(regeln):
        if rid not in benutzt:
            fehler.append("BELEG: Regel `%s` ist definiert, aber kein Muster zeigt sie." % rid)


# ------------------------------------------------------ 2. KEIN DIAGNOSE-TON
def sichtbarer_text(html):
    """Nur was der Leser sieht: Kommentare und Tags raus."""
    ohne = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    ohne = re.sub(r"<script.*?</script>", " ", ohne, flags=re.S)
    ohne = re.sub(r"<[^>]+>", " ", ohne)
    return ohne


def js_texte(js):
    """Nur die Zeichenketten aus check.js — das ist, was auf der Seite landet."""
    ohne_kommentare = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
    ohne_kommentare = re.sub(r"^\s*//.*$", " ", ohne_kommentare, flags=re.M)
    return " ".join(re.findall(r'"((?:[^"\\]|\\.)*)"', ohne_kommentare))


def pruefe_ton(text, wo):
    klein = text.lower()
    for erlaubt in ERLAUBTE_STELLEN:
        klein = klein.replace(erlaubt, " ")
    for wort in DIAGNOSEWOERTER:
        if wort in klein:
            stelle = klein.index(wort)
            fehler.append(
                'TON: Diagnosewort "%s" in %s — Zusammenhang: ...%s...'
                % (wort.strip(), wo, text[max(0, stelle - 60):stelle + 60].replace("\n", " "))
            )


# ------------------------------------------------------- 3. REIHENFOLGE
def pruefe_reihenfolge(html):
    ergebnis = html.find('id="ergebnis"')
    if ergebnis < 0:
        fehler.append('REIHENFOLGE: In index.html fehlt der Abschnitt id="ergebnis".')
        return
    marken = [("MAILERLITE_FORM", html.find("MAILERLITE_FORM")),
              ('type="email"', html.find('type="email"'))]
    for name, pos in marken:
        if pos < 0:
            fehler.append("REIHENFOLGE: %s ist in index.html nicht zu finden." % name)
        elif pos < ergebnis:
            fehler.append(
                "REIHENFOLGE: %s steht VOR dem Ergebnis (Zeichen %d vor %d). "
                "Das E-Mail-Feld darf nie ein Tor vor dem Ergebnis sein."
                % (name, pos, ergebnis)
            )
    # Und: der Ergebnis-Block muss den Mailblock enthalten, nicht umgekehrt
    if "mailblock" in html and html.find("mailblock") < ergebnis:
        fehler.append("REIHENFOLGE: Der Mailblock steht vor dem Ergebnis-Abschnitt.")


def main():
    for pfad in (JS, HTML):
        if not os.path.exists(pfad):
            print("ROT: %s fehlt." % pfad)
            return 1
    js, html = lies(JS), lies(HTML)

    regeln = regeln_aus_js(js)
    pruefe_beleg(regeln)
    pruefe_verdrahtung(js, regeln)
    pruefe_ton(sichtbarer_text(html), "check/index.html")
    pruefe_ton(js_texte(js), "check/check.js")
    pruefe_reihenfolge(html)

    print("Schlaf-Check — Pruefung")
    print("  Regeln gefunden: %d" % len(regeln))
    for z in hinweise:
        print(z)
    if fehler:
        print("\nROT — %d Punkt(e):" % len(fehler))
        for f in fehler:
            print("  - %s" % f)
        print("\nROT: Der Schlaf-Check ist nicht abnahmefaehig.")
        return 1
    print("\nGRUEN: Beleg, Ton und Reihenfolge stimmen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
