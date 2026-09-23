/* Schlaf-Check — Fragen, Regeln, Auswertung.  Stand 23.09.2026
   (Fachprüfung). Reine Daten und Logik, kein DOM.

   REGEL (geprueft von scripts/pruefe-check.py):
   - Jede Regel hat quelle + link. Ein Video ist freiwillig.
   - Jede Frage hat mindestens einen Ausloeser.
   - Fuer jede maximal auffaellige Antwort steht die zugehoerige Regel
     im Ergebnis.
   - Keine Regel erscheint ohne ihre Voraussetzung (`nurWenn`, `undWenn`,
     `nichtWenn`, `nurAntwort`) — alle vier sitzen in ausloeserGilt().
   - Zwei Regeln aus KONFLIKTE stehen nie im selben Ergebnis.
   - Der Tipp darf nicht mehr sagen als die Quelle.
*/
(function (global) {
  "use strict";

  var LEITLINIE =
    "Spiegelhalder, Riemann u. a. (2025): S3-Leitlinie „Insomnie bei " +
    "Erwachsenen“, Update 2025, AWMF 063-003, Deutsche Gesellschaft für " +
    "Schlafforschung und Schlafmedizin";
  var LEITLINIE_LINK = "https://register.awmf.org/de/leitlinien/detail/063-003";

  var DEGAM =
    "Baum, Lindner, Maisel (2022): DEGAM-Patienteninformation „Müdigkeit“ " +
    "zur S3-Leitlinie Müdigkeit, AWMF 053-002, Deutsche Gesellschaft für " +
    "Allgemeinmedizin und Familienmedizin";
  var DEGAM_LINK = "https://register.awmf.org/de/leitlinien/detail/053-002";

  /* Die drei Insomnie-Kernfragen. "ab 2" heisst: drei- bis viermal pro
     Woche oder oefter — die Schwelle "mehrmals pro Woche" (ICD-11). */
  var SYMPTOM = { eineVon: ["einschlafen", "durchschlafen", "frueh"], ab: 2 };

  /* ---------------------------------------------------------- Die Regeln */
  var REGELN = {

    /* ---------- Sicherheit: aerztlich abklaeren ---------- */

    abklaeren: {
      titel: "Lass das ärztlich abklären",
      tipp:
        "Mehrmals pro Woche, länger als drei Monate, und du merkst es am Tag: " +
        "Ab da spricht die ICD-11 von einer chronischen insomnischen Störung. " +
        "Ob das bei dir so ist, kann nur eine Ärztin oder ein Arzt feststellen " +
        "— mit Gespräch, Untersuchung und Schlaftagebuch. Frag dort nach der " +
        "kognitiven Verhaltenstherapie für Insomnie. Die gibt es auch als App " +
        "auf Rezept.",
      quelle:
        LEITLINIE + ", Abschnitt 3.1, Empfehlungen D1 und T1, Abschnitt " +
        "KVT-I (digitale Gesundheitsanwendungen)",
      link: LEITLINIE_LINK,
      video: null
    },

    muedeTrotzSchlaf: {
      titel: "Gut geschlafen und trotzdem erschöpft? Sprich es in der Praxis an",
      tipp:
        "Die Leitlinie der Hausärzte sagt: Wenn Müdigkeit dich übermäßig " +
        "belastet oder du keine Ursache findest, sprich sie in der " +
        "Hausarztpraxis an. Die Gründe reichen von Belastungen und " +
        "Medikamenten über Atemstörungen im Schlaf bis zu Depression und " +
        "Angst. Für „Stärkungsmittel“ ist keine Wirkung belegt.",
      quelle: DEGAM,
      link: DEGAM_LINK,
      video: null
    },

    atemAbklaeren: {
      titel: "Schnarchen oder Atempausen: lass das abklären",
      tipp:
        "Lautes Schnarchen und Atemaussetzer, die jemand beobachtet hat, " +
        "gehören zu den acht Fragen, mit denen Ärztinnen das Risiko für eine " +
        "Schlafapnoe einschätzen. Müdigkeit am Tag ist eine weitere. Die " +
        "deutsche Leitlinie sagt: Bei begründetem Verdacht soll das im " +
        "Schlaflabor geklärt werden. Der erste Schritt ist die Hausarztpraxis.",
      quelle:
        "Chung, Abdullah & Liao (2016): STOP-Bang Questionnaire: A Practical " +
        "Approach to Screen for Obstructive Sleep Apnea. Chest 149(3), " +
        "631–638 · " + LEITLINIE + ", Empfehlung D4",
      link: "https://doi.org/10.1378/chest.15-0903",
      video: null
    },

    beineAbklaeren: {
      titel: "Unruhige Beine am Abend: sprich es an",
      tipp:
        "Ein Drang, die Beine zu bewegen, der in Ruhe kommt, abends oder " +
        "nachts stärker ist und beim Bewegen nachlässt: So beschreibt die " +
        "internationale Fachgruppe das Restless-Legs-Syndrom. Ob es das ist, " +
        "muss eine Ärztin klären — andere Beschwerden können sich ähnlich " +
        "anfühlen. Die deutsche Leitlinie nennt Beinbewegungen im Schlaf als " +
        "etwas, das ausgeschlossen werden soll.",
      quelle:
        "Allen u. a. (2014): Restless legs syndrome/Willis-Ekbom disease " +
        "diagnostic criteria: updated IRLSSG consensus criteria. Sleep " +
        "Medicine 15(8), 860–873 · " + LEITLINIE + ", Tabelle 2",
      link: "https://doi.org/10.1016/j.sleep.2014.03.025",
      video: null
    },

    rezeptfreieMittel: {
      titel: "Frei verkäufliche Schlaftabletten: Die Leitlinie rät ab",
      tipp:
        "In Deutschland frei verkäuflich sind Schlaftabletten mit " +
        "Diphenhydramin oder Doxylamin. Die Leitlinie sagt: Sie sollen zur " +
        "Behandlung von Schlafstörungen nicht empfohlen werden — die Wirkung " +
        "ist allenfalls gering, der Körper gewöhnt sich schnell daran. Von " +
        "pflanzlichen Mitteln rät sie ebenfalls ab, von Melatonin auf Dauer. " +
        "Sprich in der Apotheke oder Praxis darüber.",
      quelle:
        LEITLINIE + ", Empfehlungen T7, T8 und T9, Abschnitt 4.2.5 und " +
        "Tabelle 15",
      link: LEITLINIE_LINK,
      video: null
    },

    rezeptMittel: {
      titel: "Schlafmittel auf Rezept: nicht auf Dauer — und nicht allein absetzen",
      tipp:
        "Die Leitlinie hält Benzodiazepine und verwandte Mittel für bis zu " +
        "vier Wochen für wirksam und rät von der Dauereinnahme ab. Setz " +
        "trotzdem nichts auf eigene Faust ab, sondern besprich es mit der " +
        "Ärztin, die es verschrieben hat. Frag dort auch nach der kognitiven " +
        "Verhaltenstherapie für Insomnie — die Leitlinie nennt sie für alle " +
        "als erste Behandlung.",
      quelle:
        LEITLINIE + ", Empfehlungen T1 und T3 · " + DEGAM,
      link: LEITLINIE_LINK,
      video: null
    },

    /* ---------- Behandlung nach Leitlinie ---------- */

    kvti: {
      titel: "Die erste Behandlung ist keine Tablette",
      tipp:
        "So steht es in der deutschen Leitlinie: Die kognitive " +
        "Verhaltenstherapie für Insomnie „soll bei allen Patientinnen und " +
        "Patienten mit Insomnie als erste Behandlungsoption empfohlen " +
        "werden“. Es gibt sie auch als App auf Rezept: Die Leitlinie nennt " +
        "somnio und HelloBetter Schlafen. Frag in der Praxis danach.",
      quelle:
        LEITLINIE + ", Empfehlung T1 und Abschnitt KVT-I (digitale " +
        "Gesundheitsanwendungen)",
      link: LEITLINIE_LINK,
      video: null
    },

    stehAuf: {
      titel: "Steh auf, wenn du nach einer Viertelstunde noch wach bist",
      tipp:
        "Die Leitlinie sagt es so: Bist du nach 15 Minuten noch wach — abends " +
        "oder nachts —, steh auf und mach etwas Angenehmes. Geh erst zurück " +
        "ins Bett, wenn du schläfrig bist. Wiederhol das, so oft es nötig ist. " +
        "Am Anfang kann dich das müder machen. Fährst du Auto oder arbeitest " +
        "an Maschinen, sprich vorher ärztlich darüber — die Leitlinie warnt " +
        "davor.",
      quelle:
        LEITLINIE + ", Tabelle 8 „Instruktionen zur Stimuluskontrolle“, " +
        "Punkte 3 und 4, und der Hinweis zur Vorsicht im Abschnitt KVT-I",
      link: LEITLINIE_LINK,
      video: "v15"
    },

    erstWennMuede: {
      titel: "Geh erst ins Bett, wenn du müde bist",
      tipp:
        "Zwei Sätze aus der Leitlinie, die zusammengehören: „Gehen Sie abends " +
        "nur zu Bett, wenn Sie schläfrig sind.“ Und: „Stehen Sie jeden Morgen " +
        "zur gleichen Uhrzeit auf.“ Die Idee: möglichst wenig Zeit wach im " +
        "Bett. Am Anfang kann dich das müder machen — fährst du Auto oder " +
        "arbeitest an Maschinen, sprich vorher ärztlich darüber.",
      quelle:
        LEITLINIE + ", Tabelle 8, Punkte 1 und 5, und der Hinweis zur " +
        "Vorsicht im Abschnitt KVT-I",
      link: LEITLINIE_LINK,
      video: null
    },

    bettNurZumSchlafen: {
      titel: "Das Bett ist zum Schlafen da",
      tipp:
        "Auch das steht so in der Leitlinie: Benutz das Bett nur zum Schlafen " +
        "und für Sex. Nicht zum Lesen, Trinken, Rauchen oder Fernsehen. " +
        "Daneben steht: helles, aktivierendes Licht vor dem Zubettgehen " +
        "vermeiden. Und schau nachts nicht auf die Uhr.",
      quelle: LEITLINIE + ", Tabelle 8 und Tabelle 6 „Regeln für einen gesunden Schlaf“",
      link: LEITLINIE_LINK,
      video: null
    },

    gedankenstuhl: {
      titel: "Gib deinen Gedanken einen Termin — vor dem Bett",
      tipp:
        "Wenn dir im Bett die Gedanken kreisen: Die Leitlinie beschreibt dafür " +
        "den „Gedankenstuhl“. Nimm dir einige Stunden vor dem Schlafen 15 bis " +
        "20 Minuten und denk die Themen gezielt durch, die sonst nachts " +
        "kommen. Schreib zu jedem eine mögliche Lösung auf. In einem kleinen " +
        "Versuch mit Studierenden war der Kopf vor dem Einschlafen danach " +
        "ruhiger.",
      quelle:
        LEITLINIE + ", Abschnitt Kognitive Techniken · Carney & Waters " +
        "(2006): Effects of a structured problem-solving procedure on " +
        "pre-sleep cognitive arousal in college students with insomnia. " +
        "Behavioral Sleep Medicine 4(1), 13–28",
      link: LEITLINIE_LINK,
      video: null
    },

    schlaftagebuch: {
      titel: "Schreib zwei Wochen lang auf, wie du schläfst",
      tipp:
        "Die Leitlinie empfiehlt dafür ein Schlaftagebuch über 7 bis 14 Tage: " +
        "morgens und abends ein paar Zeilen — wann ins Bett, wie lange wach, " +
        "wann aufgestanden, wie der Tag war. Nimm es mit, wenn du zur Ärztin " +
        "gehst. Mit genau diesem Tagebuch beginnt dort auch die Behandlung.",
      quelle:
        LEITLINIE + ", Abschnitt 3.2 und Tabelle 7, Schritt 1",
      link: LEITLINIE_LINK,
      video: null
    },

    nichtErzwingen: {
      titel: "Hör auf, das Einschlafen zu erzwingen",
      tipp:
        "Leg dich hin und nimm dir vor, wach zu bleiben. Das klingt verdreht, " +
        "ist aber eine Technik aus der Therapie. Sie heißt paradoxe Intention " +
        "und soll den Druck nehmen, einschlafen zu müssen. Die deutsche " +
        "Leitlinie schreibt, die bisherigen Studien legen eine Wirkung nahe. " +
        "Die Studien sind allerdings klein.",
      quelle:
        LEITLINIE +
        ", Abschnitt Kognitive Verhaltenstherapie für Insomnie; dort zitiert: " +
        "Jansson-Fröjmark u. a. (2022), Journal of Sleep Research 31(2), e13464",
      link: LEITLINIE_LINK,
      video: "v55"
    },

    /* ---------- Verhalten und Einzelstudien ---------- */

    alkohol: {
      titel: "Alkohol ist kein Schlafmittel",
      tipp:
        "Die Leitlinie sagt: „Alkohol weitgehend vermeiden und keinesfalls " +
        "als Schlafmittel einsetzen.“ Eine Übersicht der Studien an Gesunden " +
        "zeigt, warum der Eindruck täuscht: Mit Alkohol schläft man schneller " +
        "ein, aber in der zweiten Nachthälfte wird der Schlaf unruhiger — " +
        "bei jeder untersuchten Menge.",
      quelle:
        LEITLINIE + ", Tabelle 6 · Ebrahim u. a. (2013): Alcohol and sleep I: " +
        "effects on normal sleep. Alcoholism: Clinical and Experimental " +
        "Research 37(4), 539–549",
      link: "https://doi.org/10.1111/acer.12006",
      video: null
    },

    koffeinAbstand: {
      titel: "Die letzte Tasse liegt weiter zurück, als du denkst",
      tipp:
        "Eine Auswertung von 24 Studien rechnet vor: Eine Tasse Kaffee mit " +
        "107 Milligramm Koffein sollte mindestens 8,8 Stunden vor dem " +
        "Zubettgehen getrunken sein, damit sie die Schlafdauer nicht mehr " +
        "verkürzt. Die deutsche Leitlinie sagt es einfacher: nach dem " +
        "Mittagessen nichts Koffeinhaltiges mehr — auch keinen schwarzen Tee " +
        "und keine Cola.",
      quelle:
        "Gardiner u. a. (2023): The effect of caffeine on subsequent sleep. " +
        "Sleep Medicine Reviews 69, 101764 · " + LEITLINIE + ", Tabelle 6",
      link: "https://doi.org/10.1016/j.smrv.2023.101764",
      video: "v66"
    },

    koffeinUnbemerkt: {
      titel: "Spätes Koffein kostet Schlaf, den du nicht bemerkst",
      tipp:
        "In einem Versuch mit 12 Erwachsenen verkürzten 400 Milligramm " +
        "Koffein, sechs Stunden vor dem Schlafengehen, den gemessenen Schlaf " +
        "um gut eine Stunde. In ihrem eigenen Schlaftagebuch fiel das den " +
        "Teilnehmern nicht auf. Die Studie ist klein und die Dosis hoch.",
      quelle:
        "Drake, Roehrs, Shambroom & Roth (2013): Caffeine effects on sleep " +
        "taken 0, 3, or 6 hours before going to bed. Journal of Clinical " +
        "Sleep Medicine 9(11), 1195–1200",
      link: "https://doi.org/10.5664/jcsm.3170",
      video: null
    },

    festeAufstehzeit: {
      titel: "Steh jeden Morgen zur gleichen Zeit auf",
      tipp:
        "Die Leitlinie gibt Menschen mit Schlafproblemen diesen Satz mit: " +
        "„Stehen Sie jeden Morgen zur gleichen Uhrzeit auf.“ Am Wochenende " +
        "auch. In einer Auswertung von über 60.000 Menschen in Großbritannien " +
        "hing ein regelmäßiger Schlafrhythmus stärker mit einem längeren " +
        "Leben zusammen als die Schlafdauer. Das ist ein Zusammenhang, kein " +
        "Beweis.",
      quelle:
        LEITLINIE + ", Tabelle 8, Punkt 5 · Windred u. a. (2024): Sleep " +
        "regularity is a stronger predictor of mortality risk than sleep " +
        "duration. Sleep 47(1), zsad253",
      link: LEITLINIE_LINK,
      video: null
    },

    wochenendDifferenz: {
      titel: "Viel länger am Wochenende heißt: unter der Woche fehlt Schlaf",
      tipp:
        "Eine französische Studie mit über 12.000 Erwachsenen wertet es so: " +
        "Wer am Wochenende mehr als zwei Stunden länger schläft als unter der " +
        "Woche, hat werktags eine starke Schlafeinschränkung. Das betraf 14 " +
        "von 100. Von denen, denen viel Schlaf fehlte, glich am Wochenende " +
        "nur knapp jeder Fünfte den Rückstand aus.",
      quelle:
        "Léger u. a. (2020): Napping and weekend catchup sleep do not fully " +
        "compensate for high rates of sleep debt and short sleep at a " +
        "population level. Sleep Medicine 74, 278–288",
      link: "https://doi.org/10.1016/j.sleep.2020.05.030",
      video: "v28"
    },

    morgenlicht: {
      titel: "Helles Licht am Morgen, wenig helles Licht am Abend",
      tipp:
        "Eine Auswertung von 22 Studien zur Lichttherapie bei Schlafstörungen " +
        "fand: Helles Licht am Morgen verschob den Schlaf-Wach-Rhythmus nach " +
        "vorn, Licht am Abend nach hinten. Die deutsche Leitlinie rät, helles, " +
        "aktivierendes Licht vor dem Zubettgehen zu vermeiden. Die Effekte in " +
        "den Studien sind klein.",
      quelle:
        "Chambe u. a. (2023): Light therapy in insomnia disorder: A " +
        "systematic review and meta-analysis. Journal of Sleep Research " +
        "32(6), e13895 · " + LEITLINIE + ", Tabelle 6 und Empfehlung T10",
      link: "https://doi.org/10.1111/jsr.13895",
      video: null
    },

    fruehWachDauer: {
      titel: "Früh wach heißt nicht automatisch zu wenig",
      tipp:
        "Eine Fachgruppe hat die Studienlage gesichtet und empfiehlt " +
        "Erwachsenen sieben bis neun Stunden Schlaf, ab 65 sieben bis acht. " +
        "Das ist eine Spanne für viele, kein Maß für dich allein. Die " +
        "Leitlinie fragt deshalb zuerst, ob du am Tag etwas merkst. Wenn das " +
        "kommt — oder deine Stimmung kippt —, sprich es in der Praxis an.",
      quelle:
        "Hirshkowitz u. a. (2015): National Sleep Foundation’s sleep time " +
        "duration recommendations. Sleep Health 1(1), 40–43 · " + LEITLINIE +
        ", Abschnitt 3.1 und Empfehlung D2",
      link: "https://doi.org/10.1016/j.sleh.2014.12.010",
      video: "v53"
    },

    bewegung: {
      titel: "Beweg dich regelmäßig — auch abends ist in Ordnung",
      tipp:
        "„Regelmäßige körperliche Aktivität“ steht in der Leitlinie unter den " +
        "Regeln für gesunden Schlaf. Eine Auswertung von 66 Studien fand " +
        "durch regelmäßigen Sport kleine bis mittlere Verbesserungen, am " +
        "deutlichsten bei der Schlafqualität. Gegen Sport am Abend spricht " +
        "laut einer Übersicht an Gesunden nichts — nur hartes Training, das " +
        "weniger als eine Stunde vor dem Schlafen endet, kann stören.",
      quelle:
        LEITLINIE + ", Tabelle 6 · Kredlow u. a. (2015): The effects of " +
        "physical activity on sleep: a meta-analytic review. Journal of " +
        "Behavioral Medicine 38(3), 427–449 · Stutz, Eiholzer & Spengler " +
        "(2019): Effects of evening exercise on sleep in healthy " +
        "participants. Sports Medicine 49(2), 269–287",
      link: "https://doi.org/10.1007/s10865-015-9617-6",
      video: null
    },

    warmDuschen: {
      titel: "Dusch warm, ein bis zwei Stunden vor dem Bett",
      tipp:
        "Zehn Minuten warm duschen oder baden, bei etwa 40 bis 42 Grad, ein " +
        "bis zwei Stunden vor dem Schlafengehen — nicht kurz davor. In einer " +
        "Auswertung von 13 Studien schliefen die Teilnehmer danach schneller " +
        "ein. Die Autoren schreiben selbst, dass es dazu noch wenig Forschung " +
        "gibt.",
      quelle:
        "Haghayegh u. a. (2019): Before-bedtime passive body heating by warm " +
        "shower or bath to improve sleep. Sleep Medicine Reviews 46, 124–135",
      link: "https://doi.org/10.1016/j.smrv.2019.04.008",
      video: "v43"
    }
  };

  /* --------------------------------------------------------- Die Fragen
     Zehn Fragen. 1–5 bilden die Anamnese der S3-Leitlinie nach
     (Einschlafen, Durchschlafen, frueh wach — je als Haeufigkeit —, Dauer,
     Beeintraechtigung/Sorge am Tag). 6–8 fragen Verhalten, fuer das es
     konkrete Anweisungen gibt. 9–10 sind die Warnfragen aus Empfehlung D2
     (schlafmedizinische Erkrankungen, Substanzen). */

  var FRAGEN = [
    {
      id: "einschlafen",
      text: "Wie oft brauchst du abends länger als eine halbe Stunde, bis du einschläfst?",
      zusatz: "Geschätzt, in den letzten vier Wochen.",
      optionen: [
        { text: "So gut wie nie", wert: 0, bezug: "Du schläfst abends meist schnell ein" },
        { text: "Ein- bis zweimal pro Woche", wert: 1, bezug: "Du liegst abends ein- bis zweimal pro Woche länger wach" },
        { text: "Drei- bis viermal pro Woche", wert: 2, bezug: "Du liegst abends an mehreren Abenden pro Woche über eine halbe Stunde wach" },
        { text: "Fast jeden Abend", wert: 3, bezug: "Du liegst fast jeden Abend über eine halbe Stunde wach" }
      ],
      ausloeser: [
        { ab: 2, regel: "erstWennMuede", schwere: 5,
          nurWenn: { eineVon: ["tagsueber"], ab: 1 } },
        { ab: 2, regel: "gedankenstuhl", schwere: 4 },
        { ab: 2, regel: "nichtErzwingen", schwere: 2 },
        { ab: 2, regel: "warmDuschen", schwere: 1 }
      ]
    },
    {
      id: "durchschlafen",
      text: "Wie oft wachst du nachts auf und liegst dann länger als eine halbe Stunde wach?",
      zusatz: "Kurz aufwachen und gleich wieder wegdriften zählt nicht.",
      optionen: [
        { text: "So gut wie nie", wert: 0, bezug: "Du schläfst nachts durch" },
        { text: "Ein- bis zweimal pro Woche", wert: 1, bezug: "Du liegst ein- bis zweimal pro Woche nachts wach" },
        { text: "Drei- bis viermal pro Woche", wert: 2, bezug: "Du liegst an mehreren Nächten pro Woche wach" },
        { text: "Fast jede Nacht", wert: 3, bezug: "Du liegst fast jede Nacht wach" }
      ],
      ausloeser: [
        { ab: 2, regel: "erstWennMuede", schwere: 5,
          nurWenn: { eineVon: ["tagsueber"], ab: 1 } },
        { ab: 2, regel: "gedankenstuhl", schwere: 4 }
      ]
    },
    {
      id: "frueh",
      text: "Wie oft wachst du morgens deutlich früher auf als geplant und schläfst nicht wieder ein?",
      zusatz: "Deutlich heißt: eine halbe Stunde oder mehr.",
      optionen: [
        { text: "So gut wie nie", wert: 0, bezug: "Du wirst morgens nicht zu früh wach" },
        { text: "Ein- bis zweimal pro Woche", wert: 1, bezug: "Du wirst ein- bis zweimal pro Woche zu früh wach" },
        { text: "Drei- bis viermal pro Woche", wert: 2, bezug: "Du wirst an mehreren Morgen pro Woche zu früh wach" },
        { text: "Fast jeden Morgen", wert: 3, bezug: "Du wirst fast jeden Morgen zu früh wach" }
      ],
      ausloeser: [
        /* Nur ohne deutliche Beeintraechtigung am Tag. Mit ihr greifen
           kvti bzw. abklaeren — "fehlt dir nichts" waere dann falsch. */
        { ab: 2, regel: "fruehWachDauer", schwere: 3,
          nichtWenn: { eineVon: ["tagsueber"], ab: 2 } },
        /* Tabelle 8 gilt ausdruecklich auch fuers "wieder einschlafen". */
        { ab: 2, regel: "erstWennMuede", schwere: 5,
          nurWenn: { eineVon: ["tagsueber"], ab: 1 } }
      ]
    },
    {
      id: "dauer",
      text: "Seit wann hast du solche Nächte?",
      zusatz: "Gemeint sind die Nächte, die dich stören.",
      optionen: [
        { text: "Ich habe keine schlechten Nächte", wert: 0, bezug: "Du hast keine schlechten Nächte" },
        { text: "Seit weniger als einem Monat", wert: 1, bezug: "Das geht bei dir seit weniger als einem Monat so" },
        { text: "Seit einem bis drei Monaten", wert: 2, bezug: "Das geht bei dir seit einem bis drei Monaten so" },
        { text: "Seit mehr als drei Monaten", wert: 3, bezug: "Das geht bei dir seit mehr als drei Monaten so" }
      ],
      ausloeser: [
        /* chronisch = > 3 Monate UND mehrmals pro Woche UND am Tag spuerbar */
        { ab: 3, regel: "abklaeren", schwere: 10,
          nurWenn: SYMPTOM, undWenn: { eineVon: ["tagsueber"], ab: 1 } },
        /* Tagebuch ist harmlos und fuer jede laengere Phase sinnvoll — ohne
           Bedingung, damit auch widerspruechliche Antworten eine Regel sehen. */
        { ab: 2, regel: "schlaftagebuch", schwere: 3 }
      ]
    },
    {
      id: "tagsueber",
      text: "Wie stark merkst du deinen Schlaf im Alltag?",
      zusatz: "Müdigkeit, Konzentration, Stimmung — oder die Sorge, wie die nächste Nacht wird.",
      optionen: [
        { text: "Gar nicht, ich komme gut durch den Tag", wert: 0, bezug: "Du kommst gut durch den Tag" },
        { text: "Ein bisschen", wert: 1, bezug: "Du merkst am Tag ein bisschen davon" },
        { text: "Deutlich", wert: 2, bezug: "Du merkst am Tag deutlich etwas davon" },
        { text: "Sehr stark, es zieht sich durch alles", wert: 3, bezug: "Das belastet dich am Tag sehr stark" }
      ],
      ausloeser: [
        /* KVT-I nur mit mindestens einem Insomnie-Symptom (mehrmals/Woche). */
        { ab: 2, regel: "kvti", schwere: 6, nurWenn: SYMPTOM },
        /* Das Gegenstueck: muede OHNE Insomnie-Symptom -> Hausarzt. */
        { ab: 2, regel: "muedeTrotzSchlaf", schwere: 8, nichtWenn: SYMPTOM },
        { ab: 2, regel: "bewegung", schwere: 0 }
      ]
    },
    {
      id: "wachliegen",
      text: "Wenn du nicht schlafen kannst — was machst du meistens?",
      zusatz: "",
      optionen: [
        { text: "Das kommt bei mir nicht vor", wert: 0, bezug: "Du liegst nachts nicht wach" },
        { text: "Ich stehe auf und mache etwas Ruhiges, bis ich müde bin", wert: 0, bezug: "Du stehst dabei auf" },
        { text: "Ich bleibe liegen und warte, bis es wieder klappt", wert: 2, bezug: "Du bleibst liegen und wartest" },
        { text: "Ich nehme im Bett das Handy oder mache den Fernseher an", wert: 3, bezug: "Du greifst im Bett zum Handy oder zum Fernseher" }
      ],
      ausloeser: [
        { ab: 2, regel: "stehAuf", schwere: 6 },
        { ab: 3, regel: "bettNurZumSchlafen", schwere: 2 }
      ]
    },
    {
      id: "rhythmus",
      text: "Wie viel später stehst du am Wochenende auf als unter der Woche?",
      zusatz: "Vergleich einfach einen Samstag mit einem normalen Dienstag.",
      optionen: [
        { text: "Höchstens eine halbe Stunde", wert: 0, bezug: "Du stehst am Wochenende fast zur gleichen Zeit auf" },
        { text: "Eine halbe bis eine Stunde", wert: 1, bezug: "Du stehst am Wochenende bis zu einer Stunde später auf" },
        { text: "Ein bis zwei Stunden", wert: 2, bezug: "Du stehst am Wochenende ein bis zwei Stunden später auf" },
        { text: "Mehr als zwei Stunden", wert: 3, bezug: "Du stehst am Wochenende mehr als zwei Stunden später auf" }
      ],
      ausloeser: [
        { ab: 2, regel: "festeAufstehzeit", schwere: 2 },
        { ab: 2, regel: "morgenlicht", schwere: 4,
          nurWenn: { eineVon: ["einschlafen"], ab: 2 } },
        { ab: 3, regel: "wochenendDifferenz", schwere: 1 }
      ]
    },
    {
      id: "koffein",
      text: "Wie viele Stunden vor dem Schlafengehen trinkst du dein letztes Koffein?",
      zusatz: "Kaffee, Cola, Energydrink oder schwarzer Tee — an einem normalen Tag.",
      optionen: [
        { text: "Trinke ich nicht", wert: 0, bezug: "Du trinkst kein Koffein" },
        { text: "Neun Stunden oder mehr vorher", wert: 0, bezug: "Dein letztes Koffein liegt neun Stunden oder mehr zurück" },
        { text: "Sechs bis neun Stunden vorher", wert: 2, bezug: "Dein letztes Koffein trinkst du sechs bis neun Stunden vor dem Schlafen" },
        { text: "Weniger als sechs Stunden vorher", wert: 3, bezug: "Dein letztes Koffein trinkst du weniger als sechs Stunden vor dem Schlafen" }
      ],
      ausloeser: [
        { ab: 2, regel: "koffeinAbstand", schwere: 3 },
        { ab: 3, regel: "koffeinUnbemerkt", schwere: 1 }
      ]
    },
    {
      id: "warnzeichen",
      text: "Trifft eins davon auf dich zu?",
      zusatz: "Wenn beides zutrifft, wähl „Beides“.",
      optionen: [
        { text: "Nichts davon", wert: 0, bezug: "Du hast keins der beiden Warnzeichen" },
        { text: "Ich schnarche laut, oder jemand hat Atemaussetzer bei mir bemerkt", wert: 3, bezug: "Du schnarchst laut oder jemand hat Atemaussetzer bemerkt" },
        { text: "Abends in Ruhe habe ich einen Drang, die Beine zu bewegen — Bewegen hilft", wert: 3, bezug: "Du hast abends in Ruhe einen Drang, die Beine zu bewegen" },
        { text: "Beides", wert: 3, bezug: "Du schnarchst oder hast Atemaussetzer, und du hast unruhige Beine" }
      ],
      ausloeser: [
        { ab: 3, regel: "atemAbklaeren", schwere: 8,
          nurAntwort: { frage: "warnzeichen", index: [1, 3] } },
        { ab: 3, regel: "beineAbklaeren", schwere: 7,
          nurAntwort: { frage: "warnzeichen", index: [2, 3] } }
      ]
    },
    {
      id: "einnahme",
      text: "Nimmst du abends etwas, um besser zu schlafen?",
      zusatz: "Wenn mehreres zutrifft, wähl das, was du am häufigsten nimmst.",
      optionen: [
        { text: "Nein", wert: 0, bezug: "Du nimmst nichts zum Schlafen" },
        { text: "Alkohol, mehrmals pro Woche", wert: 3, bezug: "Du trinkst abends mehrmals pro Woche Alkohol" },
        { text: "Etwas ohne Rezept — Schlaftabletten, pflanzliche Mittel oder Melatonin", wert: 3, bezug: "Du nimmst rezeptfreie Mittel zum Schlafen" },
        { text: "Ein Schlafmittel, das mir verschrieben wurde", wert: 3, bezug: "Du nimmst ein verschriebenes Schlafmittel" }
      ],
      ausloeser: [
        { ab: 3, regel: "alkohol", schwere: 4,
          nurAntwort: { frage: "einnahme", index: [1] } },
        { ab: 3, regel: "rezeptfreieMittel", schwere: 7,
          nurAntwort: { frage: "einnahme", index: [2] } },
        { ab: 3, regel: "rezeptMittel", schwere: 7,
          nurAntwort: { frage: "einnahme", index: [3] } }
      ]
    }
  ];

  /* Wer nirgends auffaellig ist, bekommt diese zwei Regeln zum Halten. */
  var HALTEN = ["festeAufstehzeit", "bewegung"];

  /* Regelpaare, die nicht nebeneinander stehen duerfen. Es bleibt die
     Regel mit den mehr Punkten. */
  var KONFLIKTE = [
    ["abklaeren", "kvti"],             // zweimal "geh zur Praxis"
    ["abklaeren", "schlaftagebuch"],   // abklaeren nennt das Tagebuch schon
    ["stehAuf", "nichtErzwingen"],     // aufstehen vs. liegen bleiben und wach bleiben wollen
    ["erstWennMuede", "nichtErzwingen"], // nur muede ins Bett vs. hinlegen und wach bleiben
    ["erstWennMuede", "festeAufstehzeit"], // erstWennMuede zitiert Punkt 5 schon
    ["kvti", "fruehWachDauer"],        // behandlungsbeduerftig vs. "nicht automatisch zu wenig"
    ["kvti", "muedeTrotzSchlaf"]       // Insomnie vs. keine Insomnie
  ];

  var UNAUFFAELLIG = {
    titel: "Bei dir ist nichts auffällig",
    satz:
      "An keiner deiner Antworten klemmt etwas. Dann geht es bei dir nicht " +
      "ums Reparieren, sondern ums Halten. Diese zwei Regeln helfen dabei."
  };

  var AUFFAELLIG = {
    titel: "Das ist mir an deinen Antworten aufgefallen",
    satz:
      "Das sind die Regeln zu den Antworten, die am meisten auffallen. Bei " +
      "jeder steht, warum sie hier steht und woher sie kommt."
  };

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

  /* Ein Ausloeser kann bis zu vier Zusatzbedingungen haben:
     nurWenn / undWenn — muessen beide erfuellt sein,
     nichtWenn        — darf NICHT erfuellt sein,
     nurAntwort       — die Frage muss mit einer dieser Optionen
                        (Index) beantwortet sein.
     pruefe-check.py ruft nur ausloeserGilt() auf und rechnet damit alle
     vier automatisch mit. */
  function ausloeserGilt(a, antworten) {
    if (a.nurWenn && !bedingung(a.nurWenn, antworten)) { return false; }
    if (a.undWenn && !bedingung(a.undWenn, antworten)) { return false; }
    if (a.nichtWenn && bedingung(a.nichtWenn, antworten)) { return false; }
    if (a.nurAntwort) {
      var i = antworten[a.nurAntwort.frage];
      if (typeof i !== "number" || a.nurAntwort.index.indexOf(i) < 0) { return false; }
    }
    return true;
  }

  /* ------------------------------------------------------ Die Auswertung
     unveraendert gegenueber dem Stand 21.09. */
  function werteAus(antworten) {
    var treffer = [];
    var gesehen = {};

    FRAGEN.forEach(function (f) {
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

    KONFLIKTE.forEach(function (paar) {
      var ids = treffer.map(function (t) { return t.regelId; });
      var a = ids.indexOf(paar[0]), b = ids.indexOf(paar[1]);
      if (a < 0 || b < 0) { return; }
      treffer.splice(Math.max(a, b), 1);
    });

    var zeigen = treffer.slice(0, 3);

    if (zeigen.length === 1) {
      for (var k = 0; k < HALTEN.length; k++) {
        var id = HALTEN[k];
        var sperrt = KONFLIKTE.some(function (p) {
          return (p[0] === id && p[1] === zeigen[0].regelId) ||
                 (p[1] === id && p[0] === zeigen[0].regelId);
        });
        if (id !== zeigen[0].regelId && !sperrt) {
          zeigen.push({
            regelId: id, regel: REGELN[id],
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
    KONFLIKTE: KONFLIKTE,
    ausloeserGilt: ausloeserGilt,
    werteAus: werteAus
  };

  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
  if (global) { global.RUHEPULS_REGELN = API; }
})(typeof window !== "undefined" ? window : null);
