/* Mail-Formular „Die 7 Nächte“ — der EINZIGE Netzaufruf der Seite.
   Schickt nur das Formular selbst (die Mailadresse) an MailerLite, und nur
   nach dem Klick. Kennt die Antworten des Checks nicht und liest keinen
   Speicher. Geprueft von scripts/pruefe-check.py, Zweig j. */
(function () {
  "use strict";
  var form = document.getElementById("mailForm");
  if (!form) return;
  var feld = document.getElementById("mailFeld");
  var danke = document.getElementById("mailDanke");
  var fehler = document.getElementById("mailFehler");
  var knopf = form.querySelector('button[type="submit"]');
  var knopfText = knopf.textContent;
  var tipp = document.getElementById("mailTipp");
  var tippAdresse = document.getElementById("mailTippAdresse");
  var an = document.getElementById("mailAn");

  /* 06.10.2026 (Liam: „ich habe, glaube ich, die E-Mail falsch eingegeben, aber kann die
     auch nicht mehr ändern“): haeufige Tippfehler bei Anbietern vorschlagen — nur im
     Browser, nichts wird dafuer gesendet. Ob eine Adresse existiert, kann die Seite
     nicht wissen; dafuer zeigt sie die Adresse nach dem Senden an und laesst sie aendern. */
  var TIPPFEHLER = {
    "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmal.com": "gmail.com",
    "gamil.com": "gmail.com", "gmail.co": "gmail.com", "gmail.cm": "gmail.com",
    "gmail.con": "gmail.com", "gmail.om": "gmail.com", "gmail": "gmail.com", "gmaill.com": "gmail.com",
    "gmx.dee": "gmx.de", "gmx.ed": "gmx.de", "gmx.d": "gmx.de", "gmx": "gmx.de", "gmx.dr": "gmx.de",
    "web.dee": "web.de", "web.ed": "web.de", "wbe.de": "web.de", "web.d": "web.de", "web": "web.de", "wed.de": "web.de",
    "t-onlie.de": "t-online.de", "tonline.de": "t-online.de", "t-online.com": "t-online.de", "t-onine.de": "t-online.de",
    "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmail.co": "hotmail.com",
    "outlok.com": "outlook.com", "outlook.co": "outlook.com", "outllok.com": "outlook.com",
    "icloud.co": "icloud.com", "iclod.com": "icloud.com", "icoud.com": "icloud.com", "icluod.com": "icloud.com",
    "yaho.de": "yahoo.de", "yahooo.de": "yahoo.de", "yaho.com": "yahoo.com"
  };
  var vorschlagGeprueft = "";

  function vorschlag(adresse) {
    var teile = String(adresse).trim().split("@");
    if (teile.length !== 2) return "";
    var richtig = TIPPFEHLER[teile[1].toLowerCase()];
    return richtig ? teile[0] + "@" + richtig : "";
  }

  document.getElementById("mailTippJa").addEventListener("click", function () {
    feld.value = tippAdresse.textContent;
    vorschlagGeprueft = feld.value;
    tipp.classList.add("weg");
    feld.focus();
  });

  document.getElementById("mailAendern").addEventListener("click", function () {
    clearTimeout(nochmalUhr);
    danke.classList.add("weg");
    form.classList.remove("weg");
    knopf.disabled = false;
    knopf.textContent = knopfText;
    vorschlagGeprueft = "";
    feld.focus();
    feld.select();
  });

  /* 06.10.2026 (Recherche „Anmeldestrecke wie die Profis“, Baymard): Adresse ohne Endung abfangen. */
  function ohneEndung(adresse) {
    var teile = String(adresse).trim().split("@");
    return teile.length === 2 && teile[1].indexOf(".") === -1;
  }

  /* Der eine Netzaufruf: das Formular selbst, auch fuer „Nochmal senden“ (MailerLite schickt die
     Bestaetigung an Unbestaetigte erneut, Hilfe „What are unconfirmed subscribers“). */
  function senden() {
    return fetch(form.action, { method: "POST", body: new FormData(form) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || j.success === false) throw new Error("abgelehnt");
        });
      });
  }

  var nochmal = document.getElementById("mailNochmal");
  var nochmalOk = document.getElementById("mailNochmalOk");
  var nochmalZaehler = 0, nochmalUhr = null;
  function nochmalSpaeter() {
    clearTimeout(nochmalUhr);
    nochmal.classList.add("weg");
    if (nochmalZaehler < 2) nochmalUhr = setTimeout(function () { nochmal.classList.remove("weg"); }, 60000);
  }
  nochmal.addEventListener("click", function () {
    nochmal.disabled = true;
    nochmalZaehler++;
    senden().then(function () { nochmalOk.classList.remove("weg"); })
      .catch(function () { fehler.classList.remove("weg"); })
      .then(function () { nochmal.disabled = false; nochmalSpaeter(); });
  });

  feld.addEventListener("input", function () { feld.setCustomValidity(""); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    feld.setCustomValidity(ohneEndung(feld.value) ? "Da fehlt die Endung, zum Beispiel .de oder .com." : "");
    if (!feld.checkValidity()) { feld.reportValidity(); return; }
    var v = vorschlag(feld.value);
    if (v && vorschlagGeprueft !== feld.value) {
      tippAdresse.textContent = v;
      tipp.classList.remove("weg");
      vorschlagGeprueft = feld.value;
      return;
    }
    tipp.classList.add("weg");
    knopf.disabled = true;
    knopf.textContent = "Einen Moment …";
    fehler.classList.add("weg");
    senden()
      .then(function () {
        form.classList.add("weg");
        an.textContent = feld.value.trim();
        if (window.ruhepulsPostfach) window.ruhepulsPostfach(feld.value);
        danke.classList.remove("weg");
        nochmalZaehler = 0;
        nochmalOk.classList.add("weg");
        nochmalSpaeter();
      })
      .catch(function () {
        knopf.disabled = false;
        knopf.textContent = knopfText;
        fehler.classList.remove("weg");
      });
  });
})();
