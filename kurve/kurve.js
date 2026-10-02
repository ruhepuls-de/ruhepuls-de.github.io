/* Deine Energiekurve – 7 Tage.  02.10.2026: Bau „Kurve repariert“ (17-Uhr-Fenster, Nachholen
   hoechstens 2 Tage mit Kennzeichnung und „Lücke lassen“, Vergleich erst an Tag 7 und auch bei
   „Weiß ich nicht“, Rueckkehr zeichnet neu, persist()). Davor: Stand 28.09.2026 abends (Fassung 3, Liam 22:15:
   Häkchen fragen, was man getan hat · die Woche zählt sieben Einträge, keine
   Kalendertage · Einträge bleiben, wo sie gemacht werden · Ausnahme-Kasten).
   Davor: Umbau 7 Tage, Teil A.
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
   node scripts/teste-kurve.js (wird rot, exit 1).
*/
(function () {
  "use strict";

  /* Abnahme 28.09. abends (MUSS 3): Der Schluessel haengt vom Pfad ab. Unter
     /kurve-test/ ein eigener Testspeicher, unter /kurve/ derselbe Schluessel wie
     bisher (ruhepuls.kurve.v1) — sonst saehen alle bisherigen Nutzer nach dem Umzug
     „0 von 7“. Der Umzug ist damit reines Kopieren. */
  function schluesselFuer(pfad) {
    return /\/kurve-test\//.test(pfad || "") ? "ruhepuls.kurve.test" : "ruhepuls.kurve.v1";
  }
  var SCHLUESSEL = schluesselFuer(typeof location === "object" && location ? location.pathname : "");
  var HOECHSTENS = 7;          // nach sieben Eintraegen keine weiteren
  var WOCHE_AB = 5;            // „Deine Woche bisher“ ab dem 5. Eintrag
  var TAGESWECHSEL = 4;        // 28.09.: neuer Tag erst um 4:00 — ein Eintrag um 1 Uhr zaehlt fuer den Vortag
  /* 02.10.2026 (Bau „Kurve repariert“, Ablauf-Pruefung Befund 4): Fuer HEUTE oeffnet das
     Formular erst um 17 Uhr (vorher nur ueber „trotzdem jetzt eintragen“). Wer mittags
     eintrug, sah abends „schon eingetragen“; wer die 20-Uhr-Mail morgens las, trug fuer den
     neuen Tag statt fuer gestern ein (Loop Habit Tracker #374/#1312: der Eintrag gehoert
     zum Tag, an den erinnert wurde). Nachholen hoechstens 2 Tage zurueck, gekennzeichnet
     (Stone 2002/2003: stilles Nachtragen vergiftet Tagebuecher). */
  var ABEND_AB = 17;
  var NACHHOLEN = 2;
  var ANKER = "mitnehmen=";    // Mitnehmen-Link: …/kurve/#mitnehmen=<daten>

  /* Die Haekchen. Namen woertlich wie im Formular (Leser-Test 25.09.:
     abweichende Kurznamen verwirrten).
     FASSUNG 3 (Liam 28.09.): Jedes Haekchen fragt, was man GETAN hat. Leer heisst
     „nicht passiert“. Die verneinten Haekchen („kein Koffein“, „keinen Alkohol“,
     „nichts Suesses“) wurden angehakt, wenn es das gab (Durchlauf-Test, Befund 7).
     Neue Schluessel, damit alte Eintraege nie falsch herum gelesen werden (migriere).
     schalter: null = immer aktiv (Schlaf, Bewegung, Pause); sonst der
       Schalter aus der Einrichtung („Was kommt in deinem Alltag vor?“).
     tipp: Name in der Tipp-Frage und im Tipp-Block.
     mit/ohne: Tage MIT gesetztem Haekchen bzw. OHNE, als Satzteil.
     versetzt: 25.09. (Liam) — Koffein und Alkohol stoeren vor allem die Nacht
       danach. Diese beiden vergleicht der Tipp-Block mit der Zahl vom Folgetag.
     Energydrink: steht beim Koffein (Schalter Koffein) und beim Suessen — er geht
       nicht verloren, wenn „Suesses“ aus ist (Befund Jonas). */
  var HEBEL = [
    { k: "schlaf7", name: "Letzte Nacht mindestens 7 Stunden geschlafen", schalter: null, tipp: "Schlaf",
      mit: "nach mindestens 7 Stunden Schlaf", ohne: "nach weniger als 7 Stunden Schlaf" },
    { k: "koffeinSpaet", name: "Nach dem Mittagessen noch Koffein getrunken", schalter: "koffein", tipp: "Koffein",
      mit: "nach einem Nachmittag mit Koffein", ohne: "nach einem Nachmittag ohne Koffein", versetzt: true,
      warum: "Gezählt wird hier deine Zahl vom Tag danach, weil Koffein am Nachmittag vor allem die folgende Nacht stören kann." },
    { k: "alkoholGetrunken", name: "Alkohol getrunken", schalter: "alkohol", tipp: "Alkohol",
      mit: "nach einem Tag mit Alkohol", ohne: "nach einem Tag ohne Alkohol", versetzt: true,
      warum: "Gezählt wird hier deine Zahl vom Tag danach, weil Alkohol am Abend vor allem die folgende Nacht stören kann." },
    { k: "bewegt", name: "Mindestens eine halbe Stunde so bewegt, dass du etwas schneller geatmet hast", schalter: null, tipp: "Bewegung",
      mit: "mit mindestens einer halben Stunde Bewegung", ohne: "mit weniger Bewegung" },
    { k: "pause", name: "Am Nachmittag mindestens 5 Minuten unterbrochen, was du gerade tust (Arbeit, Lernen, Haushalt)", schalter: null, tipp: "Pause am Nachmittag",
      mit: "mit einer Pause am Nachmittag", ohne: "ohne Pause am Nachmittag" },
    { k: "suessesNachmittag", name: "Am Nachmittag etwas Süßes gegessen oder getrunken", schalter: "suesses", tipp: "Süßes am Nachmittag",
      mit: "mit Süßem am Nachmittag", ohne: "ohne Süßes am Nachmittag" }
  ];
  var ALLE = HEBEL.map(function (h) { return h.k; });
  var SCHALTER = ["koffein", "alkohol", "suesses"];
  var WEISS_NICHT = "weissNicht";
  var OFFEN = "offen";         // 02.10.: Frage „Bevor du's siehst“ an Tag 7 uebersprungen
  var FORMAT = 2;              // daten.v: 2 = Haekchen fragen, was man getan hat
  /* Alte Schluessel (bis 28.09.) fragten verneint: gesetzt = NICHT getan. */
  var ALT_UMKEHR = { koffeinHeute: "koffeinSpaet", alkoholHeute: "alkoholGetrunken", keinSuesses: "suessesNachmittag" };
  var ALT_SECHS = ["schlaf7", "koffeinHeute", "alkoholHeute", "bewegt", "pause", "keinSuesses"];
  /* Kurzzeichen fuer den Mitnehmen-Link (haelt ihn kurz genug zum Kopieren).
     v1 = alte Links (verneinte Haekchen), v2 = heute. */
  var ZEICHEN = { schlaf7: "s", koffeinSpaet: "c", alkoholGetrunken: "l", bewegt: "b", pause: "p",
                  suessesNachmittag: "u" };
  var ZEICHEN_V1 = { schlaf7: "s", koffeinHeute: "k", alkoholHeute: "a", bewegt: "b", pause: "p",
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
  /* Kalendertage zwischen zwei Tagen (Text). Math.round vertraegt 23-/25-Stunden-Tage. */
  function abstand(von, bis) { return Math.round((ausText(bis) - ausText(von)) / 86400000); }

  /* ------------------------------------------- Welcher Tag? (02.10.2026) */
  /* Abend = ab 17 Uhr bis zum Tageswechsel um 4 Uhr. Nur dann steht das Formular
     von selbst auf „heute“. */
  function istAbend(jetzt) {
    var h = jetzt.getHours();
    return h >= ABEND_AB || h < TAGESWECHSEL;
  }
  /* Erster Tag der Woche: Tag der Einrichtung oder erster Eintrag, was frueher ist.
     Vor diesem Tag laesst sich nie etwas nachtragen. */
  function startTag(daten) {
    var t = Object.keys((daten && daten.eintraege) || {}).sort();
    var s = daten && daten.einstellung && daten.einstellung.seit;
    if (s && (!t.length || s < t[0])) { return s; }
    return t.length ? t[0] : null;
  }
  /* Tage, die sich nachtragen lassen: gestern und vorgestern, nicht vor dem Start, nicht
     schon eingetragen, nicht bewusst als Luecke gelassen, und nur solange die Woche nicht
     voll ist. Neuester Tag zuerst. Kein freier Datumswaehler (Recherche 02.10.). */
  function nachholbar(daten, jetzt) {
    var e = (daten && daten.eintraege) || {}, r = [];
    var start = startTag(daten), luecken = (daten && daten.luecken) || [];
    if (!start || Object.keys(e).length >= HOECHSTENS) { return r; }
    var h = ausText(tagVon(jetzt));
    for (var i = 1; i <= NACHHOLEN; i++) {
      var t = datumText(plusTage(h, -i));
      if (t >= start && !e[t] && luecken.indexOf(t) < 0) { r.push(t); }
    }
    return r;
  }
  /* Fuer welchen Tag steht das Formular, wenn niemand etwas gewaehlt hat?
     Abends: heute (falls noch offen). Tagsueber: der juengste nachholbare Tag, also nach
     der 20-Uhr-Mail am Morgen „gestern“. Sonst keiner: „Heute ab 17 Uhr“. */
  function zielTag(daten, jetzt) {
    var e = (daten && daten.eintraege) || {}, h = tagVon(jetzt);
    if (Object.keys(e).length >= HOECHSTENS) { return null; }
    if (istAbend(jetzt)) { return e[h] ? null : h; }
    var offen = nachholbar(daten, jetzt);
    return offen.length ? offen[0] : null;
  }
  /* Nachgetragen = an einem spaeteren Tag eingetragen als dem, fuer den der Eintrag gilt
     (am = Tag des Eintragens, gleiche 4-Uhr-Grenze). Alte Eintraege ohne „am“ zaehlen nie. */
  function nachgetragen(tag, e) { return !!(e && e.am && e.am > tag); }

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

  /* Alte Daten (verneinte Haekchen) auf Format 2 umstellen. Nie raten:
     - Eintrag MIT „gezeigt“: stand das alte Haekchen da, heisst leer „getan“,
       gesetzt „nicht getan“.
     - Eintrag OHNE „gezeigt“ (vor dem 28.09.): nur ein GESETZTES altes Haekchen
       ist sicher („nicht getan“); leer kann auch „nicht gefragt“ heissen, dann
       zaehlt das Haekchen an diesem Tag nicht.
     - „Vorabend“-Haekchen (bis 25.09.) fallen weg.
     Geschrieben wird erst beim naechsten Speichern (G5, Recht 28.09.). */
  function migriere(d) {
    if (!d || d.v === FORMAT) { return d; }
    var e = d.eintraege || {}, neu = {};
    Object.keys(e).forEach(function (t) {
      var x = e[t], hebel = x.hebel || [];
      var gez = x.gezeigt || null, nGez = [], nHeb = [];
      ALT_SECHS.forEach(function (k) {
        var nk = ALT_UMKEHR[k] || k, war = hebel.indexOf(k) >= 0;
        var da = gez ? gez.indexOf(k) >= 0 : (!ALT_UMKEHR[k] || war);
        if (!da) { return; }
        nGez.push(nk);
        if (ALT_UMKEHR[k] ? !war : war) { nHeb.push(nk); }
      });
      neu[t] = { energie: x.energie, hebel: nHeb, gezeigt: nGez };
    });
    var r = { v: FORMAT, eintraege: neu };
    if (d.einstellung) {
      var s = {};
      for (var k in d.einstellung) { s[k] = d.einstellung[k]; }
      if (ALT_UMKEHR[s.tipp]) { s.tipp = ALT_UMKEHR[s.tipp]; }
      if (s.tipp && s.tipp !== WEISS_NICHT && ALLE.indexOf(s.tipp) < 0) { s.tipp = WEISS_NICHT; }
      r.einstellung = s;
    }
    return r;
  }

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
    return aktiveHebel(einst).filter(function (h) { return zaehlt(e, h) && gesetzt(e, h); })
      .map(function (h) { return h.name; });
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
    /* 02.10.: „Deine Woche“ statt „Dein Ergebnis“ — so sagen es Mail 7 und Video 7
       („dann siehst du deine Woche“); eine Woche liefert einen Hinweis, kein Ergebnis. */
    w.titel = w.fertig ? "Deine Woche" : "Deine Woche bisher";
    /* 02.10.: nachgetragene Tage sichtbar machen (Recherche, Absicherung 4). */
    w.nachgetragen = tage.filter(function (t) { return nachgetragen(t, eintraege[t]); }).length;
    w.nachSatz = !w.nachgetragen ? null :
      (w.nachgetragen === 1 ? "Einen Eintrag hast du" : w.nachgetragen + " Einträge hast du") +
      " erst am Tag danach oder später gemacht. In der Kurve sind sie hohl gezeichnet. Solche Werte sind aus der Erinnerung geschätzt.";

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
      w.schwankung = "Deine normale Schwankung: weniger als einen halben Punkt nach oben oder unten.";
    } else {
      grenze = Math.round(sd * 2) / 2;
      /* Fassung 3: „± 1,5“ verstand niemand (Klaus, Mira) — in Worten. */
      var gerundet = Math.round(sd * 2) / 2;
      w.schwankung = "Deine normale Schwankung: etwa " + (gerundet % 1 ? halbe(sd) : String(gerundet)) +
        (gerundet === 1 ? " Punkt" : " Punkte") + " nach oben oder unten.";
    }
    w.grenze = grenze;
    /* Recht 28.09., O5: keine Bewertung „alles normal“. Abnahme Fach 28.09.: Ohne echten
       Effekt lagen 22–31 % der Wochen ueber der Schwankung — der Satz verspricht nichts mehr. */
    w.schwankungErklaerung = sd === 0 ? "" : "So weit lag deine Zahl an einem typischen Tag über oder unter deinem Schnitt. " +
      "Unterschiede in dieser Größe entstehen in einer Woche schon durch Zufall.";

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

    /* So oft angehakt: je aktivem Haekchen „X von N Tagen“. Fassung 3: nicht mehr
       „geschafft“ — „Alkohol getrunken: 2 von 7 Tagen“ ist kein Erfolg. */
    w.geschafft = aktiveHebel(einst).map(function (h) {
      var da = tage.filter(function (t) { return zaehlt(eintraege[t], h); });
      var ja = da.filter(function (t) { return gesetzt(eintraege[t], h); }).length;
      if (!da.length) { return { name: h.name, text: "noch an keinem Tag gefragt" }; }
      return { name: h.name, text: ja + " von " + da.length + (da.length === 1 ? " Tag" : " Tagen") };
    });

    /* Deine Vermutung von Tag 1 (29.09., Liam: „Tipp“ klang wie ein Rat von Ruhepuls → „Vermutung“).
       Interne Namen (tipp, tippHebel, tippBlock) bleiben, damit alte Einträge und Links lesbar bleiben. */
    w.tipp = null;
    w.frageTag7 = false;
    /* 02.10. (Ablauf-Pruefung Befund 8): Der Vergleich erscheint erst mit dem siebten
       Eintrag. So kuendigen es Mail 6, Mail 7 und Video 5 an („Was den Unterschied macht,
       steht dort nicht“). Vorher zeigt „Deine Woche bisher“ nur Tatsachen. */
    if (!w.fertig) {
      w.grenzeSatz = grenzeSatzText();
      return w;
    }
    var hebelVon = function (k) {
      return HEBEL.filter(function (h) { return h.k === k && hebelAktiv(h, einst); })[0] || null;
    };
    var tippHebel = null, vonTag = 1;
    if (einst && einst.tipp && einst.tipp !== WEISS_NICHT) {
      tippHebel = hebelVon(einst.tipp);
    } else if (einst && einst.tipp7 && einst.tipp7 !== OFFEN) {
      /* 02.10. (Befund 5): „Weiß ich nicht“ — vor dem Aufdecken einmal gefragt. */
      tippHebel = hebelVon(einst.tipp7);
      vonTag = 7;
    } else if (einst && einst.tipp === WEISS_NICHT && !einst.tipp7) {
      w.frageTag7 = true;              /* erst fragen, dann zeigen (Seite: #vorherFrage) */
    }
    if (!tippHebel && !w.frageTag7) {
      /* „Weiß ich nicht“ und uebersprungen, oder die Vermutung ist inzwischen abgeschaltet:
         Mail 1, 6, 7 versprechen trotzdem „deine Energie an den Tagen mit und an den Tagen
         ohne“. Jedes Haekchen in der Reihenfolge des Formulars, mit Tageszahlen, ohne
         Unterschied, ohne Hervorhebung (Grundsatz 28.09.: kein Sieger). */
      var zeilen = ["Deine Häkchen: Tage mit und Tage ohne"];
      zeilen.push(einst && einst.tipp && einst.tipp !== WEISS_NICHT
        ? "Deine Vermutung von Tag 1 ist inzwischen ausgeschaltet. Deshalb stehen hier alle Häkchen in der Reihenfolge des Formulars."
        : "Du hattest keine Vermutung gewählt. Deshalb stehen hier alle Häkchen in der Reihenfolge des Formulars.");
      aktiveHebel(einst).forEach(function (h) {
        var q = paare(eintraege, h);
        var kopf = h.tipp + (h.versetzt ? " (Zahl vom Tag danach)" : "") + ": ";
        if (!q.mit.length || !q.ohne.length) {
          zeilen.push(kopf + "kein Vergleich, " + (q.mit.length ? "keine Tage " + h.ohne : q.ohne.length ? "keine Tage " + h.mit : "keine passenden Tage") + ".");
        } else {
          zeilen.push(kopf + anTagen(q.mit.length) + " " + h.mit + " " + (q.mit.length > 1 ? "im Schnitt " : "") + zahl(schnitt(q.mit)) +
                      ", " + anTagen(q.ohne.length) + " " + h.ohne + " " + (q.ohne.length > 1 ? "im Schnitt " : "") + zahl(schnitt(q.ohne)) + ".");
        }
      });
      zeilen.push("Das ist ein Hinweis, kein Beweis. Unterschiede wie diese entstehen in einer Woche oft durch Zufall.");
      zeilen.push("Ob es wirklich an einer dieser Sachen liegt, kann eine Woche nicht zeigen.");
      zeilen.push("Dafür braucht es einen längeren Versuch mit einer Sache.");
      w.tipp = zeilen;
      w.tippListe = true;
    }
    if (tippHebel) {
      var p = paare(eintraege, tippHebel);
      var s = [vonTag === 1 ? "Deine Vermutung von Tag 1: " + tippHebel.tipp + "."
                            : "Deine Vermutung, bevor du die Zahlen gesehen hast: " + tippHebel.tipp + "."];
      /* Fassung 3: eindeutig sagen, welche Tage „mit“ sind (Befund 8). */
      s.push("Verglichen werden die Tage mit dem Häkchen „" + tippHebel.name + "“ und die Tage ohne.");
      if (!p.mit.length && !p.ohne.length) {
        s.push("Dafür hattest du diese Woche keine zwei Einträge an aufeinanderfolgenden Tagen.");
      } else if (!p.mit.length || !p.ohne.length) {
        s.push("Dafür hattest du diese Woche keine Tage " + (p.mit.length ? tippHebel.ohne : tippHebel.mit) + ".");
        s.push("Ein Vergleich geht erst, wenn es beides gibt.");
      } else {
        var a = schnitt(p.mit), b = schnitt(p.ohne);
        /* Abnahme 28.09. (Technik): Unterschied aus den gezeigten, gerundeten Werten,
           sonst rechnet 7,0 − 5,3 nach und kommt nicht auf die gezeigte Zahl. */
        var d = Math.abs(Math.round(a * 10) - Math.round(b * 10)) / 10;
        s.push(erstGross(anTagen(p.mit.length)) + " " + tippHebel.mit + " lag deine Zahl " +
               (p.mit.length > 1 ? "im Schnitt " : "") + "bei " + zahl(a) + ", " +
               anTagen(p.ohne.length) + " " + tippHebel.ohne + " bei " + zahl(b) + ".");
        if (tippHebel.warum) { s.push(tippHebel.warum); }
        s.push("Der Unterschied beträgt " + zahl(d) + " Punkte.");
        s.push(d > grenze
          ? "Das ist mehr als deine normale Schwankung. Auch das kommt in einer Woche oft durch Zufall zustande."
          : "Das liegt innerhalb deiner normalen Schwankung.");
        /* 02.10. (Recherche, Absicherung 5): Bearable verlangt mindestens 3 Tage je Seite. */
        var wenig = Math.min(p.mit.length, p.ohne.length);
        if (wenig < 3) {
          s.push("Auf einer Seite stehen nur " + (wenig === 1 ? "ein Tag" : wenig + " Tage") + ". Das ist sehr wenig für einen Vergleich.");
        }
        s.push("Das ist ein Hinweis, kein Beweis.");
        /* Recht 28.09., O4: „zeigt erst“ klang, als zeige der längere Versuch es sicher. */
        s.push("Ob es wirklich daran liegt, kann eine Woche nicht zeigen.");
        s.push("Dafür braucht es einen längeren Versuch mit einer Sache.");
      }
      w.tipp = s;
    }
    w.grenzeSatz = grenzeSatzText();
    return w;
  }
  function grenzeSatzText() {
    return "Eine Woche zeigt dir, wie deine Tage waren. Warum sie so waren, kann sie nicht trennen, " +
      "denn an jedem Tag spielt vieles mit, das hier nicht steht: Stress, Wetter, ein Infekt.";
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
  function umkehren(z) { var r = {}; Object.keys(z).forEach(function (k) { r[z[k]] = k; }); return r; }
  var AUS_ZEICHEN = { 1: umkehren(ZEICHEN_V1), 2: umkehren(ZEICHEN) };

  function kodiere(daten) {
    var e = {};
    Object.keys(daten.eintraege || {}).sort().forEach(function (t) {
      var x = daten.eintraege[t];
      var z = [x.energie, x.hebel.map(function (k) { return ZEICHEN[k] || ""; }).join("")];
      if (x.gezeigt) {
        z.push(x.gezeigt.map(function (k) { return ZEICHEN[k] || ""; }).join(""));
        /* 02.10.: Tag des Eintragens als Abstand in Tagen (aeltere Seiten lesen nur z[0..2]). */
        if (x.am) { z.push(Math.max(0, abstand(t, x.am))); }
      }
      e[t.replace(/-/g, "")] = z;
    });
    var roh = { v: 2, e: e };
    var s = daten.einstellung;
    if (s) {
      roh.s = [s.koffein === false ? 0 : 1, s.alkohol === false ? 0 : 1, s.suesses === false ? 0 : 1, s.tipp || ""];
      /* 02.10.: Tag der Einrichtung und die Vermutung von Tag 7 (aeltere Seiten lesen nur s[0..3]). */
      if (s.seit || s.tipp7) { roh.s.push(s.seit ? s.seit.replace(/-/g, "") : "", s.tipp7 || ""); }
    }
    if (daten.luecken && daten.luecken.length) { roh.l = daten.luecken.map(function (t) { return t.replace(/-/g, ""); }); }
    return b64(JSON.stringify(roh));
  }
  function ausAcht(s) {
    var m = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
    return m ? m[1] + "-" + m[2] + "-" + m[3] : null;
  }

  /* Liest einen Mitnehmen-Link. Alles wird geprueft; bei jedem Fehler null. */
  function dekodiere(code) {
    var roh;
    try { roh = JSON.parse(ausB64(code)); } catch (err) { return null; }
    if (!roh || (roh.v !== 1 && roh.v !== 2) || typeof roh.e !== "object" || !roh.e) { return null; }
    var tabelle = AUS_ZEICHEN[roh.v], erlaubt = roh.v === 1 ? ALT_SECHS : ALLE;
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
          if (!tabelle[s[j]]) { return null; }
          if (out.indexOf(tabelle[s[j]]) < 0) { out.push(tabelle[s[j]]); }
        }
        return out;
      };
      var hebel = liste(z[1]);
      if (!hebel) { return null; }
      var x = { energie: z[0], hebel: hebel };
      var tagText = m[1] + "-" + m[2] + "-" + m[3];
      if (typeof z[2] === "string") {
        x.gezeigt = liste(z[2]);
        if (!x.gezeigt) { return null; }
      }
      if (z.length > 3) {
        if (typeof z[3] !== "number" || z[3] % 1 || z[3] < 0 || z[3] > 30) { return null; }
        x.am = datumText(plusTage(ausText(tagText), z[3]));
      }
      eintraege[tagText] = x;
    }
    var daten = { eintraege: eintraege };
    if (Array.isArray(roh.s)) {
      var tipp = roh.s[3];
      if (tipp && tipp !== WEISS_NICHT && erlaubt.indexOf(tipp) < 0) { return null; }
      daten.einstellung = { koffein: roh.s[0] !== 0, alkohol: roh.s[1] !== 0, suesses: roh.s[2] !== 0,
                            tipp: tipp || WEISS_NICHT };
      if (roh.s.length > 4) {
        var seit = roh.s[4], t7 = roh.s[5];
        if (typeof seit !== "string" || (seit && !ausAcht(seit))) { return null; }
        if (t7 != null && t7 !== "" && t7 !== OFFEN && ALLE.indexOf(t7) < 0) { return null; }
        if (seit) { daten.einstellung.seit = ausAcht(seit); }
        if (t7) { daten.einstellung.tipp7 = t7; }
      }
    }
    if (roh.l != null) {
      if (!Array.isArray(roh.l) || roh.l.length > 30) { return null; }
      var l = [];
      for (var k = 0; k < roh.l.length; k++) {
        var lt = typeof roh.l[k] === "string" ? ausAcht(roh.l[k]) : null;
        if (!lt) { return null; }
        if (l.indexOf(lt) < 0) { l.push(lt); }
      }
      if (l.length) { daten.luecken = l.sort(); }
    }
    if (roh.v === 1) { return migriere(daten); }   /* alter Link: verneinte Haekchen */
    daten.v = FORMAT;
    return daten;
  }

  /* Zusammenfuehren: Eintraege aus beiden, bei gleichem Tag gilt der Link.
     Mehr als sieben: die ersten sieben bleiben (sie sind die Woche). */
  function zusammen(lokal, link) {
    var e = {};
    Object.keys(lokal.eintraege || {}).forEach(function (t) { e[t] = lokal.eintraege[t]; });
    Object.keys(link.eintraege).forEach(function (t) { e[t] = link.eintraege[t]; });
    Object.keys(e).sort().slice(HOECHSTENS).forEach(function (t) { delete e[t]; });
    /* 02.10.: Einrichtungstag und Vermutung von Tag 7 gehen nicht verloren, wenn der Link
       von einer aelteren Seite stammt; Luecken aus beiden bleiben. */
    var einst = link.einstellung || lokal.einstellung || undefined;
    if (link.einstellung && lokal.einstellung) {
      var s = {};
      for (var k in link.einstellung) { s[k] = link.einstellung[k]; }
      var a = link.einstellung.seit, b = lokal.einstellung.seit;
      if (a || b) { s.seit = a && b ? (a < b ? a : b) : (a || b); }
      if (!s.tipp7 && lokal.einstellung.tipp7) { s.tipp7 = lokal.einstellung.tipp7; }
      einst = s;
    }
    var r = { v: FORMAT, eintraege: e, einstellung: einst };
    var l = (lokal.luecken || []).concat(link.luecken || []).filter(function (t, i, x) { return x.indexOf(t) === i && !e[t]; });
    if (l.length) { r.luecken = l.sort(); }
    return r;
  }

  /* Abnahme 28.09. (Technik, SOLLTE): Welche Tage fielen beim Zusammenlegen weg?
     Vor „Ja, übernehmen“ nennt die Seite sie, statt sie still zu loeschen. */
  function wegfallend(lokal, link) {
    var bleibt = zusammen(lokal, link).eintraege, weg = [];
    Object.keys(lokal.eintraege || {}).concat(Object.keys(link.eintraege || {})).forEach(function (t) {
      if (!bleibt[t] && weg.indexOf(t) < 0) { weg.push(t); }
    });
    return weg.sort();
  }

  /* In-App-Browser (TikTok, Instagram, Facebook, Google-App): eigener Speicher,
     getrennt von Safari/Chrome. */
  function istInApp(ua) {
    return /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Bytedance|\bGSA\//i.test(ua || "");
  }
  /* 02.10.2026 (Bau „Kurve repariert“, Punkt 6): In TikTok, Instagram und Facebook keine
     Einrichtung — wer dort startet, findet seine Eintraege ueber die Mail nie wieder.
     Die Google-App (GSA) bleibt aussen vor: Ob Mail-Apps sich so melden, ist ungeprueft,
     und eine Sperre im Mail-Weg waere schlimmer als der Hinweis. */
  function istSozialApp(ua) {
    return /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Bytedance/i.test(ua || "");
  }
  /* 30.09.2026 (Liam: "warum können wir es nicht auch über computer möglich machen?"): weicher Hinweis statt Sperre — eintragen erlaubt, dasselbe Geraet die ganze Woche. Vorher Fassung 3: Am Computer nicht eintragen (Klaus). Kein Handy, kein Tablet im
     Kennzeichen. Das iPad meldet sich wie ein Mac — die Seite prueft deshalb
     zusaetzlich die Touch-Punkte. */
  function istAmPC(ua) {
    return !/Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(ua || "");
  }

  /* Welches Tagesvideo? ?tag=N aus der Mail, sonst der Tag, an dem man steht:
     Eintraege + 1, nach dem heutigen Eintrag der heutige Tag. */
  function videoTag(suche, n, hatHeute) {
    var m = /[?&]tag=([1-7])(?:&|$)/.exec(suche || "");
    if (m) { return parseInt(m[1], 10); }
    return Math.max(1, Math.min(hatHeute ? n : n + 1, HOECHSTENS));
  }

  /* N2 (Zweitabnahme 29.09., Technik SOLLTE): Zwei Tabs, dieselbe Loesung wie in den 30 Tagen (N1).
     Jeder Mail-Knopf oeffnet einen neuen Tab. Jeder Schreibvorgang traegt eine neue Revision; vor dem
     Schreiben liest der Tab den Speicher neu. Steht dort eine andere Revision als beim Laden, hat ein
     anderer Tab inzwischen geschrieben (oder geloescht). Dann wird NICHT ueberschrieben, sondern der
     neuere Stand geliefert. */
  function revVon(roh) {
    if (!roh) { return 0; }
    try { var j = JSON.parse(roh); return j && Number.isInteger(j.rev) && j.rev >= 0 ? j.rev : 0; } catch (e) { return 0; }
  }
  function ausSpeicher(roh) {
    if (!roh) { return { v: FORMAT, eintraege: {} }; }
    var d = JSON.parse(roh);
    return d && typeof d.eintraege === "object" && d.eintraege ? migriere(d) : null;
  }
  function schreibeSicher(sp, schluessel, d, geladenRev, erzwingen) {
    var roh = sp.getItem(schluessel);                              /* wirft bei gesperrtem Speicher: Aufrufer faengt */
    var jetztRev = revVon(roh);
    if (!erzwingen && jetztRev !== (geladenRev || 0)) {
      var neu = null;
      try { neu = ausSpeicher(roh); } catch (e) { neu = null; }
      if (neu) { return { ok: false, konflikt: true, neu: neu, rev: jetztRev }; }
    }
    var rev = Math.max(Date.now(), jetztRev + 1);
    if (rev === (geladenRev || 0)) { rev++; }
    d.rev = rev;
    sp.setItem(schluessel, JSON.stringify(d));
    return { ok: true, konflikt: false, rev: rev };
  }

  var API = { HEBEL: HEBEL, revVon: revVon, ausSpeicher: ausSpeicher, schreibeSicher: schreibeSicher, tagVon: tagVon, auswerten: auswerten, kodiere: kodiere, dekodiere: dekodiere,
              zusammen: zusammen, wegfallend: wegfallend, istInApp: istInApp, istAmPC: istAmPC, videoTag: videoTag, aktiveHebel: aktiveHebel,
              paare: paare, migriere: migriere, schluesselFuer: schluesselFuer, SCHLUESSEL: SCHLUESSEL, ANKER: ANKER, FORMAT: FORMAT, HOECHSTENS: HOECHSTENS,
              istAbend: istAbend, startTag: startTag, nachholbar: nachholbar, zielTag: zielTag, nachgetragen: nachgetragen,
              istSozialApp: istSozialApp, ABEND_AB: ABEND_AB, NACHHOLEN: NACHHOLEN, OFFEN: OFFEN };
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

  var daten = { v: FORMAT, eintraege: {} };
  var speicherGeht = true;
  /* 02.10.2026: statt „modus“ (heute/gestern/aendern) ein Tag. Ohne Wahl rechnet zielTag(),
     fuer welchen Tag das Formular steht (abends heute, tagsueber der nachholbare Vortag). */
  var wahlTag = null;          // vom Nutzer gewaehlt: gestern, vorgestern oder heute vor 17 Uhr
  var aendern = false;         // heutigen Eintrag aendern
  var formTag = null;          // fuer diesen Tag steht das Formular gerade
  var gefuelltFuer = null;     // Formular zuletzt fuer diesen Tag gefuellt (Auswahl bleibt beim Neuzeichnen)
  var gewaehlt = 0;            // Zahl 1–10, 0 = noch keine
  var einrichten = false;      // Einstellungen gerade offen
  var linkDaten = null;        // Daten aus einem Mitnehmen-Link, noch nicht uebernommen
  var gezeichnetFuer = "";     // Tag + Tageszeit beim letzten Zeichnen (Rueckkehr in einen alten Tab)
  var persistGefragt = false;

  function heute() { return tagVon(new Date()); }
  function gestern() { return datumText(plusTage(ausText(heute()), -1)); }
  function daten7() { return Object.keys(daten.eintraege).sort(); }
  function tagParam() {
    var m = /[?&]tag=([1-7])(?:&|$)/.exec(window.location.search || "");
    return m ? parseInt(m[1], 10) : 0;
  }
  /* „heute“, „gestern“, „vorgestern“ — weiter zurueck geht kein Formular. */
  function tagWort(t) {
    var a = abstand(t, heute());
    return a === 0 ? "heute" : a === 1 ? "gestern" : "vorgestern";
  }

  /* ---------------------------------------------------------- Speicher */
  /* N2: geladenRev = Revision des Stands, den diese Seite zuletzt gelesen oder geschrieben hat.
     schreibe() ueberschreibt nie einen neueren Stand aus einem anderen Tab (schreibeSicher), sondern
     laedt ihn und zeigt #andererTab. synchron() holt vor jedem Zeichnen einen fremden Stand still nach. */
  var geladenRev = 0, konflikt = false, letzterKonflikt = false;
  function lade() {
    try {
      var roh = window.localStorage.getItem(SCHLUESSEL);
      geladenRev = revVon(roh);
      if (roh) {
        var d = ausSpeicher(roh);
        if (d) { daten = d; }
      }
    } catch (e) {
      speicherGeht = false;
    }
  }
  function synchron() {
    var roh;
    try { roh = window.localStorage.getItem(SCHLUESSEL); } catch (e) { return false; }
    var rev = revVon(roh);
    if (rev === geladenRev) { return false; }
    var neu = null;
    try { neu = ausSpeicher(roh); } catch (e) { neu = null; }
    if (!neu) { return false; }
    daten = neu; geladenRev = rev;
    aendern = false; gefuelltFuer = null;
    fuelleEinrichtung();
    return true;
  }
  function schreibe() {
    letzterKonflikt = false;
    try {
      var e = schreibeSicher(window.localStorage, SCHLUESSEL, daten, geladenRev, false);
      if (e.konflikt) { daten = e.neu; geladenRev = e.rev; konflikt = letzterKonflikt = true; fuelleEinrichtung(); return false; }
      geladenRev = e.rev;
      bitteBehalten();
      return true;
    } catch (e) {
      speicherGeht = false;
      return false;
    }
  }
  /* 02.10.2026 (Punkt 8): den Browser einmal bitten, die Eintraege nicht von selbst zu
     loeschen. Safari/Chrome entscheiden still; schadet nie, Ergebnis egal. Kein Netz. */
  function bitteBehalten() {
    if (persistGefragt) { return; }
    persistGefragt = true;
    try {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then(function () {}, function () {});
      }
    } catch (e) { /* egal */ }
  }
  function loesche() {
    try { window.localStorage.removeItem(SCHLUESSEL); } catch (e) { speicherGeht = false; }
    daten = { v: FORMAT, eintraege: {} };
    geladenRev = 0;
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
    var alt = daten.einstellung, neu = !alt;
    var s = { koffein: schalter("koffein").checked, alkohol: schalter("alkohol").checked,
              suesses: schalter("suesses").checked, tipp: tipp };
    /* 02.10.: Tag der Einrichtung = fruehester Tag zum Nachtragen. Bleibt beim Aendern. */
    if (alt && alt.seit) { s.seit = alt.seit; } else if (neu) { s.seit = heute(); }
    if (alt && alt.tipp7) { s.tipp7 = alt.tipp7; }
    daten.einstellung = s;
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

  /* Formular fuer einen Tag beschriften und fuellen (heute, gestern oder vorgestern). */
  function setzeFormular(tag) {
    var wort = tagWort(tag), istHeute = wort === "heute";
    $("frageEnergie").textContent = "Wie viel Energie hattest du " + wort + " insgesamt?";
    $("frageHaken").firstChild.textContent = "Was hast du " + wort + " gemacht?";
    $("labelSchlaf").textContent = istHeute ? "Letzte Nacht mindestens 7 Stunden geschlafen"
      : wort === "gestern" ? "In der Nacht von vorgestern auf gestern mindestens 7 Stunden geschlafen"
      : "In der Nacht vor diesem Tag mindestens 7 Stunden geschlafen";
    $("gruppeHeute").textContent = erstGross(wort);
    /* 02.10.: Der Tag steht immer mit Datum da — auch um 1 Uhr nachts ist klar, welcher gemeint ist. */
    $("eintragFuer").textContent = "Eintrag für " + (istHeute && new Date().getHours() < TAGESWECHSEL ? "" : wort + ", ") +
      tagLang(tag) + (istHeute && new Date().getHours() < TAGESWECHSEL ? " (bis 4 Uhr nachts zählt noch der Tag davor)" : "");
    zeig($("abendsHinweis"), istHeute);
    zeig($("nachHinweis"), !istHeute);
    fuelle(daten.eintraege[tag] || null);
    gefuelltFuer = tag;
  }

  function speichere(ev) {
    ev.preventDefault();
    if (!gewaehlt) { zeig($("fehltZahl"), true); return; }
    var tag = formTag;
    if (!tag) { male(); return; }
    var neu = !daten.eintraege[tag];
    if (neu && daten7().length >= HOECHSTENS) { male(); return; }
    var gewaehlteHaken = [];
    var h = haken();
    for (var i = 0; i < h.length; i++) { if (h[i].checked) { gewaehlteHaken.push(h[i].value); } }
    var vorher = daten.eintraege[tag], vorherLuecken = daten.luecken;
    /* 02.10.: „am“ = Tag des Eintragens (4-Uhr-Grenze). Liegt er nach dem Tag des Eintrags,
       ist der Eintrag nachgetragen und wird in Kurve und Woche so gekennzeichnet. */
    daten.eintraege[tag] = { energie: gewaehlt, hebel: gewaehlteHaken,
                             gezeigt: aktiveHebel(daten.einstellung).map(function (x) { return x.k; }),
                             am: heute() };
    if (daten.luecken) { daten.luecken = daten.luecken.filter(function (t) { return t !== tag; }); }
    var ok = schreibe();
    /* Abnahme 28.09. (Technik): Ging das Speichern schief, zaehlt der Eintrag nicht mit
       (sonst stand „1 von 7“ da, obwohl nichts gespeichert war). */
    if (!ok && !letzterKonflikt) {
      if (vorher) { daten.eintraege[tag] = vorher; } else { delete daten.eintraege[tag]; }
      daten.luecken = vorherLuecken;
      if (!vorherLuecken) { delete daten.luecken; }
    }
    /* N2: Bei einem Konflikt steht in daten schon der neuere Stand des anderen Tabs, nichts zuruecksetzen. */
    var warHeute = tag === heute();
    wahlTag = null; aendern = false; gefuelltFuer = null;
    male(ok ? (warHeute ? "gespeichert" : "nachgetragen:" + tag) : null);
  }

  /* 02.10.: „Lücke lassen“ — der Tag bleibt leer und wird nicht mehr nachgefragt. */
  function lueckeLassen() {
    var tag = formTag;
    if (!tag || tag === heute()) { return; }
    var vorher = daten.luecken;
    daten.luecken = (daten.luecken || []).filter(function (t) { return t !== tag; }).concat([tag]).sort();
    var ok = schreibe();
    if (!ok && !letzterKonflikt) { daten.luecken = vorher; if (!vorher) { delete daten.luecken; } }
    wahlTag = null; gefuelltFuer = null;
    male(ok ? "luecke" : null);
  }

  /* 02.10. (Befund 5): „Weiß ich nicht“ — vor dem Aufdecken an Tag 7 einmal fragen. */
  function speichereVorher(wert) {
    if (!daten.einstellung) { return; }
    daten.einstellung.tipp7 = wert;
    schreibe();
    male();
    try { $("wocheKarte").scrollIntoView(); } catch (e) { /* egal */ }
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
    /* Nur im Browser einer App auch in die Adresszeile: „Im Browser öffnen“ nimmt die
       Eintraege dann mit. Sonst nicht — die Adresszeile landet im Browserverlauf und mit
       Chrome-/iCloud-Sync beim Anbieter (Recht 28.09., O7). */
    if (istInApp(navigator.userAgent)) {
      try { window.history.replaceState(null, "", link); } catch (e) { /* egal */ }
    }
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
    frageUebernehmen(h.slice(ANKER.length + 1));
  }
  /* 02.10.: auch aus dem Feld „Link einfügen“ (In-App-Browser haben keine Adresszeile). */
  function frageUebernehmen(code) {
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
      var weg = wegfallend(daten, d);
      if (weg.length) {
        satz += " Zusammen wären es mehr als 7 Einträge. Es bleiben die ersten 7, " +
          (weg.length === 1 ? "dieser Tag fällt weg: " : "diese Tage fallen weg: ") +
          weg.map(function (t) { return tagSchild(ausText(t)); }).join(", ");   /* tagSchild endet schon mit „.“ */
      }
    }
    $("uebernehmenText").textContent = satz;
    zeig($("uebernehmen"), true);
    try { $("uebernehmen").scrollIntoView(); } catch (e) { /* egal */ }
  }
  function einfuegen() {
    var v = ($("einfuegenFeld").value || "").trim(), i = v.indexOf("#" + ANKER);
    if (i < 0) { zeig($("linkKaputt"), true); return; }
    frageUebernehmen(v.slice(i + 1 + ANKER.length));
  }

  /* ------------------------------------------------------------ Anzeige */
  function male(meldung) {
    synchron();
    var jetzt = new Date(), H = tagVon(jetzt), abend = istAbend(jetzt);
    gezeichnetFuer = H + (abend ? "a" : "t");
    var tage = daten7();
    var n = tage.length;
    var hatHeute = !!daten.eintraege[H];
    var eingerichtet = !!daten.einstellung;
    var offen = nachholbar(daten, jetzt);
    var nachMeldung = /^nachgetragen:/.test(meldung || "") ? meldung.slice(13) : null;

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

    /* 02.10. (Punkt 6): In TikTok/Instagram/Facebook ohne gespeicherte Daten keine Einrichtung. */
    var sozial = istSozialApp(navigator.userAgent) && !eingerichtet && n === 0;
    var zeigeEinrichtung = !sozial && (einrichten || (!eingerichtet && n < HOECHSTENS));
    zeig($("sozialApp"), sozial);
    zeig($("inApp"), istInApp(navigator.userAgent) && !sozial);
    zeig($("einrichtung"), zeigeEinrichtung);
    zeig($("einrichtungAbbrechen"), einrichten && eingerichtet);
    $("einrichtungSpeichern").textContent = eingerichtet ? "Speichern" : "Einrichtung speichern";
    zeig($("ersterBesuch"), n === 0 && !einrichten);
    zeig($("lesezeichen"), n === 0 && !sozial);
    /* 02.10. (Punkt 6): leerer Speicher bei einer Mail ab Tag 2 — gross, mit Anleitung. */
    zeig($("leerHinweis"), n === 0 && !eingerichtet && tagParam() >= 2);
    zeig($("speicherFehler"), !speicherGeht);
    zeig($("andererTab"), konflikt);
    konflikt = false;
    zeig($("eingerichtet"), meldung === "eingerichtet" && !abend);
    zeig($("eingerichtetAbend"), meldung === "eingerichtet" && abend);
    zeig($("einstellungGespeichert"), meldung === "einstellungGespeichert");
    zeig($("uebernommen"), meldung === "uebernommen");
    zeig($("gespeichert"), meldung === "gespeichert" && n < HOECHSTENS);
    zeig($("gespeichertLetzter"), (meldung === "gespeichert" || !!nachMeldung) && n >= HOECHSTENS);
    if (nachMeldung && n < HOECHSTENS) {
      $("gesternGespeichert").textContent = erstGross(tagWort(nachMeldung)) + " (" + tagSchild(ausText(nachMeldung)) +
        ") ist gespeichert, als nachgetragen." +
        (offen.length || hatHeute || !abend ? "" : " Trag jetzt noch heute ein.");
    }
    zeig($("gesternGespeichert"), !!nachMeldung && n < HOECHSTENS);
    zeig($("lueckeGelassen"), meldung === "luecke");
    zeig($("voll"), n >= HOECHSTENS);

    /* ---- Fuer welchen Tag steht das Formular? (02.10.) */
    if (wahlTag && !(wahlTag === H ? !hatHeute : offen.indexOf(wahlTag) >= 0)) { wahlTag = null; }
    if (aendern && !hatHeute) { aendern = false; }
    var ziel = aendern ? H : (wahlTag || zielTag(daten, jetzt));
    var zeigeFormular = !!ziel && !zeigeEinrichtung && !sozial && (n < HOECHSTENS || aendern);
    formTag = zeigeFormular ? ziel : null;
    zeig($("eintrag"), zeigeFormular);
    if (zeigeFormular && (ziel !== gefuelltFuer || meldung)) { setzeFormular(ziel); }
    if (!zeigeFormular) { gefuelltFuer = null; }

    /* Nachhol-Frage: tagsueber, wenn ein Tag fehlt („Für gestern Abend (Mi 7.10.)?“), oder
       wenn jemand abends „Für gestern eintragen“ gewaehlt hat. Mit „Lücke lassen“. */
    var nachholen = !zeigeEinrichtung && !sozial && n < HOECHSTENS &&
                    ((!abend && offen.length > 0) || (zeigeFormular && ziel !== H));
    zeig($("nachholen"), nachholen);
    if (nachholen) { maleNachholen(ziel, offen, abend, hatHeute, zeigeFormular); }

    /* Vor 17 Uhr: „Heute ab 17 Uhr“ + „trotzdem jetzt eintragen“ (auch am Einrichtungstag). */
    zeig($("abHeuteAbend"), !abend && !hatHeute && n < HOECHSTENS && !zeigeEinrichtung && !sozial && eingerichtet && ziel !== H);
    zeig($("abHeuteSatz"), meldung !== "eingerichtet");   /* direkt nach der Einrichtung sagt #eingerichtet dasselbe */
    zeig($("schonEingetragen"), hatHeute && !aendern && !zeigeEinrichtung && ziel !== H);
    zeig($("naechsterAbend"), n < HOECHSTENS);
    /* Abends: „Gestern vergessen? Für gestern eintragen“ (Video 4, Satz 2), hoechstens 2 Tage zurueck. */
    var zeileZeigen = abend && !zeigeEinrichtung && !sozial && offen.length > 0 && (ziel === H || !ziel) && !aendern;
    zeig($("gesternZeile"), zeileZeigen);
    if (zeileZeigen) {
      var g = offen.indexOf(gestern()) >= 0;
      $("gesternFrage").textContent = g ? "Gestern vergessen?" : "Vorgestern vergessen?";
      zeig($("fuerGestern"), g);
      zeig($("fuerVorgestern"), offen.some(function (t) { return t !== gestern(); }));
    }
    zeig($("fehltZahl"), false);
    zeig($("einstellungenZeile"), !zeigeEinrichtung && eingerichtet);
    zeig($("mitnehmenKnopf"), n > 0);
    zeig($("inAppMitnehmen"), n > 0);
    if (!n) { zeig($("mitnehmenBox"), false); }

    maleKurve(tage);
    maleWoche(tage);
  }

  function maleNachholen(ziel, offen, abend, hatHeute, zeigeFormular) {
    var titel;
    if (ziel && ziel !== heute()) {
      titel = "Für " + tagWort(ziel) + (abend || tagWort(ziel) !== "gestern" ? "" : " Abend") + " (" + tagSchild(ausText(ziel)) + ")?";
    } else {
      titel = "Für welchen Tag trägst du ein?";
    }
    $("nachholTitel").textContent = titel;
    var fehlt = offen.map(function (t) { return tagWort(t); });
    $("nachholText").textContent = (fehlt.length === 2 ? "Für gestern und vorgestern fehlt" :
      fehlt.length === 1 ? "Für " + fehlt[0] + " fehlt" : "Hier fehlt") +
      " noch ein Eintrag. Weißt du es nicht mehr, lass die Lücke: Deine Woche ist fertig, sobald sieben Einträge da sind.";
    var wahl = $("nachholWahl");
    leere(wahl);
    var optionen = offen.slice();
    if ((abend || ziel === heute()) && !hatHeute) { optionen.push(heute()); }
    optionen.sort().reverse();
    if (optionen.length > 1) {
      optionen.forEach(function (t) {
        var l = document.createElement("label");
        var r = document.createElement("input");
        r.type = "radio"; r.name = "nachholTag"; r.value = t; r.checked = t === ziel;
        r.addEventListener("change", function () { wahlTag = t; aendern = false; male(); });
        l.appendChild(r);
        l.appendChild(document.createTextNode(" " + erstGross(tagWort(t)) + ", " + tagSchild(ausText(t))));
        wahl.appendChild(l);
      });
    }
    zeig(wahl, optionen.length > 1);
    zeig($("lueckeLassen"), zeigeFormular && !!ziel && ziel !== heute());
  }

  /* SVG-Kurve: Tag 1 = erster Eintrag, dann Kalendertage. Ein Tag ohne
     Eintrag bleibt leer, die Linie wird dort unterbrochen. */
  function maleKurve(tage) {
    zeig($("kurveBox"), tage.length > 0);
    var box = $("diagramm");
    leere(box);
    var tbody = $("kurveTabelle").querySelector("tbody");
    leere(tbody);
    zeig($("nachLegende"), false);
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

    var vorher = null, nachDa = false;
    for (var i = 0; i < anzahl; i++) {
      var d = plusTage(erster, i);
      var e = daten.eintraege[datumText(d)];
      /* Fassung 3: Die Woche zaehlt Eintraege, keine Kalendertage — die Achse zeigt
         deshalb das Datum, nicht „Tag 1 … Tag 8“. */
      neu("text", { x: x(i), y: H - U + 20, "class": "achse", "text-anchor": "middle" }, WOCHENTAG[d.getDay()]);
      neu("text", { x: x(i), y: H - U + 36, "class": "achse klein", "text-anchor": "middle" }, d.getDate() + "." + (d.getMonth() + 1) + ".");

      var zeile = document.createElement("tr");
      var nach = nachgetragen(datumText(d), e);
      var zellen = [tagSchild(d), e ? String(e.energie) + (nach ? " (nachgetragen)" : "") : "kein Eintrag",
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
      var t2 = datumText(plusTage(erster, j));
      var e2 = daten.eintraege[t2];
      if (e2) {
        /* 02.10.: nachgetragen = hohler Punkt */
        var n2 = nachgetragen(t2, e2);
        if (n2) { nachDa = true; }
        neu("circle", { cx: x(j), cy: y(e2.energie), r: 6, "class": n2 ? "punkt nach" : "punkt" });
        neu("text", { x: x(j), y: y(e2.energie) - 12, "class": "wert", "text-anchor": "middle" }, String(e2.energie));
      }
    }
    box.appendChild(svg);
    zeig($("nachLegende"), nachDa);
  }

  /* „Deine Woche bisher“ ab dem 5. Eintrag, „Deine Woche“ ab dem 7. Kein Sieger. */
  function maleWoche(tage) {
    zeig($("woche"), tage.length > 0);
    zeig($("wocheBald"), tage.length > 0 && tage.length < WOCHE_AB);
    var w = auswerten(daten);
    zeig($("wocheKarte"), w.zeigen);
    ["wocheSchnitt", "wocheSchwankung", "wocheErklaerung", "wocheBester", "wocheSchwaechster",
     "wocheGeschafft", "tippBlock", "wocheGrenze", "wocheNach"].forEach(function (id) { leere($(id)); });
    zeig($("vorherFrage"), false);
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
    zeig($("wocheNach"), !!w.nachSatz);
    if (w.nachSatz) { $("wocheNach").textContent = w.nachSatz; }
    /* 02.10.: „Bevor du's siehst“ — nur bei „Weiß ich nicht“, einmal, ueberspringbar. */
    if (w.frageTag7) {
      var wahl = $("vorherWahl");
      leere(wahl);
      aktiveHebel(daten.einstellung).forEach(function (h) {
        var l = document.createElement("label");
        var r = document.createElement("input");
        r.type = "radio"; r.name = "vorher"; r.value = h.k;
        l.appendChild(r);
        l.appendChild(document.createTextNode(" " + h.tipp));
        wahl.appendChild(l);
      });
      zeig($("vorherFehlt"), false);
      zeig($("vorherFrage"), true);
    }
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
    /* Abnahme 28.09. abends (MUSS 4): eigene Dateinamen fuer Fassung 3. Das alte
       onboarding-tag1 (verneinte Haekchen) erscheint hier nie; /kurve/ behaelt es. */
    var basis = "../videos/f3-tag" + tag;
    /* Fassung 3: Ausnahme-Kasten zum Tag, auch ohne Videodatei */
    zeig($("ausnahme3"), tag === 3);
    zeig($("ausnahme5"), tag === 5);
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

  /* 02.10. (Punkt 7, Loop #159/#1709): Kommt die Seite zurueck (Tab von gestern, Zurueck-Cache,
     17-Uhr-Grenze bei offener Seite), wird der Tag neu berechnet und neu gezeichnet — nicht nur,
     wenn sich der Speicher geaendert hat. */
  function rueckkehr() {
    var j = new Date(), stand = tagVon(j) + (istAbend(j) ? "a" : "t");
    var neu = synchron();
    if (!neu && stand === gezeichnetFuer) { return; }
    if (stand.slice(0, 10) !== gezeichnetFuer.slice(0, 10)) { wahlTag = null; aendern = false; gefuelltFuer = null; }
    male();
  }

  /* ---------------------------------------------------------- Verdrahtung */
  document.addEventListener("DOMContentLoaded", function () {
    lade();
    zeig($("amPC"), istAmPC(navigator.userAgent) && !(navigator.maxTouchPoints > 1));
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
    $("fuerGestern").addEventListener("click", function () { wahlTag = gestern(); aendern = false; male(); });
    $("fuerVorgestern").addEventListener("click", function () {
      wahlTag = datumText(plusTage(ausText(heute()), -2)); aendern = false; male();
    });
    $("trotzdemJetzt").addEventListener("click", function () { wahlTag = heute(); aendern = false; male(); });
    $("lueckeLassen").addEventListener("click", lueckeLassen);
    $("aendern").addEventListener("click", function () {
      aendern = true; wahlTag = null; gefuelltFuer = null;
      male();
    });
    $("vorherJa").addEventListener("click", function () {
      var r = document.querySelector('input[name="vorher"]:checked');
      if (!r) { zeig($("vorherFehlt"), true); return; }
      speichereVorher(r.value);
    });
    $("vorherNein").addEventListener("click", function () { speichereVorher(OFFEN); });
    $("mitnehmenKnopf").addEventListener("click", mitnehmen);
    $("inAppMitnehmen").addEventListener("click", function () {
      mitnehmen();
      $("mitnehmen").scrollIntoView();
    });
    $("kopieren").addEventListener("click", kopiere);
    $("einfuegenKnopf").addEventListener("click", einfuegen);
    $("uebernehmenJa").addEventListener("click", function () {
      if (!linkDaten) { return; }   /* Abnahme 28.09.: Doppeltipp warf einen TypeError */
      synchron();                   /* N2: auf den neuesten Stand legen, nicht auf den beim Laden */
      daten = zusammen(daten, linkDaten);
      linkDaten = null;
      zeig($("uebernehmen"), false);
      ohneAnker();
      var ok = schreibe();
      fuelleEinrichtung();
      wahlTag = null; aendern = false; gefuelltFuer = null;
      male(ok ? "uebernommen" : null);
    });
    $("uebernehmenNein").addEventListener("click", function () {
      linkDaten = null;
      zeig($("uebernehmen"), false);
      ohneAnker();
    });
    window.addEventListener("hashchange", pruefeAnker);
    /* N2: Ein anderer Tab hat geschrieben / Seite aus dem Zurueck-Cache / Tab wieder sichtbar → neu lesen.
       02.10.: bei Rueckkehr auch neu zeichnen, wenn sich der Tag oder die 17-Uhr-Grenze geaendert hat. */
    window.addEventListener("storage", function (e) { if ((e.key === SCHLUESSEL || e.key === null) && synchron()) { male(); } });
    window.addEventListener("pageshow", rueckkehr);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") { rueckkehr(); } });
    window.setInterval(function () { if (document.visibilityState !== "hidden") { rueckkehr(); } }, 60000);
    $("loeschen").addEventListener("click", function () { zeig($("loeschenFrage"), true); });
    $("loeschenNein").addEventListener("click", function () { zeig($("loeschenFrage"), false); });
    $("loeschenJa").addEventListener("click", function () {
      loesche();
      zeig($("loeschenFrage"), false);
      wahlTag = null; aendern = false; gefuelltFuer = null;
      einrichten = false;
      fuelleEinrichtung();
      male();
    });
    male();
    pruefeAnker();
  });
})();
