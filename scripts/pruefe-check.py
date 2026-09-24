#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prueft den Energie-Check (check/) und die Energiekurve (kurve/).
Rot (Exit 1), wenn etwas bricht.

a) QUELLE      Jede Regel hat titel, tipp, kurz, quelle (mit Jahr), link
               (http/https) und eine gruppe; Hebel-Regeln eine domaene.
b) ABDECKUNG   Jede Frage hat mindestens eine Regel. Jede benutzte Regel
               existiert, jede definierte Regel wird irgendwo benutzt.
               Hoechstens sieben Fragen (F1, Umbau U1), und jeder Text, der
               die Fragen zaehlt ("Sieben Fragen"), nennt die echte Zahl.
c) ERGEBNIS    Fuer jede einzelne maximal auffaellige Antwort steht die
               zugehoerige Regel im Ergebnis (echte Auswertung in node).
d) REIHENFOLGE Das E-Mail-Feld steht im DOM NACH dem Ergebnis.
e) VIDEO       Jede genannte Video-ID gibt es in der Pipeline und sie hat
               einen Link in check/videolinks.js.
f) TON         Keine Zuschreibung im Seitentext ("du hast eine ...",
               "du leidest", "krankhaft", "Diagnose").
g) AUSSCHLUSS  Alle Antwortkombinationen (4^5 * 5) laufen durch die echte
               Auswertung. Rot, wenn eine Regel ohne Ausloeser samt
               Voraussetzung erscheint, ein KONFLIKT-Paar zusammen steht,
               mehr als drei Hebel oben stehen, die Paar-Regel
               (zuckerTief -> pauseMachen) verletzt ist, oder der Teilen-Text
               einen Regel-Titel verraet.
h) SPEICHER    Der Check speichert nichts; die Kurve schreibt UND liest
               (ruhepuls.kurve.v1); die Datenschutzerklaerung sagt fuer
               beide genau das (Abschnitt 4 / 4a).
i) VERSPRECHEN Der Mail-Block verspricht nicht das Ergebnis per Mail und
               sagt ehrlich, dass die Antworten nicht mitgehen. Kein
               Netzaufruf im Check.
j) MAIL        Der einzige Netzaufruf steht in check/mail.js, geht nur an
               assets.mailerlite.com, schickt nur die Mailadresse. Kein
               fremdes Skript.
k) KURVE       kurve/ macht keinen Netzaufruf, laedt kein fremdes Skript,
               hat kein Formular nach draussen, greift nur in try/catch auf
               den Speicher zu und traegt den Hinweis aus T2 (Safari/Chrome +
               Lesezeichen).
l) (entfallen, Umbau 24.09.: Warnzeichen hart/weich gibt es nicht mehr)
m) PROFILE     Die Muster aus Fach 4.7 (A, B, D, E; ohne Frage 7 und 8 —
               C und F entfielen mit ihnen) ergeben genau das erwartete
               Ergebnis.
n) WORTE       Mail-Block hoechstens 60 Woerter (Produkt & Text 1.4 [D]);
               keine verbotenen Wirkwoerter in Check, Regeln, Kurve und
               Danke-Seiten ("mehr Energie", "du wirst", "hilft gegen",
               "gegen Müdigkeit", "heilt" ...).
o) ZWECK       Keine Formulierung, die den Check oder die Kurve zu einem
               Medizinprodukt machen wuerde (Abteilung Recht 24.09.2026,
               Massstab 3, G1, G3): "erkennt", "findet die Ursache",
               "Risiko für", "ob du ... hast", "Schlafstörung-Test",
               "Insomnie-Check", "für den/deinen Arzt", "überwacht",
               "Woran deine Müdigkeit ...", "Kurve dorthin/zum Arzt".
               Geprueft in Check, Regeln, Kurve, Danke-Seiten und Startseite.
p) MAILBLOCK   Kein Pfad endet ohne Mail-Block (U2): reihenfolge() enthaelt
               ihn fuer JEDE Antwortkombination, check.js nimmt genau diese
               Reihenfolge, jeder Baustein existiert in index.html, es gibt
               keinen Ersatz-Zweig („biete ich dir bewusst nicht an“) und
               keine Warnzeichen-Weiche (keine Frage mit Liste oder hart).
q) UEBERSCHRIFT Keine Ueberschrift fragt nach dem Symptom (U3): <title>,
               <h1>, <h2> von Check und Startseite, Profil-Titel,
               Teilen-Text und Teilen-Titel ohne „müde“, „Müdigkeit“,
               „erschöpft“, „schlapp“ … Im Fliesstext ist das erlaubt.
r) HINWEIS     Der feste Hinweis (#festerHinweis) steht am Ende des
               Ergebnisses, hat hoechstens 2 Saetze, sagt „ersetzt keinen
               Arzt“ und nennt alle Alarmzeichen aus DEGAM_ALARM, darunter
               „tagsüber ungewollt ein“ (U-R1). Keine Seelsorge-Box im Check (U1).
s) PEM         Der Tipp der Bewegungs-Regel enthaelt den PEM-Satz (U1):
               „leichte Anstrengung … tagelang … abklären“.
t) PRAXIS      Kein Ergebnis und kein Profil verweist in die Praxis, und
               nirgends steht ein Bluttest oder eine Laborliste ausserhalb
               des festen Hinweises (Regel 24.09. abends: Werkzeug fuer
               Gesunde, kein Symptom-Check). Geprueft: Titel, Tipp, Quelle
               jeder Regel; Profil-Titel und -Satz; Fragen und Antworten;
               Teilen-Texte; sichtbarer Text von Check, Kurve und Startseite
               ohne #festerHinweis. Keine Regel-Gruppe ausser „hebel“, kein
               Arzt-Baustein in reihenfolge() oder index.html. Die Kurve
               traegt woertlich denselben festen Hinweis wie der Check, ohne
               Seelsorge-Nummer.

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
MAIL_JS = os.path.join(CHECK, "mail.js")
VIDEOLINKS_JS = os.path.join(CHECK, "videolinks.js")
HTML = os.path.join(CHECK, "index.html")
DATENSCHUTZ = os.path.join(HIER, "datenschutz.html")
KURVE_HTML = os.path.join(HIER, "kurve", "index.html")
KURVE_JS = os.path.join(HIER, "kurve", "kurve.js")
DANKE = [os.path.join(HIER, "danke", n, "index.html") for n in ("30-tage", "jahr")]
KURVE_SCHLUESSEL = "ruhepuls.kurve.v1"
PIPELINE = os.path.expanduser("~/tools/ruhepuls-pipeline/public")

ZUSCHREIBUNG = [
    "du hast eine", "du hast ein ", "du leidest", "du bist krank",
    "deine insomnie", "deine schlafstörung", "deine schlafstoerung",
    "bei dir liegt", "krankhaft", "diagnose",
]
ERLAUBTE_STELLEN = ["ersetzt keine ärztliche beratung", "keine diagnose"]

# Produkt & Text 5.3 Nr. 2 + Auftrag Bau: Wirkversprechen (HWG § 3, UWG)
VERBOTEN_WIRK = [
    "mehr energie", "du wirst", "hilft gegen", "hilft bei müdigkeit",
    "gegen müdigkeit", "heilt", "heilung", "wieder fit", "garantiert",
]
# Recht 24.09.2026, Textvorschlag (b): Der Einwilligungssatz braucht 18 statt
# 16 Woerter ("Ab 16.", G18). "Geht es nicht anders, gewinnt der
# Einwilligungssatz." Zurueck auf 60, sobald G11 umgesetzt ist (deutsche
# Bestaetigungsmail, "auf Englisch" faellt weg).
MAILBLOCK_MAX = 62

# Recht 24.09.2026, Massstab 3 (MDR/MDCG 2019-11), G1, G3: Formulierungen,
# die eine medizinische Zweckbestimmung ausloesen wuerden.
VERBOTEN_ZWECK = [
    (r"\berkennt\b", "erkennt"),
    (r"findet die ursache", "findet die Ursache"),
    (r"\brisiko für\b", "Risiko für"),
    (r"\bob du\b[^.?!¶]{0,40}\bhast\b", "ob du ... hast"),
    (r"schlafst(?:ö|oe)rung(?:s)?-?test", "Schlafstörung-Test"),
    (r"insomnie-?check", "Insomnie-Check"),
    (r"für (?:deinen|den) arzt", "für den/deinen Arzt"),
    (r"überwacht", "überwacht"),
    (r"woran deine müdigkeit", "Woran deine Müdigkeit ..."),
    (r"kurve[^.?!¶]{0,30}(?:dorthin|zum arzt|in die praxis)", "Kurve dorthin/zum Arzt"),
]
START_HTML = os.path.join(HIER, "index.html")
MAX_FRAGEN = 7
ZAHLWORT = {"fünf": 5, "sechs": 6, "sieben": 7, "acht": 8, "neun": 9, "zehn": 10}

# q) Symptom-Woerter, die in keiner Ueberschrift stehen duerfen (U3)
SYMPTOM = re.compile(r"müde|muede|müdigkeit|muedigkeit|erschöpf|erschoepf|schlapp|"
                     r"kraftlos|antriebslos|ausgelaugt|energielos|schlaflos", re.I)
# r) Alarmzeichen aus der DEGAM-Grundlage der Fach-Datei (2.1 und Abb. 2)
DEGAM_ALARM = ["vier wochen", "tagsüber ungewollt ein", "fieber", "nachtschweiß",
               "gewichtsverlust", "atempausen"]

# Video-IDs mit .verworfen-Ordner daneben, bei denen von Hand geprueft ist,
# dass die Regel zum GUELTIGEN Video passt. Mit Begruendung, sonst rot.
# (v82 entfiel am 24.09. abends mit den Arzt-Regeln.)
VERWORFEN_GEPRUEFT = {}

# t) Verweis in die Praxis, Bluttest, Laborliste — nur im festen Hinweis erlaubt.
# „Leitlinie der Hausärzte“ (Quellenangabe) ist kein Verweis und trifft nicht.
PRAXIS = re.compile(
    r"praxis|hausarzt(?!e)|\bzum arzt\b|zur ärztin|arzttermin|"
    r"lass (?:das |es |dich )?(?:ärztlich )?(?:nachsehen|untersuchen|durchchecken)|"
    r"bluttest|blutbild|blutwert|blutabnahme|blutzucker|schilddrüsenwert|"
    r"entzündungswert|leberwert|ferritin|\btsh\b|labor(?:wert|liste|untersuchung|test)",
    re.I)

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
  out.regeln[id] = { titel: r.titel, tipp: r.tipp, quelle: r.quelle, kurz: r.kurz,
                     link: r.link, video: r.video || null, gruppe: r.gruppe || null,
                     domaene: r.domaene || null };
});
R.FRAGEN.forEach(function (f) {
  out.fragen.push({ id: f.id, text: f.text, zusatz: f.zusatz || "",
                    zusatzListe: f.zusatzListe || [], optionen: f.optionen,
                    ausloeser: f.ausloeser });
});
function idsVon(l) { return l.map(function (t) { return t.regelId; }); }
function kurzErg(e) {
  return { profil: e.profil, hebel: idsVon(e.hebel), ausserdem: idsVon(e.ausserdem),
           mailblock: R.reihenfolge(e).indexOf("mailblock") >= 0,
           halten: e.halten };
}
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
      gezeigt: idsVon(e.treffer),
      unauffaellig: e.unauffaellig
    });
  });
});

/* --- g) AUSSCHLUSS: jede Antwortkombination einmal durchspielen. */
out.konflikte = R.KONFLIKTE || [];
var PAAR = R.PAAR || ["zuckerTief", "pauseMachen"];
var S = out.sweep = { zahl: 0, ohneAusloeser: [], konflikt: [],
                      zuViele: [], paar: [], ohneMail: [], teilen: [] };
var folgen = {}, teiltexte = {};
function merk(liste, x) { if (liste.length < 3) { liste.push(x); } }
(function () {
  var fs = R.FRAGEN, halten = {}, zaehler = new Array(fs.length).fill(0);
  R.HALTEN.forEach(function (id) { halten[id] = true; });
  if (fs.some(function (f) { return !f.optionen.length; })) { S.zahl = 0; return; }
  for (;;) {
    var a = {};
    fs.forEach(function (f, k) { a[f.id] = zaehler[k]; });
    var e = R.werteAus(a);
    S.zahl++;
    var erlaubt = {};
    fs.forEach(function (f) {
      var o = f.optionen[a[f.id]];
      f.ausloeser.forEach(function (x) {
        if (o.wert >= x.ab && R.ausloeserGilt(x, a)) { erlaubt[x.regel] = true; }
      });
    });
    var gezeigt = idsVon(e.treffer);
    gezeigt.forEach(function (id) {
      if (erlaubt[id] || (e.halten && halten[id])) { return; }
      merk(S.ohneAusloeser, { regel: id, antworten: a, gezeigt: gezeigt });
    });
    out.konflikte.forEach(function (paar) {
      if (gezeigt.indexOf(paar[0]) >= 0 && gezeigt.indexOf(paar[1]) >= 0) {
        merk(S.konflikt, { paar: paar, antworten: a, gezeigt: gezeigt });
      }
    });
    if (e.hebel.length > 3) { merk(S.zuViele, { antworten: a, gezeigt: gezeigt }); }
    /* Paar-Regel */
    var alle = idsVon(e.hebel.concat(e.ausserdem));
    var iz = alle.indexOf(PAAR[0]), ip = alle.indexOf(PAAR[1]);
    if (iz >= 0 && iz < 3 && ip >= 0 && ip !== iz + 1) {
      merk(S.paar, { antworten: a, gezeigt: alle });
    }
    /* p) U2: jeder Pfad endet mit Mail-Block */
    var folge = R.reihenfolge ? R.reihenfolge(e) : [];
    folgen[folge.join(",")] = folge;
    if (folge.indexOf("mailblock") < 0) {
      merk(S.ohneMail, { antworten: a, gezeigt: gezeigt, folge: folge });
    }
    /* Teilen-Text */
    var tt = R.teilText(e, "https://mein-ruhepuls.de/check/");
    teiltexte[e.profil] = tt;
    var verrat = Object.keys(R.REGELN).filter(function (id) {
      return tt.indexOf(R.REGELN[id].titel) >= 0;
    });
    if (verrat.length) {
      merk(S.teilen, { antworten: a, text: tt });
    }
    var k = fs.length - 1;
    while (k >= 0 && zaehler[k] === fs[k].optionen.length - 1) { zaehler[k] = 0; k--; }
    if (k < 0) { break; }
    zaehler[k]++;
  }
})();
out.folgen = Object.keys(folgen).map(function (k) { return folgen[k]; });
out.teiltexte = teiltexte;
out.profile = Object.keys(R.PROFILE).map(function (k) { return R.PROFILE[k].titel; });
out.profilTexte = {};
Object.keys(R.PROFILE).forEach(function (k) {
  out.profilTexte[k] = R.PROFILE[k].titel + " ¶ " + R.PROFILE[k].satz;
});
out.teilOhne = R.teilText(null, "https://mein-ruhepuls.de/check/");
out.bewegungTipp = R.REGELN.bewegungRegelmaessig ? R.REGELN.bewegungRegelmaessig.tipp : "";
var leer = {};
R.FRAGEN.forEach(function (f) { leer[f.id] = 0; });
var e0 = R.werteAus(leer);
out.leer = { unauffaellig: e0.unauffaellig, gezeigt: idsVon(e0.treffer) };

/* --- m) PROFILE: Fach 4.7, Muster A, B, D, E (Index je Frage in
   Ablauf-Reihenfolge). Frage 8 ist raus (U1), Frage 7 „Seit wann“ auch
   (24.09. abends). C war „nur Dauer, sonst nichts“ = jetzt gleich E; F war
   A plus Warnzeichen = gleich A. */
var MUSTER = {
  A: [1, 0, 2, 2, 2, 1], B: [2, 3, 0, 0, 0, 0],
  D: [0, 0, 0, 0, 3, 0], E: [0, 0, 0, 0, 0, 0]
};
out.muster = {};
Object.keys(MUSTER).forEach(function (k) {
  var a = {};
  R.FRAGEN.forEach(function (f, i) { a[f.id] = MUSTER[k][i]; });
  out.muster[k] = kurzErg(R.werteAus(a));
});

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
        for feld in ("titel", "tipp", "kurz", "quelle", "link"):
            if not (r.get(feld) or "").strip():
                fehler.append("QUELLE: Regel `%s` hat kein Feld `%s`." % (name, feld))
        if r.get("gruppe") != "hebel":
            fehler.append("QUELLE: Regel `%s` hat nicht die gruppe hebel (%r). Der Check "
                          "triagiert nicht, eine Arzt-Gruppe gibt es nicht mehr."
                          % (name, r.get("gruppe")))
        if r.get("gruppe") == "hebel" and r.get("domaene") not in ("schlaf", "trinken", "tag"):
            fehler.append("QUELLE: Hebel-Regel `%s` hat keine domaene schlaf/trinken/tag." % name)
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
    if len(d["fragen"]) > MAX_FRAGEN:
        fehler.append("ABDECKUNG: %d Fragen — hoechstens %d sind erlaubt (F1, Umbau U1)."
                      % (len(d["fragen"]), MAX_FRAGEN))
    # Jeder Text, der die Fragen zaehlt, nennt die echte Zahl.
    texte = [("check/index.html", sichtbarer_text(lies(HTML)))]
    if os.path.exists(START_HTML):
        texte.append(("index.html (Startseite)", sichtbarer_text(lies(START_HTML))))
    texte += [("Teilen-Text", t) for t in (d.get("teiltexte") or {}).values()]
    for wo, text in texte:
        for m in re.finditer(r"\b(\w+) Fragen\b", text):
            n = ZAHLWORT.get(m.group(1).lower())
            if n is not None and n != len(d["fragen"]):
                fehler.append("ABDECKUNG: %s sagt „%s“, es sind aber %d Fragen."
                              % (wo, m.group(0), len(d["fragen"])))
    for f in d["fragen"]:
        if not f["optionen"]:
            fehler.append("ABDECKUNG: Frage `%s` hat keine Antworten." % f["id"])
        for o in f["optionen"]:
            if not (o.get("text") or "").strip() or not (o.get("bezug") or "").strip():
                fehler.append("ABDECKUNG: Frage `%s` hat eine Antwort ohne text/bezug." % f["id"])
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
        if os.path.isdir(ordner + ".verworfen") and vid not in VERWORFEN_GEPRUEFT:
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


def element_mit_id(html, ident):
    """Das ganze Element mit id=ident, samt verschachtelter Elemente
    gleichen Namens. None, wenn es fehlt."""
    m = re.search(r'<(\w+)[^>]*\bid="%s"' % re.escape(ident), html)
    if not m:
        return None
    tag = m.group(1)
    tiefe, pos = 0, m.start()
    for t in re.finditer(r"<(/?)%s\b[^>]*>" % tag, html[m.start():]):
        tiefe += -1 if t.group(1) else 1
        if tiefe == 0:
            return html[m.start():m.start() + t.end()]
    return html[m.start():]


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
    if not sweep or not sweep.get("zahl"):
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
    melde = [
        ("zuViele", "mehr als drei Hebel oben"),
        ("paar", "zuckerTief steht in den Top 3, pauseMachen aber nicht direkt dahinter"),
    ]
    for schluessel, was in melde:
        for fall in sweep.get(schluessel, []):
            fehler.append("AUSSCHLUSS: %s. Antworten: %s · Ergebnis: %s"
                          % (was, kurz(fall["antworten"], d), ", ".join(fall["gezeigt"])))
    for fall in sweep.get("teilen", []):
        fehler.append("AUSSCHLUSS: Der Teilen-Text verraet einen Regel-Titel: „%s“ · "
                      "Antworten: %s"
                      % (fall["text"], kurz(fall["antworten"], d)))
    bedingt = []
    for f in d["fragen"]:
        for a in f["ausloeser"]:
            if a.get("nurWenn"):
                bedingt.append("%s (nur wenn %s ab %d)"
                               % (a["regel"], "/".join(a["nurWenn"]["eineVon"]),
                                  a["nurWenn"]["ab"]))
    if not bedingt:
        fehler.append("AUSSCHLUSS: Keine einzige Regel hat eine Voraussetzung "
                      "(`nurWenn`). Das Nickerchen braucht eine (nur bei Wachliegen).")
    hinweise.append("  g) Ausschluss: %d Antwortmuster durchgespielt, %d "
                    "Konfliktpaar(e), bedingt: %s"
                    % (sweep["zahl"], len(d.get("konflikte") or []),
                       ", ".join(bedingt) or "keine"))


# ----------------------------------------------------------- h) SPEICHER
def ohne_kommentare(js):
    ohne = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", " ", ohne)


def ds_abschnitt(ds, kopf):
    """Text eines Abschnitts der Datenschutzerklaerung (bis zur naechsten <h2>)."""
    i = ds.find(kopf)
    if i < 0:
        return None
    j = ds.find("<h2>", i + len(kopf))
    return ds[i:j if j > 0 else len(ds)]


def pruefe_speicher():
    code = ohne_kommentare(lies(CHECK_JS))
    nutzt = bool(re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie", code))
    if nutzt:
        fehler.append("SPEICHER: check.js legt etwas auf dem Geraet ab. Der Check "
                      "speichert nichts (Produkt & Text 2, Zweig h bleibt).")
    if not os.path.exists(DATENSCHUTZ):
        fehler.append("SPEICHER: datenschutz.html fehlt.")
        return
    ds = lies(DATENSCHUTZ)
    vier = ds_abschnitt(ds, "<h2>4. Der Energie-Check</h2>")
    viera = ds_abschnitt(ds, "<h2>4a. Die Energiekurve</h2>")
    if vier is None:
        fehler.append("SPEICHER: Datenschutz-Abschnitt „4. Der Energie-Check“ fehlt.")
    elif re.search(r"localStorage|im lokalen Speicher", sichtbarer_text(vier)):
        fehler.append("SPEICHER: Abschnitt 4 sagt, der Check speichere im Browser — "
                      "der Check tut das nicht.")
    if os.path.exists(KURVE_JS):
        kc = ohne_kommentare(lies(KURVE_JS))
        if "setItem" in kc and "getItem" not in kc:
            fehler.append("SPEICHER: kurve.js schreibt (setItem), liest aber nie (getItem) "
                          "— Speichern ohne Zweck ist nach § 25 Abs. 2 Nr. 2 TDDDG nicht "
                          "„unbedingt erforderlich“.")
        if KURVE_SCHLUESSEL not in kc:
            fehler.append("SPEICHER: kurve.js benutzt nicht den Schluessel %s." % KURVE_SCHLUESSEL)
        if re.search(r"sessionStorage|indexedDB|document\.cookie", kc):
            fehler.append("SPEICHER: kurve.js benutzt einen anderen Speicher als localStorage.")
        if viera is None:
            fehler.append("SPEICHER: Die Kurve speichert im Browser, die Datenschutzerklaerung "
                          "hat keinen Abschnitt „4a. Die Energiekurve“.")
        else:
            t = sichtbarer_text(viera)
            if "localStorage" not in t:
                fehler.append("SPEICHER: Abschnitt 4a nennt den localStorage nicht.")
            if "kurve" not in t.lower():
                fehler.append("SPEICHER: Abschnitt 4a nennt die Seite /kurve/ nicht.")
    elif viera is not None:
        fehler.append("SPEICHER: Abschnitt 4a beschreibt eine Kurve, die es nicht gibt.")
    hinweise.append("  h) Speicher: Check speichert nichts, Kurve schreibt+liest %s, "
                    "Datenschutz 4/4a passt" % KURVE_SCHLUESSEL)


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
    roh = element_mit_id(html, "mailblock")
    if roh is None:
        fehler.append('VERSPRECHEN: Der Mail-Block (id="mailblock") fehlt.')
        return
    block = sichtbarer_text(roh, True)
    block = re.sub(r"[ \t\r\n]+", " ", block)
    for muster, was in VERSPRECHEN_VERBOTEN:
        treffer = re.search(muster, block, re.I)
        if treffer:
            fehler.append(
                "VERSPRECHEN: Der Mail-Block %s — das kann er nicht halten, die "
                "Antworten werden nie uebertragen. Stelle: ...%s..."
                % (was, treffer.group(0))
            )
    # Recht 24.09.2026, (b): "Deine Antworten gehen nicht mit" ist aus dem
    # Einwilligungssatz raus; der ehrliche Satz steht im Danke-Feld.
    if not re.search(r"nicht schicken|nicht zusenden|nicht mitschicken|Antworten gehen nicht mit"
                     r"|(?:Ergebnis|Antworten) (?:bleibt|bleiben) in deinem Browser", block, re.I):
        fehler.append(
            "VERSPRECHEN: Im Mail-Block fehlt der ehrliche Satz, dass das "
            "Ergebnis NICHT mitgeschickt werden kann. Ohne ihn liest sich die "
            "Adressabfrage, als bekaeme man seine Auswertung."
        )
    if os.path.exists(DATENSCHUTZ):
        ds = re.sub(r"[ \t\r\n]+", " ", sichtbarer_text(lies(DATENSCHUTZ), True))
        if re.search(r"Ergebnis des (?:Schlaf|Energie)-Checks[^.¶]{0,60}zuzusenden", ds, re.I):
            fehler.append("VERSPRECHEN: Die Datenschutzerklaerung nennt als "
                          "Zweck das Zusenden des Ergebnisses.")
    hinweise.append("  i) Versprechen: Mail-Block haelt, was er sagt; kein "
                    "Netzaufruf im Check")


# ------------------------------------------------------------- j) MAIL
MAIL_ZIEL = "https://assets.mailerlite.com/jsonp/"


def pruefe_mail(html):
    fremd = re.findall(r'<script[^>]+src="(https?:[^"]+)"', html, re.I)
    if fremd:
        fehler.append("MAIL: Die Seite laedt ein fremdes Skript (%s). Beim "
                      "Laden darf nichts an Dritte gehen." % ", ".join(fremd))
    for spur in ("webforms.min.js", "takel", "universal.js"):
        if spur in html:
            fehler.append("MAIL: MailerLite-Zaehler/Skript `%s` in index.html." % spur)
    if not os.path.exists(MAIL_JS):
        fehler.append("MAIL: check/mail.js fehlt — das Formular kann nichts senden.")
        return
    code = ohne_kommentare(lies(MAIL_JS))
    if code.count("fetch(") != 1:
        fehler.append("MAIL: mail.js muss genau einen fetch( enthalten, hat %d."
                      % code.count("fetch("))
    for verboten in ("localStorage", "sessionStorage", "RUHEPULS_REGELN",
                     "antwort", "XMLHttpRequest", "sendBeacon", "http"):
        if verboten in code:
            fehler.append("MAIL: mail.js benutzt `%s` — es darf nur die "
                          "Formular-Adresse senden, an die form-action." % verboten)
    if "new FormData(form)" not in code:
        fehler.append("MAIL: mail.js sendet nicht das Formular selbst (new FormData(form)).")
    m = re.search(r'<form id="mailForm"[^>]*action="([^"]+)"', html)
    if not m or not m.group(1).startswith(MAIL_ZIEL):
        fehler.append("MAIL: Das Formular #mailForm schickt nicht an %s." % MAIL_ZIEL)
    else:
        form = html[m.start():html.find("</form>", m.start())]
        namen = set(re.findall(r'name="([^"]+)"', form))
        if namen != {"fields[email]", "ml-submit", "anticsrf"}:
            fehler.append("MAIL: Das Formular sendet mehr oder anderes als die "
                          "Mailadresse: %s" % sorted(namen))
    hinweise.append("  j) Mail: ein Netzaufruf, nur die Adresse, nur nach Klick, "
                    "kein fremdes Skript")


# ------------------------------------------------------------- k) KURVE
def pruefe_kurve():
    for pfad in (KURVE_HTML, KURVE_JS):
        if not os.path.exists(pfad):
            fehler.append("KURVE: %s fehlt." % os.path.relpath(pfad, HIER))
            return
    html = lies(KURVE_HTML)
    code = ohne_kommentare(lies(KURVE_JS))
    for ruf in ("fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource",
                "import(", "new Image", "navigator.geolocation", "window.open"):
        if ruf in code:
            fehler.append("KURVE: kurve.js enthaelt `%s` — nichts darf das Geraet verlassen." % ruf)
    urls = [u for u in re.findall(r"https?://[^\s\"')]+", code)
            if not u.startswith("http://www.w3.org/2000/svg")]
    if urls:
        fehler.append("KURVE: kurve.js nennt eine Adresse im Netz: %s" % ", ".join(urls))
    ohne = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    fremd = re.findall(r'<(?:script|link|img|iframe)[^>]+(?:src|href)="(https?:[^"]+)"', ohne, re.I)
    if fremd:
        fehler.append("KURVE: kurve/index.html laedt etwas von aussen: %s" % ", ".join(fremd))
    if re.search(r"<form[^>]+action=", ohne, re.I):
        fehler.append("KURVE: kurve/index.html hat ein Formular mit action — nichts wird gesendet.")
    skripte = re.findall(r'<script[^>]*src="([^"]+)"', ohne, re.I)
    if skripte != ["kurve.js"]:
        fehler.append("KURVE: Erwartet genau ein Skript kurve.js, gefunden: %s" % skripte)
    # jeder Speicherzugriff in try/catch
    for m in re.finditer(r"localStorage\.", code):
        davor = code[:m.start()]
        t = davor.rfind("try {")
        c = davor.rfind("catch")
        if t < 0 or c > t:
            zeile = davor.count("\n") + 1
            fehler.append("KURVE: Speicherzugriff ohne try/catch (kurve.js, etwa Zeile %d)." % zeile)
    sichtbar = re.sub(r"\s+", " ", sichtbarer_text(html))
    if not (re.search(r"Safari", sichtbar) and re.search(r"Chrome", sichtbar)
            and re.search(r"Lesezeichen", sichtbar)):
        fehler.append("KURVE: Der Hinweis aus T2 fehlt (in Safari/Chrome öffnen + Lesezeichen setzen).")
    hinweise.append("  k) Kurve: kein Netzaufruf, kein fremdes Skript, Speicher nur in "
                    "try/catch, T2-Hinweis steht")


# ----------------------------------------------------------- m) PROFILE
MUSTER_ERWARTET = {
    # Fach 4.7 (von Hand durchgespielt), hier gegen die echte Auswertung.
    # Umbau 24.09. abends: Mail-Block ueberall (U2); D ohne PEM-Frage = Bewegung.
    # Zweiter Schritt: keine Arzt-Regeln, kein kvti, keine Frage „Seit wann“.
    "A": {"profil": "schlaf", "hebel": ["schlafDauer", "bewegungRegelmaessig", "koffeinAbstand"],
          "ausserdem": ["alkoholEnergie", "zuckerTief", "pauseMachen"],
          "mailblock": True, "halten": False},
    "B": {"profil": "schlaf", "hebel": ["stehAuf"], "ausserdem": [],
          "mailblock": True, "halten": False},
    "D": {"profil": "tag", "hebel": ["bewegungRegelmaessig"], "ausserdem": [],
          "mailblock": True, "halten": False},
    "E": {"profil": "unauffaellig", "hebel": ["bewegungRegelmaessig", "festeAufstehzeit"],
          "ausserdem": [], "mailblock": True, "halten": True},
}


def pruefe_profile(d):
    ist = d.get("muster") or {}
    for k, soll in sorted(MUSTER_ERWARTET.items()):
        e = ist.get(k)
        if not e:
            fehler.append("PROFILE: Muster %s wurde nicht durchgespielt." % k)
            continue
        abw = ["%s: soll %s, ist %s" % (f, soll[f], e.get(f)) for f in soll if e.get(f) != soll[f]]
        if abw:
            fehler.append("PROFILE: Muster %s (Fach 4.7) weicht ab — %s" % (k, "; ".join(abw)))
    hinweise.append("  m) Profile: Muster A, B, D, E aus Fach 4.7 durchgespielt")


# ------------------------------------------------------------- n) WORTE
WORT = re.compile(r"[0-9A-Za-zÄÖÜäöüß]+(?:[-'’][0-9A-Za-zÄÖÜäöüß]+)*")


def mailblock_woerter(html):
    block = element_mit_id(html, "mailblock")
    if block is None:
        return None
    block = re.sub(r"<!--.*?-->", " ", block, flags=re.S)
    # nicht gezaehlt (1.4 [D]): unsichtbare Feldbeschriftung, Fehlertext, Danke-Feld
    block = re.sub(r'<label class="sr-only".*?</label>', " ", block, flags=re.S)
    block = re.sub(r'<p[^>]*id="mailFehler".*?</p>', " ", block, flags=re.S)
    block = re.sub(r'<div[^>]*id="mailDanke".*?</div>', " ", block, flags=re.S)
    return len(WORT.findall(sichtbarer_text(block)))


def text_quellen(d, html):
    """Alle Texte, die Nutzer sehen: Check, Regeln, Kurve, Danke-Seiten."""
    quellen = [("check/index.html", sichtbarer_text(html))]
    if d:
        texte = []
        for r in d["regeln"].values():
            texte += [r["titel"], r["tipp"]]
        for f in d["fragen"]:
            texte += [f["text"], f.get("zusatz") or ""]
            texte += [p.get("text", "") for p in f.get("zusatzListe") or [] if isinstance(p, dict)]
            for o in f["optionen"]:
                texte += [o["text"], o["bezug"]]
        quellen.append(("check/regeln.js", " ".join(texte)))
        prof = lies(REGELN_JS)
        quellen.append(("check/regeln.js (Profile/Teilen)",
                        " ".join(re.findall(r'(?:titel|satz): "([^"]+)"', prof) +
                                 re.findall(r'return "([^"]+)"', prof))))
    for pfad in [KURVE_HTML] + DANKE:
        if os.path.exists(pfad):
            quellen.append((os.path.relpath(pfad, HIER), sichtbarer_text(lies(pfad))))
    if os.path.exists(KURVE_JS):
        quellen.append(("kurve/kurve.js", " ".join(re.findall(r'"([^"]{12,})"', lies(KURVE_JS)))))
    return quellen


def pruefe_worte(d, html):
    n = mailblock_woerter(html)
    if n is None:
        fehler.append('WORTE: Der Mail-Block (id="mailblock") fehlt.')
    elif n > MAILBLOCK_MAX:
        fehler.append("WORTE: Der Mail-Block hat %d Woerter, erlaubt sind %d." % (n, MAILBLOCK_MAX))
    quellen = text_quellen(d, html)
    for wo, text in quellen:
        klein = re.sub(r"\s+", " ", text.lower())
        for erlaubt in ERLAUBTE_STELLEN:
            klein = klein.replace(erlaubt, " ")
        for wort in VERBOTEN_WIRK:
            i = klein.find(wort)
            if i >= 0:
                fehler.append('WORTE: Wirkversprechen "%s" in %s — ...%s...'
                              % (wort, wo, klein[max(0, i - 60):i + 60]))
    hinweise.append("  n) Worte: Mail-Block %s Woerter (hoechstens %d), keine Wirkversprechen "
                    "in %d Texten" % (n, MAILBLOCK_MAX, len(quellen)))


# ------------------------------------------------------------- o) ZWECK
def pruefe_zweck(d, html):
    quellen = text_quellen(d, html)
    if os.path.exists(START_HTML):
        quellen.append(("index.html (Startseite)", sichtbarer_text(lies(START_HTML), True)))
    for wo, text in quellen:
        klein = re.sub(r"\s+", " ", text.lower())
        for muster, name in VERBOTEN_ZWECK:
            m = re.search(muster, klein)
            if m:
                fehler.append('ZWECK: "%s" in %s — klingt nach medizinischer Zweckbestimmung '
                              '(Recht 24.09., Massstab 3) — ...%s...'
                              % (name, wo, klein[max(0, m.start() - 60):m.end() + 60]))
    hinweise.append("  o) Zweck: %d Sperren gegen Medizinprodukt-Formulierungen in %d Texten"
                    % (len(VERBOTEN_ZWECK), len(quellen)))


# ---------------------------------------------------------- p) MAILBLOCK
def pruefe_mailblock(d, html):
    sweep = d.get("sweep") or {}
    for fall in sweep.get("ohneMail", []):
        fehler.append("MAILBLOCK: Ein Pfad endet ohne Mail-Block (U2). Reihenfolge: %s · "
                      "Antworten: %s" % (", ".join(fall["folge"]) or "keine",
                                         kurz(fall["antworten"], d)))
    folgen = d.get("folgen") or []
    if not folgen:
        fehler.append("MAILBLOCK: regeln.js liefert keine reihenfolge() — die Anzeige "
                      "ist nicht pruefbar.")
    for folge in folgen:
        for baustein in folge:
            if 'id="%s"' % baustein not in html:
                fehler.append("MAILBLOCK: reihenfolge() nennt den Baustein `%s`, den es in "
                              "check/index.html nicht gibt." % baustein)
    code = ohne_kommentare(lies(CHECK_JS))
    if "R.reihenfolge(e)" not in code:
        fehler.append("MAILBLOCK: check.js nimmt die Reihenfolge nicht aus R.reihenfolge(e) — "
                      "dann prueft Zweig p nicht, was angezeigt wird.")
    if "zeigeMailblock" in code:
        fehler.append("MAILBLOCK: check.js kennt noch einen Schalter `zeigeMailblock`.")
    sichtbar = re.sub(r"\s+", " ", sichtbarer_text(html))
    if 'id="keinMailblock"' in html or "bewusst nicht an" in sichtbar:
        fehler.append("MAILBLOCK: Es gibt wieder einen Ersatz-Zweig statt des Mail-Blocks "
                      "(„biete ich dir bewusst nicht an“).")
    for f in d["fragen"]:
        if f["id"] == "warnzeichen" or f.get("zusatzListe") or \
                any("hart" in o for o in f["optionen"]):
            fehler.append("MAILBLOCK: Frage `%s` ist eine Warnzeichen-Weiche (Liste oder "
                          "hart/weich). Der Check triagiert nicht (Regel, 24.09.)." % f["id"])
    hinweise.append("  p) Mail-Block: in allen %d Antwortmustern, %d verschiedene "
                    "Reihenfolgen, keine Weiche"
                    % (sweep.get("zahl", 0), len(folgen)))


# ------------------------------------------------------- q) UEBERSCHRIFT
def pruefe_ueberschrift(d, html):
    stellen = []
    for wo, quelle in (("check/index.html", html),
                       ("index.html (Startseite)",
                        lies(START_HTML) if os.path.exists(START_HTML) else "")):
        ohne = re.sub(r"<!--.*?-->", " ", quelle, flags=re.S)
        for tag in ("title", "h1", "h2"):
            for m in re.finditer(r"<%s\b[^>]*>(.*?)</%s>" % (tag, tag), ohne, re.S | re.I):
                stellen.append(("%s <%s>" % (wo, tag), re.sub(r"<[^>]+>", " ", m.group(1))))
    stellen += [("Profil-Titel", t) for t in d.get("profile") or []]
    stellen += [("Teilen-Text (%s)" % k, t) for k, t in (d.get("teiltexte") or {}).items()]
    code = ohne_kommentare(lies(CHECK_JS))
    stellen += [("check.js Teilen-Titel", t)
                for t in re.findall(r'navigator\.share\(\{\s*title:\s*"([^"]+)"', code)]
    for wo, text in stellen:
        m = SYMPTOM.search(text)
        if m:
            fehler.append("UEBERSCHRIFT: %s fragt nach dem Symptom („%s“): %s (U3)"
                          % (wo, m.group(0), " ".join(text.split())))
    hinweise.append("  q) Ueberschrift: %d Ueberschriften ohne Symptom-Wort" % len(stellen))


# ------------------------------------------------------------ r) HINWEIS
def pruefe_hinweis(html):
    roh = element_mit_id(html, "festerHinweis")
    if roh is None:
        fehler.append('HINWEIS: Der feste Hinweis (id="festerHinweis") fehlt (U1).')
        return
    text = " ".join(sichtbarer_text(roh).split())
    saetze = [x for x in re.split(r"(?<=[.!?])\s+", text) if x.strip()]
    if len(saetze) > 2:
        fehler.append("HINWEIS: Der feste Hinweis hat %d Saetze, erlaubt sind 2: %s"
                      % (len(saetze), text))
    klein = text.lower()
    if "ersetzt keinen arzt" not in klein:
        fehler.append("HINWEIS: Der feste Hinweis sagt nicht „ersetzt keinen Arzt“.")
    fehlend = [w for w in DEGAM_ALARM if w not in klein]
    if fehlend:
        fehler.append("HINWEIS: Dem festen Hinweis fehlen Alarmzeichen aus der "
                      "DEGAM-Grundlage: %s (U-R1)." % ", ".join(fehlend))
    if "arztkasten" in roh or 'class="hinweis"' not in roh:
        fehler.append("HINWEIS: Der feste Hinweis ist kein ruhiger Satz mehr "
                      "(class=hinweis, kein Kasten).")
    pos, ende = html.find('id="festerHinweis"'), html.find("</section>", html.find('id="ergebnis"'))
    teilen = html.find('class="teilen"')
    if not (0 <= teilen < pos < ende):
        fehler.append("HINWEIS: Der feste Hinweis steht nicht am Ende des Ergebnisses.")
    sichtbar = sichtbarer_text(html)
    if re.search(r"seelsorge|0800 111 0", sichtbar, re.I):
        fehler.append("HINWEIS: Im Check steht wieder eine Seelsorge-Box (U1).")
    hinweise.append("  r) Hinweis: %d Saetze, am Ende, ruhig, DEGAM-Alarmzeichen" % len(saetze))


# ---------------------------------------------------------------- s) PEM
PEM_SATZ = re.compile(r"leichte Anstrengung[^.]*tagelang[^.]*abkl(?:ä|ae)ren", re.I)


def pruefe_pem(d):
    tipp = d.get("bewegungTipp") or ""
    if not tipp:
        fehler.append("PEM: Die Bewegungs-Regel `bewegungRegelmaessig` fehlt.")
    elif not PEM_SATZ.search(tipp):
        fehler.append("PEM: Der Tipp der Bewegungs-Regel enthaelt den PEM-Satz nicht "
                      "(„Haut dich schon leichte Anstrengung tagelang um, lass das erst "
                      "abklären …“, U1).")
    hinweise.append("  s) PEM: Satz steht in der Bewegungs-Regel")


# ------------------------------------------------------------- t) PRAXIS
def ohne_festen_hinweis(html):
    roh = element_mit_id(html, "festerHinweis")
    return html.replace(roh, " ") if roh else html


def pruefe_praxis(d, html):
    stellen = []
    for name, r in sorted(d["regeln"].items()):
        stellen.append(("Regel `%s`" % name,
                        " ¶ ".join([r["titel"], r["tipp"], r["kurz"], r["quelle"]])))
    for k, t in sorted((d.get("profilTexte") or {}).items()):
        stellen.append(("Profil `%s`" % k, t))
    for f in d["fragen"]:
        teile = [f["text"], f.get("zusatz") or ""]
        for o in f["optionen"]:
            teile += [o["text"], o["bezug"]]
        stellen.append(("Frage `%s`" % f["id"], " ¶ ".join(teile)))
    for k, t in sorted((d.get("teiltexte") or {}).items()):
        stellen.append(("Teilen-Text (%s)" % k, t))
    if d.get("teilOhne"):
        stellen.append(("Teilen-Text (ohne Ergebnis)", d["teilOhne"]))
    stellen.append(("check/index.html", sichtbarer_text(ohne_festen_hinweis(html), True)))
    kurve = lies(KURVE_HTML) if os.path.exists(KURVE_HTML) else ""
    stellen.append(("kurve/index.html", sichtbarer_text(ohne_festen_hinweis(kurve), True)))
    if os.path.exists(KURVE_JS):
        stellen.append(("kurve/kurve.js",
                        " ¶ ".join(re.findall(r'"([^"]{12,})"', ohne_kommentare(lies(KURVE_JS))))))
    if os.path.exists(START_HTML):
        stellen.append(("index.html (Startseite)", sichtbarer_text(lies(START_HTML), True)))
    for wo, text in stellen:
        text = " ".join(text.split())
        m = PRAXIS.search(text)
        if m:
            fehler.append("PRAXIS: „%s“ in %s — der Check verweist nicht in die Praxis und "
                          "nennt keinen Bluttest (nur der feste Hinweis darf das) — ...%s..."
                          % (m.group(0), wo, text[max(0, m.start() - 60):m.end() + 60]))
    # Kein Arzt-Baustein, weder in der Auswertung noch in der Seite
    for folge in d.get("folgen") or []:
        for b in folge:
            if "arzt" in b.lower():
                fehler.append("PRAXIS: reihenfolge() zeigt einen Arzt-Baustein `%s`." % b)
    if re.search(r'id="arzt\w*"|class="[^"]*arztkasten', html):
        fehler.append("PRAXIS: check/index.html hat wieder einen Arzt-Kasten.")
    # Die Kurve traegt woertlich denselben festen Hinweis, ohne Seelsorge-Nummer
    im_check = element_mit_id(html, "festerHinweis")
    in_kurve = element_mit_id(kurve, "festerHinweis")
    satz = lambda roh: " ".join(sichtbarer_text(roh).split()) if roh else None
    if not in_kurve:
        fehler.append('PRAXIS: kurve/index.html hat keinen festen Hinweis (id="festerHinweis").')
    elif satz(in_kurve) != satz(im_check):
        fehler.append("PRAXIS: Der feste Hinweis in der Kurve ist nicht woertlich derselbe wie "
                      "im Check:\n      Check: %s\n      Kurve: %s"
                      % (satz(im_check), satz(in_kurve)))
    if re.search(r"seelsorge|0800 ?111", sichtbarer_text(kurve), re.I):
        fehler.append("PRAXIS: In der Kurve steht wieder eine Seelsorge-Nummer.")
    hinweise.append("  t) Praxis: %d Texte ohne Praxis-Verweis und Bluttest, Kurve traegt "
                    "denselben festen Hinweis" % len(stellen))


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
        pruefe_profile(d)
        pruefe_mailblock(d, html)
        pruefe_ueberschrift(d, html)
        pruefe_pem(d)
        pruefe_praxis(d, html)
        texte = []
        for r in d["regeln"].values():
            texte.append(r["titel"])
            texte.append(r["tipp"])
        for f in d["fragen"]:
            texte.append(f["text"])
            texte += [p.get("text", "") for p in f.get("zusatzListe") or [] if isinstance(p, dict)]
            for o in f["optionen"]:
                texte.append(o["text"])
                texte.append("Du hast gesagt: " + o["bezug"] + ".")
        pruefe_ton(" ".join(texte), "check/regeln.js")

    pruefe_reihenfolge(html)
    pruefe_ton(sichtbarer_text(html), "check/index.html")
    if os.path.exists(KURVE_HTML):
        pruefe_ton(sichtbarer_text(lies(KURVE_HTML)), "kurve/index.html")
    pruefe_speicher()
    pruefe_versprechen(html)
    pruefe_mail(html)
    pruefe_kurve()
    pruefe_worte(d, html)
    pruefe_zweck(d, html)
    pruefe_hinweis(html)

    print("Energie-Check — Pruefung")
    for z in hinweise:
        print(z)
    if fehler:
        print("\nROT — %d Punkt(e):" % len(fehler))
        for f in fehler:
            print("  - %s" % f)
        print("\nROT: Der Energie-Check ist nicht abnahmefaehig.")
        return 1
    print("\nGRUEN: Quelle, Abdeckung, Ergebnis, Reihenfolge, Video, Ton, Ausschluss, "
          "Speicher, Versprechen, Mail, Kurve, Profile, Worte, Zweck, Mail-Block, "
          "Ueberschrift, Hinweis, PEM und Praxis stimmen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
