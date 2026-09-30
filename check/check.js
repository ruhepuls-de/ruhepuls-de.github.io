/* Energie-Check — Anzeige und Ablauf.
   Alles laeuft im Browser. Kein Server, kein Tracking, keine Cookies.
   Es wird auch nichts auf dem Geraet gespeichert: kein localStorage, kein
   sessionStorage. Ein Neuladen faengt neu an. Geprueft: Zweig h) in
   scripts/pruefe-check.py.

   Fragen, Regeln, Auswertung und Teilen-Text stehen in regeln.js.
   Die Video-Links stehen in videolinks.js und werden von
   scripts/baue-videolinks.py aus der Pipeline erzeugt.
   Ablauf des Ergebnisses: Produkt & Text 1.4 [A]–[L].
   Texte aus Daten nur per textContent, nie per innerHTML.
*/
(function () {
  "use strict";

  var R = window.RUHEPULS_REGELN;
  var V = window.RUHEPULS_VIDEOS || { kanal: {}, videos: {} };
  var FRAGEN = R.FRAGEN;

  var antworten = {}, schritt = 0, letztesErgebnis = null;

  var $ = function (id) { return document.getElementById(id); };
  var zeig = function (el, an) { el.classList[an ? "remove" : "add"]("weg"); };
  var leere = function (el) { while (el.firstChild) { el.removeChild(el.firstChild); } };

  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) { e.className = klasse; }
    if (text != null) { e.textContent = text; }
    return e;
  }

  function starte() {
    antworten = {}; schritt = 0; letztesErgebnis = null;
    $("teilenStatus").textContent = "";
    zeig($("teilBild"), false);
    zeig($("start"), false); zeig($("ergebnis"), false); zeig($("fragen"), true);
    male();
    window.scrollTo(0, 0);
  }

  function male() {
    var f = FRAGEN[schritt];
    $("zaehler").textContent = "Frage " + (schritt + 1) + " von " + FRAGEN.length;
    $("balken").style.width = Math.round((schritt / FRAGEN.length) * 100) + "%";
    $("fragetext").textContent = f.text;
    $("fragezusatz").textContent = f.zusatz || "";
    zeig($("fragezusatz"), !!f.zusatz);

    var liste = $("fragezusatzListe");
    leere(liste);
    (f.zusatzListe || []).forEach(function (p) {
      liste.appendChild(el("li", null, p.text));
    });
    zeig(liste, !!(f.zusatzListe && f.zusatzListe.length));

    var box = $("antworten");
    leere(box);
    f.optionen.forEach(function (o, i) {
      var b = el("button", "antwort", o.text);
      b.type = "button";
      b.addEventListener("click", function () { antworten[f.id] = i; b.blur(); weiter(); });
      box.appendChild(b);
    });
    zeig($("zurueck"), schritt > 0);
  }

  function weiter() {
    schritt++;
    if (schritt >= FRAGEN.length) { zeigeErgebnis(R.werteAus(antworten)); }
    else { male(); window.scrollTo(0, 0); }
  }

  /* Das Video direkt auf der Seite — oder der Satz, dass keins da ist.
     25.09.2026 (Liam): Ein Link zu TikTok oeffnet am Handy die App, und der
     Besucher ist weg vom Check. Deshalb kein Link nach aussen, nur die eigene
     Datei aus videos/ (liegt auf demselben Server wie die Seite). */
  function videoZeile(regel) {
    var v = regel.video ? V.videos[regel.video] : null;
    if (!v || !v.datei) {
      return el("p", "videos kein", "Video dazu folgt.");
    }
    var box = el("div", "videos");
    box.appendChild(el("p", "videos-titel", "Video dazu:"));
    var film = document.createElement("video");
    film.src = v.datei;
    if (v.bild) { film.poster = v.bild; }
    film.controls = true;
    film.preload = "none";
    film.setAttribute("playsinline", "");
    film.className = "video-eigen";
    box.appendChild(film);
    return box;
  }

  /* Eine Karte: Titel, „Du hast gesagt“, Tipp, Quelle, Genaue Stelle, Video.
     titel === null: ohne Ueberschrift (fuer „Außerdem“, dort steht der
     Titel im <summary>). */
  function karte(t, titel, anker) {
    var r = t.regel;
    var d = el("div", "regel");
    if (anker) { d.id = anker; }
    if (titel !== null) { d.appendChild(el("h3", null, titel)); }

    d.appendChild(el("p", "bezug", t.halten
      ? "Bei deinen Antworten fiel hier nichts auf. Das ist eine Gewohnheit, die du beibehalten oder dir angewöhnen kannst."
      : "Du hast gesagt, " + t.bezug.charAt(0).toLowerCase() + t.bezug.slice(1) + "."));

    d.appendChild(el("p", "tipp", r.tipp));

    var q = el("p", "studie");
    q.appendChild(document.createTextNode("Quelle: "));
    var a = el("a", null, r.kurz + " ↗");
    a.href = r.link; a.target = "_blank"; a.rel = "noopener";
    q.appendChild(a);
    d.appendChild(q);

    var det = el("details", "stelle");
    det.appendChild(el("summary", null, "Genaue Quelle"));
    det.appendChild(el("p", null, r.quelle));
    d.appendChild(det);

    d.appendChild(videoZeile(r));
    return d;
  }

  /* Alle Bausteine, die check.js ein- oder ausblendet. Welche davon in
     welcher Reihenfolge stehen, sagt R.reihenfolge(e) — dort steht der
     Mail-Block in jedem Fall (U2). */
  var BAUSTEINE = ["profil", "hebelListe", "mailblock", "hebelKarten",
                   "ausserdem", "zumMailblock"];

  function zeigeErgebnis(e) {
    letztesErgebnis = e;
    var fluss = $("fluss");

    /* [B] */
    $("ergebnisTitel").textContent = e.titel;
    $("ergebnisSatz").textContent = e.satz;

    /* [C] Kurzliste + [F] Karten */
    var ol = $("hebelListeOl"), karten = $("hebelKartenListe");
    leere(ol); leere(karten);
    e.hebel.forEach(function (t, i) {
      var anker = "hebel-" + (i + 1);
      karten.appendChild(karte(t, (i + 1) + ". " + t.regel.titel, anker));
      var li = el("li");
      var a = el("a", null, t.regel.titel);
      a.href = "#" + anker;
      li.appendChild(a);
      ol.appendChild(li);
    });

    /* [G] Außerdem */
    var aus = $("ausserdemListe");
    leere(aus);
    e.ausserdem.forEach(function (t) {
      var det = el("details", "ausserdem-regel");
      det.appendChild(el("summary", null, t.regel.titel));
      det.appendChild(karte(t, null, null));
      aus.appendChild(det);
    });

    /* Reihenfolge je Fall: regeln.js, reihenfolge() */
    var folge = R.reihenfolge(e);
    BAUSTEINE.forEach(function (id) { zeig($(id), folge.indexOf(id) >= 0); });
    folge.forEach(function (id) { fluss.appendChild($(id)); });

    $("balken").style.width = "100%";
    zeig($("fragen"), false); zeig($("ergebnis"), true);
    bereiteTeilBild(e);
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------- Teilen-Bild
     30.09. abends (Liam): Geteilt kam nur eine Textdatei an. Jetzt ein Bild im
     Hochformat 1080 x 1920, im Browser gezeichnet, nichts geht an einen Server.
     Es wird VOR dem Tipp fertig gemacht: iOS erlaubt share() nur, solange der
     Tipp noch „frisch“ ist, und toBlob() ist langsam. */
  var teilDatei = null, teilUrl = null;
  var SCHRIFT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  function umbrechen(ctx, text, breite) {
    var zeilen = [], zeile = "";
    text.split(" ").forEach(function (wort) {
      var probe = zeile ? zeile + " " + wort : wort;
      if (ctx.measureText(probe).width > breite && zeile) { zeilen.push(zeile); zeile = wort; }
      else { zeile = probe; }
    });
    if (zeile) { zeilen.push(zeile); }
    return zeilen;
  }

  function zeichneTeilBild(e) {
    var t = R.teilBild(e);
    var c = document.createElement("canvas");
    c.width = 1080; c.height = 1920;
    var ctx = c.getContext("2d");
    var X = 110, B = 860, y;
    ctx.fillStyle = "#0f1b2d"; ctx.fillRect(0, 0, 1080, 1920);
    ctx.textBaseline = "top";

    /* Marke oben */
    ctx.fillStyle = "#e0b45a"; ctx.font = "700 52px " + SCHRIFT;
    ctx.fillText(t.marke, X, 150);

    /* Ergebnis-Karte mit goldenem Rand links, wie auf der Seite */
    ctx.font = "700 86px " + SCHRIFT;
    var titel = umbrechen(ctx, t.titel, B - 60);
    var kartenH = 150 + titel.length * 108 + 60;
    var kartenY = 380;
    ctx.fillStyle = "#16243a"; ctx.fillRect(X - 30, kartenY, B + 60, kartenH);
    ctx.fillStyle = "#e0b45a"; ctx.fillRect(X - 30, kartenY, 14, kartenH);
    ctx.fillStyle = "#b7c0d0"; ctx.font = "500 40px " + SCHRIFT;
    ctx.fillText(t.oben.toUpperCase(), X + 30, kartenY + 70);
    ctx.fillStyle = "#e0b45a"; ctx.font = "700 86px " + SCHRIFT;
    y = kartenY + 150;
    titel.forEach(function (z) { ctx.fillText(z, X + 30, y); y += 108; });

    /* Frage + Zusatz */
    y = kartenY + kartenH + 100;
    if (t.frage) {
      ctx.fillStyle = "#f2f4f8"; ctx.font = "600 60px " + SCHRIFT;
      umbrechen(ctx, t.frage, B).forEach(function (z) { ctx.fillText(z, X, y); y += 78; });
      y += 20;
    }
    ctx.fillStyle = "#b7c0d0"; ctx.font = "400 46px " + SCHRIFT;
    ctx.fillText(t.zusatz, X, y);

    /* Aufruf + Adresse unten; darunter bleibt Platz fuer die Leisten von Story-Apps */
    var unten = Math.max(y + 130, 1470);
    ctx.fillStyle = "#f2f4f8"; ctx.font = "600 58px " + SCHRIFT;
    ctx.fillText(t.aufruf, X, unten);
    ctx.fillStyle = "#e0b45a"; ctx.fillRect(X - 30, unten + 100, B + 60, 150);
    ctx.fillStyle = "#101820"; ctx.font = "700 64px " + SCHRIFT;
    ctx.textAlign = "center";
    ctx.fillText(t.adresse, 540, unten + 140);
    ctx.textAlign = "left";
    return c;
  }

  function bereiteTeilBild(e) {
    teilDatei = null;
    if (teilUrl) { URL.revokeObjectURL(teilUrl); teilUrl = null; }
    zeig($("teilBild"), false);
    try {
      zeichneTeilBild(e).toBlob(function (blob) {
        if (!blob || letztesErgebnis !== e) { return; }
        teilUrl = URL.createObjectURL(blob);
        try { teilDatei = new File([blob], "energie-check-ruhepuls.png", { type: "image/png" }); }
        catch (x) { teilDatei = null; }
      }, "image/png");
    } catch (x) { teilDatei = null; }
  }

  /* Ohne Bild-Teilen (Computer, manche App-Browser): Bild zeigen, lange
     drücken sichert es; am Computer ein Download-Link. */
  function zeigeTeilBild(status) {
    if (!teilUrl) { return false; }
    $("teilBildImg").src = teilUrl;
    $("teilBildLaden").href = teilUrl;
    zeig($("teilBild"), true);
    status.textContent = "";
    $("teilBild").scrollIntoView({ behavior: "smooth", block: "center" });
    return true;
  }

  function ort() {
    return location.href.split("#")[0].split("?")[0];
  }

  /* ---------------------------------------------------------- Verdrahtung */
  document.addEventListener("DOMContentLoaded", function () {
    $("losgehts").addEventListener("click", starte);
    /* 25.09. Liam: Von der Startseite kommend stand derselbe Einleitungstext ein zweites Mal da. Mit #start geht es direkt zur ersten Frage. */
    if (location.hash === "#start") starte();
    $("nochmal").addEventListener("click", starte);
    $("zurueck").addEventListener("click", function () {
      if (schritt > 0) { schritt--; male(); window.scrollTo(0, 0); }
    });
    $("teilen").addEventListener("click", function () {
      var status = $("teilenStatus");
      var text = R.teilText(letztesErgebnis, ort());
      /* 1. Bild teilen, wo das Geraet es kann (iPhone, Android). Nur die Datei:
         Mit Text dazu nehmen viele iOS-Ziele nur den Text. Der Link steht im Bild. */
      if (teilDatei && navigator.canShare && navigator.share) {
        var paket = { files: [teilDatei] };
        var kann = false;
        try { kann = navigator.canShare(paket); } catch (x) { kann = false; }
        if (kann) {
          navigator.share(paket).catch(function (f) {
            if (!f || f.name !== "AbortError") { zeigeTeilBild(status); }
          });
          return;
        }
      }
      /* 2. Sonst das Bild auf der Seite zeigen (lange drücken = sichern) */
      if (zeigeTeilBild(status)) { return; }
      /* 3. Notfall: Text wie bisher. 28.09. (Liam: "teilt man einfach nur den link"):
         ohne url-Feld, sonst nehmen viele Apps NUR die url. */
      if (navigator.share) {
        navigator.share({ title: "Energie-Check von Ruhepuls", text: text })
          .catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { status.textContent = "Link und Ergebnis kopiert."; },
          function () { status.textContent = "Kopieren hat nicht geklappt, der Link steht oben in der Adresszeile."; }
        );
      } else {
        status.textContent = "Der Link steht oben in der Adresszeile.";
      }
    });
    $("teilLink").addEventListener("click", function () {
      var status = $("teilenStatus");
      var text = R.teilText(letztesErgebnis, ort());
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { status.textContent = "Link und Ergebnis kopiert."; },
          function () { status.textContent = "Kopieren hat nicht geklappt, der Link steht oben in der Adresszeile."; }
        );
      } else {
        status.textContent = "Der Link steht oben in der Adresszeile.";
      }
    });
  });
})();
