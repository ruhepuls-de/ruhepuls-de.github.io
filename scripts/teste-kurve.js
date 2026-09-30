#!/usr/bin/env node
/* Rechnet die echte Auswertung aus kurve/kurve.js mit Beispielwochen durch.
   Umbau 7 Tage, 28.09.2026 (Bauauftrag Teil A, Punkt 9).

   node scripts/teste-kurve.js          rechnet kurve/ durch und prueft Fassung 3
                                        (Liam 28.09., 22:15) — exit 1, sobald eine
                                        Pruefung rot ist
   node scripts/teste-kurve.js --json   liefert alles als JSON fuer
                                        scripts/pruefe-check.py (Zweige u, v, w)

   Release 7 Tage, Umzug (29.09.2026): kurve-test/ ist nach kurve/ kopiert und
   geloescht. Die Festnagelung auf den alten Live-Stand 8645b42 (SHA-256) ist
   damit aufgeloest: ohne Argument wird /kurve/ voll geprueft.

   Die Beispielwochen nennen Haekchen nach ihrer ROLLE (schlaf, koffein, alkohol,
   bewegt, pause, suesses).

   Nichts hier geht ins Netz. */
"use strict";
var path = require("path");
var fs = require("fs");
var ORDNER = process.argv.indexOf("kurve-test") >= 0 ? "kurve-test" : "kurve";
var K = require(path.join(__dirname, "..", ORDNER, "kurve.js"));
/* Abnahme 28.09. abends: Die Pruefungen von Fassung 3 haengen am Stand (FORMAT 2),
   nicht am Ordnernamen. Nach dem Umzug (kurve-test -> kurve, nur Kopieren) prueft
   `node scripts/teste-kurve.js` dann /kurve/ gegen Fassung 3. */
var F3 = K.FORMAT === 2;

var ALLE = K.HEBEL.map(function (h) { return h.k; });
/* Rolle -> Schluessel des geladenen Stands */
function R(rolle) {
  var h = K.HEBEL.filter(function (x) { return x.schalter === rolle || x.k === rolle; })[0] ||
          K.HEBEL.filter(function (x) { return x.k === { schlaf: "schlaf7" }[rolle]; })[0];
  if (!h) { throw new Error("Rolle unbekannt: " + rolle); }
  return h.k;
}
function RR(liste) { return liste.map(function (l) { return l.map(R); }); }
function woche(start, werte, haken, einst, gezeigt) {
  var e = {};
  var d0 = new Date(start + "T12:00:00");
  werte.forEach(function (v, i) {
    if (v == null) { return; }
    var d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i, 12);
    var t = K.tagVon(d);
    var x = { energie: v, hebel: haken[i] || [] };
    if (gezeigt !== false) {
      x.gezeigt = (gezeigt || K.aktiveHebel(einst).map(function (h) { return h.k; }));
    }
    e[t] = x;
  });
  var daten = { eintraege: e };
  if (einst) { daten.einstellung = einst; }
  return daten;
}
var JA = { koffein: true, alkohol: true, suesses: true };
function mit(einst, tipp) { var s = {}; for (var k in einst) { s[k] = einst[k]; } s.tipp = tipp === "weissNicht" ? tipp : R(tipp); return s; }

var F = {};
/* 1. Nichttrinker (Jonas, P2-aehnlich): Alkohol aus, Tipp Bewegung */
F.nichttrinker = woche("2026-09-28", [6, 5, 7, 4, 6, 7, 5],
  RR([["schlaf", "koffein", "bewegt"], ["koffein"], ["schlaf", "bewegt", "pause"], [],
   ["schlaf", "bewegt"], ["schlaf", "bewegt", "suesses"], ["pause"]]),
  mit({ koffein: true, alkohol: false, suesses: true }, "bewegt"));
/* 2. Nicht-Kaffeetrinkerin (Aylin): Koffein und Suesses aus, Tipp Schlaf */
F.ohneKaffee = woche("2026-09-28", [5, 6, 4, 7, 6, 5, 6],
  RR([["schlaf", "alkohol"], ["schlaf", "alkohol", "bewegt"], ["alkohol"],
   ["schlaf", "alkohol", "pause"], ["schlaf", "alkohol"], ["alkohol"], ["schlaf", "alkohol"]]),
  mit({ koffein: false, alkohol: true, suesses: false }, "schlaf"));
/* 3. Wochenend-Trinker (Stefan, P9): Fr/Sa Bier, Tipp Alkohol — Folgetag */
F.wochenende = woche("2026-10-02", [7, 7, 7, 5, 5, 5, 5],
  RR([["schlaf"], ["schlaf"], ["schlaf", "alkohol", "koffein"], ["alkohol"],
   ["alkohol", "koffein"], ["alkohol"], ["alkohol", "bewegt"]]),
  mit(JA, "alkohol"));
/* 4. Tipp „Weiß ich nicht“ */
F.weissNicht = woche("2026-09-28", [4, 6, 5, 8, 3, 6, 7],
  RR([["schlaf"], ["bewegt"], [], ["schlaf", "bewegt", "pause"], [], ["koffein"], ["schlaf"]]),
  mit(JA, "weissNicht"));
/* 5. Nur 5 Eintraege, Tipp Pause */
F.fuenf = woche("2026-09-28", [5, 7, 6, 4, 6],
  RR([["pause"], ["pause", "schlaf"], [], ["suesses"], ["pause"]]), mit(JA, "pause"));
/* 6. Nur 4 Eintraege: noch keine Woche */
F.vier = woche("2026-09-28", [5, 7, 6, 4], RR([[], [], [], []]), mit(JA, "pause"));
/* 7. Tipp Bewegung, aber jeden Tag bewegt: keine Tage ohne */
F.immerBewegt = woche("2026-09-28", [6, 7, 6, 5, 7], RR([["bewegt"], ["bewegt"], ["bewegt"], ["bewegt"], ["bewegt"]]),
  mit(JA, "bewegt"));
/* 8. Alte Eintraege (vor 28.09., ohne „gezeigt“), danach Alkohol ausgeschaltet */
F.altOhneAlkohol = woche("2026-09-25", [5, 6, 5, 7, 6],
  RR([["schlaf"], ["schlaf", "bewegt"], [], ["bewegt"], ["schlaf"]]),
  mit({ koffein: true, alkohol: false, suesses: true }, "weissNicht"), false);
/* 9. Alle Zahlen gleich */
F.gleich = woche("2026-09-28", [6, 6, 6, 6, 6, 6, 6], RR([[], [], [], [], [], [], []]), mit(JA, "schlaf"));

var auswertung = {};
Object.keys(F).forEach(function (k) { auswertung[k] = K.auswerten(F[k]); });

/* Tageswechsel 4:00 */
var uhr = {};
[[2026, 8, 29, 0, 30], [2026, 8, 29, 1, 0], [2026, 8, 29, 3, 59], [2026, 8, 29, 4, 0], [2026, 8, 29, 23, 59],
 [2026, 9, 1, 1, 0]].forEach(function (z) {
  var d = new Date(z[0], z[1], z[2], z[3], z[4]);
  uhr[("0" + z[2]).slice(-2) + "." + (z[1] + 1) + ". " + ("0" + z[3]).slice(-2) + ":" + ("0" + z[4]).slice(-2)] = K.tagVon(d);
});

/* Mitnehmen-Link hin und zurueck */
var link = {};
Object.keys(F).forEach(function (k) {
  var code = K.kodiere(F[k]);
  var zurueck = K.dekodiere(code);
  link[k] = { laenge: code.length, gleich: JSON.stringify(sortiert(zurueck)) === JSON.stringify(sortiert(F[k])),
              zweimal: code === K.kodiere(zurueck) };
});
function sortiert(d) {
  var e = {};
  Object.keys(d.eintraege).sort().forEach(function (t) { e[t] = d.eintraege[t]; });
  return { eintraege: e, einstellung: d.einstellung || null };
}
var kaputt = K.kodiere(F.nichttrinker);
link.abgeschnitten = K.dekodiere(kaputt.slice(0, kaputt.length - 7)) === null;
link.muell = K.dekodiere("das-ist-kein-link") === null;
link.boese = K.dekodiere(Buffer.from(JSON.stringify({ v: 1, e: { "20260928": [11, "s"] } })).toString("base64")) === null;
var lokal = woche("2026-09-26", [4, 5], [[], [R("schlaf")]], mit(JA, "schlaf"));
var zus = K.zusammen(lokal, F.fuenf);
link.zusammen = { tage: Object.keys(zus.eintraege).length, tipp: zus.einstellung.tipp };
link.anker = K.ANKER;

/* In-App-Browser */
var UA = {
  instagram: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0",
  facebook: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/480.0.0.0]",
  facebookAndroid: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/480.0.0.0;]",
  tiktok: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_36.5.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/de",
  tiktokAndroid: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36 trill_360505 BytedanceWebview/d8a21c6",
  googleApp: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/340.0.0 Mobile/15E148 Safari/604.1",
  safari: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  chrome: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
  chromeIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0 Mobile/15E148 Safari/604.1"
};
var inApp = {};
Object.keys(UA).forEach(function (k) { inApp[k] = K.istInApp(UA[k]); });

/* Tagesvideo */
var video = {
  "?tag=3": K.videoTag("?tag=3", 1, false),
  "?tag=7&x=1": K.videoTag("?tag=7&x=1", 0, false),
  "?tag=9, 2 Eintraege": K.videoTag("?tag=9", 2, false),
  "ohne, 0 Eintraege": K.videoTag("", 0, false),
  "ohne, 2 Eintraege, heute offen": K.videoTag("", 2, false),
  "ohne, 3 Eintraege, heute schon": K.videoTag("", 3, true),
  "ohne, 7 Eintraege": K.videoTag("", 7, true)
};

/* Zufallswochen: kein verbotenes Wort, kein abgeschalteter Hebel in einem Satz */
var VERBOTEN = /\bwirkt\b|\bbewirk|\bwirken\b|\bhilft\b|\bmacht\b|sorgt für|deutlichste|stärkste|am meisten|Sieger|gewinnt/i;
var zufall = { wochen: 0, verboten: [], abgeschaltet: [] };
var seed = 42;
function r() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
for (var i = 0; i < 3000; i++) {
  var einst = { koffein: r() < 0.7, alkohol: r() < 0.6, suesses: r() < 0.7 };
  var aktiv = K.aktiveHebel(einst).map(function (h) { return h.k; });
  var tipps = aktiv.concat(["weissNicht"]);
  einst.tipp = tipps[Math.floor(r() * tipps.length)];
  var n = 5 + Math.floor(r() * 3);
  var werte = [], haken = [];
  for (var j = 0; j < 7; j++) {
    werte.push(j < n || r() < 0.2 ? 1 + Math.floor(r() * 10) : null);
    haken.push(aktiv.filter(function () { return r() < 0.5; }));
  }
  var d = woche("2026-09-28", werte, haken, einst);
  var w = K.auswerten(d);
  zufall.wochen++;
  var alle = [w.schnitt, w.schwankung, w.schwankungErklaerung, w.grenzeSatz]
    .concat(typeof w.bester === "string" ? [w.bester] : w.bester ? [w.bester.kopf, w.bester.haken, w.schwaechster.kopf, w.schwaechster.haken] : [])
    .concat((w.geschafft || []).map(function (g) { return g.text + ": " + g.name; }))
    .concat(w.tipp || []).filter(Boolean);
  alle.forEach(function (s) {
    if (VERBOTEN.test(s) && zufall.verboten.length < 5) { zufall.verboten.push(s); }
    if ((!einst.alkohol && /Alkohol/.test(s)) || (!einst.koffein && /Koffein/.test(s)) ||
        (!einst.suesses && /Süß/.test(s))) {
      if (zufall.abgeschaltet.length < 5) { zufall.abgeschaltet.push(s); }
    }
  });
}

/* ---------------------------------------------------------------------------
   Fassung 3 (Liam 28.09., 22:15) — fuer /kurve/ (seit dem Umzug 29.09.). Jede Pruefung wird
   rot (exit 1), wenn die Entscheidung nicht umgesetzt ist. */
function js_texte(code) {
  var aus = [], re = /"((?:[^"\\\n]|\\.)*)"/g, m;
  code = code.replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
  while ((m = re.exec(code))) { if (m[1].length >= 12) { aus.push(m[1]); } }
  return aus;
}
var rot = [], gruen = [];
function soll(ok, was) { (ok ? gruen : rot).push(was); }
if (F3) {
  var html = fs.readFileSync(path.join(__dirname, "..", ORDNER, "index.html"), "utf8");
  var js = fs.readFileSync(path.join(__dirname, "..", ORDNER, "kurve.js"), "utf8");
  var sicht = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  var jsText = js.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
  var label = function (k) {
    var m = new RegExp('name="hebel" value="' + k + '">([\\s\\S]*?)</label>').exec(html);
    return m ? m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
  };
  var H = {}; K.HEBEL.forEach(function (h) { H[h.schalter || h.k] = h; });

  /* 4. Haekchen fragen, was man getan hat */
  soll(H.koffein.name === "Nach dem Mittagessen noch Koffein getrunken", "4 Koffein-Häkchen fragt, ob getrunken");
  soll(H.alkohol.name === "Alkohol getrunken", "4 Alkohol-Häkchen fragt, ob getrunken");
  soll(/^Am Nachmittag etwas Süßes/.test(H.suesses.name), "4 Süßes-Häkchen fragt, ob gegessen");
  soll(!/\bkein(?:en|e)?\b|\bnichts\b/i.test(K.HEBEL.map(function (h) { return h.name; }).join(" | ")),
       "4 kein Häkchen ist verneint");
  K.HEBEL.forEach(function (h) {
    soll(label(h.k).indexOf(h.name) === 0, "Name im Formular = Name in kurve.js: " + h.k);
  });
  soll(/Energydrink/.test(label(H.koffein.k)), "4 Energydrink steht beim Koffein (geht mit „Süßes aus“ nicht verloren)");
  /* Tage MIT Haekchen = Tage mit der Sache */
  var tk = woche("2026-10-05", [8, 4, 8, 4, 8, 4, 8],
    [[R("koffein")], [], [R("koffein")], [], [R("koffein")], [], []], mit(JA, "koffein"));
  var pk = K.paare(tk.eintraege, H.koffein);
  soll(JSON.stringify(pk.mit) === "[4,4,4]" && JSON.stringify(pk.ohne) === "[8,8,8]",
       "4 Koffein: Folgetag nach Häkchen zählt als „mit Koffein“");
  var wk = K.auswerten(tk);
  soll(wk.tipp && /Tagen nach einem Nachmittag mit Koffein lag deine Zahl im Schnitt bei 4,0/.test(wk.tipp.join(" ")),
       "4 Tipp-Block: Tage mit Koffein = Tage mit Häkchen");
  soll(wk.tipp && wk.tipp.some(function (t) { return /^Verglichen werden die Tage mit dem Häkchen „/.test(t); }),
       "4 Tipp-Block nennt das Häkchen wörtlich");
  var sl = K.auswerten(woche("2026-10-05", [5, 6, 5, 6, 5], [[], [], [], [], []], mit(JA, "schlaf")));
  soll(sl.tipp && sl.tipp.join(" ").indexOf("Ein Vergleich geht erst, wenn es beides gibt.") >= 0,
       "Tipp Schlaf, nie 7 Stunden: Satz „Ein Vergleich geht erst …“");
  soll(!/So oft geschafft/.test(sicht + jsText) && /So oft angehakt/.test(sicht), "„So oft angehakt“ statt „geschafft“");

  /* Umstellung alter Daten: nie falsch herum */
  var alt = K.migriere({ eintraege: {
    "2026-09-28": { energie: 6, hebel: ["schlaf7", "keinSuesses"],
                    gezeigt: ["schlaf7", "koffeinHeute", "alkoholHeute", "bewegt", "pause", "keinSuesses"] },
    "2026-09-27": { energie: 5, hebel: ["alkoholHeute"] } },
    einstellung: { koffein: true, alkohol: true, suesses: true, tipp: "keinSuesses" } });
  var a1 = alt.eintraege["2026-09-28"], a2 = alt.eintraege["2026-09-27"];
  soll(alt.v === K.FORMAT, "Umstellung setzt das Format");
  soll(a1.hebel.indexOf("koffeinSpaet") >= 0 && a1.hebel.indexOf("alkoholGetrunken") >= 0 &&
       a1.hebel.indexOf("suessesNachmittag") < 0 && a1.hebel.indexOf("schlaf7") >= 0,
       "Umstellung: altes leeres „kein Koffein“ = Koffein getrunken, altes „nichts Süßes“ = kein Süßes");
  soll(a2.gezeigt.indexOf("koffeinSpaet") < 0 && a2.gezeigt.indexOf("alkoholGetrunken") >= 0 &&
       a2.hebel.indexOf("alkoholGetrunken") < 0,
       "Umstellung ohne „gezeigt“: leer heißt nicht „getrunken“, nur Gesetztes zählt");
  soll(alt.einstellung.tipp === "suessesNachmittag", "Umstellung: alter Tipp wird mitgenommen");
  soll(K.migriere(alt) === alt, "Umstellung läuft nur einmal");
  var v1 = Buffer.from(JSON.stringify({ v: 1, e: { "20260928": [6, "sz", "skabpz"] }, s: [1, 1, 1, "keinSuesses"] }))
    .toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  var d1 = K.dekodiere(v1);
  soll(d1 && d1.v === K.FORMAT && d1.eintraege["2026-09-28"].hebel.sort().join() === "alkoholGetrunken,koffeinSpaet,schlaf7",
       "Alter Mitnehmen-Link (v1) wird richtig herum übernommen");

  /* 3. Sieben Eintraege, keine Kalendertage */
  var luecke = K.auswerten(woche("2026-10-05", [6, 5, null, 7, 4, 6, 5, 7], [[], [], [], [], [], [], [], []], mit(JA, "bewegt")));
  soll(luecke.n === 7 && luecke.fertig && luecke.titel === "Dein Ergebnis", "3 Ein Tag verpasst: Ergebnis mit dem 7. Eintrag, an Tag 8");
  var sechs = K.auswerten(woche("2026-10-05", [6, 5, null, null, 7, 4, 6, 5], [[], [], [], [], [], [], [], []], mit(JA, "bewegt")));
  soll(sechs.n === 6 && !sechs.fertig && sechs.titel === "Deine Woche bisher", "3 Sechs Einträge über 8 Tage: noch kein Ergebnis");
  soll(/sobald sieben Einträge da sind/.test(sicht), "3 Seite sagt: fertig, sobald sieben Einträge da sind");
  soll(!/"Tag " \+ \(i \+ 1\)/.test(js), "3 Kurve zählt keine Kalendertage als „Tag 8“");

  /* 2. Eintraege bleiben im Browser: kein Safari/Chrome/Lesezeichen-Rat */
  soll(!/Safari oder Chrome|in Safari|in Chrome|Lesezeichen/i.test(sicht.replace(/Safari löscht[^.]*\./g, "")),
       "2 kein Safari/Chrome/Lesezeichen-Rat auf der Seite");
  soll(/über den Knopf in der Mail, (?:immer )?auf demselben Handy/.test(sicht), "2 Rat: über den Knopf in der Mail, auf demselben Handy");
  soll(/Mail-App/.test((/id="inApp"[\s\S]*?<\/div>/.exec(html) || [""])[0]), "2 In-App-Hinweis nennt Mail-Apps");
  /* 30.09.2026 (Liam: „warum können wir es nicht auch über computer möglich machen?“): weicher Hinweis statt Sperre. */
  var pcSatz = (/id="amPC"[^>]*>([\s\S]*?)<\/p>/.exec(html) || ["", ""])[1];
  soll(/am Computer/i.test(pcSatz) && /eintragen/.test(pcSatz) && /ganze Woche/.test(pcSatz) && !/nicht ein/.test(pcSatz),
       "2 Computer: weicher Hinweis (eintragen erlaubt, ganze Woche dasselbe Gerät), keine Sperre");
  soll(K.istAmPC("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36") &&
       !K.istAmPC(UA.safari) && !K.istAmPC(UA.chrome) && !K.istAmPC(UA.instagram), "2 Computer erkannt, Handys nicht");
  soll(/>\s*Einträge mitnehmen\s*</.test(html), "2 „Einträge mitnehmen“ bleibt als Notlösung");

  /* 5. Ausnahme-Kasten */
  ["ausnahme3", "ausnahme5"].forEach(function (id) {
    var m = new RegExp('<aside class="ausnahme weg" id="' + id + '"[\\s\\S]*?</aside>').exec(html);
    soll(m && /<p class="ausnahme-titel">[^<]{10,}<\/p>/.test(m[0]), "5 grauer Ausnahme-Kasten " + id);
  });
  /* Liam 30.09.: „Ausnahme: nur für dich, wenn …“ versteht man nicht. Der Titel
     fragt, wen es betrifft, und sagt, was dann nicht gilt. */
  (function () {
    var m = /<aside class="ausnahme weg" id="ausnahme3"[\s\S]*?<p class="ausnahme-titel">([^<]*)<\/p>/.exec(html);
    soll(m && /^Liegst du nachts oft lange wach\?/.test(m[1]) && /nicht für dich/.test(m[1]) && !/^Ausnahme:/.test(m[1]),
         "5 Ausnahme 3: Titel sagt, wen es betrifft und was nicht gilt (Liam 30.09.)");
    var m5 = /<aside class="ausnahme weg" id="ausnahme5"[\s\S]*?<p class="ausnahme-titel">([^<]*)<\/p>/.exec(html);
    soll(m5 && /^Erschöpft dich schon leichte Anstrengung tagelang\?/.test(m5[1]) && /ärztlich abklären/.test(m5[1]) && !/^Ausnahme:/.test(m5[1]),
         "5 Ausnahme 5: Titel sagt, wen es betrifft und was zu tun ist (Liam 30.09.)");
  })();
  soll(/zeig\(\$\("ausnahme3"\), tag === 3\)/.test(js) && /zeig\(\$\("ausnahme5"\), tag === 5\)/.test(js),
       "5 Kasten erscheint zum Tagesvideo 3 bzw. 5");

  /* kleine Befunde */
  /* Abnahme 28.09. abends, E4: Zaehlregeln */
  soll(label("pause").indexOf("Am Nachmittag mindestens 5 Minuten unterbrochen, was du gerade tust (Arbeit, Lernen, Haushalt)") === 0 &&
       /Mittagspause nicht/.test(label("pause")), "E4 Pause: „mindestens 5 Minuten“, nur am Nachmittag, Mittagspause nicht");
  soll(!/5–10 Minuten/.test(sicht + jsText), "E4 kein „5–10 Minuten“ mehr");
  soll(/Ein Mittagsschlaf zählt nicht dazu\./.test(label("schlaf7")), "E4 Schlaf: „Ein Mittagsschlaf zählt nicht dazu.“");
  soll(/schwarzer oder grüner Tee/.test(label(H.koffein.k)) && /schwarzer oder grüner Tee/.test((/id="schalter-koffein"/.test(html) ? sicht : "")),
       "Fach: Koffein nennt schwarzen oder grünen Tee (Kräutertee zählt nicht)");
  soll(!/Das ist normal/.test(sicht), "Fach: Linie ohne „Das ist normal“");
  soll(!/was aus deinem Tipp geworden ist/.test(sicht), "Fach: kein „was aus deinem Tipp geworden ist“");
  soll(/Handy oder Tablet/.test(sicht), "Recht/Verständlichkeit: „Handy oder Tablet“");
  soll(/Unterschiede in dieser Größe entstehen in einer Woche schon durch Zufall/.test(jsText) &&
       /Auch das kommt in einer Woche oft durch Zufall zustande/.test(jsText), "Fach: Schwankungs-Sätze nennen den Zufall");
  /* MUSS 3: Schluessel nach Pfad — der Umzug ist reines Kopieren */
  soll(K.schluesselFuer("/kurve-test/") === "ruhepuls.kurve.test" && K.schluesselFuer("/kurve-test/index.html") === "ruhepuls.kurve.test",
       "MUSS 3 unter /kurve-test/ der Testschlüssel");
  soll(K.schluesselFuer("/kurve/") === "ruhepuls.kurve.v1" && K.schluesselFuer("/kurve/index.html") === "ruhepuls.kurve.v1" &&
       K.schluesselFuer("") === "ruhepuls.kurve.v1", "MUSS 3 unter /kurve/ der bisherige Schlüssel ruhepuls.kurve.v1");
  soll(/SCHLUESSEL = schluesselFuer\(/.test(jsText) && !/localStorage\.\w+\("ruhepuls/.test(jsText), "MUSS 3 Speicher nur über SCHLUESSEL");
  /* MUSS 4: eigene Videonamen, das alte Tag-1-Video erscheint nie */
  soll(/"\.\.\/videos\/f3-tag" \+ tag/.test(jsText) && !/onboarding-tag/.test(jsText), "MUSS 4 Tagesvideos unter ../videos/f3-tagN");
  soll(!/Jetzt kommt dein erster Eintrag/.test(sicht) && /heute Abend ein/.test((/id="eingerichtet"[^>]*>([^<]*)/.exec(html) || ["", ""])[1]),
       "„Eingerichtet“ verleitet nicht zum Eintragen am Mittag");
  soll(/für deine Energie den größten Unterschied/.test(sicht), "Tipp-Frage nennt „für deine Energie“");
  var alleSaetze = [];
  Object.keys(auswertung).forEach(function (k) { var w = auswertung[k]; if (w.schwankung) { alleSaetze.push(w.schwankung); } });
  soll(!/±/.test(alleSaetze.join(" ") + sicht), "„±“ nirgends, Schwankung in Worten");
  soll(/Gemeint ist dein Tag im Schnitt/.test(sicht), "„insgesamt“ = Tagesschnitt erklärt");
  soll(/nicht die Zeit im Bett/.test(label("schlaf7")) && /Nachtdienst/.test(label("schlaf7")), "Schlaf: geschlafen, nicht im Bett; Nachtdienst");
  soll(/Weg zur Arbeit/.test(label("bewegt")) && /zusammenzählen/.test(label("bewegt")), "Bewegung: Arbeitsweg und Stücke zusammenzählen");
  soll(zufall.verboten.length === 0 && zufall.abgeschaltet.length === 0, "Zufallswochen: kein Sieger-/Wirkwort, kein abgeschaltetes Häkchen");
  /* B5 (29.09.2026): SOLLTE/KANN der Abteilung Technik aus der Abnahme 7 Tage */
  var sieben = woche("2026-10-05", [6, 5, 7, 4, 6, 7, 5], [[], [], [], [], [], [], []], mit(JA, "bewegt"));
  var eins = woche("2026-10-12", [4], [[]], mit(JA, "bewegt"));
  var weg = K.wegfallend(eins, sieben);
  soll(weg.length === 1 && weg[0] === "2026-10-12" && Object.keys(K.zusammen(eins, sieben).eintraege).length === 7,
       "Zusammenlegen > 7: der wegfallende Tag wird genannt (hier 12.10.)");
  soll(K.wegfallend(woche("2026-10-05", [4, 5], [[], []], mit(JA, "bewegt")), eins).length === 0, "Zusammenlegen ≤ 7: nichts fällt weg");
  soll(/var weg = wegfallend\(daten, d\);[\s\S]{0,200}fällt weg: |fallen weg: /.test(js), "Übernehmen-Frage nennt wegfallende Tage vor „Ja, übernehmen“");
  var rund = K.auswerten(woche("2026-10-05", [7, 5, 7, 5, 7, 5, 6], [[R("bewegt")], [], [R("bewegt")], [], [R("bewegt")], [], []], mit(JA, "bewegt")));
  var rs = (rund.tipp || []).join(" ");
  soll(/bei 7,0/.test(rs) && /bei 5,3/.test(rs) && /Der Unterschied beträgt 1,7 Punkte\./.test(rs),
       "Rundung: 7,0 und 5,3 ergeben gezeigt 1,7 (" + (rs.match(/Unterschied beträgt [\d,]+/) || ["?"])[0] + ")");
  soll(/"uebernehmenJa"\)\.addEventListener\("click", function \(\) \{\s*if \(!linkDaten\) \{ return; \}/.test(js), "Doppeltipp auf „Ja, übernehmen“ ohne Fehler");
  soll(/if \(!ok && !letzterKonflikt\) \{ if \(vorher\)/.test(js), "Speicherfehler: Eintrag zählt nicht mit (bei Konflikt steht der neuere Stand)");
  soll(/tage\[0\] < gestern\(\)/.test(js), "„Für gestern“ erst ab dem zweiten Tag");
  var css = fs.readFileSync(path.join(__dirname, "..", ORDNER, "kurve.css"), "utf8");
  soll(/fieldset label\{min-height:44px\}/.test(css) && /button\.link\{min-height:44px/.test(css), "Tippziele ≥ 44 px (Tipp-Antworten, Link-Knöpfe)");
  /* N2 (Zweitabnahme 29.09., Technik SOLLTE): zwei Tabs, dieselbe Revisionsloesung wie 30-tage (N1) */
  (function () {
    var S = K.SCHLUESSEL;
    function Speicher() { var d = {}; return { getItem: function (k) { return k in d ? d[k] : null; }, setItem: function (k, v) { d[k] = String(v); }, removeItem: function (k) { delete d[k]; } }; }
    function tab(sp) { var roh = sp.getItem(S); return { d: K.ausSpeicher(roh), rev: K.revVon(roh) }; }
    function schreib(t, sp) { var e = K.schreibeSicher(sp, S, t.d, t.rev, false); if (e.konflikt) { t.d = e.neu; } t.rev = e.rev; return e; }
    var sp = Speicher();
    K.schreibeSicher(sp, S, woche("2026-10-05", [6], [[]], mit(JA, "bewegt")), 0, false);
    var A = tab(sp), B = tab(sp);                                       /* zwei Tabs aus zwei Mail-Knöpfen */
    B.d.eintraege["2026-10-06"] = { energie: 9, hebel: [], gezeigt: ALLE };
    var eB = schreib(B, sp);
    A.d.eintraege["2026-10-07"] = { energie: 3, hebel: [], gezeigt: ALLE };  /* alter Tab A trägt mit altem Stand ein */
    var eA = schreib(A, sp), drin = JSON.parse(sp.getItem(S)).eintraege;
    soll(eB.ok && eA.konflikt === true && eA.ok === false, "Zwei Tabs: alter Tab bekommt einen Konflikt statt zu überschreiben");
    soll(drin["2026-10-06"] && drin["2026-10-06"].energie === 9 && !drin["2026-10-07"], "Zwei Tabs: im Speicher bleibt der Eintrag des anderen Tabs (9)");
    A.d.eintraege["2026-10-07"] = { energie: 3, hebel: [], gezeigt: ALLE };
    soll(!!A.d.eintraege["2026-10-06"] && A.d.eintraege["2026-10-06"].energie === 9 && schreib(A, sp).ok && Object.keys(JSON.parse(sp.getItem(S)).eintraege).length === 3,
         "Zwei Tabs: danach hat Tab A den neueren Stand und speichert beide Einträge");
    var C = tab(sp); sp.removeItem(S);                                  /* anderer Tab: „Alle Einträge löschen“ */
    C.d.eintraege["2026-10-08"] = { energie: 5, hebel: [], gezeigt: ALLE };
    var eC = schreib(C, sp);
    soll(eC.konflikt && sp.getItem(S) === null && Object.keys(C.d.eintraege).length === 0, "Zwei Tabs: Löschen wird von einem alten Tab nicht rückgängig gemacht");
    var alt = Speicher(); alt.setItem(S, JSON.stringify({ eintraege: {} }));   /* Stand ohne Revision (vor N2) */
    soll(K.revVon(alt.getItem(S)) === 0 && K.revVon("{kaputt") === 0 && K.schreibeSicher(alt, S, { v: 2, eintraege: {} }, 0, false).ok, "Revision: alter Stand ohne rev zählt als 0");
    soll((js.match(/setItem\(/g) || []).length === 1 && /schreibeSicher\(window\.localStorage, SCHLUESSEL, daten, geladenRev/.test(js),
         "kurve.js schreibt nur über schreibeSicher");
    soll(/addEventListener\("storage"/.test(js) && /addEventListener\("pageshow"/.test(js) && /visibilitychange/.test(js) &&
         /function male\(meldung\) \{\s*synchron\(\);/.test(js), "Abgleich bei storage/pageshow/visibilitychange und vor jedem Zeichnen");
    soll(/id="andererTab"[^>]*>In einem anderen Tab hat sich inzwischen etwas geändert\. Hier steht jetzt der neuere Stand\./.test(html) &&
         /zeig\(\$\("andererTab"\), konflikt\)/.test(js), "Hinweis #andererTab erscheint nach einem Konflikt");
  })();

  /* Release 7 Tage (29.09.2026): /kurve/ ohne Produkt — kein Übergang, kein Link auf 30-tage/ */
  soll(!/uebergang30|30-tage\/|DREISSIG_TAGE/.test(html + js), "Release: kein Übergang und kein Link zu den 30 Tagen");

  /* 29.09. (Liam): „Tipp“ heißt „Vermutung“ — gemeint ist die eigene Wahl aus der Einrichtung.
     „tipp auf …“ (antippen) bleibt. Interne Namen (tipp, tippBlock) bleiben, sonst lesen alte
     Einträge und Links ihre Wahl nicht mehr. */
  var alsHauptwort = /\b(?:dein|deine|deinen|deinem|deiner|der|den|dem|ein|einen|kein)\s+Tipps?\b|\bTipp von Tag|\bTipp-(?:Frage|Block)/;
  var jsSicht = js_texte(jsText).join(" | ");
  soll(!alsHauptwort.test(sicht) && !alsHauptwort.test(jsSicht),
       "Vermutung: sichtbar nirgends „Tipp“ als Hauptwort (" + ((sicht.match(alsHauptwort) || jsSicht.match(alsHauptwort) || ["—"])[0]) + ")");
  soll(sicht.indexOf("Am siebten Tag siehst du mit deinen eigenen Zahlen, ob deine Vermutung stimmt: deine Energie an den Tagen mit und an den Tagen ohne.") >= 0 &&
       sicht.indexOf("Wähl bei deiner Vermutung eine Antwort. „Weiß ich nicht“ geht auch.") >= 0,
       "Vermutung: Einrichtung sagt „deine Vermutung“ (wortgleich Fassung 3)");
  var wv = K.auswerten(woche("2026-10-05", [6, 7, 4, 7, 5, 8, 5],
    RR([[], ["bewegt"], [], ["bewegt"], [], ["bewegt"], []]), mit(JA, "bewegt")));
  soll(wv.tipp && wv.tipp[0] === "Deine Vermutung von Tag 1: Bewegung.",
       "Vermutung: Block beginnt mit „Deine Vermutung von Tag 1: Bewegung.“ (" + (wv.tipp ? wv.tipp[0] : "kein Block") + ")");

  /* Umzug: Einträge der laufenden Abonnenten. So speichert der alte Live-Stand 8645b42
     (ohne v, ohne gezeigt, ohne Einstellung, verneinte Häkchen; koffeinMittag/keinAlkohol
     aus der Zeit vor dem 25.09.). Sie müssen unter ruhepuls.kurve.v1 lesbar bleiben und
     beim nächsten Speichern erhalten bleiben. */
  (function () {
    var S = K.schluesselFuer("/kurve/");
    var roh = JSON.stringify({ eintraege: {
      "2026-09-25": { energie: 4, hebel: ["koffeinMittag", "keinAlkohol", "schlaf7"] },
      "2026-09-26": { energie: 6, hebel: ["schlaf7", "koffeinHeute", "bewegt"] },
      "2026-09-27": { energie: 7, hebel: [] } } });
    var d = {}; var sp = { getItem: function (k) { return k in d ? d[k] : null; }, setItem: function (k, v) { d[k] = String(v); }, removeItem: function (k) { delete d[k]; } };
    sp.setItem("ruhepuls.kurve.v1", roh);
    var geladen = K.ausSpeicher(sp.getItem(S));
    soll(S === "ruhepuls.kurve.v1" && geladen && Object.keys(geladen.eintraege).length === 3 &&
         geladen.eintraege["2026-09-25"].energie === 4 && geladen.eintraege["2026-09-27"].energie === 7,
         "Umzug: alter Live-Eintrag (8645b42) unter ruhepuls.kurve.v1 lesbar, 3 Tage, Zahlen gleich");
    var e26 = geladen.eintraege["2026-09-26"];
    soll(e26.hebel.indexOf("schlaf7") >= 0 && e26.hebel.indexOf("bewegt") >= 0 && e26.hebel.indexOf("koffeinSpaet") < 0 &&
         e26.gezeigt.indexOf("koffeinSpaet") >= 0 && e26.gezeigt.indexOf("alkoholGetrunken") < 0,
         "Umzug: altes „kein Koffein“ gesetzt = kein Koffein; leeres „keinen Alkohol“ zählt nicht (nie falsch herum)");
    soll(K.auswerten(geladen).n === 3, "Umzug: alte Einträge zählen mit (3 von 7)");
    geladen.einstellung = { koffein: true, alkohol: true, suesses: true, tipp: "bewegt" };
    geladen.eintraege["2026-09-28"] = { energie: 5, hebel: [], gezeigt: ALLE };
    var e = K.schreibeSicher(sp, S, geladen, K.revVon(roh), false);
    var danach = JSON.parse(sp.getItem("ruhepuls.kurve.v1"));
    soll(e.ok && Object.keys(danach.eintraege).length === 4 && danach.eintraege["2026-09-25"].energie === 4 &&
         danach.v === K.FORMAT && danach.einstellung.tipp === "bewegt",
         "Umzug: nach Einrichtung + neuem Eintrag bleiben die alten Tage erhalten (Format 2)");
  })();
}

var ergebnis = { auswertung: auswertung, uhr: uhr, link: link, inApp: inApp, video: video, zufall: zufall };
if (F3) { ergebnis.fassung3 = { gruen: gruen, rot: rot }; }

if (process.argv.indexOf("--json") >= 0) {
  process.stdout.write(JSON.stringify(ergebnis));
} else {
  Object.keys(auswertung).forEach(function (k) {
    var w = auswertung[k];
    console.log("\n=== " + k + " (" + w.n + " Einträge) ===");
    if (!w.zeigen) { console.log("  (noch keine Woche: „Ab dem fünften Eintrag …“)"); return; }
    console.log("  [" + w.titel + "]");
    console.log("  " + w.schnitt);
    console.log("  " + w.schwankung + " " + w.schwankungErklaerung);
    if (typeof w.bester === "string") { console.log("  " + w.bester); }
    else { [w.bester, w.schwaechster].forEach(function (b) { console.log("  " + b.kopf + " " + b.haken); }); }
    console.log(!F3 ? "  So oft geschafft:" : "  So oft angehakt:");
    w.geschafft.forEach(function (g) { console.log("    - " + g.text + ": " + g.name); });
    if (w.tipp) { console.log("  " + w.tipp.join("\n  ")); } else { console.log("  (kein Tipp-Block)"); }
    console.log("  " + w.grenzeSatz);
  });
  console.log("\nTageswechsel:", uhr);
  console.log("Mitnehmen-Link:", JSON.stringify(link));
  console.log("In-App:", inApp);
  console.log("Tagesvideo:", video);
  console.log("Zufallswochen:", zufall.wochen, "verboten:", zufall.verboten.length, "abgeschaltet:", zufall.abgeschaltet.length);
}

if (F3 && process.argv.indexOf("--json") < 0) {
  console.log("\nFassung 3: " + gruen.length + " grün, " + rot.length + " rot");
  rot.forEach(function (r) { console.log("  ROT: " + r); });
  console.log(rot.length ? "ROT" : "GRÜN");
}
if (rot.length) { process.exitCode = 1; }
