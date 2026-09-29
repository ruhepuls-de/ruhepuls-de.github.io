#!/usr/bin/env python3
"""Zaehlt die Woerter jeder Mail einer Einsetzvorlage (7 Tage) und wird rot ab 121.

Liam, 28.09.2026 (~22:15, Fassung 3): „Kurze Mails, das Video erklärt.“ Höchstens
120 Wörter je Mail, ohne grauen Kasten und ohne Pflichtfuß. Was erklärt werden
muss, gehört ins Videoskript oder auf die Seite.

    python3 scripts/pruefe-mails.py "<Pfad zur .md-Datei>"

Gezaehlt wird jeder ```-Block, der unter einer Ueberschrift „### Mail N …“ steht.
Nicht gezaehlt werden:
  [VORSCHAUBILD …]      Bildangaben (mehrzeilig bis „]“)
  [GRAUER KASTEN …]     der feste Arzt-Hinweis und der Ausnahme-Kasten (mehrzeilig bis „]“)
  [LINK: …]             Linkziel hinter einem Knopf- oder Pfeiltext (nicht sichtbar)
  der Pflichtfuß        steht nie im Block, MailerLite haengt ihn an
Gezaehlt werden alle sichtbaren Woerter, auch Zaehler, Knopftext, nackter Link,
Gruss und P.S. Ein Wort = eine Folge ohne Leerzeichen mit mindestens einem
Buchstaben oder einer Ziffer („●“ und „→“ zaehlen nicht).

Ausnahme nur mit Grund in der Ueberschrift, z. B.
  ### Mail 8 — … [Wortgrenze 170: Recht R1/R2, keine Video-Mail]
Dann gilt fuer diese Mail die genannte Zahl (hoechstens 200), und die Ausgabe
nennt den Grund. Waechst die Mail drueber, wird sie trotzdem rot.

exit 0 = alle Mails <= 120 · exit 1 = mindestens eine drueber oder keine Mail gefunden.
"""
import re
import sys

GRENZE = 120
AUSGENOMMEN = re.compile(r"^\[(VORSCHAUBILD|GRAUER KASTEN|LINK)\b")


def mails(md):
    """(Ueberschrift, Blocktext) je Mail."""
    aus, kopf, im_block, zeilen = [], None, False, []
    for zeile in md.splitlines():
        if not im_block and zeile.startswith("### "):
            kopf = zeile[4:].strip()
        if zeile.strip().startswith("```"):
            if im_block:
                if kopf and re.match(r"Mail \d", kopf):
                    aus.append((kopf, "\n".join(zeilen)))
                im_block, zeilen = False, []
            else:
                im_block, zeilen = True, []
            continue
        if im_block:
            zeilen.append(zeile)
    return aus


def sichtbar(block):
    rest, weg = [], False
    for zeile in block.splitlines():
        s = zeile.strip()
        if not weg and AUSGENOMMEN.match(s):
            weg = not s.endswith("]")
            continue
        if weg:
            if s.endswith("]"):
                weg = False
            continue
        rest.append(zeile)
    return "\n".join(rest)


def woerter(text):
    return [w for w in text.split() if re.search(r"[0-9A-Za-zÄÖÜäöüß]", w)]


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    md = open(sys.argv[1], encoding="utf-8").read()
    liste = mails(md)
    if not liste:
        print("ROT: keine Mail gefunden (erwartet: ```-Block unter „### Mail N …“).")
        return 1
    rot = 0
    for kopf, block in liste:
        n = len(woerter(sichtbar(block)))
        grenze, grund = GRENZE, ""
        m = re.search(r"\[Wortgrenze (\d+): ([^\]]+)\]", kopf)
        if m:
            grenze, grund = min(int(m.group(1)), 200), m.group(2).strip()
        zu_viel = n > grenze
        rot += zu_viel
        print("%s  %3d Wörter  %s%s" % ("ROT " if zu_viel else "ok  ", n, kopf,
                                         "  (Ausnahme bis %d: %s)" % (grenze, grund) if grund else ""))
    print("\n%s: %d von %d Mails über %d Wörtern." % ("ROT" if rot else "GRÜN", rot, len(liste), GRENZE))
    return 1 if rot else 0


if __name__ == "__main__":
    sys.exit(main())
