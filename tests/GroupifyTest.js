import { Groupify } from "../src/Groupify.js";
import { Student } from "../src/Student.js";
import { Group } from "../src/Group.js";

function runTests() {
    console.log("Starting Groupify.js tests ...");

    // Testdaten
    const group1 = new Group("Group 1", 1, 2);
    const group2 = new Group("Group 2", 1, 2);

    const student1 = new Student("Kevin Wu");
    const student2 = new Student("Max Müller");

    const groups = [group1, group2];
    const students = [student1, student2];

    // gültiger Constructor
    const groupify = new Groupify(groups, students);

    let errorThrown = null;

    // groups ist kein Array
    errorThrown = null;
    try {
        new Groupify("Hallo", students);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(errorThrown instanceof TypeError, "groups must be an array");

    // groups enthält etwas amderes als Group-Objekte
    errorThrown = null;
    try {
        new Groupify([group1, "hallo"], students);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(errorThrown instanceof TypeError, "groups must contain only Group objects");

    // students ist kein Array
    errorThrown = null;
    try {
        new Groupify(groups, "Hallo");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(errorThrown instanceof TypeError, "students must be an array");

    // students enthält keine Student-Objekte
    errorThrown = null;
    try {
        new Groupify(groups, [student1, "hallo"]);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(errorThrown instanceof TypeError, "students must contain only Student objects");

    // ========================================
    // allocate: gültige Zuweisung
    // ========================================

    // gültige Zuweisung
    groupify.allocate(student1, group1);

    // Student wurde der Zielgruppe hinzugefügt und aus unallocated entfernt
    console.assert(
        group1.length() === 1,
        "allocate should add student to target group"
    );

    console.assert(
        groupify.unallocated.length() === 1,
        "allocate should remove student from unallocated"
    );

    // allocate student ist kein student
    errorThrown = null;
    try {
        groupify.allocate("Hallo", group1);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(errorThrown instanceof TypeError, "student must be a Student object");

    // allocate group ist kein Group
    errorThrown = null;
    try {
        groupify.allocate(student2, "Hallo");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(errorThrown instanceof TypeError, "group must be a Group object");

    // allocate: targetGroup ist nicht in Groupify
    errorThrown = null;
    try {
        groupify.allocate(student2, new Group("Foreign", 1, 2));
    } catch (error) {
        errorThrown = error;
    }   
    console.assert(errorThrown instanceof Error, "targetGroup does not belong to Groupify");
}

runTests();