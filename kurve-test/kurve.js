/* Deine Energiekurve – 7 Tage.  Stand 28.09.2026 (Umbau 7 Tage, Teil A).
   Auftrag: „(C) Umbau 7 Tage — Bauauftrag (28.09.2026)“, Grundlage
   „(C) Prüfung 7 Tage — Zusammenfassung und Umbau (28.09.2026)“.

   GRUNDSATZ (Liam 28.09.): Die 7 Tage beweisen nichts, sie zeigen dir deine
   Woche. Kein Satz sagt, was bei dir „wirkt“, und es gibt keinen Sieger mehr
   (die Pruefung zeigte: 82–85 % der Wochen bekamen einen „deutlichen“
   Unterschied, auch wenn nichts einen Unterschied macht).

   Alles laeuft im Browser. KEIN Netzaufruf (kein fetch, kein
   XMLHttpRequest, kein sendBeacon), kein fremdes Skript, keine Verbindung
   zum Check. Gespeichert wird nur unter dem Schluessel ruhepuls.kurve.v1
   im localStorage dieses Browsers — und gelesen wird er beim naechsten
   Aufruf, sonst waere das Speichern ohne Zweck (§ 25 Abs. 2 Nr. 2 TDDDG).
   Jeder Zugriff steht in try/catch. Der Mitnehmen-Link traegt die Eintraege
   hinter dem „#“: Dieser Teil einer Adresse geht nie an einen Server.

   Die Auswertung (ohne Seite) laesst sich in node laden:
   require("kurve/kurve.js") liefert die reinen Funktionen. Geprueft:
   scripts/pruefe-check.py, Zweige k, u, v, w (ruft scripts/teste-kurve.js).
*/
(function () {
  "use strict";

  var SCHLUESSEL = "ruhepuls.kurve.test"; // Testseite: eigener Speicher, mischt sich nicht mit /kurve/
  var HOECHSTENS = 7;          // nach sieben Eintraegen keine weiteren
  var WOCHE_AB = 5;            // „Deine Woche bisher“ ab dem 5. Eintrag
  var TAGESWECHSEL = 4;        // 28.09.: neuer Tag erst um 4:00 — ein Eintrag um 1 Uhr zaehlt fuer den Vortag
  var ANKER = "mitnehmen=";    // Mitnehmen-Link: …/kurve/#mitnehmen=<daten>

  /* Die Haekchen. Namen woertlich wie im Formular (Leser-Test 25.09.:
     abweichende Kurznamen verwirrten).
     schalter: null = immer aktiv (Schlaf, Bewegung, Pause); sonst der
       Schalter aus der Einrichtung („Was kommt in deinem Alltag vor?“).
     tipp: Name in der Tipp-Frage und im Tipp-Block.
     mit/ohne: Tage mit bzw. ohne gesetztes Haekchen, als Satzteil.
     versetzt: 25.09. (Liam) — alle Haekchen fragen nach HEUTE, Koffein und
       Alkohol stoeren aber vor allem die Nacht danach. Diese beiden
       vergleicht der Tipp-Block deshalb mit der Zahl vom Folgetag. */
  var HEBEL = [
    { k: "schlaf7", name: "Letzte Nacht mindestens 7 Stunden geschlafen", schalter: null, tipp: "Schlaf",
      mit: "nach mindestens 7 Stunden Schlaf", ohne: "nach weniger als 7 Stunden Schlaf" },
    { k: "koffeinHeute", name: "Nach dem Mittagessen kein Koffein mehr", schalter: "koffein", tipp: "Koffein",
      mit: "nach einem Nachmittag ohne Koffein", ohne: "nach einem Nachmittag mit Koffein", versetzt: true,
      warum: "Gezählt wird hier deine Zahl vom Tag danach, weil Koffein am Nachmittag vor allem die folgende Nacht stören kann." },
    { k: "alkoholHeute", name: "Keinen Alkohol getrunken, auch später am Abend nicht", schalter: "alkohol", tipp: "Alkohol",
      mit: "nach einem Tag ohne Alkohol", ohne: "nach einem Tag mit Alkohol", versetzt: true,
      warum: "Gezählt wird hier deine Zahl vom Tag danach, weil Alkohol am Abend vor allem die folgende Nacht stören kann." },
    { k: "bewegt", name: "Mindestens eine halbe Stunde so bewegt, dass du etwas schneller geatmet hast", schalter: null, tipp: "Bewegung",
      mit: "mit mindestens einer halben Stunde Bewegung", ohne: "mit weniger Bewegung" },
    { k: "pause", name: "Am Nachmittag eine kurze Pause gemacht, höchstens zehn Minuten", schalter: null, tipp: "Pause am Nachmittag",
      mit: "mit einer kurzen Pause am Nachmittag", ohne: "ohne kurze Pause am Nachmittag" },
    { k: "keinSuesses", name: "Am Nachmittag nichts Süßes und keinen Energydrink", schalter: "suesses", tipp: "Süßes am Nachmittag",
      mit: "ohne Süßes und Energydrink am Nachmittag", ohne: "mit Süßem oder Energydrink am Nachmittag" }
  ];
  var ALLE = HEBEL.map(function (h) { return h.k; });
  var SCHALTER = ["koffein", "alkohol", "suesses"];
  var WEISS_NICHT = "weissNicht";
  /* ALT: Schluessel bis 25.09. fragten nach dem Vorabend, stehen also schon am richtigen Tag. */
  var ALT = { koffeinHeute: "koffeinMittag", alkoholHeute: "keinAlkohol" };
  var ALT_NAME = { koffeinMittag: "Nach dem Mittagessen kein Koffein mehr", keinAlkohol: "Keinen Alkohol getrunken" };
  /* Kurzzeichen fuer den Mitnehmen-Link (haelt ihn kurz genug zum Kopieren). */
  var ZEICHEN = { schlaf7: "s", koffeinHeute: "k", alkoholHeute: "a", bewegt: "b", pause: "p",
                  keinSuesses: "z", koffeinMittag: "K", keinAlkohol: "A" };
  var WOCHENTAG = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var WOCHENTAG_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  /* Titel der Tagesvideos. Fehlt die Datei, verschwindet der Block still. */
  var VIDEOTITEL = { 1: "So geht's", 2: "Koffein", 3: "Schlaf", 4: "Alkohol",
                     5: "Bewegung und deine Woche bisher", 6: "Das Nachmittagstief", 7: "Deine Woche" };

  /* ------------------------------------------------------------ Datum */
  function datumText(d) {
    var m = d.getMonth() + 1, t = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (t < 10 ? "0" : "") + t;
  }
  function ausText(s) {
    var p = s.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function plusTage(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }
  /* Der Kalendertag, fuer den ein Eintrag zu diesem Zeitpunkt zaehlt. */
  function tagVon(jetzt) {
    return datumText(plusTage(jetzt, jetzt.getHours() < TAGESWECHSEL ? -1 : 0));
  }
  function tagSchild(d) { return WOCHENTAG[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + "."; }
  function tagLang(s) { var d = ausText(s); return WOCHENTAG_LANG[d.getDay()] + ", " + d.getDate() + "." + (d.getMonth() + 1) + "."; }

  /* ------------------------------------------------------- Einstellung */
  function hebelAktiv(h, einst) {
    return !h.schalter || !einst || einst[h.schalter] !== false;
  }
  function aktiveHebel(einst) {
    return HEBEL.filter(function (h) { return hebelAktiv(h, einst); });
  }
  /* Welche Haekchen standen bei diesem Eintrag auf der Seite? Eintraege vor
     dem 28.09. kennen das Feld nicht: dort standen alle sechs. Ein Haekchen,
     das nicht zu sehen war, zaehlt nie — weder als gesetzt noch als leer. */
  function gezeigt(e) { return e.gezeigt || ALLE; }
  function zaehlt(e, h) { return gezeigt(e).indexOf(h.k) >= 0; }
  function gesetzt(e, h) { return e.hebel.indexOf(h.k) >= 0; }

  /* ------------------------------------------------------- Auswertung */
  function zahl(v) { return (Math.round(v * 10) / 10).toFixed(1).replace(".", ","); }
  function halbe(v) {
    return (Math.round(v * 2) / 2).toFixed(1).replace(".", ",");
  }
  function schnitt(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function anTagen(n) { return n === 1 ? "an einem Tag" : "an " + n + " Tagen"; }
  function erstGross(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* Tage mit und ohne Haekchen; bei versetzten Hebeln die Zahl vom Folgetag. */
  function paare(eintraege, h) {
    var mit = [], ohne = [];
    Object.keys(eintraege).sort().forEach(function (t) {
      var e = eintraege[t];
      var ja;
      if (!h.versetzt) {
        if (!zaehlt(e, h)) { return; }
        ja = gesetzt(e, h);
      } else if (ALT[h.k] && e.hebel.indexOf(ALT[h.k]) >= 0) {
        ja = true;                              /* alter Eintrag: fragte schon nach dem Vorabend */
      } else {
        var vortag = eintraege[datumText(plusTage(ausText(t), -1))];
        if (!vortag || !zaehlt(vortag, h)) { return; }   /* ohne Vortag kein Paar */
        ja = gesetzt(vortag, h);
      }
      (ja ? mit : ohne).push(e.energie);
    });
    return { mit: mit, ohne: ohne };
  }

  function hakenNamen(e, einst) {
    var namen = aktiveHebel(einst).filter(function (h) { return zaehlt(e, h) && gesetzt(e, h); })
      .map(function (h) { return h.name; });
    return namen.concat(e.hebel.filter(function (k) { return ALT_NAME[k]; })
      .map(function (k) { return ALT_NAME[k] + " (Vorabend)"; }));
  }

  /* Liefert alle Saetze fuer „Deine Woche bisher“ / „Dein Ergebnis“.
     Nur Tatsachen, die immer stimmen: Schnitt, Spannweite, normale
     Schwankung, bester und schwaechster Tag, wie oft geschafft, und der
     eigene Tipp mit ehrlicher Grenze. */
  function auswerten(daten) {
    var eintraege = daten.eintraege || {};
    var einst = daten.einstellung || null;
    var tage = Object.keys(eintraege).sort();
    var n = tage.length;
    var w = { n: n, zeigen: n >= WOCHE_AB, fertig: n >= HOECHSTENS };
    if (!w.zeigen) { return w; }
    w.titel = w.fertig ? "Dein Ergebnis" : "Deine Woche bisher";

    var werte = tage.map(function (t) { return eintraege[t].energie; });
    var mittel = schnitt(werte);
    var tief = Math.min.apply(null, werte), hoch = Math.max.apply(null, werte);
    w.schnitt = hoch === tief ? "Deine Zahl lag an allen Tagen bei " + hoch + "."
      : "Deine Zahl lag im Schnitt bei " + zahl(mittel) + ". Die niedrigste war " + tief + ", die höchste " + hoch + ".";

    /* Normale Schwankung: Standardabweichung der eigenen Tageszahlen
       (typische Abweichung vom eigenen Schnitt), auf 0,5 gerundet. */
    var sd = Math.sqrt(werte.reduce(function (s, v) { return s + (v - mittel) * (v - mittel); }, 0) / (n - 1));
    var grenze;
    if (sd === 0) {
      grenze = 0;
      w.schwankung = "Deine normale Schwankung: keine.";
    } else if (sd < 0.25) {
      grenze = 0.5;
      w.schwankung = "Deine normale Schwankung: weniger als ±\u00a00,5 Punkte.";
    } else {
      grenze = Math.round(sd * 2) / 2;
      w.schwankung = "Deine normale Schwankung: etwa ±\u00a0" + halbe(sd) + " Punkte.";
    }
    w.grenze = grenze;
    w.schwankungErklaerung = sd === 0 ? "" : "So weit lag deine Zahl an einem typischen Tag über oder unter deinem Schnitt. " +
      "Ein Auf und Ab in dieser Größe gehört zu einer ganz normalen Woche.";

    /* Bester und schwaechster Tag, mit Datum und Haekchen */
    if (hoch === tief) {
      w.bester = "Einen besten und einen schwächsten Tag gibt es deshalb nicht.";
      w.schwaechster = null;
    } else {
      var tagSatz = function (wort, wert) {
        var gleich = tage.filter(function (t) { return eintraege[t].energie === wert; });
        var t = gleich[0], namen = hakenNamen(eintraege[t], einst);
        return { kopf: wort + ": " + tagLang(t) + ", mit " + wert + "." +
                   (gleich.length > 1 ? " Diese Zahl hattest du an " + gleich.length + " Tagen, hier steht der erste." : ""),
                 haken: namen.length ? "Häkchen an diesem Tag: " + namen.join(" · ") + "."
                                     : "An diesem Tag hast du kein Häkchen gesetzt." };
      };
      w.bester = tagSatz("Dein bester Tag", hoch);
      w.schwaechster = tagSatz("Dein schwächster Tag", tief);
    }

    /* So oft geschafft: je aktivem Haekchen „X von N Tagen“ */
    w.geschafft = aktiveHebel(einst).map(function (h) {
      var da = tage.filter(function (t) { return zaehlt(eintraege[t], h); });
      var ja = da.filter(function (t) {
        var e = eintraege[t];
        return gesetzt(e, h) || (ALT[h.k] && e.hebel.indexOf(ALT[h.k]) >= 0);
      }).length;
      if (!da.length) { return { name: h.name, text: "noch an keinem Tag gefragt" }; }
      return { name: h.name, text: ja + " von " + da.length + (da.length === 1 ? " Tag" : " Tagen") };
    });

    /* Dein Tipp von Tag 1 */
    w.tipp = null;
    var tippHebel = null;
    if (einst && einst.tipp && einst.tipp !== WEISS_NICHT) {
      tippHebel = HEBEL.filter(function (h) { return h.k === einst.tipp && hebelAktiv(h, einst); })[0] || null;
    }
    if (tippHebel) {
      var p = paare(eintraege, tippHebel);
      var s = ["Dein Tipp von Tag 1: " + tippHebel.tipp + "."];
      if (!p.mit.length && !p.ohne.length) {
        s.push("Dafür hattest du diese Woche keine zwei Einträge an aufeinanderfolgenden Tagen.");
      } else if (!p.mit.length || !p.ohne.length) {
        s.push("Dafür hattest du diese Woche keine Tage " + (p.mit.length ? tippHebel.ohne : tippHebel.mit) + ".");
      } else {
        var a = schnitt(p.mit), b = schnitt(p.ohne);
        var d = Math.abs(Math.round((a - b) * 10) / 10);
        s.push(erstGross(anTagen(p.mit.length)) + " " + tippHebel.mit + " lag deine Zahl " +
               (p.mit.length > 1 ? "im Schnitt " : "") + "bei " + zahl(a) + ", " +
               anTagen(p.ohne.length) + " " + tippHebel.ohne + " bei " + zahl(b) + ".");
        if (tippHebel.warum) { s.push(tippHebel.warum); }
        s.push("Der Unterschied beträgt " + zahl(d) + " Punkte.");
        s.push(d > grenze
          ? "Das ist mehr als deine normale Schwankung, aber eine Woche ist kurz, und vieles verändert sich gleichzeitig."
          : "Das liegt innerhalb deiner normalen Schwankung.");
        s.push("Ob es wirklich daran liegt, zeigt erst ein längerer Versuch mit einer Sache.");
      }
      w.tipp = s;
    }
    w.grenzeSatz = "Eine Woche zeigt dir, wie deine Tage waren. Warum sie so waren, kann sie nicht trennen, " +
      "denn an jedem Tag spielt vieles mit, das hier nicht steht: Stress, Wetter, ein Infekt.";
    return w;
  }

  /* -------------------------------------------------- Mitnehmen-Link */
  function b64(s) {
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function ausB64(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) { s += "="; }
    return atob(s);
  }
  var AUS_ZEICHEN = {};
  Object.keys(ZEICHEN).forEach(function (k) { AUS_ZEICHEN[ZEICHEN[k]] = k; });

  function kodiere(daten) {
    var e = {};
    Object.keys(daten.eintraege || {}).sort().forEach(function (t) {
      var x = daten.eintraege[t];
      var z = [x.energie, x.hebel.map(function (k) { return ZEICHEN[k] || ""; }).join("")];
      if (x.gezeigt) { z.push(x.gezeigt.map(function (k) { return ZEICHEN[k] || ""; }).join("")); }
      e[t.replace(/-/g, "")] = z;
    });
    var roh = { v: 1, e: e };
    var s = daten.einstellung;
    if (s) { roh.s = [s.koffein === false ? 0 : 1, s.alkohol === false ? 0 : 1, s.suesses === false ? 0 : 1, s.tipp || ""]; }
    return b64(JSON.stringify(roh));
  }

  /* Liest einen Mitnehmen-Link. Alles wird geprueft; bei jedem Fehler null. */
  function dekodiere(code) {
    var roh;
    try { roh = JSON.parse(ausB64(code)); } catch (err) { return null; }
    if (!roh || roh.v !== 1 || typeof roh.e !== "object" || !roh.e) { return null; }
    var eintraege = {};
    var tage = Object.keys(roh.e);
    if (tage.length > HOECHSTENS) { return null; }
    for (var i = 0; i < tage.length; i++) {
      var m = /^(\d{4})(\d{2})(\d{2})$/.exec(tage[i]);
      var z = roh.e[tage[i]];
      if (!m || !Array.isArray(z) || typeof z[0] !== "number" || z[0] % 1 || z[0] < 1 || z[0] > 10 ||
          typeof z[1] !== "string") { return null; }
      var liste = function (s) {
        var out = [];
        for (var j = 0; j < s.length; j++) {
          if (!AUS_ZEICHEN[s[j]]) { return null; }
          if (out.indexOf(AUS_ZEICHEN[s[j]]) < 0) { out.push(AUS_ZEICHEN[s[j]]); }
        }
        return out;
      };
      var hebel = liste(z[1]);
      if (!hebel) { return null; }
      var x = { energie: z[0], hebel: hebel };
      if (typeof z[2] === "string") {
        x.gezeigt = liste(z[2]);
        if (!x.gezeigt) { return null; }
      }
      eintraege[m[1] + "-" + m[2] + "-" + m[3]] = x;
    }
    var daten = { eintraege: eintraege };
    if (Array.isArray(roh.s)) {
      var tipp = roh.s[3];
      if (tipp && tipp !== WEISS_NICHT && ALLE.indexOf(tipp) < 0) { return null; }
      daten.einstellung = { koffein: roh.s[0] !== 0, alkohol: roh.s[1] !== 0, suesses: roh.s[2] !== 0,
                            tipp: tipp || WEISS_NICHT };
    }
    return daten;
  }

  /* Zusammenfuehren: Eintraege aus beiden, bei gleichem Tag gilt der Link.
     Mehr als sieben: die ersten sieben bleiben (sie sind die Woche). */
  function zusammen(lokal, link) {
    var e = {};
    Object.keys(lokal.eintraege || {}).forEach(function (t) { e[t] = lokal.eintraege[t]; });
    Object.keys(link.eintraege).forEach(function (t) { e[t] = link.eintraege[t]; });
    Object.keys(e).sort().slice(HOECHSTENS).forEach(function (t) { delete e[t]; });
    return { eintraege: e, einstellung: link.einstellung || lokal.einstellung || undefined };
  }

  /* In-App-Browser (TikTok, Instagram, Facebook, Google-App): eigener Speicher,
     getrennt von Safari/Chrome. */
  function istInApp(ua) {
    return /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Bytedance|\bGSA\//i.test(ua || "");
  }

  /* Welches Tagesvideo? ?tag=N aus der Mail, sonst der Tag, an dem man steht:
     Eintraege + 1, nach dem heutigen Eintrag der heutige Tag. */
  function videoTag(suche, n, hatHeute) {
    var m = /[?&]tag=([1-7])(?:&|$)/.exec(suche || "");
    if (m) { return parseInt(m[1], 10); }
    return Math.max(1, Math.min(hatHeute ? n : n + 1, HOECHSTENS));
  }

  var API = { HEBEL: HEBEL, tagVon: tagVon, auswerten: auswerten, kodiere: kodiere, dekodiere: dekodiere,
              zusammen: zusammen, istInApp: istInApp, videoTag: videoTag, aktiveHebel: aktiveHebel,
              paare: paare, ANKER: ANKER };
  if (typeof module === "object" && module.exports) { module.exports = API; return; }

  /* ================================================================ Seite */
  var $ = function (id) { return document.getElementById(id); };
  var zeig = function (el, an) { el.classList[an ? "remove" : "add"]("weg"); };
  var leere = function (el) { while (el.firstChild) { el.removeChild(el.firstChild); } };
  var absatz = function (text, klasse) {
    var p = document.createElement("p");
    if (klasse) { p.className = klasse; }
    p.textContent = text;
    return p;
  };

  var daten = { eintraege: {} };
  var speicherGeht = true;
  var modus = "heute";         // oder "gestern", "aendern"
  var gewaehlt = 0;            // Zahl 1–10, 0 = noch keine
  var einrichten = false;      // Einstellungen gerade offen
  var linkDaten = null;        // Daten aus einem Mitnehmen-Link, noch nicht uebernommen

  function heute() { return tagVon(new Date()); }
  function gestern() { return datumText(plusTage(ausText(heute()), -1)); }
  function daten7() { return Object.keys(daten.eintraege).sort(); }

  /* ---------------------------------------------------------- Speicher */
  function lade() {
    try {
      var roh = window.localStorage.getItem(SCHLUESSEL);
      if (roh) {
        var d = JSON.parse(roh);
        if (d && typeof d.eintraege === "object" && d.eintraege) { daten = d; }
      }
    } catch (e) {
      speicherGeht = false;
    }
  }
  function schreibe() {
    try {
      window.localStorage.setItem(SCHLUESSEL, JSON.stringify(daten));
      return true;
    } catch (e) {
      speicherGeht = false;
      return false;
    }
  }
  function loesche() {
    try { window.localStorage.removeItem(SCHLUESSEL); } catch (e) { speicherGeht = false; }
    daten = { eintraege: {} };
  }

  /* ---------------------------------------------------------- Einrichtung */
  function schalter(name) { return $("schalter-" + name); }
  function tippKnoepfe() { return document.querySelectorAll('input[name="tipp"]'); }

  function zeigeSchalterText() {
    SCHALTER.forEach(function (name) {
      $("stand-" + name).textContent = schalter(name).checked ? "Ja" : "Nein";
    });
    /* Tipp-Auswahl: nur aktive Hebel */
    var einst = { koffein: schalter("koffein").checked, alkohol: schalter("alkohol").checked,
                  suesses: schalter("suesses").checked };
    var t = tippKnoepfe();
    for (var i = 0; i < t.length; i++) {
      var h = HEBEL.filter(function (x) { return x.k === t[i].value; })[0];
      var an = !h || hebelAktiv(h, einst);
      zeig(t[i].parentNode, an);
      if (!an) { t[i].checked = false; }
    }
  }
  function fuelleEinrichtung() {
    var s = daten.einstellung || {};
    SCHALTER.forEach(function (name) { schalter(name).checked = s[name] !== false; });
    var t = tippKnoepfe();
    for (var i = 0; i < t.length; i++) { t[i].checked = t[i].value === s.tipp; }
    zeigeSchalterText();
    zeig($("tippFehlt"), false);
  }
  function speichereEinrichtung(ev) {
    ev.preventDefault();
    var tipp = null, t = tippKnoepfe();
    for (var i = 0; i < t.length; i++) { if (t[i].checked) { tipp = t[i].value; } }
    if (!tipp) { zeig($("tippFehlt"), true); $("tippFehlt").focus(); return; }
    var neu = !daten.einstellung;
    daten.einstellung = { koffein: schalter("koffein").checked, alkohol: schalter("alkohol").checked,
                          suesses: schalter("suesses").checked, tipp: tipp };
    var ok = schreibe();
    einrichten = false;
    male(ok ? (neu ? "eingerichtet" : "einstellungGespeichert") : null);
  }

  /* ---------------------------------------------------------- Formular */
  function baueSkala() {
    var box = $("skala");
    for (var i = 1; i <= 10; i++) {
      (function (n) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "stufe";
        b.textContent = String(n);
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", "false");
        b.addEventListener("click", function () { waehle(n); });
        box.appendChild(b);
      })(i);
    }
  }
  function waehle(n) {
    gewaehlt = n;
    var knoepfe = $("skala").querySelectorAll(".stufe");
    for (var i = 0; i < knoepfe.length; i++) {
      var an = (i + 1) === n;
      knoepfe[i].classList[an ? "add" : "remove"]("an");
      knoepfe[i].setAttribute("aria-checked", an ? "true" : "false");
    }
    if (n) { zeig($("fehltZahl"), false); }
  }
  function haken() { return document.querySelectorAll('input[name="hebel"]'); }

  /* Nur aktive Haekchen stehen im Formular. */
  function zeigeAktiveHaken() {
    var aktiv = aktiveHebel(daten.einstellung).map(function (h) { return h.k; });
    var h = haken();
    for (var i = 0; i < h.length; i++) {
      var an = aktiv.indexOf(h[i].value) >= 0;
      zeig(h[i].parentNode, an);
      if (!an) { h[i].checked = false; }
    }
  }

  function fuelle(eintrag) {
    waehle(eintrag ? eintrag.energie : 0);
    var h = haken();
    for (var i = 0; i < h.length; i++) {
      h[i].checked = !!(eintrag && eintrag.hebel.indexOf(h[i].value) >= 0);
    }
    zeigeAktiveHaken();
  }

  function setzeModus(m) {
    modus = m;
    $("frageEnergie").textContent = m === "gestern"
      ? "Wie viel Energie hattest du gestern insgesamt?"
      : "Wie viel Energie hattest du heute insgesamt?";
    $("frageHaken").firstChild.textContent = m === "gestern" ? "Was traf gestern zu?" : "Was traf heute zu?";
    $("labelSchlaf").textContent = m === "gestern"
      ? "In der Nacht von vorgestern auf gestern mindestens 7 Stunden geschlafen"
      : "Letzte Nacht mindestens 7 Stunden geschlafen";
    $("gruppeHeute").textContent = m === "gestern" ? "Gestern" : "Heute";
    fuelle(daten.eintraege[m === "gestern" ? gestern() : heute()] || null);
  }

  function speichere(ev) {
    ev.preventDefault();
    if (!gewaehlt) { zeig($("fehltZahl"), true); return; }
    var tag = modus === "gestern" ? gestern() : heute();
    var neu = !daten.eintraege[tag];
    if (neu && daten7().length >= HOECHSTENS) { male(); return; }
    var gewaehlteHaken = [];
    var h = haken();
    for (var i = 0; i < h.length; i++) { if (h[i].checked) { gewaehlteHaken.push(h[i].value); } }
    daten.eintraege[tag] = { energie: gewaehlt, hebel: gewaehlteHaken,
                             gezeigt: aktiveHebel(daten.einstellung).map(function (x) { return x.k; }) };
    var ok = schreibe();
    var warGestern = modus === "gestern";
    modus = "heute";
    if (ok && warGestern && !daten.eintraege[heute()] && daten7().length < HOECHSTENS) { male("gesternGespeichert"); return; }
    male(ok ? "gespeichert" : null);
  }

  /* -------------------------------------------------- Mitnehmen-Link */
  function ohneAnker() {
    try { window.history.replaceState(null, "", window.location.pathname + window.location.search); }
    catch (e) { window.location.hash = ""; }
  }
  function linkFuer() {
    return window.location.origin + window.location.pathname + "#" + ANKER + kodiere(daten);
  }
  function mitnehmen() {
    var link = linkFuer();
    $("mitnehmenLink").value = link;
    zeig($("mitnehmenBox"), true);
    zeig($("kopiert"), false);
    /* Auch in die Adresszeile: „Im Browser öffnen“ einer App nimmt die Eintraege dann mit. */
    try { window.history.replaceState(null, "", link); } catch (e) { /* egal */ }
    $("mitnehmenLink").focus();
    $("mitnehmenLink").select();
  }
  function kopiere() {
    var feld = $("mitnehmenLink");
    var fertig = function () { zeig($("kopiert"), true); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(feld.value).then(fertig, function () {
          feld.select(); document.execCommand("copy"); fertig();
        });
        return;
      }
    } catch (e) { /* weiter unten */ }
    feld.select();
    try { document.execCommand("copy"); fertig(); } catch (e) { /* Feld ist markiert, kopieren von Hand */ }
  }
  function pruefeAnker() {
    var h = window.location.hash || "";
    if (h.indexOf("#" + ANKER) !== 0) { return; }
    var code = h.slice(ANKER.length + 1);
    var d = dekodiere(code);
    zeig($("linkKaputt"), !d);
    if (!d) { ohneAnker(); return; }
    if (code === kodiere(daten)) { ohneAnker(); return; }   /* derselbe Stand, nichts zu fragen */
    linkDaten = d;
    var t = Object.keys(d.eintraege).sort();
    var satz = t.length
      ? "Im Link stehen " + (t.length === 1 ? "ein Eintrag" : t.length + " Einträge") + ", vom " +
        tagSchild(ausText(t[0])) + " bis " + tagSchild(ausText(t[t.length - 1]))
      : "Im Link stehen keine Einträge, nur deine Einstellungen.";
    var hier = daten7().length;
    if (hier) {
      satz += " Auf diesem Gerät " + (hier === 1 ? "steht schon ein Eintrag" : "stehen schon " + hier + " Einträge") +
        ". Beides wird zusammengelegt. Gibt es einen Tag doppelt, gilt der Eintrag aus dem Link.";
    }
    $("uebernehmenText").textContent = satz;
    zeig($("uebernehmen"), true);
  }

  /* ------------------------------------------------------------ Anzeige */
  function male(meldung) {
    var tage = daten7();
    var n = tage.length;
    var hatHeute = !!daten.eintraege[heute()];
    var eingerichtet = !!daten.einstellung;

    /* Fortschrittszeile */
    var zeile = $("fortschritt");
    leere(zeile);
    /* Leser-Test 25.09. Runde 2: „Tag 3“ neben Mail „vierter Tag“ wirkte wie verzaehlt — die Zeile zaehlt Eintraege. */
    zeile.appendChild(document.createTextNode(Math.min(n, HOECHSTENS) + " von 7 Tagen eingetragen  "));
    var punkte = document.createElement("span");
    punkte.className = "punkte";
    var p = [];
    for (var i = 0; i < HOECHSTENS; i++) { p.push(i < Math.min(n, HOECHSTENS) ? "●" : "○"); }
    punkte.textContent = p.join(" ");
    zeile.appendChild(punkte);

    var zeigeEinrichtung = einrichten || (!eingerichtet && n < HOECHSTENS);
    zeig($("einrichtung"), zeigeEinrichtung);
    zeig($("einrichtungAbbrechen"), einrichten && eingerichtet);
    $("einrichtungSpeichern").textContent = eingerichtet ? "Speichern" : "Weiter zum Eintrag";
    zeig($("ersterBesuch"), n === 0 && !einrichten);
    zeig($("lesezeichen"), n === 0);
    zeig($("leerHinweis"), n === 0 && /[?&]tag=[2-7]/.test(window.location.search));
    zeig($("speicherFehler"), !speicherGeht);
    zeig($("eingerichtet"), meldung === "eingerichtet");
    zeig($("einstellungGespeichert"), meldung === "einstellungGespeichert");
    zeig($("uebernommen"), meldung === "uebernommen");
    zeig($("gespeichert"), meldung === "gespeichert" && n < HOECHSTENS);
    zeig($("gespeichertLetzter"), meldung === "gespeichert" && n >= HOECHSTENS);
    zeig($("gesternGespeichert"), meldung === "gesternGespeichert");
    zeig($("voll"), n >= HOECHSTENS);

    var ruhig = !meldung || meldung === "gesternGespeichert" || meldung === "eingerichtet" ||
                meldung === "einstellungGespeichert" || meldung === "uebernommen";
    var zeigeFormular = ruhig && (modus === "gestern" || !hatHeute) && (n < HOECHSTENS || modus === "aendern");
    if (modus === "aendern") { zeigeFormular = true; }
    if (zeigeEinrichtung) { zeigeFormular = false; }
    zeig($("schonEingetragen"), ruhig && hatHeute && !zeigeFormular && !zeigeEinrichtung);
    zeig($("eintrag"), zeigeFormular);
    /* Leser-Test 25.09.: auch NACH dem heutigen Eintrag nachholbar (Mail 4 verspricht das). */
    zeig($("gesternZeile"), !zeigeEinrichtung && modus === "heute" && meldung !== "gesternGespeichert" &&
         n < HOECHSTENS && !daten.eintraege[gestern()] && n > 0 && (zeigeFormular || hatHeute));
    if (zeigeFormular) { setzeModus(modus === "aendern" ? "heute" : modus); }
    zeig($("fehltZahl"), false);
    zeig($("einstellungenZeile"), !zeigeEinrichtung);
    zeig($("mitnehmenKnopf"), n > 0);
    zeig($("inAppMitnehmen"), n > 0);
    if (!n) { zeig($("mitnehmenBox"), false); }

    maleKurve(tage);
    maleWoche(tage);
  }

  /* SVG-Kurve: Tag 1 = erster Eintrag, dann Kalendertage. Ein Tag ohne
     Eintrag bleibt leer, die Linie wird dort unterbrochen. */
  function maleKurve(tage) {
    zeig($("kurveBox"), tage.length > 0);
    var box = $("diagramm");
    leere(box);
    var tbody = $("kurveTabelle").querySelector("tbody");
    leere(tbody);
    if (!tage.length) { return; }

    var erster = ausText(tage[0]);
    var letzter = ausText(tage[tage.length - 1]);
    var spanne = Math.round((letzter - erster) / 86400000) + 1;
    var anzahl = Math.max(HOECHSTENS, spanne);

    var NS = "http://www.w3.org/2000/svg";
    var B = 600, H = 280, L = 44, R = 14, O = 16, U = 56;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + B + " " + H);
    svg.setAttribute("class", "kurve-svg");
    function neu(tag, attr, text) {
      var e = document.createElementNS(NS, tag);
      for (var k in attr) { e.setAttribute(k, attr[k]); }
      if (text != null) { e.textContent = text; }
      svg.appendChild(e);
      return e;
    }
    var x = function (i) { return L + (anzahl === 1 ? 0 : i * (B - L - R) / (anzahl - 1)); };
    var y = function (v) { return O + (10 - v) * (H - O - U) / 9; };

    [1, 5, 10].forEach(function (v) {
      neu("line", { x1: L, x2: B - R, y1: y(v), y2: y(v), "class": "gitter" });
      neu("text", { x: L - 8, y: y(v) + 4, "class": "achse", "text-anchor": "end" }, String(v));
    });
    neu("text", { x: 12, y: (O + H - U) / 2, "class": "achse titel", "text-anchor": "middle",
                  transform: "rotate(-90 12 " + ((O + H - U) / 2) + ")" }, "Energie, 1 bis 10");

    var vorher = null;
    for (var i = 0; i < anzahl; i++) {
      var d = plusTage(erster, i);
      var e = daten.eintraege[datumText(d)];
      neu("text", { x: x(i), y: H - U + 20, "class": "achse", "text-anchor": "middle" }, "Tag " + (i + 1));
      neu("text", { x: x(i), y: H - U + 36, "class": "achse klein", "text-anchor": "middle" }, tagSchild(d));

      var zeile = document.createElement("tr");
      var zellen = ["Tag " + (i + 1), tagSchild(d), e ? String(e.energie) : "kein Eintrag",
        e ? hakenNamen(e, daten.einstellung).join(", ") : ""];
      zellen.forEach(function (z) {
        var td = document.createElement("td");
        td.textContent = z;
        zeile.appendChild(td);
      });
      tbody.appendChild(zeile);

      if (e) {
        if (vorher) {
          neu("line", { x1: vorher[0], y1: vorher[1], x2: x(i), y2: y(e.energie), "class": "linie" });
        }
        vorher = [x(i), y(e.energie)];
      } else {
        vorher = null;
        if (i < spanne) {
          neu("text", { x: x(i), y: y(5.5), "class": "achse klein luecke", "text-anchor": "middle" }, "kein Eintrag");
        }
      }
    }
    for (var j = 0; j < anzahl; j++) {
      var e2 = daten.eintraege[datumText(plusTage(erster, j))];
      if (e2) {
        neu("circle", { cx: x(j), cy: y(e2.energie), r: 6, "class": "punkt" });
        neu("text", { x: x(j), y: y(e2.energie) - 12, "class": "wert", "text-anchor": "middle" }, String(e2.energie));
      }
    }
    box.appendChild(svg);
  }

  /* „Deine Woche bisher“ ab dem 5. Eintrag, „Dein Ergebnis“ ab dem 7. Kein Sieger. */
  function maleWoche(tage) {
    zeig($("woche"), tage.length > 0);
    zeig($("wocheBald"), tage.length > 0 && tage.length < WOCHE_AB);
    var w = auswerten(daten);
    zeig($("wocheKarte"), w.zeigen);
    ["wocheSchnitt", "wocheSchwankung", "wocheErklaerung", "wocheBester", "wocheSchwaechster",
     "wocheGeschafft", "tippBlock", "wocheGrenze"].forEach(function (id) { leere($(id)); });
    if (!w.zeigen) { return; }
    $("wocheTitel").textContent = w.titel;
    $("wocheSchnitt").textContent = w.schnitt;
    $("wocheSchwankung").textContent = w.schwankung;
    $("wocheErklaerung").textContent = w.schwankungErklaerung;
    if (typeof w.bester === "string") {
      $("wocheBester").appendChild(absatz(w.bester));
    } else {
      [[w.bester, "wocheBester"], [w.schwaechster, "wocheSchwaechster"]].forEach(function (x) {
        $(x[1]).appendChild(absatz(x[0].kopf, "tag-kopf"));
        $(x[1]).appendChild(absatz(x[0].haken, "small"));
      });
    }
    w.geschafft.forEach(function (g) {
      var li = document.createElement("li");
      var b = document.createElement("b");
      b.textContent = g.text;
      li.appendChild(b);
      li.appendChild(document.createTextNode(": " + g.name));
      $("wocheGeschafft").appendChild(li);
    });
    zeig($("tippBlock"), !!w.tipp);
    if (w.tipp) {
      var kopf = document.createElement("h3");
      kopf.textContent = w.tipp[0];
      $("tippBlock").appendChild(kopf);
      w.tipp.slice(1).forEach(function (s) { $("tippBlock").appendChild(absatz(s)); });
    }
    $("wocheGrenze").textContent = w.grenzeSatz;
  }

  /* ---------------------------------------------------------- Tagesvideo */
  /* 25.09.2026 (Liam: „Du drückst den Check in der Bio und ab da sollst du dich
     begleitet fühlen“). 28.09.: jede Datei onboarding-tagN; fehlt sie, bleibt der
     Block still weg (erst das Standbild pruefen, dann zeigen; Fehler beim Film
     blendet ihn wieder aus). Kein autoplay, Start per Tipp, playsinline. */
  function zeigeTagesvideo() {
    var tag = videoTag(window.location.search, daten7().length, !!daten.eintraege[heute()]);
    var sektion = $("tagesvideo"), film = $("tagesvideoFilm"), probe = $("tagesvideoProbe");
    var weg = function () { zeig(sektion, false); };
    var basis = "../videos/onboarding-tag" + tag;
    probe.addEventListener("error", weg);
    film.addEventListener("error", weg);
    probe.addEventListener("load", function () {
      film.poster = basis + ".jpg";
      film.src = basis + ".mp4";
      $("tagesvideoTitel").textContent = "Tag " + tag + " von 7: " + VIDEOTITEL[tag];
      zeig(sektion, true);
    });
    probe.src = basis + ".jpg";
  }

  /* ---------------------------------------------------------- Verdrahtung */
  document.addEventListener("DOMContentLoaded", function () {
    lade();
    zeig($("inApp"), istInApp(navigator.userAgent));
    zeigeTagesvideo();
    baueSkala();
    fuelleEinrichtung();
    SCHALTER.forEach(function (name) { schalter(name).addEventListener("change", zeigeSchalterText); });
    $("einrichtung").addEventListener("submit", speichereEinrichtung);
    $("einrichtungAbbrechen").addEventListener("click", function () { einrichten = false; male(); });
    $("einstellungen").addEventListener("click", function () {
      einrichten = true;
      fuelleEinrichtung();
      male();
      $("einrichtung").scrollIntoView();
    });
    $("eintrag").addEventListener("submit", speichere);
    $("fuerGestern").addEventListener("click", function () {
      modus = "gestern";
      male();
    });
    $("aendern").addEventListener("click", function () {
      modus = "aendern";
      male();
    });
    $("mitnehmenKnopf").addEventListener("click", mitnehmen);
    $("inAppMitnehmen").addEventListener("click", function () {
      mitnehmen();
      $("mitnehmen").scrollIntoView();
    });
    $("kopieren").addEventListener("click", kopiere);
    $("uebernehmenJa").addEventListener("click", function () {
      daten = zusammen(daten, linkDaten);
      linkDaten = null;
      zeig($("uebernehmen"), false);
      ohneAnker();
      var ok = schreibe();
      fuelleEinrichtung();
      modus = "heute";
      male(ok ? "uebernommen" : null);
    });
    $("uebernehmenNein").addEventListener("click", function () {
      linkDaten = null;
      zeig($("uebernehmen"), false);
      ohneAnker();
    });
    window.addEventListener("hashchange", pruefeAnker);
    $("loeschen").addEventListener("click", function () { zeig($("loeschenFrage"), true); });
    $("loeschenNein").addEventListener("click", function () { zeig($("loeschenFrage"), false); });
    $("loeschenJa").addEventListener("click", function () {
      loesche();
      zeig($("loeschenFrage"), false);
      modus = "heute";
      einrichten = false;
      fuelleEinrichtung();
      male();
    });
    male();
    pruefeAnker();
  });
})();
