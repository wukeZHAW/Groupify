import assert from "node:assert/strict";
import { Student } from "../src/Student.js";

function runTests(){
    console.log("Starting Student.js tests ...");

    const student1 = new Student("Wu", "Kevin");
    assert.equal(student1.lastName, "Wu", "Valid student should store lastName");
    assert.equal(student1.firstName, "Kevin", "Valid student should store firstName");
    assert.equal(student1.name, "Kevin Wu", "name should be 'Vorname Nachname'");

    // einstellige Namen (z. B. 王, 김)
    const studentShort = new Student("王", "小明");
    assert.equal(studentShort.lastName, "王", "1 character lastName should be valid");
    assert.equal(studentShort.firstName, "小明", "1 character lastName should be valid");

    // Nachname unter Minimum
    assert.throws(
        () => new Student("", "Kevin"),
        RangeError,
        `lastName must be between ${Student.NAME_MIN_LEN} and ${Student.NAME_MAX_LEN} characters`
    );

    // Vorname unter Minimum
    assert.throws(
        () => new Student("Wu", ""),
        RangeError,
        `firstName must be between ${Student.NAME_MIN_LEN} and ${Student.NAME_MAX_LEN} characters`
    );

    // Namen genau Minimum
    const minName = "A".repeat(Student.NAME_MIN_LEN);
    const studentMinName = new Student(minName, minName);
    assert.equal(studentMinName.lastName, minName, `${Student.NAME_MIN_LEN} character names should be valid`);
    assert.equal(studentMinName.firstName, minName, `${Student.NAME_MIN_LEN} character names should be valid`);

    // Namen genau Maximum
    const maxName = "A".repeat(Student.NAME_MAX_LEN);
    const studentMaxName = new Student(maxName, maxName);
    assert.equal(
        studentMaxName.lastName.length,
        Student.NAME_MAX_LEN,
        `${Student.NAME_MAX_LEN} character names should be valid`
    );
    assert.equal(
        studentMaxName.firstName.length,
        Student.NAME_MAX_LEN,
        `${Student.NAME_MAX_LEN} character names should be valid`
    );

    // Nachname kein String
    assert.throws(
        () => new Student(1234, "Kevin"),
        TypeError,
        "lastName must be of type string"
    );

    // Vorname kein String
    assert.throws(
        () => new Student("Wu", 1234),
        TypeError,
        "firstName must be of type string"
    );

    // Nachname über Maximum
    assert.throws(
        () => new Student(maxName + "s", "Kevin"),
        RangeError,
        `lastName must not exceed ${Student.NAME_MAX_LEN} characters`
    );

    // Vorname über Maximum
    assert.throws(
        () => new Student("Wu", maxName + "s"),
        RangeError,
        `firstName must not exceed ${Student.NAME_MAX_LEN} characters`
    );

    assert.equal(
    student1.lastName,
    "DIES_IST_ABSICHTLICH_FALSCH, MUSS failen",
    "CI failure test"
);
}

runTests()
