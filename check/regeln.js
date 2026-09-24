/* Energie-Check — Fragen, Regeln, Auswertung.  Stand 24.09.2026.
   Reine Daten und Logik, kein DOM.

   Texte: „(C) Abteilung Produkt & Text — Energie-Check, 7 Tage,
   Tag-7-Angebot (24.09.2026)“, Abschnitt 1.3–1.5, woertlich.
   Fragen, Ausloeser, Konflikte, Profil-Logik: „(C) Abteilung Fach —
   Energie-Check, Fragen und Regeln (24.09.2026)“, Abschnitt 4.
   Entscheidungen: „(C) Entscheidungen Energie-Check — Liam (24.09.2026)“,
   F1–F6 und der Umbau U1–U3 (Nachtrag ~18:00): Der Check ist ein Werkzeug
   fuer Gesunde, kein Symptom-Check. Keine Warnzeichen-Frage, keine
   Triage, jeder bekommt den Mail-Block. Sechs Fragen.
   Zweiter Schritt (Regel, 24.09. abends): Kein Ergebnis und kein Profil
   verweist in die Praxis. Raus sind die Arzt-Regeln zur Dauer der
   Muedigkeit (muedeTrotzSchlaf, vierWochen), das Profil „Das gehört in die
   Hausarztpraxis“, der Bluttest-Kasten, die KVT-I-Karte (verwies in die
   Praxis, hing an der Dauer) und damit die Frage „Seit wann …“. Der
   Hinweis auf die Praxis steht nur noch im festen Hinweis am Ende.

   REGEL (geprueft von scripts/pruefe-check.py):
   - Jede Regel hat titel, tipp, kurz, quelle (mit Jahr), link, gruppe.
   - Jede Frage hat mindestens einen Ausloeser.
   - Fuer jede maximal auffaellige Antwort steht die zugehoerige Regel
     im Ergebnis.
   - Keine Regel erscheint ohne ihre Voraussetzung (`nurWenn`, `undWenn`,
     `nichtWenn`, `nurAntwort`) — alle sitzen in ausloeserGilt().
   - Zwei Regeln aus KONFLIKTE stehen nie im selben Ergebnis.
   - Jede Reihenfolge (reihenfolge()) enthaelt den Mail-Block (U2).
   - Die Bewegungs-Regel traegt den PEM-Satz (U1).
   - Kein Ergebnis, kein Profil verweist in die Praxis; kein Bluttest,
     keine Laborliste (Zweig t).
   - Der Tipp darf nicht mehr sagen als die Quelle.
*/
(function (global) {
  "use strict";

  var INSOMNIE =
    "Spiegelhalder, Riemann u. a. (2025): S3-Leitlinie „Insomnie bei " +
    "Erwachsenen“";
  var INSOMNIE_LINK = "https://register.awmf.org/de/leitlinien/detail/063-003";

  /* ---------------------------------------------------------- Die Regeln
     gruppe "hebel": etwas, das man selbst aendern kann (Karten). Eine
     andere Gruppe gibt es nicht mehr: Der Check triagiert nicht. */
  var REGELN = {

    /* ---------- Hebel, Domaene schlaf ---------- */

    schlafDauer: {
      gruppe: "hebel", domaene: "schlaf",
      titel: "Gib dir regelmäßig sieben Stunden Schlaf",
      tipp:
        "Die beiden großen Fachgesellschaften für Schlafmedizin in den USA " +
        "empfehlen Erwachsenen, regelmäßig sieben Stunden oder mehr zu " +
        "schlafen. Weniger bringen sie unter anderem mit schlechterer " +
        "Leistung und mehr Fehlern in Verbindung. In einem Laborversuch mit " +
        "48 Erwachsenen sank die Leistung nach zwei Wochen mit sechs Stunden " +
        "im Bett deutlich. Die Teilnehmer selbst merkten davon wenig.",
      kurz: "Watson u. a., Sleep 2015",
      quelle:
        "Watson u. a. (2015): Recommended Amount of Sleep for a Healthy " +
        "Adult: A Joint Consensus Statement of the American Academy of Sleep " +
        "Medicine and Sleep Research Society. Sleep 38(6), 843–844 · Van " +
        "Dongen u. a. (2003): The cumulative cost of additional wakefulness. " +
        "Sleep 26(2), 117–126",
      link: "https://doi.org/10.5665/sleep.4716",
      video: "v53"
    },

    stehAuf: {
      gruppe: "hebel", domaene: "schlaf",
      titel: "Steh auf, wenn du nach einer Viertelstunde noch wach bist",
      tipp:
        "Die Leitlinie sagt es so: Bist du nach 15 Minuten noch wach, abends " +
        "oder nachts, steh auf und mach etwas Angenehmes. Geh erst zurück " +
        "ins Bett, wenn du schläfrig bist. Wiederhol das, so oft es nötig " +
        "ist. Am Anfang kann dich das müder machen. Fährst du Auto oder " +
        "arbeitest an Maschinen, sprich vorher ärztlich darüber. Die " +
        "Leitlinie warnt davor.",
      kurz: "S3-Leitlinie Insomnie, 2025",
      quelle:
        INSOMNIE + ", Update 2025, AWMF 063-003, Deutsche Gesellschaft für " +
        "Schlafforschung und Schlafmedizin, Tabelle 8 „Instruktionen zur " +
        "Stimuluskontrolle“, Punkte 3 und 4, und der Hinweis zur Vorsicht im " +
        "Abschnitt KVT-I",
      link: INSOMNIE_LINK,
      video: "v15"
    },

    nickerchenBeiSchlafproblem: {
      gruppe: "hebel", domaene: "schlaf",
      titel: "Wenn du nachts wach liegst: tagsüber besser nicht hinlegen",
      tipp:
        "In Studien machte ein Nickerchen gesunde Erwachsene wacher. Wer " +
        "aber nachts oft wach liegt, bekommt von der deutschen " +
        "Schlaf-Leitlinie einen anderen Rat: „Legen Sie sich tagsüber nicht " +
        "hin.“",
      kurz: "S3-Leitlinie Insomnie, 2025",
      quelle:
        INSOMNIE + ", AWMF 063-003, Tabelle 8 · Mesas u. a. (2023): British " +
        "Journal of Sports Medicine 57(7), 417–426 · Leong, Lo & Chee " +
        "(2022): Sleep Medicine Reviews 65, 101666",
      link: INSOMNIE_LINK,
      video: null
    },

    /* nur HALTEN, kein Ausloeser */
    festeAufstehzeit: {
      gruppe: "hebel", domaene: "schlaf",
      titel: "Steh jeden Morgen zur gleichen Zeit auf",
      tipp:
        "Die Leitlinie gibt Menschen mit Schlafproblemen diesen Satz mit: " +
        "„Stehen Sie jeden Morgen zur gleichen Uhrzeit auf.“ Am Wochenende " +
        "auch. In einer Auswertung von über 60.000 Menschen in Großbritannien " +
        "hing ein regelmäßiger Schlafrhythmus stärker mit einem längeren " +
        "Leben zusammen als die Schlafdauer. Das ist ein Zusammenhang, kein " +
        "Beweis.",
      kurz: "S3-Leitlinie Insomnie, 2025",
      quelle:
        INSOMNIE + ", AWMF 063-003, Tabelle 8, Punkt 5 · Windred u. a. " +
        "(2024): Sleep regularity is a stronger predictor of mortality risk " +
        "than sleep duration. Sleep 47(1), zsad253",
      link: INSOMNIE_LINK,
      video: null
    },

    /* ---------- Hebel, Domaene trinken ---------- */

    koffeinAbstand: {
      gruppe: "hebel", domaene: "trinken",
      titel: "Die letzte Tasse liegt weiter zurück, als du denkst",
      tipp:
        "Koffein gegen die Müdigkeit kann die nächste Nacht stören. Eine " +
        "Auswertung von 24 Studien rechnet vor: Eine Tasse Kaffee mit 107 " +
        "Milligramm Koffein sollte mindestens 8,8 Stunden vor dem " +
        "Zubettgehen getrunken sein, damit sie die Schlafdauer nicht mehr " +
        "verkürzt. Die deutsche Schlaf-Leitlinie sagt es einfacher: nach dem " +
        "Mittagessen nichts Koffeinhaltiges mehr, auch keinen schwarzen Tee " +
        "und keine Cola.",
      kurz: "Gardiner u. a., Sleep Medicine Reviews 2023",
      quelle:
        "Gardiner u. a. (2023): The effect of caffeine on subsequent sleep. " +
        "Sleep Medicine Reviews 69, 101764 · " + INSOMNIE + ", AWMF 063-003, " +
        "Tabelle 6",
      link: "https://doi.org/10.1016/j.smrv.2023.101764",
      video: "v66"
    },

    mehrKaffee: {
      gruppe: "hebel", domaene: "trinken",
      titel: "Noch eine Tasse hebt vor allem den Entzug auf", // Recht 24.09., G5
      tipp:
        "In einem Doppelblindversuch mit 369 Erwachsenen kamen " +
        "Gewohnheitstrinker mit Koffein nur auf die Wachheit, die " +
        "Nicht-Trinker ohne Koffein ohnehin hatten. Die Tasse hob vor allem " +
        "den Entzug seit der letzten auf. Die Autoren schließen, dass " +
        "regelmäßiges Koffein die geistige Wachheit nicht steigert. " +
        "Schneller reagieren ließ es alle. (Doppelblind heißt: Weder die " +
        "Teilnehmer noch die Versuchsleiter wussten, wer Koffein bekam.)",
      kurz: "Rogers u. a., Psychopharmacology 2013",
      quelle:
        "Rogers, Heatherley, Mullings & Smith (2013): Faster but not " +
        "smarter: effects of caffeine and caffeine withdrawal on alertness " +
        "and performance. Psychopharmacology 226(2), 229–240",
      link: "https://doi.org/10.1007/s00213-012-2889-4",
      video: "v70"
    },

    alkoholEnergie: {
      gruppe: "hebel", domaene: "trinken",
      titel: "Das Glas am Abend kann Erholung kosten", // Recht 24.09., G6
      tipp:
        "Die Leitlinie der Hausärzte zur Müdigkeit schreibt: Alkohol am " +
        "Abend kann dazu führen, dass der Schlaf weniger erholsam wird. Eine " +
        "Auswertung von 27 Schlaflabor-Studien zeigt, was sich messen lässt: " +
        "Schon bei der kleinsten untersuchten Menge gab es weniger " +
        "REM-Schlaf, also weniger von der Schlafphase mit schnellen " +
        "Augenbewegungen. Mit jeder größeren Menge wurde es mehr. Schneller " +
        "eingeschlafen wurde erst bei viel Alkohol.",
      kurz: "DEGAM-Leitlinie Müdigkeit 2022 · Gardiner u. a. 2025",
      quelle:
        "Baum, Lindner, Maisel (2022): DEGAM-Patienteninformation " +
        "„Müdigkeit“ zur S3-Leitlinie Müdigkeit, AWMF 053-002, Deutsche " +
        "Gesellschaft für Allgemeinmedizin und Familienmedizin · Gardiner " +
        "u. a. (2025): The effect of alcohol on subsequent sleep in healthy " +
        "adults. Sleep Medicine Reviews 80, 102030",
      link: "https://doi.org/10.1016/j.smrv.2024.102030",
      video: "v76"
    },

    /* ---------- Hebel, Domaene tag ---------- */

    /* auch HALTEN. Traegt den PEM-Satz (U1): Die Frage nach Anstrengung
       gibt es nicht mehr, deshalb steht die Sicherheit im Text selbst
       (DEGAM 6.5 C). Geprueft in pruefe-check.py, Zweig s. */
    bewegungRegelmaessig: {
      gruppe: "hebel", domaene: "tag",
      titel: "Regelmäßig bewegen: mittel, nicht hart",
      tipp:
        "In einer Auswertung von 81 Studien mit 7.050 Menschen fühlten sich " +
        "die Teilnehmer nach einem Bewegungsprogramm mittlerer Stärke " +
        "weniger müde und energiegeladener als die Vergleichsgruppen. Wer " +
        "trainierte und wer nicht, entschied dabei der Zufall. Die Effekte " +
        "sind klein bis mittel. Die Leitlinie der Hausärzte nennt Bewegung " +
        "bei Müdigkeit mit einem Zusatz: beobachten, wie du darauf " +
        "reagierst, und anpassen. Haut dich schon leichte Anstrengung " +
        "tagelang um, lass das erst abklären, bevor du mehr machst.",
      kurz: "Wender u. a., Frontiers in Psychology 2022",
      quelle:
        "Wender, Manninen & O'Connor (2022): The Effect of Chronic Exercise " +
        "on Energy and Fatigue States: A Systematic Review and Meta-Analysis " +
        "of Randomized Trials. Frontiers in Psychology 13, 907637 · DEGAM " +
        "S3-Leitlinie „Müdigkeit“ (2022), AWMF 053-002, Empfehlungen 6.5 B " +
        "und 6.5 C",
      link: "https://doi.org/10.3389/fpsyg.2022.907637",
      video: "v78"
    },

    zuckerTief: {
      gruppe: "hebel", domaene: "tag",
      titel: "Süßes macht dich im Tief nicht wacher",
      tipp:
        "Eine Auswertung von 31 Studien mit 1.259 Erwachsenen fand: Nach " +
        "Zucker waren die Teilnehmer in der ersten Stunde müder und weniger " +
        "wach als nach einem Placebo, also einem Scheinmittel ohne Zucker. " +
        "Eine bessere Stimmung fand sich zu keinem Zeitpunkt. Getestet " +
        "wurden vor allem junge Erwachsene, meist nüchtern.",
      kurz: "Mantantzis u. a., Neuroscience & Biobehavioral Reviews 2019",
      quelle:
        "Mantantzis, Schlaghecken, Sünram-Lea & Maylor (2019): Sugar rush " +
        "or sugar crash? A meta-analysis of carbohydrate effects on mood. " +
        "Neuroscience & Biobehavioral Reviews 101, 45–67",
      link: "https://doi.org/10.1016/j.neubiorev.2019.03.016",
      video: "v68"
    },

    pauseMachen: {
      gruppe: "hebel", domaene: "tag",
      titel: "Mach im Tief fünf bis zehn Minuten Pause",
      tipp:
        "Eine Auswertung von 22 Studien mit 2.335 Menschen fand: Kurze " +
        "Pausen von höchstens zehn Minuten machten wacher und weniger " +
        "erschöpft. Die Effekte sind klein. Die Arbeitsleistung insgesamt " +
        "stieg dadurch nicht messbar. Sie sank aber auch nicht.",
      kurz: "Albulescu u. a., PLOS ONE 2022",
      quelle:
        "Albulescu u. a. (2022): „Give me a break!“ A systematic review and " +
        "meta-analysis on the efficacy of micro-breaks for increasing " +
        "well-being and performance. PLOS ONE 17(8), e0272460",
      link: "https://doi.org/10.1371/journal.pone.0272460",
      video: "v72"
    }
  };

  /* ------------------------------------------------- Bedingungen (Fach 4.3) */
  var WACH = { eineVon: ["wachliegen"], ab: 2 };

  /* --------------------------------------------------------- Die Fragen
     Sechs Fragen (F1, Umbau U1: die Warnzeichen-Frage ist raus; die Frage
     nach der Dauer ist raus, weil sie nur noch in die Praxis verwies).
     Reihenfolge = Ablauf. `wert` 0–3. */
  var FRAGEN = [
    {
      id: "schlafdauer",
      text: "Wie viele Stunden schläfst du an einem normalen Werktag? Gemeint ist wirklich geschlafen, nicht nur im Bett gelegen.",
      zusatz: "Geschätzt, in den letzten vier Wochen.",
      optionen: [
        { text: "7 Stunden oder mehr", wert: 0, bezug: "Du schläfst an Werktagen 7 Stunden oder mehr" },
        { text: "6 bis 7 Stunden", wert: 2, bezug: "Du schläfst an Werktagen 6 bis 7 Stunden" },
        { text: "5 bis 6 Stunden", wert: 3, bezug: "Du schläfst an Werktagen 5 bis 6 Stunden" },
        { text: "Weniger als 5 Stunden", wert: 3, bezug: "Du schläfst an Werktagen weniger als 5 Stunden" }
      ],
      ausloeser: [
        /* kurz UND wach liegen -> Stimuluskontrolle, nicht "mehr Bettzeit" */
        { ab: 2, regel: "schlafDauer", schwere: 10, nichtWenn: WACH }
      ]
    },
    {
      id: "wachliegen",
      text: "Wie oft liegst du abends oder nachts länger als eine halbe Stunde wach?",
      zusatz: "",
      optionen: [
        { text: "So gut wie nie", wert: 0, bezug: "Du liegst so gut wie nie lange wach" },
        { text: "Ein- bis zweimal pro Woche", wert: 1, bezug: "Du liegst ein- bis zweimal pro Woche über eine halbe Stunde wach" },
        { text: "Drei- bis viermal pro Woche", wert: 2, bezug: "Du liegst drei- bis viermal pro Woche über eine halbe Stunde wach" },
        { text: "Fast jede Nacht", wert: 3, bezug: "Du liegst fast jede Nacht über eine halbe Stunde wach" }
      ],
      ausloeser: [
        { ab: 2, regel: "stehAuf", schwere: 9 }
      ]
    },
    {
      id: "koffein",
      text: "Wie viele Stunden vor dem Schlafengehen trinkst du dein letztes Koffein?",
      zusatz: "Kaffee, Cola, Energydrink, schwarzer oder grüner Tee. An einem normalen Tag.",
      optionen: [
        { text: "Ich trinke kein Koffein", wert: 0, bezug: "Du trinkst kein Koffein" },
        { text: "9 Stunden oder mehr vorher", wert: 0, bezug: "Dein letztes Koffein liegt 9 Stunden oder mehr vor dem Schlafengehen" },
        { text: "6 bis 9 Stunden vorher", wert: 2, bezug: "Dein letztes Koffein liegt 6 bis 9 Stunden vor dem Schlafengehen" },
        { text: "Weniger als 6 Stunden vorher", wert: 3, bezug: "Dein letztes Koffein liegt weniger als 6 Stunden vor dem Schlafengehen" }
      ],
      ausloeser: [
        { ab: 2, regel: "koffeinAbstand", schwere: 6 }
      ]
    },
    {
      id: "alkohol",
      text: "An wie vielen Abenden pro Woche trinkst du Alkohol? Auch ein einzelnes Glas zählt.",
      zusatz: "",
      optionen: [
        { text: "An keinem", wert: 0, bezug: "Du trinkst abends keinen Alkohol" },
        { text: "An einem", wert: 1, bezug: "Du trinkst an einem Abend pro Woche Alkohol" },
        { text: "An zwei bis drei", wert: 2, bezug: "Du trinkst an zwei bis drei Abenden pro Woche Alkohol" },
        { text: "An vier oder mehr", wert: 3, bezug: "Du trinkst an vier oder mehr Abenden pro Woche Alkohol" }
      ],
      ausloeser: [
        { ab: 2, regel: "alkoholEnergie", schwere: 6 }
      ]
    },
    {
      id: "bewegung",
      text: "An wie vielen Tagen pro Woche bewegst du dich mindestens eine halbe Stunde so, dass du etwas schneller atmest?",
      zusatz: "Zügig gehen, Rad fahren, Sport, Gartenarbeit: Alles zählt.",
      optionen: [
        { text: "An 5 oder mehr Tagen", wert: 0, bezug: "Du bewegst dich an 5 oder mehr Tagen pro Woche" },
        { text: "An 3 bis 4 Tagen", wert: 0, bezug: "Du bewegst dich an 3 bis 4 Tagen pro Woche" },
        { text: "An 1 bis 2 Tagen", wert: 2, bezug: "Du bewegst dich an 1 bis 2 Tagen pro Woche eine halbe Stunde" },
        { text: "An keinem", wert: 3, bezug: "Du bewegst dich an keinem Tag pro Woche eine halbe Stunde" }
      ],
      ausloeser: [
        /* PEM-Sicherheit steht im Tipp selbst (U1), keine Sperre mehr. */
        { ab: 2, regel: "bewegungRegelmaessig", schwere: 7 }
      ]
    },
    {
      id: "tief",
      text: "Was machst du meistens, wenn dich am Nachmittag das Tief erwischt?",
      zusatz: "",
      /* fuenf Antworten, Index 0–4 — wichtig fuer nurAntwort */
      optionen: [
        { text: "Das Tief kenne ich kaum", wert: 0, bezug: "Das Nachmittagstief kennst du kaum" },
        { text: "Ich greife zu Süßem, Cola oder einem Energydrink", wert: 3, bezug: "Im Tief greifst du zu Süßem, Cola oder einem Energydrink" },
        { text: "Ich trinke noch einen Kaffee", wert: 2, bezug: "Im Tief trinkst du noch einen Kaffee" },
        { text: "Ich beiße mich ohne Pause durch", wert: 2, bezug: "Im Tief beißt du dich ohne Pause durch" },
        { text: "Ich lege mich kurz hin", wert: 0, bezug: "Im Tief legst du dich kurz hin" }
      ],
      ausloeser: [
        { ab: 3, regel: "zuckerTief", schwere: 5, nurAntwort: { frage: "tief", index: [1] } },
        { ab: 2, regel: "pauseMachen", schwere: 4, nurAntwort: { frage: "tief", index: [1, 3] } },
        { ab: 2, regel: "mehrKaffee", schwere: 4, nurAntwort: { frage: "tief", index: [2] } },
        { ab: 0, regel: "nickerchenBeiSchlafproblem", schwere: 5,
          nurAntwort: { frage: "tief", index: [4] }, nurWenn: WACH }
      ]
    }
  ];

  /* Nur wenn kein Hebel greift (Fach 4.4 Nr. 7). */
  var HALTEN = ["bewegungRegelmaessig", "festeAufstehzeit"];

  /* Regelpaare, die nicht nebeneinander stehen duerfen. Es bleibt die
     Regel mit den mehr Punkten. */
  var KONFLIKTE = [
    ["schlafDauer", "stehAuf"]             // mehr Bettzeit vs. Stimuluskontrolle (Netz zu nichtWenn)
  ];

  /* Paar-Regel (Fach 4.4 Nr. 3): zuckerTief hat keine Handlung aus der
     eigenen Quelle, pauseMachen rueckt direkt dahinter. */
  var PAAR = ["zuckerTief", "pauseMachen"];

  /* Profil-Texte (Produkt & Text 1.4 [B]) */
  var PROFILE = {
    schlaf: {
      titel: "Dein größter Hebel ist der Schlaf",
      satz: "Die meisten deiner Antworten zeigen auf die Nacht. Die Leitlinie der Hausärzte sagt: Gewohnheitsmäßig zu wenig Schlaf führt zu Müdigkeit am Tag."
    },
    trinken: {
      titel: "Dein größter Hebel ist, was du trinkst",
      satz: "Die meisten deiner Antworten betreffen Koffein und Alkohol. Beide verändern den Schlaf, der danach kommt. Das zeigen zwei Auswertungen mit zusammen 51 Studien."
    },
    tag: {
      titel: "Dein größter Hebel ist dein Tag",
      satz: "Die meisten deiner Antworten betreffen Bewegung und das Nachmittagstief. Die Effekte in den Studien dazu sind klein bis mittel."
    },
    /* Kein Hebel: neutral, ohne Arzt, ohne Wirkversprechen (Regel,
       24.09. abends). Darunter der Mail-Block, danach die zwei Halte-Karten. */
    unauffaellig: {
      titel: "Bei dir klemmt wenig",
      satz: "Bei deinen Antworten sticht keine Gewohnheit heraus. Ob kleine Dinge bei dir mit besseren Tagen zusammenfallen, kannst du an deiner eigenen Kurve beobachten."
    }
  };

  var DOMAENEN = ["schlaf", "trinken", "tag"]; // Reihenfolge = Gleichstand-Regel

  /* Eine Bedingung {eineVon, ab}: mindestens eine der Fragen hat einen
     Wert >= ab. */
  function bedingung(b, antworten) {
    for (var i = 0; i < FRAGEN.length; i++) {
      var f = FRAGEN[i];
      if (b.eineVon.indexOf(f.id) < 0) { continue; }
      var k = antworten[f.id];
      if (typeof k !== "number" || !f.optionen[k]) { continue; }
      if (f.optionen[k].wert >= b.ab) { return true; }
    }
    return false;
  }

  function antwortIst(b, antworten) {
    var i = antworten[b.frage];
    return typeof i === "number" && b.index.indexOf(i) >= 0;
  }

  /* Ein Ausloeser kann bis zu vier Zusatzbedingungen haben:
     nurWenn / undWenn — muessen erfuellt sein,
     nichtWenn        — darf NICHT erfuellt sein,
     nurAntwort       — die Frage muss mit einer dieser Optionen
                        (Index) beantwortet sein.
     pruefe-check.py ruft nur ausloeserGilt() auf und rechnet damit alle
     automatisch mit. */
  function ausloeserGilt(a, antworten) {
    if (a.nurWenn && !bedingung(a.nurWenn, antworten)) { return false; }
    if (a.undWenn && !bedingung(a.undWenn, antworten)) { return false; }
    if (a.nichtWenn && bedingung(a.nichtWenn, antworten)) { return false; }
    if (a.nurAntwort && !antwortIst(a.nurAntwort, antworten)) { return false; }
    return true;
  }

  function halteEintrag(id) {
    return { regelId: id, regel: REGELN[id], bezug: null, frageId: null,
             punkte: 0, schwere: 0, ordnung: 999, halten: true };
  }

  function ids(liste) { return liste.map(function (t) { return t.regelId; }); }

  /* ------------------------------------------------------ Die Auswertung
     Rueckgabe (Produkt & Text 5.2):
     { profil, titel, satz, hebel: [Top 3],
       ausserdem: [..], halten: bool, treffer: [alle],
       unauffaellig: bool } */
  function werteAus(antworten) {
    var treffer = [];
    var gesehen = {};

    FRAGEN.forEach(function (f, fi) {
      var i = antworten[f.id];
      if (typeof i !== "number" || !f.optionen[i]) { return; }
      var o = f.optionen[i];
      f.ausloeser.forEach(function (a) {
        if (o.wert < a.ab) { return; }
        if (!ausloeserGilt(a, antworten)) { return; }
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
          punkte: punkte,
          schwere: a.schwere,
          ordnung: fi,
          halten: false
        };
        gesehen[a.regel] = t;
        treffer.push(t);
      });
    });

    /* Gleichstand: zuerst punkte, dann schwere, dann Fragenreihenfolge. */
    treffer.sort(function (a, b) {
      return (b.punkte - a.punkte) || (b.schwere - a.schwere) || (a.ordnung - b.ordnung);
    });

    KONFLIKTE.forEach(function (paar) {
      var liste = ids(treffer);
      var a = liste.indexOf(paar[0]), b = liste.indexOf(paar[1]);
      if (a < 0 || b < 0) { return; }
      treffer.splice(Math.max(a, b), 1);
    });

    var hebel = treffer;

    /* Paar-Regel: steht zuckerTief in den Top 3, rueckt pauseMachen
       direkt dahinter. */
    var iz = ids(hebel).indexOf(PAAR[0]);
    var ip = ids(hebel).indexOf(PAAR[1]);
    if (iz >= 0 && iz < 3 && ip >= 0 && ip !== iz + 1) {
      var pause = hebel.splice(ip, 1)[0];
      hebel.splice(ids(hebel).indexOf(PAAR[0]) + 1, 0, pause);
    }

    var top = hebel.slice(0, 3);
    var ausserdem = hebel.slice(3);

    var profil, halten = false;
    if (top.length) {
      var summe = { schlaf: 0, trinken: 0, tag: 0 };
      top.forEach(function (t) { summe[t.regel.domaene] += t.punkte; });
      profil = DOMAENEN[0];
      DOMAENEN.forEach(function (d) { if (summe[d] > summe[profil]) { profil = d; } });
    } else {
      halten = true;
      top = HALTEN.map(halteEintrag);
      profil = "unauffaellig";
    }

    return {
      profil: profil,
      titel: PROFILE[profil].titel,
      satz: PROFILE[profil].satz,
      hebel: top,
      ausserdem: ausserdem,
      halten: halten,
      unauffaellig: halten,
      treffer: top.concat(ausserdem)
    };
  }

  /* Reihenfolge der Ergebnis-Bausteine (Produkt & Text 1.4, Umbau U2):
     Der Mail-Block steht in JEDEM Fall direkt unter dem Ergebnis. Es gibt
     keinen Zweig ohne ihn. check.js zeigt genau diese Bausteine in genau
     dieser Reihenfolge; pruefe-check.py (Zweig p) spielt jede
     Antwortkombination durch. */
  function reihenfolge(e) {
    if (e.halten) { return ["profil", "mailblock", "hebelKarten"]; }
    var folge = ["profil", "hebelListe", "mailblock", "hebelKarten"];
    if (e.ausserdem.length) { folge.push("ausserdem"); }
    folge.push("zumMailblock");
    return folge;
  }

  /* Teilen-Text (Produkt & Text 1.4 [J], Ueberschrift U3): nur der
     Profil-Titel, nie eine Regel. Ohne Ergebnis ein neutraler Satz. */
  var FRAGE_OBEN = "Was kostet dich im Alltag Energie?";
  function teilText(e, url) {
    if (!e) {
      return "Ich habe den Energie-Check von Ruhepuls gemacht: " + FRAGE_OBEN +
        " Sechs Fragen, unter zwei Minuten: " + url;
    }
    return "Mein Energie-Profil bei Ruhepuls: " + e.titel + ". " + FRAGE_OBEN +
      " Sechs Fragen, unter zwei Minuten: " + url;
  }

  var API = {
    REGELN: REGELN,
    FRAGEN: FRAGEN,
    HALTEN: HALTEN,
    KONFLIKTE: KONFLIKTE,
    PAAR: PAAR,
    PROFILE: PROFILE,
    ausloeserGilt: ausloeserGilt,
    werteAus: werteAus,
    reihenfolge: reihenfolge,
    teilText: teilText
  };

  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
  if (global) { global.RUHEPULS_REGELN = API; }
})(typeof window !== "undefined" ? window : null);
