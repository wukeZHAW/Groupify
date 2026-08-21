import { Student } from "../src/Student.js";

function runTests(){
    console.log("Starting Student.js tests ...");

    const student1 = new Student("Wu", "Kevin");
    console.assert(student1.lastName === "Wu", "Valid student should store lastName");
    console.assert(student1.firstName === "Kevin", "Valid student should store firstName");
    console.assert(student1.name === "Kevin Wu", "name should be 'Vorname Nachname'");

    // einstellige Namen (z. B. 王, 김)
    const studentShort = new Student("王", "小明");
    console.assert(
        studentShort.lastName === "王" && studentShort.firstName === "小明",
        "1 character lastName should be valid"
    );

    // Nachname unter Minimum
    let errorThrown = null;
    try {new Student("", "Kevin");} catch(error) {
        errorThrown = error
    }
    console.assert(
        errorThrown instanceof RangeError,
        `lastName must be between ${Student.NAME_MIN_LEN} and ${Student.NAME_MAX_LEN} characters`
    )

    // Vorname unter Minimum
    errorThrown = null;
    try {new Student("Wu", "");} catch(error) {
        errorThrown = error
    }
    console.assert(
        errorThrown instanceof RangeError,
        `firstName must be between ${Student.NAME_MIN_LEN} and ${Student.NAME_MAX_LEN} characters`
    )

    // Namen genau Minimum
    const minName = "A".repeat(Student.NAME_MIN_LEN);
    const studentMinName = new Student(minName, minName);
    console.assert(
        studentMinName.lastName === minName && studentMinName.firstName === minName,
        `${Student.NAME_MIN_LEN} character names should be valid`
    )

    // Namen genau Maximum
    const maxName = "A".repeat(Student.NAME_MAX_LEN);
    const studentMaxName = new Student(maxName, maxName);
    console.assert(
        studentMaxName.lastName.length === Student.NAME_MAX_LEN &&
            studentMaxName.firstName.length === Student.NAME_MAX_LEN,
        `${Student.NAME_MAX_LEN} character names should be valid`
    );

    // Nachname kein String
    errorThrown = null;
    try {new Student(1234, "Kevin");} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown instanceof TypeError, "lastName must be of type string");

    // Vorname kein String
    errorThrown = null;
    try {new Student("Wu", 1234);} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown instanceof TypeError, "firstName must be of type string");

    // Nachname über Maximum
    errorThrown = null;
    try {new Student(maxName + "s", "Kevin");} catch(error) {
        errorThrown = error
    }
    console.assert(
        errorThrown instanceof RangeError,
        `lastName must not exceed ${Student.NAME_MAX_LEN} characters`
    );

    // Vorname über Maximum
    errorThrown = null;
    try {new Student("Wu", maxName + "s");} catch(error) {
        errorThrown = error
    }
    console.assert(
        errorThrown instanceof RangeError,
        `firstName must not exceed ${Student.NAME_MAX_LEN} characters`
    );
}

runTests()
