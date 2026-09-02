import assert from "node:assert/strict";
import { CsvLoader } from "../src/CSVLoader.js";
import { Person } from  "../src/Person.js";

function runTests() {
    console.log("Starting CsvLoader.js tests ...");

    const LOADER = new CsvLoader();

    // valid CSV
    const CSV = `Name;Vorname
    Müller;Max
    Meier;Anna`;

    const PERSONS = LOADER.parse(CSV);
    assert.equal(PERSONS.length, 2, "CSV with two rows should create two persons");

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
    }

runTests();
