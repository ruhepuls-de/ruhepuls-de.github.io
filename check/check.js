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
    window.scrollTo(0, 0);
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
      if (navigator.share) {
        navigator.share({ title: "Energie-Check von Ruhepuls", text: text, url: ort() })
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
  });
})();
