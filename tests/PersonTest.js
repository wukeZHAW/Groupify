import assert from "node:assert/strict";
import { Person } from "../js/Person.js";

function runTests(){
    console.log("Starting Person.js tests ...");

    const person1 = new Person("Wu", "Kevin");
    assert.equal(person1.lastName, "Wu", "Valid person should store lastName");
    assert.equal(person1.firstName, "Kevin", "Valid person should store firstName");
    assert.equal(person1.name, "Kevin Wu", "name should be 'Vorname Nachname'");
    assert.equal(person1.points, 0, "points should default to 0");

    // einstellige Namen (z. B. 王, 김)
    const personShort = new Person("王", "小明");
    assert.equal(personShort.lastName, "王", "1 character lastName should be valid");
    assert.equal(personShort.firstName, "小明", "1 character lastName should be valid");

    // Nachname unter Minimum
    assert.throws(
        () => new Person("", "Kevin"),
        RangeError,
        `lastName must be between ${Person.NAME_MIN_LEN} and ${Person.NAME_MAX_LEN} characters`
    );

    // Vorname unter Minimum
    assert.throws(
        () => new Person("Wu", ""),
        RangeError,
        `firstName must be between ${Person.NAME_MIN_LEN} and ${Person.NAME_MAX_LEN} characters`
    );

    // Namen genau Minimum
    const minName = "A".repeat(Person.NAME_MIN_LEN);
    const personMinName = new Person(minName, minName);
    assert.equal(personMinName.lastName, minName, `${Person.NAME_MIN_LEN} character names should be valid`);
    assert.equal(personMinName.firstName, minName, `${Person.NAME_MIN_LEN} character names should be valid`);

    // Namen genau Maximum
    const maxName = "A".repeat(Person.NAME_MAX_LEN);
    const personMaxName = new Person(maxName, maxName);
    assert.equal(
        personMaxName.lastName.length,
        Person.NAME_MAX_LEN,
        `${Person.NAME_MAX_LEN} character names should be valid`
    );
    assert.equal(
        personMaxName.firstName.length,
        Person.NAME_MAX_LEN,
        `${Person.NAME_MAX_LEN} character names should be valid`
    );

    // Nachname kein String
    assert.throws(
        () => new Person(1234, "Kevin"),
        TypeError,
        "lastName must be of type string"
    );

    // Vorname kein String
    assert.throws(
        () => new Person("Wu", 1234),
        TypeError,
        "firstName must be of type string"
    );

    // Nachname über Maximum
    assert.throws(
        () => new Person(maxName + "s", "Kevin"),
        RangeError,
        `lastName must not exceed ${Person.NAME_MAX_LEN} characters`
    );

    // Vorname über Maximum
    assert.throws(
        () => new Person("Wu", maxName + "s"),
        RangeError,
        `firstName must not exceed ${Person.NAME_MAX_LEN} characters`
    );

    for (let points = Person.POINTS_MIN; points <= Person.POINTS_MAX; points++) {
        const withPoints = new Person("Wu", "Kevin", points);
        assert.equal(
            withPoints.points,
            points,
            `points ${points} should be stored`
        );
    }

    assert.throws(
        () => new Person("Wu", "Kevin", -1),
        RangeError,
        "points below 0 should be invalid"
    );
    assert.throws(
        () => new Person("Wu", "Kevin", 6),
        RangeError,
        "points above 5 should be invalid"
    );
    assert.throws(
        () => new Person("Wu", "Kevin", 2.5),
        TypeError,
        "non-integer points should be invalid"
    );
    assert.throws(
        () => new Person("Wu", "Kevin", "3"),
        TypeError,
        "text points should be invalid"
    );
}

runTests()
