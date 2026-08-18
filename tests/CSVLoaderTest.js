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
    console.assert(STUDENTS.length === 2, "CSV with two rows should create two students");

    console.assert(STUDENTS[0] instanceof Student, "Parsed entries must be of type Student");

    console.assert(STUDENTS[0].name === "Max Müller", "Stundent name should be 'Vorname Nachname'");

    //not string
    let errorThrown = null;
    try {LOADER.parse(123);} catch (error) {errorThrown = error}
    console.assert(errorThrown instanceof TypeError, "csvText must be of type string");

    //empty string
    errorThrown = null;
    try {LOADER.parse("");} catch (error) {errorThrown = error}
    console.assert(errorThrown instanceof Error, "csvText must not be empty");

    //header invalid
    errorThrown = null;
    try {LOADER.parse("Nachname,Vorname\nMüller;Max\nMeier;Anna\n");} catch (error) {errorThrown = error}
    console.assert(errorThrown instanceof Error, "Header must be 'Name;Vorname'");

    // too few columns in row
    errorThrown = null;
    try {
        LOADER.parse("Name;Vorname\nMüller\nMeier:Anna\n");
    } catch (error) {
        errorThrown = error;
    }

    console.assert(
        errorThrown instanceof Error, 
        "Row must contain exactly two columns"
    );

    // too many colums
    errorThrown = null;
    try {LOADER.parse("Name;Vorname; Nachname\nMüller;Max\nMeier;Anna\n");} catch (error) {errorThrown = error}
    console.assert(errorThrown instanceof Error, "Row must contain exactly two columns");

    // surname empty
    errorThrown = null;
    try {LOADER.parse("Name;Vorname\n;\nMeier;Anna\n ;Max\n");} catch (error) {errorThrown = error}
    console.assert(errorThrown instanceof Error, "Surname must not be empty");

    // first name empty
    errorThrown = null;
    try {LOADER.parse("Name;Vorname\nMüller; \nMeier;Anna\n");} catch (error) {errorThrown = error}
    console.assert(errorThrown instanceof Error, "First name must not be empty");

    //whitespace
    const WHITESPACE_STUDENTS = LOADER.parse("Name;Vorname\n  Wu  ;  Kevin  ");
    console.assert(
        WHITESPACE_STUDENTS[0].name === "Kevin Wu",
        "Whitespace should be trimmed"
    );

    //empty row
    const STUDENTS_WITH_EMPTYROW = LOADER.parse(
        "Name;Vorname\nMüller;Max\n\nMeier;Anna"
    );
    console.assert(
        STUDENTS_WITH_EMPTYROW.length === 2,
        "Empty row should be ignored"
    );
}

runTests();