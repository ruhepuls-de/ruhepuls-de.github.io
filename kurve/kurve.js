/* Deine Energiekurve – 7 Tage.  Stand 24.09.2026.
   Texte: Produkt & Text, Abschnitt 2. Speicher: Abschnitt 5.2.

   Alles laeuft im Browser. KEIN Netzaufruf (kein fetch, kein
   XMLHttpRequest, kein sendBeacon), kein fremdes Skript, keine Verbindung
   zum Check. Gespeichert wird nur unter dem Schluessel ruhepuls.kurve.v1
   im localStorage dieses Browsers — und gelesen wird er beim naechsten
   Aufruf, sonst waere das Speichern ohne Zweck (§ 25 Abs. 2 Nr. 2 TDDDG).
   Jeder Zugriff steht in try/catch. Geprueft: scripts/pruefe-check.py,
   Zweig k.
*/
(function () {
  "use strict";

  var SCHLUESSEL = "ruhepuls.kurve.v1";
  var HOECHSTENS = 7;          // nach sieben Eintraegen keine weiteren (2.2)
  var VERGLEICH_AB = 5;        // Auswertung ab 5 Eintraegen (2.3)
  var MIND_TAGE = 2;           // je Hebel >= 2 Tage mit und >= 2 ohne
  var SCHWELLE = 1.0;          // gesetzt, nicht belegt (2.3)

  /* Kurznamen fuer die Auswertung (2.3), Reihenfolge = Formular.
     25.09.2026 (Liam): Alle Haekchen fragen nach HEUTE — „gestern Abend“ hat
     im Leser-Test verwirrt. Koffein und Alkohol wirken aber auf die Nacht
     danach; diese beiden (VERSETZT) vergleicht die Auswertung deshalb mit der
     Zahl vom Folgetag. ALT: die Schluessel bis 25.09. fragten nach dem
     Vorabend, stehen also schon am richtigen Tag. */
  var HEBEL = [
    /* Namen woertlich wie im Formular (Leser-Test 25.09.: abweichende Kurznamen verwirrten) */
    ["schlaf7", "Letzte Nacht mindestens 7 Stunden geschlafen"],
    ["koffeinHeute", "Nach dem Mittagessen kein Koffein mehr"],
    ["alkoholHeute", "Keinen Alkohol getrunken, auch später am Abend nicht"],
    ["bewegt", "Mindestens eine halbe Stunde so bewegt, dass du etwas schneller geatmet hast"],
    ["pause", "Am Nachmittag eine kurze Pause gemacht, höchstens zehn Minuten"],
    ["keinSuesses", "Am Nachmittag nichts Süßes und keinen Energydrink"]
  ];
  var VERSETZT = { koffeinHeute: "koffeinMittag", alkoholHeute: "keinAlkohol" };
  var ALT_NAME = { koffeinMittag: "Nach dem Mittagessen kein Koffein mehr", keinAlkohol: "Keinen Alkohol getrunken" };
  var WOCHENTAG = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  var $ = function (id) { return document.getElementById(id); };
  var zeig = function (el, an) { el.classList[an ? "remove" : "add"]("weg"); };
  var leere = function (el) { while (el.firstChild) { el.removeChild(el.firstChild); } };

  var daten = { eintraege: {} };
  var speicherGeht = true;
  var modus = "heute";         // oder "gestern"
  var gewaehlt = 0;            // Zahl 1–10, 0 = noch keine

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
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }
  function heute() { return datumText(new Date()); }
  function gestern() { return datumText(plusTage(new Date(), -1)); }
  function tagSchild(d) { return WOCHENTAG[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + "."; }

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

  function daten7() {
    return Object.keys(daten.eintraege).sort();
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

  function fuelle(eintrag) {
    waehle(eintrag ? eintrag.energie : 0);
    var h = haken();
    for (var i = 0; i < h.length; i++) {
      h[i].checked = !!(eintrag && eintrag.hebel.indexOf(h[i].value) >= 0);
    }
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
    daten.eintraege[tag] = { energie: gewaehlt, hebel: gewaehlteHaken };
    var ok = schreibe();
    var warGestern = modus === "gestern";
    modus = "heute";
    if (ok && warGestern && !daten.eintraege[heute()] && daten7().length < HOECHSTENS) { male("gesternGespeichert"); return; }
    male(ok ? "gespeichert" : null);
  }

  /* ------------------------------------------------------------ Anzeige */
  function male(meldung) {
    var tage = daten7();
    var n = tage.length;
    var hatHeute = !!daten.eintraege[heute()];

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

    zeig($("ersterBesuch"), n === 0);
    zeig($("speicherFehler"), !speicherGeht);
    zeig($("gespeichert"), meldung === "gespeichert" && n < HOECHSTENS);
    zeig($("gespeichertLetzter"), meldung === "gespeichert" && n >= HOECHSTENS);
    zeig($("gesternGespeichert"), meldung === "gesternGespeichert");
    zeig($("voll"), n >= HOECHSTENS);

    var zeigeFormular = (!meldung || meldung === "gesternGespeichert") && (modus === "gestern" || !hatHeute) && (n < HOECHSTENS || modus === "aendern");
    if (modus === "aendern") { zeigeFormular = true; }
    zeig($("schonEingetragen"), !meldung && hatHeute && !zeigeFormular);
    zeig($("eintrag"), zeigeFormular);
    /* Leser-Test 25.09.: auch NACH dem heutigen Eintrag nachholbar (Mail 4 verspricht das). */
    zeig($("gesternZeile"), modus === "heute" && meldung !== "gesternGespeichert" && n < HOECHSTENS && !daten.eintraege[gestern()] && n > 0 && (zeigeFormular || hatHeute));
    if (zeigeFormular) { setzeModus(modus === "aendern" ? "heute" : modus); }
    zeig($("fehltZahl"), false);

    maleKurve(tage);
    maleVergleich(tage);
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
        e ? HEBEL.filter(function (h) { return e.hebel.indexOf(h[0]) >= 0; })
                 .map(function (h) { return h[1]; })
                 .concat(e.hebel.filter(function (k) { return ALT_NAME[k]; })
                 .map(function (k) { return ALT_NAME[k] + " (Vorabend)"; })).join(", ") : ""];
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

  function zahl(v) { return (Math.round(v * 10) / 10).toFixed(1).replace(".", ","); }

  function maleVergleich(tage) {
    zeig($("vergleich"), tage.length > 0);
    zeig($("vergleichBald"), tage.length > 0 && tage.length < VERGLEICH_AB);
    zeig($("vergleichBox"), tage.length >= VERGLEICH_AB);
    var liste = $("vergleichListe");
    leere(liste);
    if (tage.length < VERGLEICH_AB) { return; }

    var zeilen = HEBEL.map(function (h, ordnung) {
      var mit = [], ohne = [];
      var alt = VERSETZT[h[0]];
      tage.forEach(function (t) {
        var e = daten.eintraege[t];
        var gesetzt;
        if (!alt) {
          gesetzt = e.hebel.indexOf(h[0]) >= 0;
        } else if (e.hebel.indexOf(alt) >= 0) {
          gesetzt = true;                       /* alter Eintrag: fragte schon nach dem Vorabend */
        } else {
          var vortag = daten.eintraege[datumText(plusTage(ausText(t), -1))];
          if (!vortag) { return; }              /* ohne Vortag kein Vergleich fuer diesen Tag */
          gesetzt = vortag.hebel.indexOf(h[0]) >= 0;
        }
        (gesetzt ? mit : ohne).push(e.energie);
      });
      var schnitt = function (a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; };
      if (mit.length < MIND_TAGE || ohne.length < MIND_TAGE) {
        return { name: h[1], ordnung: ordnung, vergleich: false, versetzt: !!alt };
      }
      var a = schnitt(mit), b = schnitt(ohne);
      return { name: h[1], ordnung: ordnung, vergleich: true, versetzt: !!alt, a: a, b: b,
               n1: mit.length, n2: ohne.length, d: Math.round((a - b) * 1000) / 1000 };
    });
    zeilen.sort(function (p, q) {
      if (p.vergleich !== q.vergleich) { return p.vergleich ? -1 : 1; }
      if (p.vergleich && Math.abs(q.d) !== Math.abs(p.d)) { return Math.abs(q.d) - Math.abs(p.d); }
      return p.ordnung - q.ordnung;
    });
    zeilen.forEach(function (z) {
      var li = document.createElement("li");
      var b = document.createElement("b");
      b.textContent = z.name + ":";
      li.appendChild(b);
      var text;
      if (!z.vergleich) {
        text = z.versetzt
          ? " Noch kein Vergleich. Dafür brauchst du 2 Tage mit und 2 Tage ohne dieses Häkchen, jeweils mit einem Eintrag am Tag danach."
          : " Noch kein Vergleich. Dafür brauchst du mindestens 2 Tage mit und mindestens 2 Tage ohne dieses Häkchen.";
      } else {
        text = z.versetzt
          ? " An den " + z.n1 + " Tagen nach einem Tag mit Häkchen im Schnitt " + zahl(z.a) +
            ", an den " + z.n2 + " Tagen nach einem Tag ohne im Schnitt " + zahl(z.b) + ". "
          : " an " + z.n1 + " Tagen mit Häkchen im Schnitt " + zahl(z.a) +
            ", an " + z.n2 + " Tagen ohne im Schnitt " + zahl(z.b) + ". ";
        if (Math.abs(z.d) >= SCHWELLE) {
          text += z.versetzt
            ? "Nach Tagen mit Häkchen war deine Zahl am nächsten Tag " + (z.d > 0 ? "höher" : "niedriger") + " als nach Tagen ohne."
            : "An den Tagen mit Häkchen lag deine Zahl " + (z.d > 0 ? "höher." : "niedriger.");
        } else {
          text += "Der Unterschied ist kleiner als 1 Punkt, also kaum ein Unterschied.";
        }
      }
      li.appendChild(document.createTextNode(text));
      liste.appendChild(li);
    });
  }

  /* ---------------------------------------------------------- Verdrahtung */
  document.addEventListener("DOMContentLoaded", function () {
    lade();
    baueSkala();
    $("eintrag").addEventListener("submit", speichere);
    $("fuerGestern").addEventListener("click", function () {
      modus = "gestern";
      male();
    });
    $("aendern").addEventListener("click", function () {
      modus = "aendern";
      male();
    });
    $("loeschen").addEventListener("click", function () { zeig($("loeschenFrage"), true); });
    $("loeschenNein").addEventListener("click", function () { zeig($("loeschenFrage"), false); });
    $("loeschenJa").addEventListener("click", function () {
      loesche();
      zeig($("loeschenFrage"), false);
      modus = "heute";
      male();
    });
    male();
  });
})();
