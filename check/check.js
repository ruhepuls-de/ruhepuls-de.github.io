/* Schlaf-Check — Ruhepuls
   Alles laeuft im Browser. Kein Server, kein Tracking, keine Cookies.
   Gespeichert wird nur das letzte Ergebnis in localStorage, damit ein
   versehentliches Neuladen die sieben Fragen nicht wegwirft.

   REGEL: Jede Regel unten muss in der KOMMENTAR.md ihres Videos belegt sein.
   Geprueft von scripts/pruefe-check.py — das Skript wird rot, wenn nicht.
*/
(function () {
  "use strict";

  var KANAL_TIKTOK = "https://www.tiktok.com/@ruhepuls.de";

  /* ---------- Die Regeln. Zitate woertlich aus public/<id>/skript.txt ---------- */
  var REGELN = {
    warmDuschen: {
      video: "v43",
      stichworte: ["Haghayegh", "10 Minuten"],
      titel: "Warm duschen, ein bis zwei Stunden vorher",
      zitat: "Zum Einschlafen muss dein Körper innen kühler werden. Warmes Wasser öffnet die Gefäße, deshalb kann die Wärme über Hände und Füße raus, und innen wird es kühler. Zehn Minuten warm duschen, ein bis zwei Stunden vor dem Bett.",
      studie: "Systematische Übersicht über 5.322 gesichtete Arbeiten, 17 ausgewertet: warmes Duschen oder Baden ein bis zwei Stunden vor dem Bett, ab zehn Minuten, verkürzte die Einschlafzeit (Haghayegh et al., Sleep Medicine Reviews 2019).",
      youtube: "https://youtu.be/BLa4VXTeZyM"
    },
    nichtVersuchen: {
      video: "v55",
      stichworte: ["Broomfield", "Paradoxe Intention"],
      titel: "Hör auf, es zu versuchen",
      zitat: "Aber Einschlafen ist nichts, was man macht. Es passiert, wenn du es nicht mehr willst. Wer sich zum Schlafen zwingt, hält sich wach. Also hör auf, es zu versuchen.",
      studie: "Menschen mit Einschlafproblemen wurden gebeten, im Bett bewusst wach zu bleiben. Nach zwei Wochen schliefen sie schneller ein als die Vergleichsgruppe (Broomfield & Espie, Behavioural and Cognitive Psychotherapy 2003; Meta-Analyse Jansson-Fröjmark et al., Sleep Medicine Reviews 2021).",
      youtube: null
    },
    zwanzigMinuten: {
      video: "v56",
      stichworte: ["Ohayon", "Durchschlaf"],
      titel: "Die Zwanzig-Minuten-Regel",
      zitat: "Denn du programmierst dein Bett gerade um: auf wach. Also steh nach zwanzig Minuten auf und geh erst müde zurück.",
      studie: "24.600 Befragte in vier europäischen Ländern: nachts aufwachen kam häufiger vor als nicht einschlafen können (Ohayon & Roth, Journal of Psychiatric Research 2001).",
      youtube: null
    },
    handyAusserReichweite: {
      video: "v45",
      stichworte: ["COSMOS", "Auvinen"],
      titel: "Nicht das Gerät weckt dich, deine Hand",
      zitat: "Was messbar stört, ist etwas anderes, weil es dich aufweckt: dass du danach greifst. Ein Blick auf die Uhr, eine Nachricht, und dein Kopf rechnet wieder. Also leg es dorthin, wo du es im Liegen nicht erreichst.",
      studie: "Über 100.000 Erwachsene, jahrelang begleitet, mit den echten Nutzungsdaten der Mobilfunkanbieter: zwischen Strahlung und schlechtem Schlaf fand sich kein Zusammenhang — die Nutzung wirkt, das Feld nicht (COSMOS, Auvinen et al., Environment International 2019).",
      youtube: "https://youtu.be/kk2FK0fXo4M"
    },
    weckerTest: {
      video: "v53",
      stichworte: ["Hirshkowitz", "7–9"],
      titel: "Der Wecker-Test",
      zitat: "Acht ist ein Durchschnitt, nicht dein Wert. Die gesunde Spanne liegt zwischen sieben und neun. Ob du genug hast, sagt dir nicht die Uhr, sondern der Wecker. Wachst du vor ihm auf, reicht es. Weckt er dich, fehlt etwas.",
      studie: "Eine Expertengruppe der National Sleep Foundation sichtete die Studienlage und empfiehlt für Erwachsene einen Bereich von 7–9 Stunden, keine einzelne Zahl (Hirshkowitz et al., Sleep Health 2015).",
      youtube: null
    },
    vorhangZu: {
      video: "v48",
      stichworte: ["Cordi", "1.265"],
      titel: "Nicht der Mond, das Licht im Zimmer",
      zitat: "Nicht der Mond hält dich wach, sondern das Licht im Zimmer. Wer den Mond dafür verantwortlich macht, sucht nie weiter. Also mach abends den Vorhang zu.",
      studie: "Ein Treffer an 33 Personen wurde bekannt; dieselbe Rechnung an 1.265 Personen ergab nichts — ein Lehrbuchfall für den Publikationsbias (Cordi et al., Current Biology 2014).",
      youtube: "https://youtu.be/zzw0ofurivo"
    },
    einerVonVier: {
      video: "v28",
      stichworte: ["Léger", "12.637"],
      titel: "Ausschlafen holt es nicht zurück",
      zitat: "Bei nur einem von vier reichten Ausschlafen und Nickerchen zusammen, um den Rückstand aufzuholen. Bei den anderen drei blieb er stehen, obwohl sie länger schliefen.",
      studie: "Repräsentative Befragung von 12.637 Erwachsenen (Léger et al., Sleep Medicine 2020).",
      youtube: "https://youtu.be/J3srQNZ8xvk"
    },
    eigenerRhythmus: {
      video: "v24",
      stichworte: ["Tiefschlaf", "erste Nachthälfte"],
      titel: "Der Rhythmus zählt, nicht die Uhrzeit",
      zitat: "Gemeint ist die erste Hälfte deines Schlafs, nicht die erste Hälfte der Uhr. Was dich wirklich Tiefschlaf kostet, ist gegen deinen eigenen Rhythmus zu schlafen. Nicht die Zahl auf dem Wecker.",
      studie: "Der Tiefschlaf (N3) fällt größtenteils in die erste Nachthälfte — gemessen ab dem Einschlafen, nicht an der Uhrzeit.",
      youtube: null
    },
    inhaltNichtLicht: {
      video: "v33",
      stichworte: ["4,86 Minuten", "Blaulichtfilter"],
      titel: "Nicht das Blaulicht, der Inhalt",
      zitat: "Was dich wach hält, ist deshalb nicht das Licht, sondern das, was du liest. Aber wer den Filter anschaltet und weiterscrollt, ändert genau das Falsche.",
      studie: "Meta-Analyse randomisierter Cross-over-Studien: Brillen mit Blaulichtfilter verkürzten die Einschlafzeit um im Mittel 4,86 Minuten — statistisch nicht bedeutsam.",
      youtube: "https://youtu.be/dGJywp-UteQ"
    },
    vierStunden: {
      video: "v47",
      stichworte: ["vier Stunden", "Afaghi"],
      titel: "Vier Stunden Abstand, nicht acht Uhr",
      zitat: "Nicht die Uhr entscheidet, sondern der Abstand zum Bett. Also rechne rückwärts, nicht nach der Uhr: vier Stunden vor dem Bett. Wer um zehn schläft, isst um sechs.",
      studie: "Dieselbe Mahlzeit vier Stunden statt eine Stunde vor dem Bett: die Teilnehmer schliefen schneller ein (Afaghi et al., American Journal of Clinical Nutrition 2007).",
      youtube: null
    },
    toleranzInTagen: {
      video: "v54",
      stichworte: ["Richardson", "Toleranz"],
      titel: "Höchstens ein paar Nächte",
      zitat: "Man hat Leute vier Tage lang damit versorgt. Am vierten Tag machte es nicht müder als eine Zuckertablette. Der Körper gewöhnt sich in Tagen daran. Also höchstens ein paar Nächte, nie auf Dauer.",
      studie: "50 mg Diphenhydramin über vier Tage: am vierten Tag war die Wirkung von Placebo nicht mehr zu unterscheiden — Toleranz in Tagen (Richardson et al., Journal of Clinical Psychopharmacology 2002).",
      youtube: null
    },
    zwoelfMinuten: {
      video: "v26",
      stichworte: ["zwölf Minuten", "Unter fünf Minuten"],
      titel: "Wach liegen ist kein Fehler",
      zitat: "Im Schnitt brauchen Gesunde knapp zwölf Minuten. Unter fünf gilt als schwerer Schlafmangel. Die Minuten, in denen du wach liegst, sind kein Fehler. Sie sind der Beleg.",
      studie: "Schlafmedizinischer Normwert: Gesunde brauchen im Mittel rund zwölf Minuten zum Einschlafen; unter fünf Minuten gilt als Zeichen für erheblichen Schlafmangel.",
      youtube: "https://youtu.be/79PnN6DD6vc"
    }
  };

  /* ---------- Die Fragen ---------- */
  var FRAGEN = [
    { id: "einschlafen", text: "Wie lange brauchst du abends, bis du eingeschlafen bist?",
      zusatz: "Geschätzt, an einem normalen Wochentag.",
      optionen: [
        { text: "Unter 15 Minuten", wert: 0 },
        { text: "15 bis 30 Minuten", wert: 1 },
        { text: "30 bis 60 Minuten", wert: 2 },
        { text: "Über eine Stunde", wert: 3 }
      ]},
    { id: "durchschlafen", text: "Wachst du nachts auf und bleibst dann länger als 20 Minuten wach?",
      zusatz: "Kurz aufwachen und wieder wegdriften zählt nicht.",
      optionen: [
        { text: "Nie", wert: 0 },
        { text: "Manchmal, ein-, zweimal die Woche", wert: 2 },
        { text: "Oft, die meisten Nächte", wert: 4 }
      ]},
    { id: "frueh", text: "Wachst du morgens deutlich vor dem Wecker auf und kommst nicht mehr in den Schlaf zurück?",
      zusatz: "Gemeint ist eine Stunde oder mehr zu früh.",
      optionen: [
        { text: "Nie", wert: 0 },
        { text: "Manchmal", wert: 2 },
        { text: "Oft, die meisten Nächte", wert: 4 }
      ]},
    { id: "wochenende", text: "Wie viel später stehst du am Wochenende auf als unter der Woche?",
      zusatz: "Aufstehzeit Samstag oder Sonntag minus Aufstehzeit Dienstag.",
      optionen: [
        { text: "Weniger als eine Stunde", wert: 0 },
        { text: "Ein bis zwei Stunden", wert: 2 },
        { text: "Mehr als zwei Stunden", wert: 4 }
      ]},
    { id: "koffein", text: "Trinkst du nach 14 Uhr noch Kaffee, Cola oder Energydrinks?",
      zusatz: "",
      optionen: [
        { text: "Nie", wert: 0 },
        { text: "Manchmal", wert: 1 },
        { text: "Fast jeden Tag", wert: 2 }
      ]},
    { id: "bildschirm", text: "Liegst du im Bett noch am Handy, Tablet oder Fernseher?",
      zusatz: "Gemeint ist: schon liegend, nicht davor auf dem Sofa.",
      optionen: [
        { text: "Nie", wert: 0 },
        { text: "Manchmal", wert: 1 },
        { text: "Jeden Abend", wert: 2 }
      ]},
    { id: "schlafmittel", text: "Nimmst du Schlafmittel aus der Apotheke, die es ohne Rezept gibt?",
      zusatz: "Zum Beispiel Doxylamin oder Diphenhydramin.",
      optionen: [
        { text: "Nein, noch nie", wert: 0 },
        { text: "Ja, ab und zu", wert: 2 },
        { text: "Ja, seit Monaten regelmäßig", wert: 3 }
      ]},
    { id: "alter", text: "Wie alt bist du?", optional: true,
      zusatz: "Nur zur Auswertung. Du kannst die Frage überspringen.",
      optionen: [
        { text: "Unter 30", wert: 0 },
        { text: "30 bis 45", wert: 1 },
        { text: "45 bis 60", wert: 2 },
        { text: "Über 60", wert: 3 }
      ]}
  ];

  /* ---------- Die Muster ---------- */
  var MUSTER = [
    { id: "einschlafen", name: "Einschlaf-Muster",
      satz: "Bei dir liegt der Abend im Weg: Bis der Schlaf kommt, vergeht Zeit. Die zwei Regeln dazu greifen an zwei verschiedenen Stellen an — eine an der Temperatur, eine am Kopf.",
      regeln: ["warmDuschen", "nichtVersuchen"],
      punkte: function (a) { return a.einschlafen * 1.6; } },

    { id: "durchschlafen", name: "Durchschlaf-Muster",
      satz: "Bei dir liegt die Mitte der Nacht im Weg: Einschlafen geht, aber irgendwann bist du wach und bleibst es. Das ist die häufigste der drei Formen, nicht die seltene.",
      regeln: ["zwanzigMinuten", "handyAusserReichweite"],
      punkte: function (a) { return a.durchschlafen * 1.5; } },

    { id: "frueh", name: "Früh-wach-Muster",
      satz: "Bei dir liegt das Ende der Nacht im Weg: Du bist vor dem Wecker wach und kommst nicht mehr zurück. Ob das ein Problem ist, entscheidet nicht die Uhrzeit, sondern wie du dich tagsüber fühlst.",
      regeln: ["weckerTest", "vorhangZu"],
      punkte: function (a) { return a.frueh * 1.5; } },

    { id: "wochenende", name: "Wochenend-Versatz",
      satz: "Bei dir liegt nicht die einzelne Nacht im Weg, sondern der Sprung zwischen Woche und Wochenende. Dein Körper bekommt zweimal pro Woche eine neue Zeitzone.",
      regeln: ["einerVonVier", "eigenerRhythmus"],
      punkte: function (a) { return a.wochenende * 1.4; } },

    { id: "gewohnheit", name: "Gewohnheits-Muster",
      satz: "Deine Nächte selbst sind unauffällig — auffällig ist, was davor passiert. Bildschirm, Essenszeit und Tablette sind Stellschrauben, an denen du heute Abend drehen kannst, ohne etwas zu kaufen.",
      regeln: ["inhaltNichtLicht", "vierStunden"],
      regelnWennSchlafmittel: ["toleranzInTagen", "inhaltNichtLicht"],
      punkte: function (a) {
        var nacht = a.einschlafen + a.durchschlafen + a.frueh + a.wochenende;
        var g = (a.koffein + a.bildschirm) * 1.3 + a.schlafmittel * 1.3;
        /* Klemmt die Nacht selbst, ist das Muster dort — sonst stuende
           "Deine Naechte sind unauffaellig" ueber einer schlechten Nacht. */
        return nacht >= 4 ? 0 : g;
      } },

    { id: "ruhig", name: "Kein auffälliges Muster",
      satz: "Deine Antworten zeigen kein Muster, an dem etwas klemmt. Dann geht es bei dir nicht ums Reparieren, sondern ums Halten — und um die Frage, ob deine Stundenzahl wirklich deine ist.",
      regeln: ["weckerTest", "zwoelfMinuten"],
      punkte: function () { return 0.5; } }
  ];

  /* ---------- Ablauf ---------- */
  var SPEICHER = "ruhepuls-check-v1";
  var antworten = {}, schritt = 0;

  var $ = function (id) { return document.getElementById(id); };
  var zeig = function (el, an) { el.classList[an ? "remove" : "add"]("weg"); };

  function starte() {
    antworten = {}; schritt = 0;
    zeig($("start"), false); zeig($("ergebnis"), false); zeig($("fragen"), true);
    male();
    window.scrollTo(0, 0);
  }

  function male() {
    var f = FRAGEN[schritt];
    var pflicht = FRAGEN.filter(function (x) { return !x.optional; }).length;
    $("zaehler").textContent = f.optional
      ? "Noch eine Frage — freiwillig"
      : "Frage " + (schritt + 1) + " von " + pflicht;
    $("balken").style.width = Math.round((Math.min(schritt, pflicht) / pflicht) * 100) + "%";
    $("fragetext").textContent = f.text;
    $("fragezusatz").textContent = f.zusatz || "";
    var box = $("antworten");
    box.innerHTML = "";
    f.optionen.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "antwort"; b.textContent = o.text;
      b.addEventListener("click", function () { antwortGeben(f.id, o.wert); });
      box.appendChild(b);
    });
    zeig($("zurueck"), schritt > 0);
    zeig($("ueberspringen"), !!f.optional);
  }

  function antwortGeben(id, wert) {
    antworten[id] = wert;
    weiter();
  }

  function weiter() {
    schritt++;
    if (schritt >= FRAGEN.length) { auswerten(); } else { male(); window.scrollTo(0, 0); }
  }

  function auswerten() {
    FRAGEN.forEach(function (f) { if (typeof antworten[f.id] !== "number") { antworten[f.id] = 0; } });
    var beste = null;
    MUSTER.forEach(function (m) {
      var p = m.punkte(antworten);
      if (!beste || p > beste.p) { beste = { m: m, p: p }; }
    });
    var m = beste.m;
    var regelIds = (m.regelnWennSchlafmittel && antworten.schlafmittel > 0)
      ? m.regelnWennSchlafmittel.slice() : m.regeln.slice();
    if (antworten.schlafmittel >= 2 && regelIds.indexOf("toleranzInTagen") < 0) {
      regelIds[1] = "toleranzInTagen";
    }
    zeigeErgebnis(m, regelIds);
    try { localStorage.setItem(SPEICHER, JSON.stringify({ muster: m.id, antworten: antworten })); } catch (e) {}
  }

  function zeigeErgebnis(m, regelIds) {
    $("musterName").textContent = m.name;
    $("musterSatz").textContent = m.satz;
    var box = $("regeln");
    box.innerHTML = "";
    regelIds.forEach(function (rid, i) {
      var r = REGELN[rid];
      var d = document.createElement("div");
      d.className = "regel";
      var h = document.createElement("h3");
      h.textContent = "Regel " + (i + 1) + ": " + r.titel;
      var z = document.createElement("blockquote");
      z.className = "zitat"; z.textContent = "„" + r.zitat + "“";
      var s = document.createElement("p");
      s.className = "studie"; s.textContent = r.studie;
      var v = document.createElement("p");
      v.className = "videos";
      var a1 = document.createElement("a");
      a1.href = KANAL_TIKTOK; a1.target = "_blank"; a1.rel = "noopener";
      a1.textContent = "Das Video auf TikTok →";
      v.appendChild(a1);
      if (r.youtube) {
        var a2 = document.createElement("a");
        a2.href = r.youtube; a2.target = "_blank"; a2.rel = "noopener";
        a2.textContent = "auf YouTube →";
        v.appendChild(a2);
      }
      d.appendChild(h); d.appendChild(z); d.appendChild(s); d.appendChild(v);
      box.appendChild(d);
    });
    $("balken").style.width = "100%";
    zeig($("fragen"), false); zeig($("ergebnis"), true);
    window.scrollTo(0, 0);
    merkeTeilText(m);
  }

  var teilText = "";
  function merkeTeilText(m) {
    teilText = "Mein Ergebnis beim Schlaf-Check von Ruhepuls: " + m.name + ". " +
               m.satz + " Zwei Minuten, sieben Fragen: " + ort();
  }
  function ort() {
    return location.href.split("#")[0].split("?")[0];
  }

  /* ---------- Verdrahtung ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    $("losgehts").addEventListener("click", starte);
    $("nochmal").addEventListener("click", starte);
    $("zurueck").addEventListener("click", function () {
      if (schritt > 0) { schritt--; male(); window.scrollTo(0, 0); }
    });
    $("ueberspringen").addEventListener("click", weiter);
    $("teilen").addEventListener("click", function () {
      var status = $("teilenStatus");
      if (navigator.share) {
        navigator.share({ title: "Schlaf-Check von Ruhepuls", text: teilText, url: ort() })
          .catch(function () {});
        return;
      }
      var fertig = function () { status.textContent = "Link und Ergebnis kopiert."; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(teilText).then(fertig, function () {
          status.textContent = "Kopieren hat nicht geklappt — der Link steht oben in der Adresszeile.";
        });
      } else {
        status.textContent = "Der Link steht oben in der Adresszeile.";
      }
    });
  });
})();
