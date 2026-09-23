#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prueft den Schlaf-Check (check/). Rot (Exit 1), wenn etwas bricht.

Neun Zweige:

a) QUELLE      Jede Regel hat `quelle` und `link` (http/https). Ein Video ist
               NICHT mehr Pflicht — eine Regel haengt an einer Quelle, nicht
               an einem Video.
b) ABDECKUNG   Jede Frage hat mindestens eine Regel. Jede benutzte Regel
               existiert, jede definierte Regel wird irgendwo benutzt.
c) ERGEBNIS    Fuer jede einzelne maximal auffaellige Antwort steht die
               zugehoerige Regel im Ergebnis. Dafuer laeuft die echte
               Auswertung aus check/regeln.js in node.
d) REIHENFOLGE Das E-Mail-Feld steht im DOM NACH dem Ergebnis.
e) VIDEO       Jede genannte Video-ID gibt es in der Pipeline (genau
               v<Zahl>, nicht .verworfen) und sie hat einen Link in
               check/videolinks.js.
f) TON         Keine Zuschreibung im Seitentext ("du hast eine ...",
               "du leidest", "krankhaft"). Fachbegriffe in einer
               Quellenangabe sind erlaubt.
g) AUSSCHLUSS  Alle 4^10 Antwortkombinationen laufen durch die echte
               Auswertung. Keine Regel steht im Ergebnis, ohne dass ein
               Ausloeser samt Voraussetzung (`nurWenn`) erfuellt ist — die
               KVT-I darf nie ohne Insomnie-Symptom erscheinen. Und kein
               Paar aus KONFLIKTE steht je zusammen im Ergebnis.
h) SPEICHER    Wer auf dem Geraet schreibt, muss auch lesen (sonst ist die
               Speicherung nach § 25 TDDDG nicht erforderlich), und die
               Datenschutzerklaerung muss genau das sagen, was der Code tut.
i) VERSPRECHEN Der Mail-Block verspricht nichts, was die Seite nicht halten
               kann: kein "Ergebnis per Mail", solange die Antworten den
               Browser nie verlassen. Dazu: kein Netzaufruf im Check.

Aufruf:  python3 scripts/pruefe-check.py
"""
import json
import os
import re
import subprocess
import sys
import tempfile

HIER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECK = os.path.join(HIER, "check")
REGELN_JS = os.path.join(CHECK, "regeln.js")
CHECK_JS = os.path.join(CHECK, "check.js")
VIDEOLINKS_JS = os.path.join(CHECK, "videolinks.js")
HTML = os.path.join(CHECK, "index.html")
DATENSCHUTZ = os.path.join(HIER, "datenschutz.html")
PIPELINE = os.path.expanduser("~/tools/ruhepuls-pipeline/public")

ZUSCHREIBUNG = [
    "du hast eine", "du hast ein ", "du leidest", "du bist krank",
    "deine insomnie", "deine schlafstörung", "deine schlafstoerung",
    "bei dir liegt", "krankhaft", "diagnose",
]
ERLAUBTE_STELLEN = ["ersetzt keine ärztliche beratung"]

fehler = []
hinweise = []


def lies(pfad):
    with open(pfad, encoding="utf-8") as f:
        return f.read()


# ------------------------------------------------- Daten aus regeln.js holen
HARNESS = r"""
var R = require(process.argv[2]);
var out = { regeln: {}, fragen: [], halten: R.HALTEN, faelle: [] };
Object.keys(R.REGELN).forEach(function (id) {
  var r = R.REGELN[id];
  out.regeln[id] = { titel: r.titel, tipp: r.tipp, quelle: r.quelle,
                     link: r.link, video: r.video || null };
});
R.FRAGEN.forEach(function (f) {
  out.fragen.push({ id: f.id, text: f.text, optionen: f.optionen,
                    ausloeser: f.ausloeser });
});
R.FRAGEN.forEach(function (f) {
  var max = Math.max.apply(null, f.optionen.map(function (o) { return o.wert; }));
  f.optionen.forEach(function (o, i) {
    if (o.wert !== max) { return; }
    var a = {}; a[f.id] = i;
    var e = R.werteAus(a);
    out.faelle.push({
      frage: f.id, option: o.text, wert: o.wert,
      erwartet: f.ausloeser.filter(function (x) {
                    return o.wert >= x.ab && R.ausloeserGilt(x, a);
                  }).map(function (x) { return x.regel; }),
      gezeigt: e.treffer.map(function (t) { return t.regelId; }),
      unauffaellig: e.unauffaellig
    });
  });
});

/* --- g) AUSSCHLUSS: jede Antwortkombination einmal durchspielen. */
out.konflikte = R.KONFLIKTE || [];
out.sweep = { zahl: 0, ohneAusloeser: [], konflikt: [] };
(function () {
  var fs = R.FRAGEN, halten = {}, zaehler = new Array(fs.length).fill(0);
  R.HALTEN.forEach(function (id) { halten[id] = true; });
  for (;;) {
    var a = {};
    fs.forEach(function (f, k) { a[f.id] = zaehler[k]; });
    var e = R.werteAus(a);
    out.sweep.zahl++;
    /* Erlaubt ist eine Regel nur mit einem Ausloeser, dessen Schwelle UND
       dessen Voraussetzung erfuellt sind — oder als Halte-Regel. */
    var erlaubt = {};
    fs.forEach(function (f) {
      var o = f.optionen[a[f.id]];
      f.ausloeser.forEach(function (x) {
        if (o.wert >= x.ab && R.ausloeserGilt(x, a)) { erlaubt[x.regel] = true; }
      });
    });
    var gezeigt = e.treffer.map(function (t) { return t.regelId; });
    gezeigt.forEach(function (id) {
      if (erlaubt[id] || halten[id]) { return; }
      if (out.sweep.ohneAusloeser.length < 3) {
        out.sweep.ohneAusloeser.push({ regel: id, antworten: a, gezeigt: gezeigt });
      }
    });
    out.konflikte.forEach(function (paar) {
      if (gezeigt.indexOf(paar[0]) >= 0 && gezeigt.indexOf(paar[1]) >= 0 &&
          out.sweep.konflikt.length < 3) {
        out.sweep.konflikt.push({ paar: paar, antworten: a, gezeigt: gezeigt });
      }
    });
    var k = fs.length - 1;
    while (k >= 0 && zaehler[k] === fs[k].optionen.length - 1) { zaehler[k] = 0; k--; }
    if (k < 0) { break; }
    zaehler[k]++;
  }
})();
var leer = {};
R.FRAGEN.forEach(function (f) { leer[f.id] = 0; });
var e0 = R.werteAus(leer);
out.leer = { unauffaellig: e0.unauffaellig,
             gezeigt: e0.treffer.map(function (t) { return t.regelId; }) };
process.stdout.write(JSON.stringify(out));
"""


def hole_daten():
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
        f.write(HARNESS)
        harness = f.name
    try:
        roh = subprocess.run(
            ["node", harness, REGELN_JS],
            capture_output=True, text=True, timeout=60,
        )
    except (OSError, subprocess.TimeoutExpired) as e:
        fehler.append("ERGEBNIS: node laesst sich nicht ausfuehren (%s)." % e)
        return None
    finally:
        os.unlink(harness)
    if roh.returncode != 0:
        fehler.append("ERGEBNIS: check/regeln.js laeuft nicht durch:\n    %s"
                      % roh.stderr.strip().replace("\n", "\n    "))
        return None
    try:
        return json.loads(roh.stdout)
    except ValueError:
        fehler.append("ERGEBNIS: node hat kein JSON geliefert: %s" % roh.stdout[:200])
        return None


# ------------------------------------------------------------- a) QUELLE
def pruefe_quelle(d):
    for name in sorted(d["regeln"]):
        r = d["regeln"][name]
        for feld in ("titel", "tipp", "quelle", "link"):
            if not (r.get(feld) or "").strip():
                fehler.append("QUELLE: Regel `%s` hat kein Feld `%s`." % (name, feld))
        link = (r.get("link") or "").strip()
        if link and not re.match(r"^https?://\S+$", link):
            fehler.append("QUELLE: Regel `%s` hat keinen gueltigen Link: %r" % (name, link))
        quelle = (r.get("quelle") or "")
        if quelle and not re.search(r"(19|20)\d\d", quelle):
            fehler.append("QUELLE: Regel `%s` nennt in `quelle` kein Jahr: %r"
                          % (name, quelle[:80]))
    hinweise.append("  a) Quelle+Link: %d Regeln geprueft" % len(d["regeln"]))


# ---------------------------------------------------------- b) ABDECKUNG
def pruefe_abdeckung(d):
    benutzt = set(d["halten"])
    for f in d["fragen"]:
        if not f["ausloeser"]:
            fehler.append("ABDECKUNG: Frage `%s` hat keine einzige Regel." % f["id"])
        for a in f["ausloeser"]:
            benutzt.add(a["regel"])
            if a["regel"] not in d["regeln"]:
                fehler.append("ABDECKUNG: Frage `%s` benutzt die Regel `%s`, "
                              "die es nicht gibt." % (f["id"], a["regel"]))
    for name in sorted(d["regeln"]):
        if name not in benutzt:
            fehler.append("ABDECKUNG: Regel `%s` ist definiert, aber keine Frage "
                          "loest sie aus." % name)
    for name in d["halten"]:
        if name not in d["regeln"]:
            fehler.append("ABDECKUNG: Halte-Regel `%s` gibt es nicht." % name)
    if len(d["fragen"]) > 10:
        fehler.append("ABDECKUNG: %d Fragen — hoechstens zehn sind erlaubt."
                      % len(d["fragen"]))
    hinweise.append("  b) Abdeckung: %d Fragen, %d Regeln, alle verdrahtet"
                    % (len(d["fragen"]), len(d["regeln"])))


# ----------------------------------------------------------- c) ERGEBNIS
def pruefe_ergebnis(d):
    for fall in d["faelle"]:
        fehlend = [r for r in fall["erwartet"] if r not in fall["gezeigt"]]
        if fehlend:
            fehler.append(
                "ERGEBNIS: Antwort „%s“ auf Frage `%s` muesste die Regel(n) %s "
                "zeigen — im Ergebnis stehen aber nur %s."
                % (fall["option"], fall["frage"], ", ".join(fehlend),
                   ", ".join(fall["gezeigt"]) or "keine")
            )
        if fall["unauffaellig"]:
            fehler.append(
                "ERGEBNIS: Antwort „%s“ auf Frage `%s` ist die auffaelligste "
                "und wird trotzdem als unauffaellig ausgewertet."
                % (fall["option"], fall["frage"])
            )
    if not d["leer"]["unauffaellig"]:
        fehler.append("ERGEBNIS: Wer ueberall unauffaellig antwortet, bekommt "
                      "kein unauffaelliges Ergebnis.")
    elif sorted(d["leer"]["gezeigt"]) != sorted(d["halten"]):
        fehler.append("ERGEBNIS: Das unauffaellige Ergebnis zeigt %s statt der "
                      "Halte-Regeln %s."
                      % (d["leer"]["gezeigt"], d["halten"]))
    hinweise.append("  c) Ergebnis: %d maximal auffaellige Antworten geprueft"
                    % len(d["faelle"]))


# -------------------------------------------------------- d) REIHENFOLGE
def pruefe_reihenfolge(html):
    ergebnis = html.find('id="ergebnis"')
    if ergebnis < 0:
        fehler.append('REIHENFOLGE: In index.html fehlt der Abschnitt id="ergebnis".')
        return
    for name in ("MAILERLITE_FORM", 'type="email"', "mailblock"):
        pos = html.find(name)
        if pos < 0:
            fehler.append("REIHENFOLGE: %s ist in index.html nicht zu finden." % name)
        elif pos < ergebnis:
            fehler.append(
                "REIHENFOLGE: %s steht VOR dem Ergebnis (Zeichen %d vor %d). Das "
                "E-Mail-Feld darf nie ein Tor vor dem Ergebnis sein."
                % (name, pos, ergebnis)
            )
    hinweise.append("  d) Reihenfolge: E-Mail-Feld steht nach dem Ergebnis")


# -------------------------------------------------------------- e) VIDEO
def pruefe_video(d):
    if not os.path.exists(VIDEOLINKS_JS):
        fehler.append("VIDEO: check/videolinks.js fehlt — "
                      "`python3 scripts/baue-videolinks.py` laufen lassen.")
        links = {}
    else:
        roh = lies(VIDEOLINKS_JS)
        try:
            links = json.loads(roh[roh.index("{"):roh.rindex(";")])["videos"]
        except (ValueError, KeyError):
            fehler.append("VIDEO: check/videolinks.js ist nicht lesbar — neu bauen.")
            links = {}
    ids = sorted(set(r["video"] for r in d["regeln"].values() if r["video"]))
    for vid in ids:
        if not re.match(r"^v\d+$", vid):
            fehler.append("VIDEO: `%s` ist keine gueltige Video-ID (erwartet v<Zahl])." % vid)
            continue
        ordner = os.path.join(PIPELINE, vid)
        if not os.path.isdir(ordner):
            fehler.append("VIDEO: Eine Regel nennt `%s` — den Ordner gibt es in der "
                          "Pipeline nicht." % vid)
            continue
        if os.path.isdir(ordner + ".verworfen"):
            fehler.append("VIDEO: `%s` hat einen .verworfen-Ordner daneben — pruefen, "
                          "ob die Regel noch zum Video passt." % vid)
        if vid not in links:
            fehler.append("VIDEO: `%s` hat in check/videolinks.js keinen Link. Ist es "
                          "hochgeladen? Sonst in der Regel `video: null` setzen." % vid)
    ohne = sorted(n for n in d["regeln"] if not d["regeln"][n]["video"])
    hinweise.append("  e) Video: %d Regeln mit Video (%s), %d ohne — das ist erlaubt"
                    % (len(ids), ", ".join(ids), len(ohne)))
    if ohne:
        hinweise.append("     ohne Video (Kandidaten): %s" % ", ".join(ohne))


# ---------------------------------------------------------------- f) TON
def sichtbarer_text(html, grenzen=False):
    """Sichtbarer Text ohne Kommentare und Skripte.

    grenzen=True setzt an jeder Element-Grenze ein ¶. Zwei Saetze in zwei
    Elementen sind zwei Aussagen — ohne das Zeichen laufen sie im Text
    zusammen und eine Suche ueber Satzgrenzen findet Unsinn."""
    ohne = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    ohne = re.sub(r"<script.*?</script>", " ", ohne, flags=re.S)
    return re.sub(r"<[^>]+>", " ¶ " if grenzen else " ", ohne)


def pruefe_ton(text, wo):
    klein = text.lower()
    for erlaubt in ERLAUBTE_STELLEN:
        klein = klein.replace(erlaubt, " ")
    for wort in ZUSCHREIBUNG:
        if wort in klein:
            stelle = klein.index(wort)
            fehler.append(
                'TON: Zuschreibung "%s" in %s — Zusammenhang: ...%s...'
                % (wort.strip(), wo, text[max(0, stelle - 70):stelle + 70].replace("\n", " "))
            )


# --------------------------------------------------------- g) AUSSCHLUSS
def kurz(antworten, d):
    """Antwortmuster als lesbare Zeile."""
    teile = []
    for f in d["fragen"]:
        i = antworten.get(f["id"])
        if i is None:
            continue
        teile.append("%s=%s" % (f["id"], f["optionen"][i]["text"]))
    return " · ".join(teile)


def pruefe_ausschluss(d):
    sweep = d.get("sweep")
    if not sweep:
        fehler.append("AUSSCHLUSS: Der Durchlauf aller Antwortmuster fehlt.")
        return
    for fall in sweep["ohneAusloeser"]:
        fehler.append(
            "AUSSCHLUSS: Die Regel `%s` steht im Ergebnis, obwohl kein "
            "Ausloeser samt Voraussetzung greift. Antworten: %s"
            % (fall["regel"], kurz(fall["antworten"], d))
        )
    for fall in sweep["konflikt"]:
        fehler.append(
            "AUSSCHLUSS: `%s` und `%s` stehen zusammen in einem Ergebnis — "
            "die beiden widersprechen sich. Antworten: %s"
            % (fall["paar"][0], fall["paar"][1], kurz(fall["antworten"], d))
        )
    bedingt = []
    for f in d["fragen"]:
        for a in f["ausloeser"]:
            if a.get("nurWenn"):
                bedingt.append("%s (nur wenn %s ab %d)"
                               % (a["regel"], "/".join(a["nurWenn"]["eineVon"]),
                                  a["nurWenn"]["ab"]))
    if not bedingt:
        fehler.append("AUSSCHLUSS: Keine einzige Regel hat eine Voraussetzung "
                      "(`nurWenn`). Die KVT-I braucht eine.")
    hinweise.append("  g) Ausschluss: %d Antwortmuster durchgespielt, %d "
                    "Konfliktpaar(e), bedingt: %s"
                    % (sweep["zahl"], len(d.get("konflikte") or []),
                       ", ".join(bedingt) or "keine"))


# ----------------------------------------------------------- h) SPEICHER
def ohne_kommentare(js):
    ohne = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", " ", ohne)


def pruefe_speicher():
    code = ohne_kommentare(lies(CHECK_JS))
    schreibt = "setItem" in code
    liest = "getItem" in code
    nutzt = bool(re.search(r"localStorage|sessionStorage|indexedDB", code))
    if schreibt and not liest:
        fehler.append(
            "SPEICHER: check.js schreibt in den Browser-Speicher (setItem), "
            "liest ihn aber nie (kein getItem). Speichern ohne Zweck ist nach "
            "§ 25 Abs. 2 Nr. 2 TDDDG nicht „unbedingt erforderlich“ — "
            "entweder das Ergebnis beim Neuladen wiederherstellen oder das "
            "Schreiben entfernen."
        )
    if not os.path.exists(DATENSCHUTZ):
        fehler.append("SPEICHER: datenschutz.html fehlt.")
        return
    ds = sichtbarer_text(lies(DATENSCHUTZ))
    nennt = bool(re.search(r"localStorage|im lokalen Speicher", ds))
    if nutzt and not nennt:
        fehler.append("SPEICHER: check.js legt etwas auf dem Geraet ab, die "
                      "Datenschutzerklaerung sagt davon nichts.")
    if nennt and not nutzt:
        fehler.append("SPEICHER: Die Datenschutzerklaerung beschreibt einen "
                      "Browser-Speicher, den der Check gar nicht benutzt.")
    schluessel = re.findall(r"ruhepuls-check-v\d+", ds)
    for k in schluessel:
        if k not in code:
            fehler.append("SPEICHER: Die Datenschutzerklaerung nennt den "
                          "Schluessel „%s“ — im Code steht er nicht." % k)
    hinweise.append("  h) Speicher: check.js benutzt %s, Datenschutz sagt %s"
                    % ("Browser-Speicher" if nutzt else "keinen Speicher",
                       "dasselbe" if nennt == nutzt else "etwas anderes"))


# ------------------------------------------------------- i) VERSPRECHEN
VERSPRECHEN_VERBOTEN = [
    (r"Ergebnis[^.!?¶]{0,60}per Mail", "verspricht das Ergebnis per Mail"),
    (r"(?:schicke|schicken|sende|senden|zusenden)[^.!?¶]{0,40}Ergebnis",
     "verspricht, das Ergebnis zu schicken"),
    (r"Ergebnis[^.!?¶]{0,40}schwarz auf wei", "verspricht das Ergebnis schriftlich"),
]


def pruefe_versprechen(html):
    for js in (CHECK_JS, REGELN_JS):
        code = ohne_kommentare(lies(js))
        for ruf in ("fetch(", "XMLHttpRequest", "sendBeacon", "navigator.geolocation"):
            if ruf in code:
                fehler.append(
                    "VERSPRECHEN: %s enthaelt `%s`. Die Seite sagt, die "
                    "Antworten verlassen den Browser nie — dann darf es keinen "
                    "Netzaufruf geben." % (os.path.basename(js), ruf)
                )
    start = html.find('class="mailblock"')
    if start < 0:
        fehler.append('VERSPRECHEN: Der Mail-Block (class="mailblock") fehlt.')
        return
    ende = html.find('class="hinweis"', start)
    block = sichtbarer_text(html[start:ende if ende > 0 else len(html)], True)
    block = re.sub(r"[ \t\r\n]+", " ", block)
    for muster, was in VERSPRECHEN_VERBOTEN:
        treffer = re.search(muster, block, re.I)
        if treffer:
            fehler.append(
                "VERSPRECHEN: Der Mail-Block %s — das kann er nicht halten, die "
                "Antworten werden nie uebertragen. Stelle: ...%s..."
                % (was, treffer.group(0))
            )
    if not re.search(r"nicht schicken|nicht zusenden|nicht mitschicken", block, re.I):
        fehler.append(
            "VERSPRECHEN: Im Mail-Block fehlt der ehrliche Satz, dass das "
            "Ergebnis NICHT mitgeschickt werden kann. Ohne ihn liest sich die "
            "Adressabfrage, als bekaeme man seine Auswertung."
        )
    if os.path.exists(DATENSCHUTZ):
        ds = re.sub(r"[ \t\r\n]+", " ", sichtbarer_text(lies(DATENSCHUTZ), True))
        if re.search(r"Ergebnis des Schlaf-Checks[^.¶]{0,60}zuzusenden", ds, re.I):
            fehler.append("VERSPRECHEN: Die Datenschutzerklaerung nennt als "
                          "Zweck das Zusenden des Ergebnisses.")
    hinweise.append("  i) Versprechen: Mail-Block haelt, was er sagt; kein "
                    "Netzaufruf im Check")


def main():
    for pfad in (REGELN_JS, CHECK_JS, HTML):
        if not os.path.exists(pfad):
            print("ROT: %s fehlt." % pfad)
            return 1

    d = hole_daten()
    html = lies(HTML)

    if d:
        pruefe_quelle(d)
        pruefe_abdeckung(d)
        pruefe_ergebnis(d)
        pruefe_ausschluss(d)
        pruefe_video(d)
        texte = []
        for r in d["regeln"].values():
            texte.append(r["titel"])
            texte.append(r["tipp"])
        for f in d["fragen"]:
            texte.append(f["text"])
            for o in f["optionen"]:
                texte.append(o["text"])
                texte.append("Du hast gesagt: " + o["bezug"] + ".")
        pruefe_ton(" ".join(texte), "check/regeln.js")

    pruefe_reihenfolge(html)
    pruefe_ton(sichtbarer_text(html), "check/index.html")
    pruefe_speicher()
    pruefe_versprechen(html)

    print("Schlaf-Check — Pruefung")
    for z in hinweise:
        print(z)
    if fehler:
        print("\nROT — %d Punkt(e):" % len(fehler))
        for f in fehler:
            print("  - %s" % f)
        print("\nROT: Der Schlaf-Check ist nicht abnahmefaehig.")
        return 1
    print("\nGRUEN: Quelle, Abdeckung, Ergebnis, Reihenfolge, Video, Ton, "
          "Ausschluss, Speicher und Versprechen stimmen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
