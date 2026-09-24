/* Energie-Check — Fragen, Regeln, Auswertung.  Stand 24.09.2026.
   Reine Daten und Logik, kein DOM.

   Texte: „(C) Abteilung Produkt & Text — Energie-Check, 7 Tage,
   Tag-7-Angebot (24.09.2026)“, Abschnitt 1.3–1.5, woertlich.
   Fragen, Ausloeser, Konflikte, Profil-Logik: „(C) Abteilung Fach —
   Energie-Check, Fragen und Regeln (24.09.2026)“, Abschnitt 4.
   Entscheidungen: „(C) Entscheidungen Energie-Check — Liam (24.09.2026)“,
   F1–F6, T1 (Warnzeichen hart/weich).

   REGEL (geprueft von scripts/pruefe-check.py):
   - Jede Regel hat titel, tipp, kurz, quelle (mit Jahr), link, gruppe.
   - Jede Frage hat mindestens einen Ausloeser.
   - Fuer jede maximal auffaellige Antwort steht die zugehoerige Regel
     im Ergebnis.
   - Keine Regel erscheint ohne ihre Voraussetzung (`nurWenn`, `undWenn`,
     `nichtWenn`, `nurAntwort`, `nichtWennAntwort`) — alle sitzen in
     ausloeserGilt().
   - Zwei Regeln aus KONFLIKTE stehen nie im selben Ergebnis.
   - Ein HARTES Warnzeichen: Arzt-Kasten oben, kein Mail-Block.
     Ein WEICHES: Arzt-Hinweis unten, Mail-Block bleibt (T1).
   - Der Tipp darf nicht mehr sagen als die Quelle.
*/
(function (global) {
  "use strict";

  var INSOMNIE =
    "Spiegelhalder, Riemann u. a. (2025): S3-Leitlinie „Insomnie bei " +
    "Erwachsenen“";
  var INSOMNIE_LINK = "https://register.awmf.org/de/leitlinien/detail/063-003";
  var DEGAM_LINK = "https://register.awmf.org/de/leitlinien/detail/053-002";

  /* ---------------------------------------------------------- Die Regeln
     gruppe "hebel": etwas, das man selbst aendern kann (Karten).
     gruppe "arzt":  gehoert in die Praxis (Kasten). */
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

    kvti: {
      gruppe: "hebel", domaene: "schlaf",
      titel: "Die erste Behandlung ist keine Tablette",
      tipp:
        "So steht es in der deutschen Leitlinie: Die kognitive " +
        "Verhaltenstherapie für Insomnie „soll bei allen Patientinnen und " +
        "Patienten mit Insomnie als erste Behandlungsoption empfohlen " +
        "werden“. Es gibt sie auch als App auf Rezept: Die Leitlinie nennt " +
        "somnio und HelloBetter Schlafen. Frag in der Praxis danach.",
      kurz: "S3-Leitlinie Insomnie, 2025",
      quelle:
        INSOMNIE + ", AWMF 063-003, Empfehlung T1 und Abschnitt KVT-I " +
        "(digitale Gesundheitsanwendungen)",
      link: INSOMNIE_LINK,
      video: null
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
      titel: "Noch eine Tasse macht dich nicht wacher",
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
      titel: "Das Glas am Abend kostet Erholung",
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

    /* auch HALTEN. Nie zusammen mit pemKasten (nichtWennAntwort + KONFLIKT). */
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
        "reagierst, und anpassen. Geht es dir nach Anstrengung tagelang " +
        "schlechter, hör auf und sprich es in der Praxis an.",
      kurz: "Wender u. a., Frontiers in Psychology 2022",
      quelle:
        "Wender, Manninen & O'Connor (2022): The Effect of Chronic Exercise " +
        "on Energy and Fatigue States: A Systematic Review and Meta-Analysis " +
        "of Randomized Trials. Frontiers in Psychology 13, 907637 · DEGAM " +
        "S3-Leitlinie „Müdigkeit“ (2022), AWMF 053-002, Empfehlung 6.5 B",
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
    },

    /* ---------- Arzt ---------- */

    arztKasten: {
      gruppe: "arzt",
      titel: "Sprich das in der Hausarztpraxis an",
      tipp:
        "Was du angekreuzt hast, gehört zu den Punkten, nach denen die " +
        "Leitlinie der Hausärzte bei Müdigkeit ausdrücklich fragen lässt. " +
        "Deshalb gehört es in ein Gespräch in der Praxis, nicht in einen " +
        "Online-Check. Nimm mit: seit wann, wie stark, und alle Medikamente, " +
        "auch die selbst gekauften. Setz nichts ohne Rücksprache ab. Wenn es " +
        "dir seelisch schlecht geht: Die TelefonSeelsorge ist rund um die " +
        "Uhr kostenlos erreichbar, 0800 111 0 111 oder 0800 111 0 222.",
      kurz: "DEGAM-Leitlinie Müdigkeit, 2022",
      quelle:
        "DEGAM S3-Leitlinie „Müdigkeit“ (2022), AWMF 053-002, Empfehlungen " +
        "5.1.3 und 5.1.4, Kurzfassung „Diagnostische Hilfen“ · " +
        "DEGAM-Patienteninformation „Müdigkeit“ (2022)",
      link: DEGAM_LINK,
      video: null
    },

    pemKasten: {
      gruppe: "arzt",
      titel: "Wenn Anstrengung dich tagelang zurückwirft: erst klären, dann mehr bewegen",
      tipp:
        "Geht es dir nach körperlicher oder geistiger Anstrengung oft einen " +
        "Tag oder länger deutlich schlechter, fragt die Leitlinie der " +
        "Hausärzte gezielt danach. Denn dann ist der sonst hilfreiche Rat, " +
        "sich mehr zu bewegen, laut Leitlinie nicht sinnvoll. Er kann den " +
        "Zustand verschlechtern. Sprich das in der Praxis an, bevor du dein " +
        "Training steigerst.",
      kurz: "DEGAM-Leitlinie Müdigkeit, 2022",
      quelle:
        "DEGAM S3-Leitlinie „Müdigkeit“ (2022), AWMF 053-002, Empfehlungen " +
        "5.1.4 und 6.5 C, Kapitel 5.7 · DEGAM-Patienteninformation " +
        "„Müdigkeit“ (2022)",
      link: DEGAM_LINK,
      video: null
    },

    /* nur, wenn KEIN Hebel gefunden wurde */
    muedeTrotzSchlaf: {
      gruppe: "arzt",
      titel: "Kein Hebel gefunden, aber seit Wochen müde? Lass nachsehen",
      tipp:
        "An deinen Antworten klemmt nichts, was du selbst ändern kannst, und " +
        "trotzdem bist du seit über vier Wochen oft müde. Für diesen Fall " +
        "sieht die Leitlinie der Hausärzte ein Gespräch, eine Untersuchung " +
        "und einen Bluttest mit fünf Werten vor: Blutzucker, großes " +
        "Blutbild, Entzündungswert, Leberwert und Schilddrüsenwert. Für " +
        "„Stärkungsmittel“ ist keine Wirkung belegt.",
      kurz: "DEGAM-Leitlinie Müdigkeit, 2022",
      quelle:
        "DEGAM S3-Leitlinie „Müdigkeit“ (2022), AWMF 053-002, Empfehlung " +
        "5.3.1 und Abbildung 2 · DEGAM-Patienteninformation „Müdigkeit“ " +
        "(2022)",
      link: DEGAM_LINK,
      video: "v82"
    },

    /* Hebel da UND seit ueber vier Wochen muede (F2) */
    vierWochen: {
      gruppe: "arzt",
      titel: "Fang mit den Hebeln an. Ändert sich nichts, geh zur Praxis",
      tipp:
        "Die Punkte oben sind mögliche Ursachen, die du selbst ändern " +
        "kannst. Bleibt die Müdigkeit trotzdem, sieht die Leitlinie der " +
        "Hausärzte ab vier Wochen ohne erkennbare Ursache einen Bluttest mit " +
        "fünf Werten vor. Das ist dann der nächste Schritt.",
      kurz: "DEGAM-Leitlinie Müdigkeit, 2022",
      quelle:
        "DEGAM S3-Leitlinie „Müdigkeit“ (2022), AWMF 053-002, Empfehlung " +
        "5.3.1 und Abbildung 2",
      link: DEGAM_LINK,
      video: "v82"
    }
  };

  /* ------------------------------------------------- Bedingungen (Fach 4.3) */
  var WACH = { eineVon: ["wachliegen"], ab: 2 };
  var HEBEL_FRAGEN = {
    eineVon: ["schlafdauer", "wachliegen", "koffein", "alkohol", "bewegung", "tief"],
    ab: 2
  };
  var PEM = { frage: "warnzeichen", index: [2, 3] };

  /* --------------------------------------------------------- Die Fragen
     Acht Fragen (F1). Reihenfolge = Ablauf. `wert` 0–3. */
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
        { ab: 2, regel: "stehAuf", schwere: 9 },
        { ab: 2, regel: "kvti", schwere: 8, nurWenn: { eineVon: ["seitWann"], ab: 3 } }
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
        /* PEM: Aktivierung kann schaden (DEGAM 6.5 C). Fach 4.6 Nr. 1. */
        { ab: 2, regel: "bewegungRegelmaessig", schwere: 7, nichtWennAntwort: PEM }
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
    },
    {
      id: "seitWann",
      text: "Seit wann bist du so oft müde?",
      zusatz: "",
      optionen: [
        { text: "Ich bin nicht oft müde", wert: 0, bezug: "Du bist nicht oft müde" },
        { text: "Seit weniger als vier Wochen", wert: 1, bezug: "Du bist seit weniger als vier Wochen oft müde" },
        { text: "Seit ein bis drei Monaten", wert: 2, bezug: "Du bist seit ein bis drei Monaten oft müde" },
        { text: "Seit mehr als drei Monaten", wert: 3, bezug: "Du bist seit mehr als drei Monaten oft müde" }
      ],
      ausloeser: [
        { ab: 2, regel: "muedeTrotzSchlaf", schwere: 8, nichtWenn: HEBEL_FRAGEN },
        { ab: 2, regel: "vierWochen", schwere: 1, nurWenn: HEBEL_FRAGEN }
      ]
    },
    {
      id: "warnzeichen",
      text: "Trifft etwas davon auf dich zu?",
      zusatz: "",
      /* T1: jedes Warnzeichen hart oder weich. Einteilung mit Begruendung
         in Produkt & Text, Abschnitt „Einteilung hart/weich (Bau, zur
         Pruefung durch Recht/Fach)“. Im Zweifel hart. */
      zusatzListe: [
        { text: "Du hast abgenommen, ohne es zu wollen.", hart: true },
        { text: "Du hast Fieber oder schwitzt nachts stark.", hart: true },
        /* hart wegen „einschlafen … am Steuer“; Schnarchen allein waere weich */
        { text: "Du schnarchst laut, jemand hat Atempausen bei dir bemerkt, oder du schläfst tagsüber ein, ohne es zu wollen, zum Beispiel am Steuer.", hart: true },
        /* Stimmung = hart (T1); Anspannung allein waere weich */
        { text: "Du fühlst dich seit Wochen oft niedergeschlagen, hast kaum Freude an Dingen oder bist ständig angespannt.", hart: true },
        { text: "Die Müdigkeit kam mit einem neuen Medikament.", hart: false },
        { text: "Es sind neue Beschwerden dazugekommen, etwa Atemnot oder Schmerzen.", hart: true }
      ],
      /* `hart` je Antwort: Die Seite weiss nicht, WELCHER Listenpunkt
         zutrifft. Eine Antwort, die einen harten Punkt einschliessen kann,
         ist hart (im Zweifel hart). pruefe-check.py prueft das nach. */
      optionen: [
        { text: "Nichts davon", wert: 0, hart: false, bezug: "Keiner der Punkte trifft auf dich zu" },
        { text: "Mindestens eins aus der Liste", wert: 3, hart: true, liste: true, bezug: "Mindestens ein Punkt aus der Liste trifft auf dich zu" },
        { text: "Nach Anstrengung, körperlich oder im Kopf, geht es mir oft einen Tag oder länger deutlich schlechter", wert: 3, hart: true, bezug: "Nach Anstrengung geht es dir oft einen Tag oder länger deutlich schlechter" },
        { text: "Beides: etwas aus der Liste und das mit der Anstrengung", wert: 3, hart: true, liste: true, bezug: "Ein Punkt aus der Liste trifft zu, und nach Anstrengung geht es dir oft länger schlechter" }
      ],
      ausloeser: [
        { ab: 3, regel: "arztKasten", schwere: 10, nurAntwort: { frage: "warnzeichen", index: [1, 3] } },
        { ab: 3, regel: "pemKasten", schwere: 10, nurAntwort: { frage: "warnzeichen", index: [2, 3] } }
      ]
    }
  ];

  /* Nur wenn Hebel UND Arzt leer sind (Fach 4.4 Nr. 7). */
  var HALTEN = ["bewegungRegelmaessig", "festeAufstehzeit"];

  /* Regelpaare, die nicht nebeneinander stehen duerfen. Es bleibt die
     Regel mit den mehr Punkten. */
  var KONFLIKTE = [
    ["pemKasten", "bewegungRegelmaessig"], // PEM: Aktivierung kann schaden (DEGAM 6.5 C)
    ["schlafDauer", "stehAuf"],            // mehr Bettzeit vs. Stimuluskontrolle (Netz zu nichtWenn)
    ["arztKasten", "muedeTrotzSchlaf"],    // zweimal "Praxis"
    ["arztKasten", "vierWochen"],
    ["pemKasten", "vierWochen"],
    ["muedeTrotzSchlaf", "vierWochen"]     // schliessen sich per Bedingung aus; Netz
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
    nurArztWarn: {
      titel: "Das gehört in die Hausarztpraxis",
      satz: "An deinen Alltagsantworten klemmt wenig. Den Punkt oben solltest du aber ärztlich ansprechen."
    },
    nurArzt: {
      titel: "Das gehört in die Hausarztpraxis",
      satz: "An deinen Alltagsantworten klemmt wenig. Einen Punkt solltest du aber ärztlich ansprechen. Er steht direkt hier drunter."
    },
    unauffaellig: {
      titel: "Bei dir klemmt wenig",
      satz: "Dann geht es ums Halten, nicht ums Reparieren. Dazu zwei Punkte aus der Forschung."
    },
    kurzMuede: {
      titel: "An deinen Gewohnheiten klemmt wenig",
      satz: "Du bist erst seit Kurzem oft müde. Bleibt das länger als vier Wochen und findest du keine Ursache, ist die Hausarztpraxis der nächste Schritt."
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

  /* Ein Ausloeser kann bis zu fuenf Zusatzbedingungen haben:
     nurWenn / undWenn — muessen erfuellt sein,
     nichtWenn        — darf NICHT erfuellt sein,
     nurAntwort       — die Frage muss mit einer dieser Optionen
                        (Index) beantwortet sein,
     nichtWennAntwort — die Frage darf NICHT mit einer dieser Optionen
                        beantwortet sein (Gegenstueck zu nurAntwort).
     pruefe-check.py ruft nur ausloeserGilt() auf und rechnet damit alle
     automatisch mit. */
  function ausloeserGilt(a, antworten) {
    if (a.nurWenn && !bedingung(a.nurWenn, antworten)) { return false; }
    if (a.undWenn && !bedingung(a.undWenn, antworten)) { return false; }
    if (a.nichtWenn && bedingung(a.nichtWenn, antworten)) { return false; }
    if (a.nurAntwort && !antwortIst(a.nurAntwort, antworten)) { return false; }
    if (a.nichtWennAntwort && antwortIst(a.nichtWennAntwort, antworten)) { return false; }
    return true;
  }

  /* Ist die Antwort auf die Warnfrage hart? (T1) */
  function warnHart(antworten) {
    for (var i = 0; i < FRAGEN.length; i++) {
      var f = FRAGEN[i];
      if (f.id !== "warnzeichen") { continue; }
      var k = antworten.warnzeichen;
      return typeof k === "number" && !!f.optionen[k] && !!f.optionen[k].hart;
    }
    return false;
  }

  function halteEintrag(id) {
    return { regelId: id, regel: REGELN[id], bezug: null, frageId: null,
             punkte: 0, schwere: 0, ordnung: 999, halten: true };
  }

  function ids(liste) { return liste.map(function (t) { return t.regelId; }); }

  /* ------------------------------------------------------ Die Auswertung
     Rueckgabe (Produkt & Text 5.2):
     { profil, titel, satz, warnOben, zeigeMailblock, hebel: [Top 3],
       ausserdem: [..], arzt: [..], halten: bool, treffer: [alle],
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

    var hebel = treffer.filter(function (t) { return t.regel.gruppe === "hebel"; });
    var arzt = treffer.filter(function (t) { return t.regel.gruppe === "arzt"; });

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

    /* T1: hart -> Kasten oben, kein Mail-Block. weich -> Kasten unten,
       Mail-Block bleibt. */
    var warnRegel = arzt.some(function (t) { return t.frageId === "warnzeichen"; });
    var warnOben = warnRegel && warnHart(antworten);
    var muede = ids(arzt).indexOf("muedeTrotzSchlaf") >= 0;
    var zeigeMailblock = !warnOben && !muede;

    var profil, halten = false;
    if (top.length) {
      var summe = { schlaf: 0, trinken: 0, tag: 0 };
      top.forEach(function (t) { summe[t.regel.domaene] += t.punkte; });
      profil = DOMAENEN[0];
      DOMAENEN.forEach(function (d) { if (summe[d] > summe[profil]) { profil = d; } });
    } else if (arzt.length) {
      profil = warnOben ? "nurArztWarn" : "nurArzt";
    } else {
      halten = true;
      top = HALTEN.map(halteEintrag);
      profil = antworten.seitWann === 1 ? "kurzMuede" : "unauffaellig";
    }

    return {
      profil: profil,
      titel: PROFILE[profil].titel,
      satz: PROFILE[profil].satz,
      warnOben: warnOben,
      zeigeMailblock: zeigeMailblock,
      hebel: top,
      ausserdem: ausserdem,
      arzt: arzt,
      halten: halten,
      unauffaellig: halten,
      treffer: top.concat(ausserdem, arzt)
    };
  }

  /* Teilen-Text (Produkt & Text 1.4 [J]): nur der Profil-Titel, nie eine
     Regel. Bei Arzt-Profilen ein neutraler Satz ohne Titel. */
  function teilText(e, url) {
    if (!e || e.profil === "nurArzt" || e.profil === "nurArztWarn") {
      return "Ich habe den Energie-Check von Ruhepuls gemacht. Acht Fragen, unter zwei Minuten: " + url;
    }
    return "Mein Energie-Profil bei Ruhepuls: " + e.titel +
      ". Acht Fragen, unter zwei Minuten: " + url;
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
    teilText: teilText
  };

  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
  if (global) { global.RUHEPULS_REGELN = API; }
})(typeof window !== "undefined" ? window : null);
