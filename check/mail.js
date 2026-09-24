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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!feld.checkValidity()) { feld.reportValidity(); return; }
    knopf.disabled = true;
    knopf.textContent = "Einen Moment …";
    fehler.classList.add("weg");
    fetch(form.action, { method: "POST", body: new FormData(form) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || j.success === false) throw new Error("abgelehnt");
        });
      })
      .then(function () {
        form.classList.add("weg");
        danke.classList.remove("weg");
      })
      .catch(function () {
        knopf.disabled = false;
        knopf.textContent = knopfText;
        fehler.classList.remove("weg");
      });
  });
})();
