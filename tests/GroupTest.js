import {Group} from '../src/Group.js'

function runTests() {
    console.log("Starting Group.js tests ...");

    // gültiger Constructor
    const group1 = new Group("Hallo", 1,2);

    // min > max
    let errorThrown = null;
    try {const group2 = new Group("Hallo", 2,1);} catch (error) {errorThrown = error}
    console.assert(errorThrown != null, "Range was expected as min > max");

    // min < 0
    errorThrown = null;
    try {const group3 = new Group("Hallo", -1,1);} catch (error) {errorThrown = error}
    console.assert(errorThrown != null, "Range was expected as min < 0");
    
    // max < 1
    errorThrown = null;
    try {const group3 = new Group("Hallo", 0,0);} catch (error) {errorThrown = error}
    console.assert(errorThrown != null, "Range was expected as max == 0");

    // Name unter Minimum
    errorThrown = null;
    try {const group4 = new Group("Hall", 1, 2);} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, `name must be between ${Group.NAME_MIN_LEN} and ${Group.NAME_MAX_LEN} characters`)

    // Name genau Minimum
    const groupMinName = new Group("Hallo", 1, 2);
    console.assert(groupMinName.name === "Hallo", "5 character name should be valid");

    // Name genau Maximum
    const groupMaxName = new Group("HalloHalloHalloHallo", 1, 2);
    console.assert(groupMaxName.name.length === Group.NAME_MAX_LEN, "20 character name should be valid");

    // Name über Maximum
    errorThrown = null;
    try {const group7 = new Group("HalloHalloHalloHallos", 2, 3);} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, `name must be less than ${Group.NAME_MAX_LEN} characters`);

    // Name kein String
    errorThrown = null;
    try {const groupNotString = new Group(12345, 1, 2);} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown instanceof TypeError, "name must be of type string");

    // min kein Integer
    errorThrown = null;
    try {const groupMinFloat = new Group("Hallo", 1.5, 3);} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown instanceof TypeError, "min must be an integer");

    // max kein Integer
    errorThrown = null;
    try {const groupMaxFloat = new Group("Hallo", 1, 3.5);} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown instanceof TypeError, "max must be an integer");

    // isFull() unter max
    const group5 = new Group("Hallo", 1, 2);
    group5.addStudent("Max");
    console.assert(group5.isFull() === false, "Group should not be full below max");

    // isFull() bei max
    group5.addStudent("Anna");
    console.assert(group5.isFull() === true, "Group should be full at max");

    // Add wenn bereits full
    errorThrown = null;
    try {group5.addStudent("Peter");} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, "Adding a student to a full group should throw");

    // Student doppelt hinzufügen
    errorThrown = null;
    const groupDuplicate = new Group("Hallo", 1, 2);
    groupDuplicate.addStudent("Max");
    try {groupDuplicate.addStudent("Max");} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, "Adding a duplicate student should throw");

    // isComplete() unter min
    const group6 = new Group("Hallo", 2, 3);
    group6.addStudent("Max");
    console.assert(group6.isComplete() === false, "Group should not be complete below min");

    // isComplete() bei min
    group6.addStudent("Anna");
    console.assert(group6.isComplete() === true, "Group should be complete at min");

    // vorhandenen Student entfernen
    const groupRemove = new Group("Hallo", 1, 2);
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
    const groupNameSetter = new Group("Hallo", 1, 2);
    groupNameSetter.name = "Gruppe";
    console.assert(groupNameSetter.name === "Gruppe", "Valid name setter should update the group name");

    // ungültiger Name-Setter
    errorThrown = null;
    try {groupNameSetter.name = "Hi";} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, "Invalid name setter should throw");
}



runTests();
