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



    // ========================================
    // unallocate
    // ========================================

    // gültige Rückzuweisung
    groupify.unallocate(student1, group1);

    // Student wurde aus der Gruppe entfernt und zu unallocated hinzugefügt
    console.assert(
        group1.length() === 0,
        "unallocate should remove student from group"
    );

    console.assert(
        groupify.unallocated.length() === 2,
        "unallocate should add student back to unallocated"
    );


    //falscher Student/Group-Typ
    errorThrown = null;
    try {
        groupify.unallocate("Hallo", group1);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(errorThrown instanceof TypeError, "student must be a Student object");

    errorThrown = null;
    try {
        groupify.unallocate(student2, "Hallo");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(errorThrown instanceof TypeError, "group must be a Group object");

    // fremde Gruppe
    // allocate: targetGroup ist nicht in Groupify
    errorThrown = null;
    try {
        groupify.unallocate(student2, new Group("Foreign", 1, 2));
    } catch (error) {
        errorThrown = error;
    }   
    console.assert(errorThrown instanceof Error, "targetGroup does not belong to Groupify");


    // ========================================
    // move
    // ========================================
    //gültiger Move A → B
    groupify.allocate(student1, group1);
    groupify.move(group1, student1, group2);
    
    console.assert(
        group1.length() === 0,
        "move should remove student from srcGroup"
    );

    console.assert(
        group2.length() === 1,
        "move should add student to targetGroup"
    );

    //volle Target-Group
    const smallGroup = new Group("Small", 1, 1);
    const otherGroup = new Group("Other", 1, 2);
    const studentA = new Student("Anna A");
    const studentB = new Student("Bernd B");
    const groupifyFull = new Groupify(
        [smallGroup, otherGroup],
        [studentA, studentB]
    );

    groupifyFull.allocate(studentA, smallGroup);
    groupifyFull.allocate(studentB, otherGroup);

    errorThrown = null;
    try {
        groupifyFull.move(otherGroup, studentB, smallGroup);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "move to a full group should throw"
    );
    console.assert(
        otherGroup.length() === 1 && smallGroup.length() === 1,
        "failed move should not change group membership"
    );


    
    //fremde Source/Target-Group
    const moveGroupA = new Group("Move A", 1, 2);
    const moveGroupB = new Group("Move B", 1, 2);
    const foreignGroup = new Group("Foreign", 1, 2);
    const moveStudent = new Student("Clara C");
    const groupifyMove = new Groupify(
        [moveGroupA, moveGroupB],
        [moveStudent]
    );

    groupifyMove.allocate(moveStudent, moveGroupA);

    // fremde Source-Group
    errorThrown = null;
    try {
        groupifyMove.move(foreignGroup, moveStudent, moveGroupB);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "move from a foreign srcGroup should throw"
    );

    // fremde Target-Group
    errorThrown = null;
    try {
        groupifyMove.move(moveGroupA, moveStudent, foreignGroup);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "move to a foreign targetGroup should throw"
    );


    //Student nicht in Source
    errorThrown = null;
    try {
        groupifyMove.move(moveGroupB, moveStudent, moveGroupA);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "move should throw when student is not in srcGroup"
    );
    console.assert(
        moveGroupA.length() === 1 && moveGroupB.length() === 0,
        "failed move should not change group membership"
    );


    // ========================================
    // randAssign
    // ========================================

    // Student landet in einer verfügbaren Group + verschwindet aus unallocated
    const raGroup1 = new Group("RandA One", 1, 3);
    const raGroup2 = new Group("RandA Two", 1, 3);
    const raStudent = new Student("Dora Distel");
    const groupifyRand = new Groupify([raGroup1, raGroup2], [raStudent]);

    groupifyRand.randAssign(raStudent);

    console.assert(
        raGroup1.length() + raGroup2.length() === 1,
        "randAssign should place student in an available group"
    );
    console.assert(
        groupifyRand.unallocated.length() === 0,
        "randAssign should remove student from unallocated"
    );

    // volle Groups werden nicht gewählt
    const raFull = new Group("RandA Full", 1, 1);
    const raOpen = new Group("RandA Open", 1, 3);
    const raFiller = new Student("Emil Egal");
    const raPick = new Student("Frida Fein");
    const groupifyPick = new Groupify([raFull, raOpen], [raFiller, raPick]);

    groupifyPick.allocate(raFiller, raFull); // raFull ist jetzt voll
    groupifyPick.randAssign(raPick);

    console.assert(
        raOpen.length() === 1,
        "randAssign should choose the open group and skip full ones"
    );
    console.assert(
        raFull.length() === 1,
        "randAssign should not add to a full group"
    );

    // keine verfügbare Group → Error
    const raOnly = new Group("RandA Only", 1, 1);
    const raTaken = new Student("Gustav Gross");
    const raExtra = new Student("Hanna Hoch");
    const groupifyNone = new Groupify([raOnly], [raTaken, raExtra]);

    groupifyNone.allocate(raTaken, raOnly); // einzige Gruppe ist voll

    errorThrown = null;
    try {
        groupifyNone.randAssign(raExtra);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "randAssign should throw when no group is available"
    );

    // kleinere Groups werden vor grösseren gewählt
    const raSmall = new Group("Rand Small", 0, 3);
    const raBig = new Group("Rand Big", 0, 3);
    const raFirst = new Student("Ines Klein");
    const raSecond = new Student("Jonas Klein");
    const groupifyEven = new Groupify(
        [raSmall, raBig],
        [raFirst, raSecond]
    );

    groupifyEven.allocate(raFirst, raBig);
    groupifyEven.randAssign(raSecond);

    console.assert(
        raSmall.length() === 1 && raBig.length() === 1,
        "randAssign should choose a smallest available group"
    );


    // ========================================
    // randAssignAll
    // ========================================

    const raaGroup1 = new Group("RandAll One", 0, 2);
    const raaGroup2 = new Group("RandAll Two", 0, 2);
    const raaStudents = [
        new Student("Ida Igel"),
        new Student("Jan Jungmann"),
        new Student("Kira Klein")
    ];
    const groupifyAll = new Groupify([raaGroup1, raaGroup2], raaStudents);

    groupifyAll.randAssignAll();

    // alle Students werden zugewiesen
    console.assert(
        raaGroup1.length() + raaGroup2.length() === raaStudents.length,
        "randAssignAll should assign all students to groups"
    );

    // unallocated ist leer
    console.assert(
        groupifyAll.unallocated.length() === 0,
        "randAssignAll should empty unallocated"
    );

    // keine Group überschreitet max
    console.assert(
        raaGroup1.length() <= 2 && raaGroup2.length() <= 2,
        "randAssignAll should not exceed group max"
    );

    // Verteilung bleibt gleichmässig (kein 2,2,0)
    const evenA = new Group("Even A", 1, 2);
    const evenB = new Group("Even B", 1, 2);
    const evenC = new Group("Even C", 1, 2);
    const evenStudents = [
        new Student("Lisa Lang"),
        new Student("Mark Kurz"),
        new Student("Nina Neu"),
        new Student("Otto Obst")
    ];
    const groupifyEvenAll = new Groupify(
        [evenA, evenB, evenC],
        evenStudents
    );

    groupifyEvenAll.randAssignAll();

    const evenSizes = [evenA.length(), evenB.length(), evenC.length()];
    console.assert(
        evenSizes[0] + evenSizes[1] + evenSizes[2] === 4,
        "randAssignAll should assign all students evenly"
    );
    console.assert(
        Math.max(...evenSizes) - Math.min(...evenSizes) <= 1,
        "randAssignAll should keep group sizes within 1 of each other"
    );
}

runTests();