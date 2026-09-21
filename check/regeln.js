/* Schlaf-Check — Fragen, Regeln, Auswertung.
   Reine Daten und Logik, kein DOM. check.js zeigt nur an, was hier
   herauskommt; scripts/pruefe-check.py laesst dieselbe Datei in node
   laufen und prueft das Ergebnis.

   REGEL (geprueft von scripts/pruefe-check.py):
   - Jede Regel hat quelle + link. Ein Video ist freiwillig.
   - Jede Frage hat mindestens einen Ausloeser.
   - Fuer jede maximal auffaellige Antwort steht die zugehoerige Regel
     im Ergebnis.
   - Der Tipp darf nicht mehr sagen als die Quelle.
*/
(function (global) {
  "use strict";

  var LEITLINIE =
    "Spiegelhalder, Riemann u. a. (2025): S3-Leitlinie „Insomnie bei " +
    "Erwachsenen“, Update 2025, AWMF 063-003, Deutsche Gesellschaft für " +
    "Schlafforschung und Schlafmedizin";
  var LEITLINIE_LINK = "https://register.awmf.org/de/leitlinien/detail/063-003";

  /* ---------------------------------------------------------- Die Regeln */
  var REGELN = {
    warmDuschen: {
      titel: "Dusch warm, ein bis zwei Stunden vor dem Bett",
      tipp:
        "Zehn Minuten warm duschen oder baden reichen. Wichtig ist der " +
        "Abstand: ein bis zwei Stunden vorher, nicht kurz vor dem Hinlegen. " +
        "Eine Auswertung von 17 Studien fand danach eine kürzere Einschlafzeit.",
      quelle:
        "Haghayegh u. a. (2019): Before-bedtime passive body heating by warm " +
        "shower or bath to improve sleep. Sleep Medicine Reviews 46, 124–135",
      link: "https://doi.org/10.1016/j.smrv.2019.04.008",
      video: "v43"
    },

    nichtErzwingen: {
      titel: "Hör auf, das Einschlafen zu erzwingen",
      tipp:
        "Leg dich hin und nimm dir vor, wach zu bleiben. Das klingt verdreht " +
        "und ist eine anerkannte Technik: Sie heißt paradoxe Intention. Die " +
        "deutsche Leitlinie führt sie als wirksam auf und stützt sich dabei " +
        "auf eine Übersicht mehrerer Studien.",
      quelle:
        LEITLINIE +
        ", Abschnitt Kognitive Verhaltenstherapie für Insomnie; dort zitiert: " +
        "Jansson-Fröjmark u. a. (2022), Journal of Sleep Research 31",
      link: LEITLINIE_LINK,
      video: "v55"
    },

    bettzeit: {
      titel: "Verbring nicht mehr Zeit im Bett, als du schläfst",
      tipp:
        "Wer nachts lange wach liegt, geht oft früher ins Bett — und liegt " +
        "dann noch länger wach. Die Leitlinie macht es andersherum: die " +
        "Bettzeit auf die Zeit kürzen, die du wirklich schläfst, nie unter " +
        "viereinhalb Stunden. Mach das nicht allein, sondern mit ärztlicher " +
        "oder therapeutischer Begleitung. Am Anfang wirst du müder.",
      quelle: LEITLINIE + ", Tabelle 7 „Instruktionen der Bettzeitrestriktion“",
      link: LEITLINIE_LINK,
      video: null
    },

    dreiFormen: {
      titel: "Nachts wach werden ist die häufigere Form",
      tipp:
        "Schlecht schlafen heißt nicht nur, abends nicht einschlafen zu " +
        "können. In einer Befragung von 24.600 Menschen in sechs " +
        "europäischen Ländern berichteten 18 von 100 einen unterbrochenen " +
        "Schlaf und 10 von 100 Einschlafprobleme. Du bist damit nicht der " +
        "Sonderfall.",
      quelle:
        "Ohayon & Roth (2001): What are the contributing factors for insomnia " +
        "in the general population? Journal of Psychosomatic Research 51(6), " +
        "745–755",
      link: "https://doi.org/10.1016/S0022-3999(01)00285-9",
      video: "v56"
    },

    weckerTest: {
      titel: "Rechne nach, wie viele Stunden es wirklich waren",
      tipp:
        "Früh wach heißt nicht automatisch zu wenig. Eine Fachgruppe hat die " +
        "Studienlage gesichtet und empfiehlt Erwachsenen sieben bis neun " +
        "Stunden, älteren Menschen sieben bis acht. Das ist eine Spanne, " +
        "keine feste Zahl. Liegst du darin, fehlt dir nichts.",
      quelle:
        "Hirshkowitz u. a. (2015): National Sleep Foundation’s sleep time " +
        "duration recommendations. Sleep Health 1(1), 40–43",
      link: "https://doi.org/10.1016/j.sleh.2014.12.010",
      video: "v53"
    },

    abklaeren: {
      titel: "Lass das ärztlich abklären",
      tipp:
        "Mehrmals pro Woche und länger als drei Monate — ab da spricht die " +
        "internationale Krankheitsklassifikation ICD-11 von einer chronischen " +
        "insomnischen Störung. Das gehört in eine Sprechstunde. Die Leitlinie " +
        "sieht dafür ein Gespräch, eine körperliche Untersuchung und ein " +
        "Schlaftagebuch vor. Nimm dieses Ergebnis mit.",
      quelle: LEITLINIE + ", Empfehlung D1 und die ICD-11-Kriterien",
      link: LEITLINIE_LINK,
      video: null
    },

    kvti: {
      titel: "Die erste Behandlung ist keine Tablette",
      tipp:
        "So steht es wörtlich in der deutschen Leitlinie: Die kognitive " +
        "Verhaltenstherapie für Insomnie „soll bei allen Patientinnen und " +
        "Patienten mit Insomnie als erste Behandlungsoption empfohlen " +
        "werden“. Frag in der Praxis danach, bevor du zu Mitteln greifst.",
      quelle: LEITLINIE + ", Empfehlung T1",
      link: LEITLINIE_LINK,
      video: null
    },

    tagIstMassstab: {
      titel: "Der Tag ist der Maßstab, nicht die Uhr",
      tipp:
        "Ob dein Schlaf ein Problem ist, entscheidet nicht die Stundenzahl. " +
        "Die Leitlinie fragt zuerst, ob du mit deinem Schlaf unzufrieden bist " +
        "und ob du am Tag etwas davon merkst. Wer kurz schläft und sich " +
        "tagsüber wohlfühlt, hat kein Schlafproblem.",
      quelle: LEITLINIE + ", Abschnitt Diagnostik, Empfehlung D1",
      link: LEITLINIE_LINK,
      video: null
    },

    stehAuf: {
      titel: "Steh auf, wenn du nach einer Viertelstunde noch wach bist",
      tipp:
        "Die Leitlinie sagt es so: Wenn du nach 15 Minuten noch wach bist, " +
        "steh auf und mach etwas Angenehmes. Geh erst zurück ins Bett, wenn " +
        "du schläfrig bist. Wiederhol das, so oft es nötig ist.",
      quelle: LEITLINIE + ", Tabelle 8 „Instruktionen zur Stimuluskontrolle“",
      link: LEITLINIE_LINK,
      video: "v15"
    },

    bettNurZumSchlafen: {
      titel: "Das Bett ist zum Schlafen da",
      tipp:
        "Auch das steht so in der Leitlinie: Benutz das Bett nur zum Schlafen " +
        "und für Sex. Nicht zum Lesen, Trinken, Rauchen oder Fernsehen. Und " +
        "schau nachts nicht auf die Uhr.",
      quelle: LEITLINIE + ", Tabelle 8 und Tabelle 6 „Regeln für einen gesunden Schlaf“",
      link: LEITLINIE_LINK,
      video: null
    },

    festeAufstehzeit: {
      titel: "Steh jeden Morgen zur gleichen Zeit auf",
      tipp:
        "Ein Satz aus der Leitlinie, ohne Bedingung: „Stehen Sie jeden Morgen " +
        "zur gleichen Uhrzeit auf.“ Am Wochenende auch. Der Satz danach " +
        "lautet: „Legen Sie sich tagsüber nicht hin.“",
      quelle: LEITLINIE + ", Tabelle 8, Punkte 5 und 6",
      link: LEITLINIE_LINK,
      video: null
    },

    nachholen: {
      titel: "Ausschlafen holt wenig zurück",
      tipp:
        "Am Wochenende länger schlafen gleicht den Rückstand selten aus. In " +
        "einer Befragung von über 12.000 Erwachsenen in Frankreich hatte rund " +
        "ein Viertel einen starken Schlafrückstand. Davon holten 18 von 100 " +
        "ihn am Wochenende auf und 7 von 100 mit einem Nickerchen. Die " +
        "übrigen taten nichts dagegen.",
      quelle:
        "Léger u. a. (2020): Napping and weekend catchup sleep do not fully " +
        "compensate for high rates of sleep debt and short sleep at a " +
        "population level. Sleep Medicine 74, 278–288",
      link: "https://doi.org/10.1016/j.sleep.2020.05.030",
      video: "v28"
    },

    koffeinAbstand: {
      titel: "Die letzte Tasse liegt weiter zurück, als du denkst",
      tipp:
        "Eine Auswertung von 24 Studien rechnet vor: Eine normale Tasse " +
        "Kaffee mit 107 Milligramm Koffein sollte mindestens 8,8 Stunden vor " +
        "dem Zubettgehen getrunken sein, damit sie die Schlafdauer nicht mehr " +
        "verkürzt. Die deutsche Leitlinie sagt es kürzer: nach dem " +
        "Mittagessen nichts Koffeinhaltiges mehr.",
      quelle:
        "Gardiner u. a. (2023): The effect of caffeine on subsequent sleep. " +
        "Sleep Medicine Reviews 69, 101764 · " +
        LEITLINIE +
        ", Tabelle 6",
      link: "https://doi.org/10.1016/j.smrv.2023.101764",
      video: "v66"
    },

    mehrKoffein: {
      titel: "Mehr Koffein macht den Kopf nicht wacher",
      tipp:
        "In einem Versuch mit 369 Erwachsenen holte Koffein den täglichen " +
        "Kaffeetrinkern die Wachheit zurück, die ihnen ohne Kaffee fehlte — " +
        "mehr nicht. Bei Menschen, die fast nie Koffein trinken, stieg die " +
        "Wachheit im Kopf gar nicht, weil die Unruhe den Gewinn auffraß. " +
        "Schneller wurden nur die Finger.",
      quelle:
        "Rogers u. a. (2013): Faster but not smarter — effects of caffeine " +
        "and caffeine withdrawal on alertness and performance. " +
        "Psychopharmacology 226(2), 229–240",
      link: "https://doi.org/10.1007/s00213-012-2889-4",
      video: "v70"
    }
  };

  /* --------------------------------------------------------- Die Fragen
     Acht Fragen. Die ersten fünf bilden nach, wonach die S3-Leitlinie in
     der Anamnese fragt (Einschlafen, Durchschlafen, frühes Erwachen,
     Dauer, Beeinträchtigung am Tag). Die letzten drei fragen nach dem
     Verhalten, für das es in der Leitlinie konkrete Anweisungen gibt.
     Begründung je Frage: check/README.md. */
  var FRAGEN = [
    {
      id: "einschlafen",
      text: "Wie lange brauchst du abends, bis du eingeschlafen bist?",
      zusatz: "Geschätzt, an einem normalen Wochentag.",
      optionen: [
        { text: "Meistens unter 15 Minuten", wert: 0, bezug: "du abends schnell einschläfst" },
        { text: "15 bis 30 Minuten", wert: 1, bezug: "du abends bis zu einer halben Stunde brauchst" },
        { text: "30 bis 60 Minuten", wert: 2, bezug: "du abends eine halbe bis eine Stunde wach liegst" },
        { text: "Meistens über eine Stunde", wert: 3, bezug: "du abends über eine Stunde wach liegst" }
      ],
      ausloeser: [
        { ab: 2, regel: "warmDuschen", schwere: 5 },
        { ab: 2, regel: "nichtErzwingen", schwere: 5 }
      ]
    },
    {
      id: "durchschlafen",
      text: "Wachst du nachts auf und liegst dann längere Zeit wach?",
      zusatz: "Kurz aufwachen und gleich wieder wegdriften zählt nicht.",
      optionen: [
        { text: "So gut wie nie", wert: 0, bezug: "du nachts durchschläfst" },
        { text: "Ein- bis zweimal pro Woche", wert: 1, bezug: "du ein- bis zweimal pro Woche nachts wach liegst" },
        { text: "Drei- bis viermal pro Woche", wert: 2, bezug: "du an mehreren Nächten pro Woche wach liegst" },
        { text: "Fast jede Nacht", wert: 3, bezug: "du fast jede Nacht wach liegst" }
      ],
      ausloeser: [
        { ab: 1, regel: "dreiFormen", schwere: 2 },
        { ab: 2, regel: "bettzeit", schwere: 6 }
      ]
    },
    {
      id: "frueh",
      text: "Wachst du morgens zu früh auf und schläfst nicht mehr ein?",
      zusatz: "Gemeint ist: eine Stunde oder mehr vor dem Wecker.",
      optionen: [
        { text: "So gut wie nie", wert: 0, bezug: "du morgens nicht zu früh wach wirst" },
        { text: "Ein- bis zweimal pro Woche", wert: 1, bezug: "du ein- bis zweimal pro Woche zu früh wach wirst" },
        { text: "Drei- bis viermal pro Woche", wert: 2, bezug: "du an mehreren Morgen pro Woche zu früh wach wirst" },
        { text: "Fast jeden Morgen", wert: 3, bezug: "du fast jeden Morgen zu früh wach wirst" }
      ],
      ausloeser: [
        { ab: 1, regel: "dreiFormen", schwere: 2 },
        { ab: 2, regel: "weckerTest", schwere: 5 }
      ]
    },
    {
      id: "dauer",
      text: "Seit wann geht das so?",
      zusatz: "Gemeint sind die Nächte, nach denen du unzufrieden aufwachst.",
      optionen: [
        { text: "Ich schlafe eigentlich gut", wert: 0, bezug: "du gut schläfst" },
        { text: "Ein paar Nächte, seit Kurzem", wert: 1, bezug: "es bei dir erst seit Kurzem vorkommt" },
        { text: "Mehrmals pro Woche, seit weniger als drei Monaten", wert: 2, bezug: "es mehrmals pro Woche vorkommt, seit weniger als drei Monaten" },
        { text: "Mehrmals pro Woche, seit mehr als drei Monaten", wert: 3, bezug: "es mehrmals pro Woche vorkommt, und das seit mehr als drei Monaten" }
      ],
      ausloeser: [
        { ab: 3, regel: "abklaeren", schwere: 10 }
      ]
    },
    {
      id: "tagsueber",
      text: "Merkst du am Tag etwas von deinem Schlaf?",
      zusatz: "Zum Beispiel Müdigkeit, Konzentration, Stimmung, Antrieb.",
      optionen: [
        { text: "Nein, ich komme gut durch den Tag", wert: 0, bezug: "du gut durch den Tag kommst" },
        { text: "Ein bisschen", wert: 1, bezug: "du am Tag ein bisschen davon merkst" },
        { text: "Deutlich", wert: 2, bezug: "du am Tag deutlich etwas davon merkst" },
        { text: "Sehr stark, es zieht sich durch alles", wert: 3, bezug: "dich das am Tag sehr stark belastet" }
      ],
      ausloeser: [
        { ab: 1, regel: "tagIstMassstab", schwere: 2 },
        { ab: 2, regel: "kvti", schwere: 8 }
      ]
    },
    {
      id: "wachliegen",
      text: "Wenn du nachts wach liegst — was machst du dann?",
      zusatz: "",
      optionen: [
        { text: "Das kommt bei mir nicht vor", wert: 0, bezug: "du nachts nicht wach liegst" },
        { text: "Ich stehe auf und mache etwas Ruhiges", wert: 0, bezug: "du dabei aufstehst" },
        { text: "Ich bleibe liegen und warte, bis es wieder klappt", wert: 2, bezug: "du liegen bleibst und wartest" },
        { text: "Ich nehme das Handy oder mache den Fernseher an", wert: 3, bezug: "du im Bett zum Handy oder zum Fernseher greifst" }
      ],
      ausloeser: [
        { ab: 2, regel: "stehAuf", schwere: 6 },
        { ab: 3, regel: "bettNurZumSchlafen", schwere: 4 }
      ]
    },
    {
      id: "rhythmus",
      text: "Wie viel später stehst du am Wochenende auf als unter der Woche?",
      zusatz: "Aufstehzeit am Samstag oder Sonntag minus Aufstehzeit am Dienstag.",
      optionen: [
        { text: "Höchstens eine halbe Stunde", wert: 0, bezug: "du am Wochenende fast zur gleichen Zeit aufstehst" },
        { text: "Eine halbe bis eine Stunde", wert: 1, bezug: "du am Wochenende bis zu einer Stunde später aufstehst" },
        { text: "Ein bis zwei Stunden", wert: 2, bezug: "du am Wochenende ein bis zwei Stunden später aufstehst" },
        { text: "Mehr als zwei Stunden", wert: 3, bezug: "du am Wochenende mehr als zwei Stunden später aufstehst" }
      ],
      ausloeser: [
        { ab: 2, regel: "festeAufstehzeit", schwere: 4 },
        { ab: 3, regel: "nachholen", schwere: 3 }
      ]
    },
    {
      id: "koffein",
      text: "Wann trinkst du dein letztes Koffein?",
      zusatz: "Kaffee, Cola, Energydrink oder schwarzer Tee.",
      optionen: [
        { text: "Ich trinke so etwas nicht", wert: 0, bezug: "du kein Koffein trinkst" },
        { text: "Vormittags", wert: 0, bezug: "du Koffein nur vormittags trinkst" },
        { text: "Am frühen Nachmittag", wert: 2, bezug: "du dein letztes Koffein am frühen Nachmittag trinkst" },
        { text: "Am späten Nachmittag oder abends", wert: 3, bezug: "du noch am späten Nachmittag oder abends Koffein trinkst" }
      ],
      ausloeser: [
        { ab: 2, regel: "koffeinAbstand", schwere: 5 },
        { ab: 3, regel: "mehrKoffein", schwere: 3 }
      ]
    }
  ];

  /* Wer nirgends auffaellig ist, bekommt diese zwei Regeln zum Halten. */
  var HALTEN = ["festeAufstehzeit", "bettNurZumSchlafen"];

  var UNAUFFAELLIG = {
    titel: "Bei dir ist nichts auffällig",
    satz:
      "Keine deiner Antworten zeigt ein Muster, an dem etwas klemmt. Dann " +
      "geht es bei dir nicht ums Reparieren, sondern ums Halten. Diese zwei " +
      "Regeln sind die, die deinen Schlaf stabil halten."
  };

  var AUFFAELLIG = {
    titel: "Das ist an deinen Antworten aufgefallen",
    satz:
      "Diese Regeln gehören zu den Antworten, die am stärksten auffallen. " +
      "Zu jeder steht, worauf sie sich bezieht und woher sie kommt."
  };

  /* ------------------------------------------------------ Die Auswertung
     antworten: { frageId: gewaehlterIndex }
     Ergebnis: { unauffaellig, titel, satz, treffer: [ {regelId, regel,
                 bezug, frageId, punkte} ] } — hoechstens drei, nach
     Punkten sortiert. */
  function werteAus(antworten) {
    var treffer = [];
    var gesehen = {};

    FRAGEN.forEach(function (f) {
      var i = antworten[f.id];
      if (typeof i !== "number" || !f.optionen[i]) { return; }
      var o = f.optionen[i];
      f.ausloeser.forEach(function (a) {
        if (o.wert < a.ab) { return; }
        var punkte = a.schwere + o.wert;
        if (gesehen[a.regel]) {
          if (punkte > gesehen[a.regel].punkte) {
            gesehen[a.regel].punkte = punkte;
            gesehen[a.regel].bezug = o.bezug;
            gesehen[a.regel].frageId = f.id;
          }
          return;
        }
        var t = {
          regelId: a.regel,
          regel: REGELN[a.regel],
          bezug: o.bezug,
          frageId: f.id,
          punkte: punkte
        };
        gesehen[a.regel] = t;
        treffer.push(t);
      });
    });

    if (!treffer.length) {
      return {
        unauffaellig: true,
        titel: UNAUFFAELLIG.titel,
        satz: UNAUFFAELLIG.satz,
        treffer: HALTEN.map(function (id) {
          return { regelId: id, regel: REGELN[id], bezug: null, frageId: null, punkte: 0 };
        })
      };
    }

    treffer.sort(function (a, b) { return b.punkte - a.punkte; });
    var zeigen = treffer.slice(0, 3);

    /* Steht nur eine Regel da, kommt eine Regel zum Halten dazu — damit
       das Ergebnis nie aus einem einzelnen Satz besteht. */
    if (zeigen.length === 1) {
      for (var k = 0; k < HALTEN.length; k++) {
        if (HALTEN[k] !== zeigen[0].regelId) {
          zeigen.push({
            regelId: HALTEN[k], regel: REGELN[HALTEN[k]],
            bezug: null, frageId: null, punkte: 0
          });
          break;
        }
      }
    }

    return {
      unauffaellig: false,
      titel: AUFFAELLIG.titel,
      satz: AUFFAELLIG.satz,
      treffer: zeigen
    };
  }

  var API = {
    REGELN: REGELN,
    FRAGEN: FRAGEN,
    HALTEN: HALTEN,
    werteAus: werteAus
  };

  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
  if (global) { global.RUHEPULS_REGELN = API; }
})(typeof window !== "undefined" ? window : null);
