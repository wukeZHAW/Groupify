import assert from "node:assert/strict";
import { CsvLoader } from "../js/CSVLoader.js";
import { Person } from  "../js/Person.js";

function runTests() {
    console.log("Starting CsvLoader.js tests ...");

    const LOADER = new CsvLoader();

    // valid CSV
    const CSV = `Name;Vorname
    Müller;Max
    Meier;Anna`;

    const PERSONS = LOADER.parse(CSV);
    assert.equal(PERSONS.length, 2, "CSV with two rows should create two persons");
    assert.equal(LOADER.pointsBalancing, false, "two-column CSV should not enable points balancing");
    assert.equal(PERSONS[0].points, 0, "two-column CSV should leave points at 0");

    assert(PERSONS[0] instanceof Person, "Parsed entries must be of type Person");

    assert.equal(PERSONS[0].lastName, "Müller", "lastName should come from the Name column");
    assert.equal(PERSONS[0].firstName, "Max", "firstName should come from the Vorname column");
    assert.equal(PERSONS[0].name, "Max Müller", "Person name should be 'Vorname Nachname'");

    //not string
    assert.throws(
        () => LOADER.parse(123),
        TypeError,
        "csvText must be of type string"
    );

    //empty string
    assert.throws(
        () => LOADER.parse(""),
        Error,
        "csvText must not be empty"
    );

    //header invalid
    assert.throws(
        () => LOADER.parse("Nachname,Vorname\nMüller;Max\nMeier;Anna\n"),
        Error,
        "Header must be 'Name;Vorname'"
    );

    // too few columns in row
    assert.throws(
        () => LOADER.parse("Name;Vorname\nMüller\nMeier:Anna\n"),
        Error,
        "Row must contain exactly two columns"
    );

    // too many colums
    assert.throws(
        () => LOADER.parse("Name;Vorname; Nachname\nMüller;Max\nMeier;Anna\n"),
        Error,
        "Row must contain exactly two columns"
    );

    // surname empty
    assert.throws(
        () => LOADER.parse("Name;Vorname\n;\nMeier;Anna\n ;Max\n"),
        Error,
        "Surname must not be empty"
    );

    // first name empty
    assert.throws(
        () => LOADER.parse("Name;Vorname\nMüller; \nMeier;Anna\n"),
        Error,
        "First name must not be empty"
    );

    //whitespace
    const WHITESPACE_PERSONS = LOADER.parse("Name;Vorname\n  Wu  ;  Kevin  ");
    assert.equal(WHITESPACE_PERSONS[0].lastName, "Wu", "Whitespace should be trimmed");
    assert.equal(WHITESPACE_PERSONS[0].firstName, "Kevin", "Whitespace should be trimmed");
    assert.equal(WHITESPACE_PERSONS[0].name, "Kevin Wu", "Whitespace should be trimmed");

    //empty row
    const PERSONS_WITH_EMPTYROW = LOADER.parse(
        "Name;Vorname\nMüller;Max\n\nMeier;Anna"
    );
    assert.equal(
        PERSONS_WITH_EMPTYROW.length,
        2,
        "Empty row should be ignored"
    );

    const EAST_ASIAN_PERSONS = LOADER.parse(
        "Name;Vorname\n王;小明\n李;雨桐\n陈;子轩\n佐藤;陽菜\n김;민준"
    );
    assert.equal(EAST_ASIAN_PERSONS.length, 5, "1 character last names should parse");
    assert.equal(EAST_ASIAN_PERSONS[0].lastName, "王", "1 character last names should parse");
    assert.equal(EAST_ASIAN_PERSONS[0].firstName, "小明", "1 character last names should parse");
    assert.equal(EAST_ASIAN_PERSONS[4].lastName, "김", "1 character last names should parse");
    assert.equal(EAST_ASIAN_PERSONS[4].firstName, "민준", "1 character last names should parse");

    const POINTS_PERSONS = LOADER.parse(
        "Name;Vorname;Punkte\nWu;Kevin;5\nMeier;Anna;3\nLang;Lisa;0\nJung;Jan;\nKurz;Klara;4"
    );
    assert.equal(LOADER.pointsBalancing, true, "Punkte header should enable points balancing");
    assert.equal(POINTS_PERSONS.length, 5, "Punkte CSV should parse mixed points including 0");
    assert.equal(POINTS_PERSONS[0].points, 5, "Punkte column should parse 5");
    assert.equal(POINTS_PERSONS[1].points, 3, "Punkte column should parse 3");
    assert.equal(POINTS_PERSONS[2].points, 0, "explicit points 0 should stay 0");
    assert.equal(POINTS_PERSONS[3].points, 0, "empty Punkte should become 0");
    assert.equal(POINTS_PERSONS[4].points, 4, "Punkte column should parse 4");

    const NO_POINTS_AFTER = LOADER.parse("Name;Vorname\nWu;Kevin");
    assert.equal(
        LOADER.pointsBalancing,
        false,
        "a later two-column CSV should disable points balancing"
    );
    assert.equal(NO_POINTS_AFTER[0].points, 0, "two-column CSV should not copy previous points");

    const EMPTY_POINTS_ONLY = LOADER.parse("Name;Vorname;Punkte\nWu;Kevin;");
    assert.equal(LOADER.pointsBalancing, true, "Punkte header with empty value still enables balancing");
    assert.equal(EMPTY_POINTS_ONLY[0].points, 0, "empty Punkte should become 0");

    assert.throws(
        () => LOADER.parse("Name;Vorname;Punkte\nWu;Kevin;-1"),
        Error,
        "negative Punkte should be invalid"
    );
    assert.throws(
        () => LOADER.parse("Name;Vorname;Punkte\nWu;Kevin;6"),
        Error,
        "Punkte above 5 should be invalid"
    );
    assert.throws(
        () => LOADER.parse("Name;Vorname;Punkte\nWu;Kevin;2.5"),
        Error,
        "non-integer Punkte should be invalid"
    );
    assert.throws(
        () => LOADER.parse("Name;Vorname;Punkte\nWu;Kevin;gut"),
        Error,
        "text Punkte should be invalid"
    );
    assert.throws(
        () => LOADER.parse("Name;Vorname;Punkte\nWu;Kevin"),
        Error,
        "Punkte CSV row must contain three columns"
    );
    assert.throws(
        () => LOADER.parse("Name;Vorname;Punkte\nWu;Kevin;5;extra"),
        Error,
        "Punkte CSV row must not contain extra columns"
    );
    assert.throws(
        () => LOADER.parse("Name;Vorname\nWu;Kevin;5"),
        Error,
        "two-column header must not accept a Punkte cell"
    );
    }

runTests();
