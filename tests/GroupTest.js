import assert from "node:assert/strict";
import {Group} from '../src/Group.js'

function runTests() {
    console.log("Starting Group.js tests ...");

    // gültiger Constructor
    const group1 = new Group("Hallo");

    // Name unter Minimum
    assert.throws(
        () => new Group(""),
        Error,
        `name must be between ${Group.NAME_MIN_LEN} and ${Group.NAME_MAX_LEN} characters`
    );

    // Name genau Minimum
    const groupMinName = new Group("A");
    assert.equal(
        groupMinName.name,
        "A",
        "1 character name should be valid"
    );

    // Name genau Maximum
    const groupMaxName = new Group("HalloHalloHalloHallo");
    assert.equal(groupMaxName.name.length, Group.NAME_MAX_LEN, "20 character name should be valid");

    // Name über Maximum
    assert.throws(
        () => new Group("HalloHalloHalloHallos"),
        Error,
        `name must be less than ${Group.NAME_MAX_LEN} characters`
    );

    // Name kein String
    assert.throws(
        () => new Group(12345),
        TypeError,
        "name must be of type string"
    );

    // Person hinzufügen
    const group5 = new Group("Hallo");
    group5.addPerson("Max");
    group5.addPerson("Anna");
    assert.equal(group5.length(), 2, "Group should accept persons without a capacity limit");

    // Person doppelt hinzufügen
    const groupDuplicate = new Group("Hallo");
    groupDuplicate.addPerson("Max");
    assert.throws(
        () => groupDuplicate.addPerson("Max"),
        Error,
        "Adding a duplicate person should throw"
    );

    // vorhandenen Person entfernen
    const groupRemove = new Group("Hallo");
    groupRemove.addPerson("Max");
    groupRemove.removePerson("Max");
    assert.equal(groupRemove.length(), 0, "Removing an existing person should leave the group empty");

    // nicht vorhandenen entfernen
    assert.throws(
        () => groupRemove.removePerson("Peter"),
        Error,
        "Removing a person that is not in the group should throw"
    );

    // gültiger Name-Setter
    const groupNameSetter = new Group("Hallo");
    groupNameSetter.name = "Gruppe";
    assert.equal(groupNameSetter.name, "Gruppe", "Valid name setter should update the group name");

    // ungültiger Name-Setter
    assert.throws(
        () => { groupNameSetter.name = ""; },
        Error,
        "Invalid name setter should throw"
    );
}



runTests();
