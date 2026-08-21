import {Group} from '../src/Group.js'

function runTests() {
    console.log("Starting Group.js tests ...");

    // gültiger Constructor
    const group1 = new Group("Hallo");

    // Name unter Minimum
    let errorThrown = null;
    try {const group4 = new Group("");} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, `name must be between ${Group.NAME_MIN_LEN} and ${Group.NAME_MAX_LEN} characters`)

    // Name genau Minimum
    const groupMinName = new Group("A");
    console.assert(
    groupMinName.name === "A",
    "1 character name should be valid"
    )

    // Name genau Maximum
    const groupMaxName = new Group("HalloHalloHalloHallo");
    console.assert(groupMaxName.name.length === Group.NAME_MAX_LEN, "20 character name should be valid");

    // Name über Maximum
    errorThrown = null;
    try {const group7 = new Group("HalloHalloHalloHallos");} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, `name must be less than ${Group.NAME_MAX_LEN} characters`);

    // Name kein String
    errorThrown = null;
    try {const groupNotString = new Group(12345);} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown instanceof TypeError, "name must be of type string");

    // Student hinzufügen
    const group5 = new Group("Hallo");
    group5.addStudent("Max");
    group5.addStudent("Anna");
    console.assert(group5.length() === 2, "Group should accept students without a capacity limit");

    // Student doppelt hinzufügen
    errorThrown = null;
    const groupDuplicate = new Group("Hallo");
    groupDuplicate.addStudent("Max");
    try {groupDuplicate.addStudent("Max");} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, "Adding a duplicate student should throw");

    // vorhandenen Student entfernen
    const groupRemove = new Group("Hallo");
    groupRemove.addStudent("Max");
    groupRemove.removeStudent("Max");
    console.assert(groupRemove.length() === 0, "Removing an existing student should leave the group empty");

    // nicht vorhandenen entfernen
    errorThrown = null;
    try {groupRemove.removeStudent("Peter");} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, "Removing a student that is not in the group should throw");

    // gültiger Name-Setter
    const groupNameSetter = new Group("Hallo");
    groupNameSetter.name = "Gruppe";
    console.assert(groupNameSetter.name === "Gruppe", "Valid name setter should update the group name");

    // ungültiger Name-Setter
    errorThrown = null;
    try {groupNameSetter.name = "";} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, "Invalid name setter should throw");
}



runTests();
