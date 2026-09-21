/* Schlaf-Check — Anzeige und Ablauf.
   Alles laeuft im Browser. Kein Server, kein Tracking, keine Cookies.
   Gespeichert wird nur die letzte Antwortfolge in localStorage, damit ein
   versehentliches Neuladen die acht Fragen nicht wegwirft.

   Fragen, Regeln und Auswertung stehen in regeln.js.
   Die Video-Links stehen in videolinks.js und werden von
   scripts/baue-videolinks.py aus der Pipeline erzeugt.
*/
(function () {
  "use strict";

  var R = window.RUHEPULS_REGELN;
  var V = window.RUHEPULS_VIDEOS || { kanal: {}, videos: {} };
  var FRAGEN = R.FRAGEN;
  var SPEICHER = "ruhepuls-check-v2";

  var antworten = {}, schritt = 0, letztesErgebnis = null;

  var $ = function (id) { return document.getElementById(id); };
  var zeig = function (el, an) { el.classList[an ? "remove" : "add"]("weg"); };

  function starte() {
    antworten = {}; schritt = 0; letztesErgebnis = null;
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
    var box = $("antworten");
    box.innerHTML = "";
    f.optionen.forEach(function (o, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "antwort";
      b.textContent = o.text;
      b.addEventListener("click", function () { antworten[f.id] = i; weiter(); });
      box.appendChild(b);
    });
    zeig($("zurueck"), schritt > 0);
  }

  function weiter() {
    schritt++;
    if (schritt >= FRAGEN.length) { auswerten(); }
    else { male(); window.scrollTo(0, 0); }
  }

  function auswerten() {
    var e = R.werteAus(antworten);
    zeigeErgebnis(e);
    try {
      localStorage.setItem(SPEICHER, JSON.stringify(antworten));
    } catch (fehler) { /* Privater Modus: dann eben nicht. */ }
  }

  /* Baut die Zeile mit den Video-Links — oder den Satz, dass keins da ist. */
  function videoZeile(regel) {
    var p = document.createElement("p");
    p.className = "videos";
    var v = regel.video ? V.videos[regel.video] : null;
    if (!v || (!v.tiktok && !v.youtube)) {
      p.className = "videos kein";
      p.textContent = "Video dazu folgt.";
      return p;
    }
    p.appendChild(document.createTextNode("Video dazu: "));
    var links = [];
    if (v.tiktok) { links.push(["auf TikTok", v.tiktok]); }
    if (v.youtube) { links.push(["auf YouTube", v.youtube]); }
    links.forEach(function (l, i) {
      if (i) { p.appendChild(document.createTextNode(" · ")); }
      var a = document.createElement("a");
      a.href = l[1]; a.target = "_blank"; a.rel = "noopener";
      a.textContent = l[0] + " →";
      p.appendChild(a);
    });
    return p;
  }

  function zeigeErgebnis(e) {
    letztesErgebnis = e;
    $("ergebnisTitel").textContent = e.titel;
    $("ergebnisSatz").textContent = e.satz;

    var box = $("regeln");
    box.innerHTML = "";
    e.treffer.forEach(function (t, i) {
      var r = t.regel;
      var d = document.createElement("div");
      d.className = "regel";

      var h = document.createElement("h3");
      h.textContent = (i + 1) + ". " + r.titel;
      d.appendChild(h);

      var bezug = document.createElement("p");
      bezug.className = "bezug";
      bezug.textContent = t.bezug
        ? "Du hast angegeben, dass " + t.bezug + "."
        : "Diese Regel hält, was schon gut läuft.";
      d.appendChild(bezug);

      var tipp = document.createElement("p");
      tipp.className = "tipp";
      tipp.textContent = r.tipp;
      d.appendChild(tipp);

      var q = document.createElement("p");
      q.className = "studie";
      q.appendChild(document.createTextNode("Quelle: "));
      var a = document.createElement("a");
      a.href = r.link; a.target = "_blank"; a.rel = "noopener";
      a.textContent = r.quelle;
      q.appendChild(a);
      d.appendChild(q);

      d.appendChild(videoZeile(r));
      box.appendChild(d);
    });

    $("balken").style.width = "100%";
    zeig($("fragen"), false); zeig($("ergebnis"), true);
    window.scrollTo(0, 0);
  }

  function teilText() {
    if (!letztesErgebnis) { return ort(); }
    var titel = letztesErgebnis.treffer.map(function (t) { return t.regel.titel; });
    return "Mein Ergebnis beim Schlaf-Check von Ruhepuls: " +
      titel.join(" · ") + ". Acht Fragen, zwei Minuten: " + ort();
  }

  function ort() {
    return location.href.split("#")[0].split("?")[0];
  }

  /* ---------------------------------------------------------- Verdrahtung */
  document.addEventListener("DOMContentLoaded", function () {
    $("losgehts").addEventListener("click", starte);
    $("nochmal").addEventListener("click", starte);
    $("zurueck").addEventListener("click", function () {
      if (schritt > 0) { schritt--; male(); window.scrollTo(0, 0); }
    });
    $("teilen").addEventListener("click", function () {
      var status = $("teilenStatus");
      var text = teilText();
      if (navigator.share) {
        navigator.share({ title: "Schlaf-Check von Ruhepuls", text: text, url: ort() })
          .catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { status.textContent = "Link und Ergebnis kopiert."; },
          function () { status.textContent = "Kopieren hat nicht geklappt — der Link steht oben in der Adresszeile."; }
        );
      } else {
        status.textContent = "Der Link steht oben in der Adresszeile.";
      }
    });
  });
})();
