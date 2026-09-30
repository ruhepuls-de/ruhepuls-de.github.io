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
               Lesezeichen). Das Tagesvideo startet nie von selbst (kein
               autoplay, playsinline).
               (Umbau 7 Tage, 28.09.2026 — die Zweige u, v, w rechnen die
               echte Auswertung mit scripts/teste-kurve.js in node durch.)
u) EINRICHTUNG Vor dem ersten Eintrag: drei Schalter (Koffein, Alkohol,
               Suesses, Standard Ja) und die Tipp-Frage mit allen sechs
               Hebeln plus „Weiß ich nicht“; „Einstellungen ändern“ steht da.
               Abgeschaltete Hebel tauchen in keinem Satz auf (Nichttrinker,
               Nicht-Kaffeetrinker, alte Eintraege, 3000 Zufallswochen), und
               der Speicher merkt sich je Eintrag, was gezeigt wurde.
v) OHNE SIEGER „Deine Woche bisher“ ab 5, „Dein Ergebnis“ ab 7 Eintraegen:
               Schnitt, Spannweite, normale Schwankung, bester und
               schwaechster Tag, „So oft geschafft“, Tipp von Tag 1 mit den
               Saetzen aus dem Bauauftrag; bei „Weiß ich nicht“ kein Tipp-
               Block. Kein Ranking, kein Wirkverb, keine Aufforderung zum
               Vergleichen („2 Tage mit und 2 ohne“), kein „bleiben
               gespeichert, bis du sie löschst“; Safari-Satz steht.
w) MITNEHMEN   Der Link traegt die Daten hinter „#“ (nie im Query-String),
               hin und zurueck gleich, kaputte Links ergeben nichts; die
               Seite fragt „Einträge übernehmen?“. In-App-Browser (Instagram,
               FBAN/FBAV, TikTok/musical_ly/Bytedance, GSA) erkannt, Safari
               und Chrome nicht. Tageswechsel um 4:00 (1 Uhr = Vortag).
x) DANKE      (Recht 28.09.2026, R2/R5) Die vier Danke-Seiten nach der Frage
               zu den 30 Tagen (bescheid, nein-woche, nein-themen, nein-zeit)
               gibt es, je mit noindex, ohne Skript und Formular, mit Fuss
               Startseite · Impressum · Datenschutz. „Ja“ sagt „keine
               Bestellung und kostet nichts“, jedes „Nein“ sagt „Zu den 30
               Tagen bekommst du keine eigene Mail“. In der Mail-Datei
               (Fassung 2) hat jeder /danke/-Link eine Seite, und Mail 7
               enthaelt weder die Frage noch einen 30-Tage-Absatz (R1: die
               Einwilligung deckt Angebote erst „danach“, also Mail 8).
y) DATENSCHUTZ (Recht 28.09.2026, R3/R4) Abschnitt 4a beschreibt die neue
               Kurve: Einrichtung/Tipp, 4 Uhr, Safari nach etwa einer Woche,
               Einträge mitnehmen mit #, Browserverlauf, Browserkennung,
               Zweckbestimmung; nicht mehr „bleiben gespeichert, bis du sie
               löschst“ ohne Einschraenkung. Abschnitt 5 nennt Video und
               Vorschlag, die Mail am Tag nach der siebten und beide Gruppen;
               „Aus den Klicks bilde ich keine Gruppen“ steht nicht mehr da.
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

Aufruf:  python3 scripts/pruefe-check.py              prueft kurve/ (Fassung 3)
Release 7 Tage, Umzug (29.09.2026): kurve-test/ ist nach kurve/ kopiert und
geloescht; die SHA-256-Festnagelung auf den alten Live-Stand 8645b42 ist
aufgeloest. /kurve/ wird ohne Argument voll gegen Fassung 3 geprueft.
  z) „Vermutung“ (Liam 29.09.): Die eigene Wahl aus der Einrichtung heisst auf
     der Seite, in der Datenschutzerklaerung, in den Mails 1–9 und in den
     Skripten „Vermutung“, nie „Tipp“ (klang wie ein Rat von Ruhepuls).
     Wortgleich: Einrichtungssatz der Seite = Skript Tag 1, Satz 3.

FASSUNG 3 (Abnahme 28.09.2026 abends, Liam 22:35 „alles nach Empfehlung“):
Ob ein Kurven-Ordner gegen Fassung 3 geprueft wird, entscheidet sein Stand
(`var FORMAT = 2` in kurve.js), nicht sein Name. Nach dem Umzug
kurve-test -> kurve (reines Kopieren) prueft der Aufruf ohne Argument also
automatisch /kurve/ gegen Fassung 3. Dann gilt zusaetzlich:
  k) Rat nur „über den Knopf in der Mail“, kein Safari/Chrome/Lesezeichen;
     Speicherschluessel nach Pfad (schluesselFuer, /kurve/ = ruhepuls.kurve.v1);
     Tagesvideos unter ../videos/f3-tagN.
  u) Tipp-Frage „Was macht für deine Energie …“, Haekchen-Schluessel Format 2.
  v) Tipp-Saetze mit dem Zufalls-Satz (Fach 28.09.).
  x) Sechs Danke-Seiten (+ preis, nein-durchgehalten mit Knopf zur Kurve), keine
     Seite spricht mit „ich“ (E6), 30-tage/ und jahr/ sind weg; Mail-Datei =
     Fassung 3: Mail 8 an Tag 10 mit Preisrahmen 29–49 €, „Noch keine 7
     Einträge? Hier weiter“, ohne „viel besser“; Mail 7 „In drei Tagen“;
     Mail 9 (Wochenmail) ohne 30-Tage-Hinweis; die Haekchen-Liste der
     Mail-Datei nennt jedes Haekchen samt Erklaerzeile wortgleich zur Seite,
     die Skripte jeden Haekchen-Namen (Zahlen ausgeschrieben).
  y) Datenschutz 4a mit Computer/Touchscreen, 5 mit vier Gruppen und „drei
     Tage nach der siebten“, 6 und Impressum mit Facebook.
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
STIL_AB = int(os.environ.get("STIL_AB", "20"))
HTML = os.path.join(CHECK, "index.html")
DATENSCHUTZ = os.path.join(HIER, "datenschutz.html")
KURVE_ORDNER = "kurve-test" if "kurve-test" in sys.argv[1:] else "kurve"
KURVE_HTML = os.path.join(HIER, KURVE_ORDNER, "index.html")
KURVE_JS = os.path.join(HIER, KURVE_ORDNER, "kurve.js")
# Fassung 3 erkennt man am Stand, nicht am Namen (Umzug = Kopieren).
F3 = os.path.exists(KURVE_JS) and bool(re.search(r"var FORMAT = 2;", open(KURVE_JS, encoding="utf-8").read()))
# 30-tage und jahr (alter Plan, 39 €/99 €) sind geloescht (Recht 28.09., O11; Abnahme MUSS 5).
DANKE_ALT = ("30-tage", "jahr")
DANKE_JA_SEITEN = ("bescheid", "preis")
DANKE_NEU = ("bescheid", "nein-woche", "nein-themen", "nein-zeit", "preis", "nein-durchgehalten")
DANKE = [os.path.join(HIER, "danke", n, "index.html") for n in DANKE_NEU]
_PRODUKT = os.path.expanduser("~/Desktop/Liam KI Gehirn/03 Projects/TikTok Automation/07 Produkt/")
MAILS_F2 = _PRODUKT + ("(C) Die 7 Tage — Fassung 3 (28.09.2026).md" if F3 else
                       "(C) Die 7 Tage — Mails und Videoskripte, Fassung 2 (28.09.2026).md")
KURVE_SCHLUESSEL = "ruhepuls.kurve.v1"
# Alte Danke-Seiten des Plans vom 24.09. (39 €/99 €): Die alte Mail 7 der laufenden
# Abonnenten verlinkt sie, bis sie in MailerLite umgestellt ist (Recht O11 knuepft die
# Loeschung genau daran). Bis dahin BLEIBEN sie — aber byte-gleich mit dem Live-Stand,
# damit sich dort nichts still aendert. Loeschen: Ordner entfernen und DANKE_ALT_BLEIBT
# leeren; dann wird die alte Pruefung „30-tage/jahr weg“ wieder scharf.
DANKE_ALT_BLEIBT = {
    "30-tage": "b7ad1f6397699de27256870c2a521b9943452c57e662784295df48c1e0450054",
    "jahr": "ef2f54d35ff6d62176dcb5e93cc4aaa282b374d6f71d16dade36f61ba207f1b9",
}
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
MAILBLOCK_MAX = 70  # 25.09. Liam: "man versteht gar nicht, was man fuer ein Ergebnis bekommt" - der Nutzen braucht einen Satz mehr; Klarheit vor Wortgrenze

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
    # Kein Link nach aussen in der Video-Zeile (Liam 25.09.).
    cj = ohne_kommentare(lies(os.path.join(CHECK, "check.js")))
    if re.search(r"v\.(tiktok|youtube)", cj):
        fehler.append("VIDEO: check.js verlinkt Videos nach aussen (v.tiktok/v.youtube) — "
                      "am Handy oeffnet das die App, der Besucher ist weg vom Check (Liam 25.09.).")
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
        # 25.09.2026 (Liam): „die Videos mit der Eule … verwirrend. Einfach alle Videos,
        # die nicht in dem Stil sind, den wir jetzt haben“ → erst ab der Strichfigur (V20).
        if int(vid[1:]) < STIL_AB:
            fehler.append("VIDEO: `%s` ist aus der Zeit vor der Strichfigur (vor v%d, Eulen-/Standbild-Stil). "
                          "Lieber „Video dazu folgt.“ — Regel auf `video: null` (Liam 25.09.)." % (vid, STIL_AB))
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
        # 25.09.2026 (Liam): TikTok-Link am Handy = App geht auf, Besucher weg vom Check.
        # Jedes Video muss als eigene Datei auf der Seite liegen.
        elif not links[vid].get("datei") or not os.path.exists(os.path.join(HIER, "videos", vid + ".mp4")):
            fehler.append("VIDEO: `%s` liegt nicht als eigene Datei in videos/ — ein Link nach "
                          "aussen schickt den Besucher in die TikTok-App (Liam 25.09.). "
                          "Datei anlegen (720p, faststart) und baue-videolinks.py laufen lassen." % vid)
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
    if F3:
        # Fassung 3, Entscheidung 2: Eintraege bleiben, wo sie gemacht werden.
        if "über den Knopf in der Mail" not in sichtbar or re.search(r"Lesezeichen|Safari oder Chrome", sichtbar):
            fehler.append("KURVE: Fassung 3 rät „über den Knopf in der Mail“ und nicht mehr zu "
                          "Safari/Chrome/Lesezeichen.")
        # Abnahme MUSS 3: Schluessel nach Pfad, /kurve/ behaelt ruhepuls.kurve.v1.
        if not (re.search(r"function schluesselFuer\(pfad\)", code) and "/kurve-test" in code
                and re.search(r"SCHLUESSEL = schluesselFuer\(", code)):
            fehler.append("KURVE: Der Speicherschlüssel hängt nicht vom Pfad ab (schluesselFuer) — "
                          "nach dem Umzug sähen alle bisherigen Nutzer „0 von 7“.")
        # Abnahme MUSS 4: das alte Tag-1-Video (verneinte Haekchen) erscheint nie.
        if '"../videos/f3-tag"' not in code or "onboarding-tag" in code:
            fehler.append("KURVE: Fassung 3 lädt ihre Tagesvideos nicht unter ../videos/f3-tagN.")
    elif not (re.search(r"Safari", sichtbar) and re.search(r"Chrome", sichtbar)
              and re.search(r"Lesezeichen", sichtbar)):
        fehler.append("KURVE: Der Hinweis aus T2 fehlt (in Safari/Chrome öffnen + Lesezeichen setzen).")
    film = re.search(r"<video[^>]*>", ohne)
    if not film:
        fehler.append("KURVE: Das Tagesvideo (<video>) fehlt in kurve/index.html.")
    elif re.search(r"\bautoplay\b", film.group(0)) or "playsinline" not in film.group(0):
        fehler.append("KURVE: Das Tagesvideo darf nicht von selbst starten (kein autoplay) "
                      "und braucht playsinline: %s" % film.group(0))
    if re.search(r"\.autoplay\s*=\s*true|\.play\(\)", code):
        fehler.append("KURVE: kurve.js startet das Tagesvideo selbst — es startet nur per Tipp.")
    hinweise.append("  k) Kurve (%s%s): kein Netzaufruf, kein fremdes Skript, Speicher nur in "
                    "try/catch, %s, Video ohne autoplay"
                    % (KURVE_ORDNER, ", Fassung 3" if F3 else "",
                       "Schlüssel nach Pfad, Rat über die Mail, Videos f3-tagN" if F3 else "T2-Hinweis steht"))


# ------------------------------------------- u, v, w) KURVE, Umbau 7 Tage
# 28.09.2026 — Bauauftrag „Umbau 7 Tage“, Liam: *„ja, wenn dann das ganze produkt
# und der verlauf stimmig ist mach es“*. Grundsatz: Die 7 Tage beweisen nichts, sie
# zeigen dir deine Woche. Die Pruefung vom 28.09. fand: 82–85 % Zufallssieger,
# Nichttrinker bekamen Alkohol-Saetze, Eintraege gingen zwischen In-App-Browser und
# Safari verloren. Die Zweige rechnen die echte Auswertung (kurve.js) in node durch.
TESTE_KURVE = os.path.join(HIER, "scripts", "teste-kurve.js")
KURVE_HEBEL = (["schlaf7", "koffeinSpaet", "alkoholGetrunken", "bewegt", "pause", "suessesNachmittag"] if F3 else
               ["schlaf7", "koffeinHeute", "alkoholHeute", "bewegt", "pause", "keinSuesses"])
KURVE_WIRKVERB = re.compile(r"\bhilft\b|\bmacht\b|sorgt für|besser schlafen|\bwirkt\b|\bbewirk\w*|\bwirken\b", re.I)
KURVE_WIRK_HTML = re.compile(r"\bhilft\b|sorgt für|besser schlafen|\bwirkt\b|\bbewirk\w*|\bwirken\b", re.I)
KURVE_SIEGER = [
    (r"\b2 Tage(?:n)? mit\b|mindestens 2 Tage|zwei Tage mit und zwei", "„2 Tage mit und 2 ohne“"),
    (r"an zwei Tagen (?:weg|aus)|lass es [^.]{0,40}weg|Probier es an zwei Tagen", "Aufforderung zum Vergleichen"),
    (r"deutlichste|stärksten Unterschied|staerksten Unterschied|größten Unterschied bei dir war", "Sieger-Satz"),
    (r"Alle Häkchen im Einzelnen|vergleichListe|ergebnisSatz", "alte Rangliste"),
    (r"bis du sie löschst", "„bleiben gespeichert, bis du sie löschst“"),
]
KURVE_TIPP_SAETZE = [
    "Das liegt innerhalb deiner normalen Schwankung.",
    # Fach 28.09. (Abnahme): Ohne echten Effekt lagen 22–31 % der Wochen darueber.
    ("Das ist mehr als deine normale Schwankung. Auch das kommt in einer Woche oft durch Zufall zustande." if F3 else
     "Das ist mehr als deine normale Schwankung, aber eine Woche ist kurz, und vieles verändert sich gleichzeitig."),
    # Recht 28.09., O4: nicht mehr „zeigt erst ein längerer Versuch“ (klang sicher).
    "Ob es wirklich daran liegt, kann eine Woche nicht zeigen.",
    "Dafür braucht es einen längeren Versuch mit einer Sache.",
]
KURVE_NICHTS_AENDERN = "Ändern musst du dafür nichts. Leb deine Woche wie immer, und probier die Vorschläge aus, wenn du magst."
KURVE_SAFARI = re.compile(r"Safari löscht (?:die Einträge|sie), wenn du die Seite "
                          r"(?:länger als eine Woche|etwa eine Woche lang) nicht öffnest")


def js_texte(code, mindest=12):
    """Alle Zeichenketten "…" eines Skripts, sauber von Anfang bis Ende gelesen.
    (Ein naives "([^"]{12,})" verrutscht nach kurzen Strings wie "#" und liest
    dann Code als Text — ein Satz dahinter faellt durch.)"""
    code = ohne_kommentare(code)
    code = re.sub(r"'(?:[^'\\\n]|\\.)*'", "''", code)
    return [t for t in re.findall(r'"((?:[^"\\\n]|\\.)*)"', code) if len(t) >= mindest]


def kurve_lauf():
    """Die echte Auswertung aus kurve.js, durchgerechnet von teste-kurve.js."""
    if not os.path.exists(TESTE_KURVE):
        fehler.append("KURVE: scripts/teste-kurve.js fehlt — ohne Lauf keine Pruefung u/v/w.")
        return None
    try:
        aus = subprocess.run(["node", TESTE_KURVE, KURVE_ORDNER, "--json"], capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.TimeoutExpired) as e:
        fehler.append("KURVE: teste-kurve.js laeuft nicht (%s)." % e)
        return None
    if not aus.stdout.strip():
        fehler.append("KURVE: teste-kurve.js bricht ab: %s" % aus.stderr.strip()[-400:])
        return None
    lauf = json.loads(aus.stdout)
    for r in (lauf.get("fassung3") or {}).get("rot") or []:
        fehler.append("FASSUNG 3 (teste-kurve.js %s): %s" % (KURVE_ORDNER, r))
    return lauf


def woche_saetze(w):
    s = [w.get("schnitt"), w.get("schwankung"), w.get("schwankungErklaerung"), w.get("grenzeSatz")]
    b = w.get("bester")
    if isinstance(b, str):
        s.append(b)
    elif b:
        s += [b["kopf"], b["haken"], w["schwaechster"]["kopf"], w["schwaechster"]["haken"]]
    s += ["%s: %s" % (g["text"], g["name"]) for g in w.get("geschafft") or []]
    s += w.get("tipp") or []
    return [x for x in s if x]


def pruefe_einrichtung(html, lauf):
    form = element_mit_id(html, "einrichtung")
    if not form:
        fehler.append('EINRICHTUNG: kurve/index.html hat keine Einrichtung (id="einrichtung").')
    else:
        text = " ".join(sichtbarer_text(form).split())
        for frage in ("Was kommt in deinem Alltag vor?",
                      "Was glaubst du: Was macht für deine Energie den größten Unterschied?" if F3 else
                      "Was glaubst du: Was macht bei dir den größten Unterschied?"):
            if frage not in text:
                fehler.append("EINRICHTUNG: Die Frage „%s“ fehlt." % frage)
        for name in ("koffein", "alkohol", "suesses"):
            m = re.search(r'<input[^>]*id="schalter-%s"[^>]*>' % name, form)
            if not m:
                fehler.append("EINRICHTUNG: Der Schalter „%s“ fehlt." % name)
            elif 'role="switch"' not in m.group(0) or not re.search(r"\bchecked\b", m.group(0)):
                fehler.append("EINRICHTUNG: Der Schalter „%s“ ist kein Schalter mit Standard Ja: %s"
                              % (name, m.group(0)))
        tipps = re.findall(r'<input[^>]*name="tipp"[^>]*value="(\w+)"', form)
        if sorted(tipps) != sorted(KURVE_HEBEL + ["weissNicht"]):
            fehler.append("EINRICHTUNG: Die Tipp-Frage bietet %s statt aller sechs Hebel plus "
                          "„Weiß ich nicht“." % tipps)
    if not re.search(r">\s*Einstellungen ändern\s*<", html):
        fehler.append("EINRICHTUNG: Der Link „Einstellungen ändern“ fehlt.")
    code = ohne_kommentare(lies(KURVE_JS))
    if not re.search(r"gezeigt\s*:", code):
        fehler.append("EINRICHTUNG: kurve.js merkt sich je Eintrag nicht, welche Häkchen gezeigt "
                      "wurden — ein leeres, unsichtbares Häkchen zählte dann als „getrunken“.")
    if not lauf:
        return
    a = lauf["auswertung"]
    faelle = [("nichttrinker", r"Alkohol"), ("ohneKaffee", r"Koffein|Süß"), ("altOhneAlkohol", r"Alkohol")]
    for fall, wort in faelle:
        w = a.get(fall) or {}
        if not w.get("zeigen"):
            fehler.append("EINRICHTUNG: Die Beispielwoche „%s“ zeigt keine Woche." % fall)
            continue
        for satz in woche_saetze(w):
            if re.search(wort, satz):
                fehler.append("EINRICHTUNG: Abgeschalteter Hebel in der Woche „%s“: %s" % (fall, satz))
    z = lauf["zufall"]
    for satz in z["abgeschaltet"]:
        fehler.append("EINRICHTUNG: Zufallswoche nennt einen abgeschalteten Hebel: %s" % satz)
    hinweise.append("  u) Einrichtung: 3 Schalter (Standard Ja), Vermutungs-Frage mit 7 Antworten, "
                    "abgeschaltete Hebel in keinem Satz (3 Beispielwochen, %d Zufallswochen)" % z["wochen"])


def pruefe_ohne_sieger(html, lauf):
    code = ohne_kommentare(lies(KURVE_JS))
    sichtbar = " ".join(sichtbarer_text(html).split())
    texte = js_texte(lies(KURVE_JS))
    for muster, was in KURVE_SIEGER:
        for wo, text in (("kurve/index.html", sichtbar), ("kurve/kurve.js", " ¶ ".join(texte))):
            m = re.search(muster, text)
            if m:
                fehler.append("OHNE SIEGER: %s in %s — ...%s..."
                              % (was, wo, text[max(0, m.start() - 60):m.end() + 60]))
    for t in texte:
        w = KURVE_WIRKVERB.search(t)
        if w:
            fehler.append("OHNE SIEGER: Wirkverb „%s“ in kurve.js — ...%s..." % (w.group(0), t[:120]))
    w = KURVE_WIRK_HTML.search(sichtbar)
    if w:
        fehler.append("OHNE SIEGER: Wirkverb „%s“ in kurve/index.html — ...%s..."
                      % (w.group(0), sichtbar[max(0, w.start() - 60):w.end() + 60]))
    if KURVE_NICHTS_AENDERN not in sichtbar:
        fehler.append("OHNE SIEGER: Der Satz „%s“ fehlt in kurve/index.html." % KURVE_NICHTS_AENDERN)
    for ident in ("datenschutzSatz", "voll"):
        el = element_mit_id(html, ident)
        if not el or not KURVE_SAFARI.search(" ".join(sichtbarer_text(el).split())):
            fehler.append("OHNE SIEGER: #%s sagt nicht, dass Safari die Einträge nach einer Woche "
                          "ohne Besuch löscht." % ident)
    karte = element_mit_id(html, "wocheKarte")
    if not karte:
        fehler.append('OHNE SIEGER: Die Karte „Deine Woche“ (id="wocheKarte") fehlt.')
    else:
        for ident in ("wocheTitel", "wocheSchnitt", "wocheSchwankung", "wocheBester",
                      "wocheSchwaechster", "wocheGeschafft", "tippBlock"):
            if 'id="%s"' % ident not in karte:
                fehler.append('OHNE SIEGER: In der Karte fehlt id="%s".' % ident)
    if not lauf:
        return
    a = lauf["auswertung"]
    erwartet_titel = {"vier": None, "fuenf": "Deine Woche bisher", "nichttrinker": "Dein Ergebnis"}
    for fall, titel in erwartet_titel.items():
        w = a.get(fall) or {}
        if titel is None and w.get("zeigen"):
            fehler.append("OHNE SIEGER: Mit 4 Einträgen erscheint schon eine Woche.")
        if titel and w.get("titel") != titel:
            fehler.append("OHNE SIEGER: Woche „%s“ heißt „%s“ statt „%s“." % (fall, w.get("titel"), titel))
    for fall, w in sorted(a.items()):
        if not w.get("zeigen"):
            continue
        if "normale Schwankung" not in (w.get("schwankung") or ""):
            fehler.append("OHNE SIEGER: Woche „%s“ nennt die normale Schwankung nicht." % fall)
        if not w.get("schnitt") or not w.get("bester") or not w.get("geschafft"):
            fehler.append("OHNE SIEGER: Woche „%s“ ohne Schnitt, besten Tag oder „So oft geschafft“." % fall)
        tipp = w.get("tipp")
        if fall in ("weissNicht", "altOhneAlkohol"):
            if tipp:
                fehler.append("OHNE SIEGER: Bei „Weiß ich nicht“ steht ein Tipp-Block: %s" % tipp)
            continue
        if not tipp:
            fehler.append("OHNE SIEGER: Woche „%s“ hat einen Tipp, aber keinen Tipp-Block." % fall)
            continue
        if not tipp[0].startswith("Deine Vermutung von Tag 1:"):
            fehler.append("OHNE SIEGER: Der Block beginnt nicht mit „Deine Vermutung von Tag 1“ (Liam 29.09.): %s" % tipp[0])
        fehlt = [t for t in tipp if t.startswith("Dafür hattest du diese Woche keine")]
        if fehlt:
            continue
        if (KURVE_TIPP_SAETZE[2] not in tipp or KURVE_TIPP_SAETZE[3] not in tipp
                or not (KURVE_TIPP_SAETZE[0] in tipp or KURVE_TIPP_SAETZE[1] in tipp)):
            fehler.append("OHNE SIEGER: Der Tipp-Block der Woche „%s“ hat nicht die Sätze aus dem "
                          "Bauauftrag: %s" % (fall, " / ".join(tipp)))
        if not re.search(r"\d+ Tagen|einem Tag", " ".join(tipp)):
            fehler.append("OHNE SIEGER: Der Tipp-Block der Woche „%s“ nennt keine Tageszahl." % fall)
    if not any(t.startswith("Dafür hattest du diese Woche keine Tage")
               for t in (a.get("immerBewegt") or {}).get("tipp") or []):
        fehler.append("OHNE SIEGER: Jeden Tag bewegt, Tipp Bewegung — der Satz „Dafür hattest du "
                      "diese Woche keine Tage …“ fehlt.")
    z = lauf["zufall"]
    for satz in z["verboten"]:
        fehler.append("OHNE SIEGER: Zufallswoche mit Sieger- oder Wirkwort: %s" % satz)
    hinweise.append("  v) Ohne Sieger: %d Beispielwochen + %d Zufallswochen, Vermutungs-Sätze wörtlich, "
                    "kein Ranking, kein Wirkverb, Safari-Satz steht" % (len(a), z["wochen"]))


def pruefe_mitnehmen(html, lauf):
    code = ohne_kommentare(lies(KURVE_JS))
    if not re.search(r'"#"\s*\+\s*ANKER\s*\+\s*kodiere\(', code):
        fehler.append("MITNEHMEN: kurve.js baut den Link nicht als „#“ + Daten — die Einträge "
                      "müssen hinter dem # stehen, sonst gehen sie an den Server.")
    if re.search(r'"\?[^"]*"\s*\+\s*(?:ANKER|kodiere)', code) or re.search(r"search\s*\+\s*kodiere", code):
        fehler.append("MITNEHMEN: kurve.js hängt die Daten an den Query-String (?).")
    if "Einträge übernehmen?" not in " ".join(sichtbarer_text(html).split()):
        fehler.append("MITNEHMEN: Die Frage „Einträge übernehmen?“ fehlt in kurve/index.html.")
    if not re.search(r">\s*Einträge mitnehmen\s*<", html):
        fehler.append("MITNEHMEN: Der Knopf „Einträge mitnehmen“ fehlt.")
    if not element_mit_id(html, "inApp"):
        fehler.append('MITNEHMEN: Der Hinweis für In-App-Browser (id="inApp") fehlt.')
    if not lauf:
        return
    l = lauf["link"]
    for fall, r in sorted(l.items()):
        if isinstance(r, dict) and "gleich" in r and not (r["gleich"] and r["zweimal"]):
            fehler.append("MITNEHMEN: Der Link der Woche „%s“ kommt nicht gleich zurück." % fall)
        if isinstance(r, dict) and r.get("laenge", 0) > 1500:
            fehler.append("MITNEHMEN: Der Link der Woche „%s“ ist %d Zeichen lang." % (fall, r["laenge"]))
    for fall in ("abgeschnitten", "muell", "boese"):
        if not l.get(fall):
            fehler.append("MITNEHMEN: Ein kaputter Link (%s) wird trotzdem übernommen." % fall)
    if l.get("zusammen", {}).get("tage") != 7:
        fehler.append("MITNEHMEN: Zusammenführen ergibt %s Tage statt 7." % l.get("zusammen"))
    ia = lauf["inApp"]
    for ua in ("instagram", "facebook", "facebookAndroid", "tiktok", "tiktokAndroid", "googleApp"):
        if not ia.get(ua):
            fehler.append("MITNEHMEN: In-App-Browser „%s“ wird nicht erkannt." % ua)
    for ua in ("safari", "chrome", "chromeIos"):
        if ia.get(ua):
            fehler.append("MITNEHMEN: „%s“ gilt fälschlich als In-App-Browser." % ua)
    uhr = lauf["uhr"]
    soll = {"29.9. 00:30": "2026-09-28", "29.9. 01:00": "2026-09-28", "29.9. 03:59": "2026-09-28",
            "29.9. 04:00": "2026-09-29", "29.9. 23:59": "2026-09-29", "01.10. 01:00": "2026-09-30"}
    for k, v in soll.items():
        if uhr.get(k) != v:
            fehler.append("MITNEHMEN: Tageswechsel falsch — %s zählt für %s statt %s." % (k, uhr.get(k), v))
    v = lauf["video"]
    soll_v = {"?tag=3": 3, "?tag=7&x=1": 7, "ohne, 0 Eintraege": 1, "ohne, 2 Eintraege, heute offen": 3,
              "ohne, 3 Eintraege, heute schon": 3}
    for k, t in soll_v.items():
        if v.get(k) != t:
            fehler.append("MITNEHMEN: Tagesvideo für „%s“ ist Tag %s statt %s." % (k, v.get(k), t))
    hinweise.append("  w) Mitnehmen: Link hinter #, %d Wochen hin und zurück gleich, kaputte Links "
                    "abgewiesen, 6 In-App-Kennungen erkannt, Tageswechsel 4:00, Tagesvideo je Tag"
                    % sum(1 for r in l.values() if isinstance(r, dict) and "gleich" in r))


# ------------------------------------------------------------- x) DANKE
# Recht 28.09.2026 (Umbau 7 Tage), R1, R2, R5. Entscheidung Hauptsession: Die Frage
# zu den 30 Tagen steht in einer eigenen Mail 8 („Tag 8“) statt in Mail 7.
DANKE_JA = "keine Bestellung und kostet nichts"
DANKE_NEIN = "Zu den 30 Tagen bekommst du keine eigene Mail"


def mail_block(md, nummer):
    """Der ```-Block einer Mail aus der Mail-Datei (### Mail N ...)."""
    m = re.search(r"^### Mail %d\b.*?```\n(.*?)```" % nummer, md, flags=re.S | re.M)
    return m.group(1) if m else None


def haken_liste(html):
    """(Name, Erklaerzeile) je Haekchen, wie es im Formular steht."""
    aus = []
    for m in re.finditer(r'name="hebel" value="\w+">\s*<span>(.*?)<span class="hilfe">(.*?)</span>', html, re.S):
        aus.append((" ".join(re.sub(r"<[^>]+>", " ", m.group(1)).split()), " ".join(m.group(2).split())))
    return aus


def gesprochen(name):
    """Haekchen-Name, wie ihn ein Skript spricht: Zahlen ausgeschrieben, ohne Klammer."""
    name = name.split(" (")[0]
    for z, w in (("5", "fünf"), ("7", "sieben")):
        name = re.sub(r"\b%s\b" % z, w, name)
    return name


def pruefe_danke_f3(md):
    """Abnahme 28.09. abends: E1, E2, E3, E4, E6 als Pruefung, die rot wird."""
    import hashlib
    for alt in DANKE_ALT:
        pfad_alt = os.path.join(HIER, "danke", alt, "index.html")
        if alt in DANKE_ALT_BLEIBT and os.path.exists(pfad_alt):
            ist = hashlib.sha256(open(pfad_alt, "rb").read()).hexdigest()
            if ist != DANKE_ALT_BLEIBT[alt] or len(os.listdir(os.path.dirname(pfad_alt))) != 1:
                fehler.append("DANKE: /danke/%s/ weicht vom Live-Stand ab — die Seite bleibt nur "
                              "unveraendert stehen, bis die alte Mail 7 umgestellt ist." % alt)
            else:
                hinweise.append("  x) HINWEIS: /danke/%s/ (alter Plan, 39/99 €) bleibt, bis die alte Mail 7 "
                                "in MailerLite umgestellt ist — danach loeschen (DANKE_ALT_BLEIBT)" % alt)
            continue
        if os.path.exists(os.path.join(HIER, "danke", alt)):
            fehler.append("DANKE: /danke/%s/ gibt es noch — die Seite verspricht öffentlich einen "
                          "Preis für einen Plan, den es nicht mehr gibt (Recht O11, MUSS 5)." % alt)
    for name in DANKE_NEU:
        pfad = os.path.join(HIER, "danke", name, "index.html")
        if os.path.exists(pfad):
            t = " ".join(sichtbarer_text(lies(pfad)).split())
            m = re.search(r"\b(ich|mir|mich|mein\w*)\b", t, re.I)
            if m:
                fehler.append("DANKE: /danke/%s/ spricht mit „%s“ — Absender ist „Ruhepuls“ (E6)." % (name, m.group(0)))
    nd = os.path.join(HIER, "danke", "nein-durchgehalten", "index.html")
    if os.path.exists(nd):
        roh = lies(nd)
        if ("Deine Einträge sind noch da. Trag einfach weiter ein" not in " ".join(sichtbarer_text(roh).split())
                or not re.search(r'<a class="btn" href="\.\./\.\./kurve/"', roh)):
            fehler.append("DANKE: /danke/nein-durchgehalten/ ist eine Sackgasse — es fehlt „Deine Einträge "
                          "sind noch da. Trag einfach weiter ein …“ mit Knopf zur Kurve (E3).")
    acht = mail_block(md, 8) or ""
    kopf8 = re.search(r"^### Mail 8\b.*$", md, re.M)
    if not kopf8 or "Tag 10" not in kopf8.group(0):
        fehler.append("DANKE: Mail 8 kommt nicht an Tag 10 (E2).")
    for muss, was in (("zwischen 29 und 49 €", "Preisrahmen (E1)"),
                      ("eine Woche ist noch nicht voll? Trag erst fertig ein, diese Mail kann warten.", "E2-Satz"),
                      ("Noch keine 7 Einträge? Hier weiter", "E2-Knopf"),
                      ("Erst will ich den Preis wissen", "Knopf „Preis“"),
                      ("Deine Energiekurve – 30 Tage", "was man bekommt (E1)")):
        if muss not in acht:
            fehler.append("DANKE: Mail 8 fehlt %s: „%s“." % (was, muss))
    if "viel besser" in acht:
        fehler.append("DANKE: Mail 8 sagt noch „viel besser“ (Recht, Strengeprinzip).")
    if not re.search(r"\[LINK: https://mein-ruhepuls\.de/kurve/[^\]]*\]", acht):
        fehler.append("DANKE: Der Knopf „Noch keine 7 Einträge?“ in Mail 8 führt nicht zur Kurve.")
    sieben = mail_block(md, 7) or ""
    if "In drei Tagen" not in sieben or "Morgen Abend schreibt" in sieben:
        fehler.append("DANKE: Mail 7 kündigt Mail 8 nicht „In drei Tagen“ an (E2, Tag 10).")
    neun = mail_block(md, 9)
    if neun is None:
        fehler.append("DANKE: Die Wochenmail (### Mail 9) fehlt (E3).")
    else:
        m = re.search(r"30 Tage|/danke/|kosten|€|Preis", neun)
        if m:
            fehler.append("DANKE: Die Wochenmail enthält „%s“ — sie geht an alle, auch an „Nein“, "
                          "ohne 30-Tage-Hinweis (E3, Recht)." % m.group(0))
    # E4: Haekchen wortgleich in Seite, Mail-Datei und Skripten
    kurve = lies(KURVE_HTML)
    haken = haken_liste(kurve)
    if len(haken) != 6:
        fehler.append("DANKE/E4: Im Formular stehen %d statt 6 Häkchen mit Erklärzeile." % len(haken))
    teil2 = md.split("## 2. Die Skripte", 1)[1].split("\n## 3.", 1)[0] if "## 2. Die Skripte" in md else ""
    if not teil2:
        fehler.append("DANKE/E4: In der Mail-Datei fehlt „## 2. Die Skripte …“.")
    for name, hilfe in haken:
        if "- %s · *%s*" % (name, hilfe) not in md:
            fehler.append("DANKE/E4: Die Häkchen-Liste der Mail-Datei nennt nicht wortgleich: „%s“ · „%s“."
                          % (name, hilfe))
        if teil2 and gesprochen(name) not in teil2:
            fehler.append("DANKE/E4: Kein Skript nennt das Häkchen wortgleich: „%s“." % gesprochen(name))


def pruefe_danke():
    for name in DANKE_NEU:
        pfad = os.path.join(HIER, "danke", name, "index.html")
        if not os.path.exists(pfad):
            fehler.append("DANKE: /danke/%s/ fehlt — der Link in Mail 8 liefe ins Leere (R5)." % name)
            continue
        roh = lies(pfad)
        ohne = re.sub(r"<!--.*?-->", " ", roh, flags=re.S)
        text = " ".join(sichtbarer_text(roh).split())
        if not re.search(r'<meta name="robots" content="noindex', ohne):
            fehler.append("DANKE: /danke/%s/ hat kein noindex." % name)
        if re.search(r"<script|<form|<img|<iframe", ohne, re.I):
            fehler.append("DANKE: /danke/%s/ hat Skript, Formular oder Bild (kein Zähler erlaubt)." % name)
        for ziel in ("index.html", "impressum.html", "datenschutz.html"):
            if not re.search(r'<footer>.*href="\.\./\.\./%s"' % re.escape(ziel), ohne, re.S):
                fehler.append("DANKE: /danke/%s/ — im Fuß fehlt der Link auf %s." % (name, ziel))
        if name in DANKE_JA_SEITEN:
            if DANKE_JA not in text:
                fehler.append("DANKE: /danke/%s/ sagt nicht „%s“." % (name, DANKE_JA))
        elif DANKE_NEIN not in text:
            fehler.append("DANKE: /danke/%s/ sagt nicht „%s“ (§ 7 Abs. 1 S. 2 UWG)." % (name, DANKE_NEIN))
        if re.search(r"\d+\s*€|Euro", text):
            fehler.append("DANKE: /danke/%s/ nennt einen Preis." % name)
    if not os.path.exists(MAILS_F2):
        hinweise.append("  x) Danke: %d Seiten geprüft (Mail-Datei nicht gefunden, Mails nicht geprüft)" % len(DANKE_NEU))
        return
    md = lies(MAILS_F2)
    for name in sorted(set(re.findall(r"mein-ruhepuls\.de/danke/([\w-]+)/", md))):
        if not os.path.exists(os.path.join(HIER, "danke", name, "index.html")):
            fehler.append("DANKE: Die Mail-Datei verlinkt /danke/%s/, die Seite gibt es nicht." % name)
    sieben = mail_block(md, 7)
    acht = mail_block(md, 8)
    if sieben is None or acht is None:
        fehler.append("DANKE: In der Mail-Datei fehlt Mail 7 oder Mail 8 (R1: Frage in eigener Mail 8).")
    else:
        m = re.search(r"Bescheid|/danke/|30 Tage|kosten", sieben)
        if m:
            fehler.append("DANKE: Mail 7 enthält „%s“ — der 30-Tage-Absatz gehört in Mail 8 "
                          "(Einwilligung deckt Angebote erst danach, Recht R1)." % m.group(0))
        if not re.search(r"Zu den 30 Tagen bekommst du (?:dann )?keine eigene Mail", acht):
            fehler.append("DANKE: Mail 8 sagt vor den Nein-Links nicht, dass dann keine eigene "
                          "30-Tage-Mail kommt (Recht R2).")
        for muss in ("Ja, Bescheid geben", DANKE_JA, "plant", "lebst wie immer",
                     "zwischen 29 und 49 €" if F3 else "etwas kosten", "besser auseinanderhalten"):
            if muss not in acht:
                fehler.append("DANKE: Mail 8 fehlt „%s“ (Fassung Recht 28.09., Abschnitt 3)." % muss)
        if re.search(r"Als Nächstes baut|zeigt erst", acht):
            fehler.append("DANKE: Mail 8 hat wieder „baut“ oder „zeigt erst“ (Recht O1/O4).")
    if F3:
        pruefe_danke_f3(md)
    hinweise.append("  x) Danke: %d Seiten mit noindex, ohne Skript, Fuß vollständig; Mail 7 ohne "
                    "30-Tage-Absatz, Mail 8 mit Recht-Fassung, jeder /danke/-Link hat eine Seite%s"
                    % (len(DANKE_NEU), "; Fassung 3: Tag 10, 29–49 €, Wochenmail ohne 30 Tage, "
                       "kein „ich“, Häkchen wortgleich in Seite/Liste/Skripten, 30-tage/jahr weg oder unverändert bis zur Umstellung" if F3 else ""))


# ------------------------------------------------------- z) VERMUTUNG
# Liam 29.09.2026: „was war denn der tipp bei tag 1? da gab es doch noch keinen.“ →
# „vermutung passt“. Die eigene Wahl aus der Einrichtung heisst ueberall „Vermutung“.
# „tipp auf …“ (antippen) ist ein Verb und bleibt. Interne Namen (tipp, tippBlock) bleiben.
TIPP_HAUPTWORT = re.compile(r"\b(?:dein|deine|deinen|deinem|deiner|der|den|dem|ein|einen|kein|Dein|Deine)\s+Tipps?\b|"
                            r"\bTipp von Tag|\bTipp-(?:Frage|Block|Satz)")
# 30.09.2026 Nutzen-Satz (Liam: „was man von diesem Ergebnis hat … größter Hebel“)
VERMUTUNG_SEITE = "Am siebten Tag siehst du mit deinen eigenen Zahlen, ob deine Vermutung stimmt: deine Energie an den Tagen mit und an den Tagen ohne."
VERMUTUNG_KERN = "ob deine Vermutung stimmt: deine Energie an den Tagen mit und an den Tagen ohne"  # 30.09.2026 Nutzen-Satz


def pruefe_vermutung():
    if not F3:
        return
    seite = " ".join(sichtbarer_text(re.sub(r"<!--.*?-->", " ", lies(KURVE_HTML), flags=re.S)).split())
    js_sicht = " | ".join(js_texte(lies(KURVE_JS)))
    for wo, text in (("kurve/index.html", seite), ("kurve/kurve.js", js_sicht),
                     ("datenschutz.html", " ".join(sichtbarer_text(lies(DATENSCHUTZ)).split()))):
        m = TIPP_HAUPTWORT.search(text)
        if m:
            fehler.append("VERMUTUNG: %s sagt noch „%s“ — die eigene Wahl heisst „Vermutung“ (Liam 29.09.)." % (wo, m.group(0)))
    if VERMUTUNG_SEITE not in seite:
        fehler.append("VERMUTUNG: kurve/index.html fehlt wortgleich: „%s“" % VERMUTUNG_SEITE)
    if "Deine Vermutung von Tag 1: " not in js_sicht:
        fehler.append("VERMUTUNG: kurve.js beginnt den Block nicht mit „Deine Vermutung von Tag 1: “.")
    if not os.path.exists(MAILS_F2):
        hinweise.append("  z) Vermutung: Seite und Datenschutz geprüft (Mail-Datei nicht gefunden)")
        return
    md = lies(MAILS_F2)
    teil1 = md.split("## 1. Die Mails", 1)[1].split("\n## 2.", 1)[0] if "## 1. Die Mails" in md else ""
    teil2 = md.split("## 2. Die Skripte", 1)[1].split("\n## 3.", 1)[0] if "## 2. Die Skripte" in md else ""
    if not teil1 or not teil2:
        fehler.append("VERMUTUNG: In der Mail-Datei fehlt „## 1. Die Mails“ oder „## 2. Die Skripte“.")
        return
    for wo, text in (("Mails (Abschnitt 1)", teil1), ("Skripte (Abschnitt 2)", teil2)):
        for m in TIPP_HAUPTWORT.finditer(text):
            zeile = text[:m.start()].count("\n")
            fehler.append("VERMUTUNG: %s sagt noch „%s“ (etwa Zeile %d des Abschnitts) — heisst „Vermutung“."
                          % (wo, m.group(0), zeile + 1))
    for nr in (6, 7):
        if VERMUTUNG_KERN not in (mail_block(md, nr) or ""):
            fehler.append("VERMUTUNG: Mail %d sagt nicht wortgleich zur Seite „%s“." % (nr, VERMUTUNG_KERN))
    if "Betreff:** Tag 7 von 7: Deine Woche und deine Vermutung nebeneinander" not in md:
        fehler.append("VERMUTUNG: Betreff Mail 7 ist nicht „Tag 7 von 7: Deine Woche und deine Vermutung nebeneinander“.")
    tag1 = teil2.split("### Tag 1", 1)[-1].split("### Tag 2", 1)[0]
    if VERMUTUNG_KERN not in tag1 or "Dann deine Vermutung:" not in tag1:
        fehler.append("VERMUTUNG: Skript Tag 1, Satz 3 sagt nicht „Dann deine Vermutung: …“ und wortgleich zur "
                      "Seite „%s“." % VERMUTUNG_KERN)
    tag7 = teil2.split("### Tag 7", 1)[-1]
    if "Dann deine Vermutung von Tag eins" not in tag7:
        fehler.append("VERMUTUNG: Skript Tag 7, Satz 3 sagt nicht „Dann deine Vermutung von Tag eins“ "
                      "(Seite: „Deine Vermutung von Tag 1:“).")
    hinweise.append("  z) Vermutung: Seite, kurve.js, Datenschutz, Mails 1–9 und Skripte ohne „Tipp“ als "
                    "Hauptwort; Seite = Mail 6/7 = Skript Tag 1 wortgleich; Betreff Mail 7; Skript Tag 7")


# ------------------------------------------------------- y) DATENSCHUTZ
# Recht 28.09.2026 (Umbau 7 Tage), R3/R4: Die Erklaerung muss die neue Kurve und die
# Gruppen aus Klicks beschreiben, sonst ist die Einwilligung nicht informiert.
DS_4A_MUSS = [
    ("localStorage", "localStorage"),
    ("(„deine Vermutung“)", "Einrichtung und Vermutung (Liam 29.09.: nicht „Tipp“)"),
    ("4 Uhr", "Tageswechsel 4 Uhr"),
    ("etwa eine Woche", "Safari löscht nach etwa einer Woche"),
    ("Einträge mitnehmen", "Einträge mitnehmen"),
    ("hinter dem Zeichen #", "Daten hinter #"),
    ("Verlauf", "Browserverlauf"),
    ("Browserkennung", "Browserkennung (In-App-Warnung)"),
    ("am Computer", "Computer-Erkennung (Abnahme 28.09., Technik)"),
    ("Touchscreen", "Touch-Erkennung (iPad gilt nicht als Computer)"),
    ("nicht dafür gedacht, Krankheiten zu erkennen oder zu behandeln", "Zweckbestimmung"),
]
DS_5_MUSS = [
    ("kurzen Video", "Video je Mail"),
    ("Vorschlag", "Vorschlag je Mail"),
    ("drei Tage nach der siebten", "eigene Mail drei Tage nach der siebten (E2, Tag 10)"),
    ("30 Tage – Bescheid", "Gruppe „30 Tage – Bescheid“"),
    ("30 Tage – Preis", "Gruppe „30 Tage – Preis“"),
    ("30 Tage – Nein", "Gruppe „30 Tage – Nein“"),
    ("30 Tage – nicht durchgehalten", "Gruppe „30 Tage – nicht durchgehalten“"),
    ("vier Gründen für „Nein“", "vier Nein-Gründe"),
]
DS_VERBOTEN = [
    ("„dein Tipp“", "alter Name „Tipp“ (Liam 29.09.: „Vermutung“)"),
    ("Die Einträge bleiben gespeichert, bis du sie löschst", "alte 4a-Aussage ohne Safari"),
    ("Aus den Klicks bilde ich keine Gruppen", "absolutes „keine Gruppen“ (widerspricht R2)"),
    ("welche der beiden Antworten", "alte Frage mit zwei Antworten"),
    ("jede mit einem Punkt aus dem Energie-Check", "alte Mail-Strecke"),
    ("drei Gründen für „Nein“", "alte Nein-Gründe (heute vier)"),
    ("am Tag nach der siebten", "Mail 8 kommt jetzt drei Tage nach der siebten"),
]


def pruefe_datenschutz():
    if not os.path.exists(DATENSCHUTZ):
        fehler.append("DATENSCHUTZ: datenschutz.html fehlt.")
        return
    ds = lies(DATENSCHUTZ)
    ohne = re.sub(r"<!--.*?-->", " ", ds, flags=re.S)
    viera = ds_abschnitt(ohne, "<h2>4a. Die Energiekurve</h2>")
    fuenf = ds_abschnitt(ohne, "<h2>5. Newsletter-Versand über MailerLite</h2>")
    for kopf, abschnitt, liste in (("4a", viera, DS_4A_MUSS), ("5", fuenf, DS_5_MUSS)):
        if abschnitt is None:
            fehler.append("DATENSCHUTZ: Abschnitt %s fehlt." % kopf)
            continue
        t = " ".join(sichtbarer_text(abschnitt).split())
        for wort, was in liste:
            if wort not in t:
                fehler.append("DATENSCHUTZ: Abschnitt %s nennt nicht: %s („%s“)." % (kopf, was, wort))
    alles = " ".join(sichtbarer_text(ohne).split())
    sechs = ds_abschnitt(ohne, "<h2>6. Profile")
    if not sechs or "Facebook" not in sechs:
        fehler.append("DATENSCHUTZ: Abschnitt 6 nennt Facebook nicht (Recht, Abnahme 28.09.).")
    imp = os.path.join(HIER, "impressum.html")
    if os.path.exists(imp) and "Facebook" not in lies(imp):
        fehler.append("DATENSCHUTZ: Das Impressum gilt nicht für Facebook (Recht, Abnahme 28.09.).")
    for wort, was in DS_VERBOTEN:
        if wort in alles:
            fehler.append("DATENSCHUTZ: Veraltet — %s: „%s“." % (was, wort))
    hinweise.append("  y) Datenschutz: 4a mit %d Stichworten, 5 mit %d, %d veraltete Sätze nicht mehr da"
                    % (len(DS_4A_MUSS), len(DS_5_MUSS), len(DS_VERBOTEN)))


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
        quellen.append(("kurve/kurve.js", " ".join(js_texte(lies(KURVE_JS)))))
    return quellen


# 25.09.2026 — Liam zur Skala „1 = ganz leer“: *„das sagt niemand so im Deutschen …
# sehr müde eher, oder sehr erschöpft.“* Uebersetzte Wendungen, die kein Muttersprachler
# sagt. Die Liste ersetzt nicht Liams Lesung — sie haelt nur fest, was er schon gefunden hat.
UNDEUTSCH = ["ganz leer", "sehr leer", "völlig leer"]
MAILS_MD = os.path.expanduser("~/Desktop/Liam KI Gehirn/03 Projects/TikTok Automation/07 Produkt/"
                              "(C) MailerLite — die 7 Mails, Klartext (24.09.2026).md")


def pruefe_worte(d, html):
    n = mailblock_woerter(html)
    if n is None:
        fehler.append('WORTE: Der Mail-Block (id="mailblock") fehlt.')
    elif n > MAILBLOCK_MAX:
        fehler.append("WORTE: Der Mail-Block hat %d Woerter, erlaubt sind %d." % (n, MAILBLOCK_MAX))
    quellen = text_quellen(d, html)
    if os.path.exists(MAILS_MD):
        quellen_deutsch = quellen + [("Mails (Klartext)", "\n".join(re.findall(r"```\n(.*?)```", lies(MAILS_MD), flags=re.S)))]
    else:
        quellen_deutsch = quellen
    for wo, text in quellen_deutsch:
        klein = re.sub(r"\s+", " ", text.lower())
        for wendung in UNDEUTSCH:
            i = klein.find(wendung)
            if i >= 0:
                fehler.append('WORTE: Keine deutsche Wendung "%s" in %s (Liam 25.09.: „sehr müde“, „sehr erschöpft“) — ...%s...'
                              % (wendung, wo, klein[max(0, i - 40):i + 40]))
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
                        " ¶ ".join(js_texte(lies(KURVE_JS)))))
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
                texte.append("Du hast gesagt, " + o["bezug"][:1].lower() + o["bezug"][1:] + ".")
        pruefe_ton(" ".join(texte), "check/regeln.js")

    pruefe_reihenfolge(html)
    pruefe_ton(sichtbarer_text(html), "check/index.html")
    if os.path.exists(KURVE_HTML):
        pruefe_ton(sichtbarer_text(lies(KURVE_HTML)), "kurve/index.html")
    pruefe_speicher()
    pruefe_versprechen(html)
    pruefe_mail(html)
    pruefe_kurve()
    if os.path.exists(KURVE_HTML) and os.path.exists(KURVE_JS):
        kurve_html = re.sub(r"<!--.*?-->", " ", lies(KURVE_HTML), flags=re.S)
        lauf = kurve_lauf()
        pruefe_einrichtung(kurve_html, lauf)
        pruefe_ohne_sieger(kurve_html, lauf)
        pruefe_mitnehmen(kurve_html, lauf)
    pruefe_danke()
    pruefe_vermutung()
    pruefe_datenschutz()
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
          "Speicher, Versprechen, Mail, Kurve, Einrichtung, Ohne Sieger, Mitnehmen, Danke, "
          "Datenschutz, Vermutung, Profile, "
          "Worte, Zweck, Mail-Block, Ueberschrift, Hinweis, PEM und Praxis stimmen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
