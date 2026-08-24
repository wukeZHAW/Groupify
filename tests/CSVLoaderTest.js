import assert from "node:assert/strict";
import { CsvLoader } from "../src/CSVLoader.js";
import { Student } from  "../src/Student.js";

function runTests() {
    console.log("Starting CsvLoader.js tests ...");

    const LOADER = new CsvLoader();

    // valid CSV
    const CSV = `Name;Vorname
    Müller;Max
    Meier;Anna`;

    const STUDENTS = LOADER.parse(CSV);
    assert.equal(STUDENTS.length, 2, "CSV with two rows should create two students");

    assert(STUDENTS[0] instanceof Student, "Parsed entries must be of type Student");

    assert.equal(STUDENTS[0].lastName, "Müller", "lastName should come from the Name column");
    assert.equal(STUDENTS[0].firstName, "Max", "firstName should come from the Vorname column");
    assert.equal(STUDENTS[0].name, "Max Müller", "Student name should be 'Vorname Nachname'");

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
    const WHITESPACE_STUDENTS = LOADER.parse("Name;Vorname\n  Wu  ;  Kevin  ");
    assert.equal(WHITESPACE_STUDENTS[0].lastName, "Wu", "Whitespace should be trimmed");
    assert.equal(WHITESPACE_STUDENTS[0].firstName, "Kevin", "Whitespace should be trimmed");
    assert.equal(WHITESPACE_STUDENTS[0].name, "Kevin Wu", "Whitespace should be trimmed");

    //empty row
    const STUDENTS_WITH_EMPTYROW = LOADER.parse(
        "Name;Vorname\nMüller;Max\n\nMeier;Anna"
    );
    assert.equal(
        STUDENTS_WITH_EMPTYROW.length,
        2,
        "Empty row should be ignored"
    );

    const EAST_ASIAN_STUDENTS = LOADER.parse(
        "Name;Vorname\n王;小明\n李;雨桐\n陈;子轩\n佐藤;陽菜\n김;민준"
    );
    assert.equal(EAST_ASIAN_STUDENTS.length, 5, "1 character last names should parse");
    assert.equal(EAST_ASIAN_STUDENTS[0].lastName, "王", "1 character last names should parse");
    assert.equal(EAST_ASIAN_STUDENTS[0].firstName, "小明", "1 character last names should parse");
    assert.equal(EAST_ASIAN_STUDENTS[4].lastName, "김", "1 character last names should parse");
    assert.equal(EAST_ASIAN_STUDENTS[4].firstName, "민준", "1 character last names should parse");
    }

runTests();
