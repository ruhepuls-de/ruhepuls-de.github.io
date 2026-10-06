/* Knopf „Postfach öffnen“ nach dem Eintragen (02.10.2026). Nur Links,
   kein Netzaufruf, liest keinen Speicher. Aufgerufen von mail.js. */
(function () {
  "use strict";
  /* 02.10.2026: Knopf „Postfach öffnen“ passend zur Adresse — ein normaler
     Link, kein Netzaufruf. Unbekannter Anbieter: Knopf bleibt versteckt. */
  /* 06.10.2026 (Recherche Profis, Buttondown/Growth.Design): Gmail-Knopf oeffnet die Suche nach
     unserem Absender in allen Ordnern (auch Spam/Werbung). */
  var POSTFACH = {
    "gmail.com": ["https://mail.google.com/mail/u/0/#search/from%3Ahallo%40mein-ruhepuls.de+in%3Aanywhere+newer_than%3A1d", "Gmail"],
    "googlemail.com": ["https://mail.google.com/mail/u/0/#search/from%3Ahallo%40mein-ruhepuls.de+in%3Aanywhere+newer_than%3A1d", "Gmail"],
    "gmx.de": ["https://www.gmx.net/", "GMX"], "gmx.net": ["https://www.gmx.net/", "GMX"],
    "gmx.at": ["https://www.gmx.at/", "GMX"], "gmx.ch": ["https://www.gmx.ch/", "GMX"],
    "web.de": ["https://web.de/", "WEB.DE"],
    "t-online.de": ["https://email.t-online.de/", "t-online"],
    "outlook.com": ["https://outlook.live.com/mail/", "Outlook"],
    "outlook.de": ["https://outlook.live.com/mail/", "Outlook"],
    "hotmail.com": ["https://outlook.live.com/mail/", "Outlook"],
    "hotmail.de": ["https://outlook.live.com/mail/", "Outlook"],
    "live.com": ["https://outlook.live.com/mail/", "Outlook"],
    "live.de": ["https://outlook.live.com/mail/", "Outlook"],
    "icloud.com": ["https://www.icloud.com/mail/", "iCloud"],
    "me.com": ["https://www.icloud.com/mail/", "iCloud"],
    "yahoo.com": ["https://mail.yahoo.com/", "Yahoo"], "yahoo.de": ["https://mail.yahoo.com/", "Yahoo"]
  };
  window.ruhepulsPostfach = function (adresse) {
    var a = document.getElementById("postfachKnopf");
    if (!a) return;
    var ziel = POSTFACH[String(adresse).split("@").pop().trim().toLowerCase()];
    if (!ziel) return;
    a.href = ziel[0];
    a.textContent = ziel[1] + " öffnen";
    a.classList.remove("weg");
  };

})();
