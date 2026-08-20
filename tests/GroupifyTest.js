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
    // constructor: numberOfGroups
    // ========================================

    const countStudents = [
        new Student("Anna A"),
        new Student("Bernd B"),
        new Student("Clara C"),
        new Student("Dora D"),
        new Student("Emil E")
    ];
    const groupifyFromCount = new Groupify(2, countStudents);

    console.assert(
        groupifyFromCount.groups.length === 2,
        "numberOfGroups constructor should create that many groups"
    );
    console.assert(
        groupifyFromCount.groups[0].name === "Gruppe 1" &&
            groupifyFromCount.groups[1].name === "Gruppe 2",
        "numberOfGroups constructor should name groups Gruppe N"
    );
    console.assert(
        groupifyFromCount.unallocated.length() === countStudents.length,
        "numberOfGroups constructor should put all students in unallocated"
    );

    // min = floor(5 / 2) = 2
    groupifyFromCount.allocate(countStudents[0], groupifyFromCount.groups[0]);
    console.assert(
        groupifyFromCount.groups[0].isComplete() === false,
        "group min should be floor(studentCount / numberOfGroups)"
    );
    groupifyFromCount.allocate(countStudents[1], groupifyFromCount.groups[0]);
    console.assert(
        groupifyFromCount.groups[0].isComplete() === true,
        "group should be complete once it reaches min"
    );

    // max = studentCount = 5
    groupifyFromCount.allocate(countStudents[2], groupifyFromCount.groups[0]);
    groupifyFromCount.allocate(countStudents[3], groupifyFromCount.groups[0]);
    console.assert(
        groupifyFromCount.groups[0].isFull() === false,
        "group max should be studentCount, not a tight per-group cap"
    );
    groupifyFromCount.allocate(countStudents[4], groupifyFromCount.groups[0]);
    console.assert(
        groupifyFromCount.groups[0].isFull() === true,
        "group should be full when it contains all students"
    );

    errorThrown = null;
    try {
        new Groupify(1.5, countStudents);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof TypeError,
        "numberOfGroups must be an integer"
    );

    errorThrown = null;
    try {
        new Groupify(0, countStudents);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof RangeError,
        "numberOfGroups must be >= 1"
    );

    const emptyGroupify = new Groupify(3, []);
    console.assert(
        emptyGroupify.groups.length === 3,
        "empty roster should still create the requested groups"
    );
    console.assert(
        emptyGroupify.unallocated.length() === 0 &&
            emptyGroupify.groups[0].length() === 0 &&
            emptyGroupify.groups[1].length() === 0 &&
            emptyGroupify.groups[2].length() === 0,
        "empty roster should create empty groups and empty unallocated"
    );

    const lastStudent = new Student("Last One");
    const groupifyLast = new Groupify(3, [lastStudent]);
    groupifyLast.removeStudent(lastStudent);
    console.assert(
        groupifyLast.groups.length === 3 &&
            groupifyLast.unallocated.length() === 0,
        "removing the last student should leave Groupify empty but intact"
    );

    groupifyLast.setNumberOfGroups(5);
    console.assert(
        groupifyLast.groups.length === 5 &&
            groupifyLast.unallocated.length() === 0,
        "setNumberOfGroups should work with zero students"
    );

    groupifyLast.addStudent(new Student("Again Ok"));
    console.assert(
        groupifyLast.unallocated.length() === 1,
        "addStudent should work after Groupify became empty"
    );

    // ========================================
    // setNumberOfGroups
    // ========================================

    const rebuildStudents = [
        new Student("Finn F"),
        new Student("Greta G"),
        new Student("Hugo H")
    ];
    const groupifyRebuild = new Groupify(2, rebuildStudents);
    const oldGroup = groupifyRebuild.groups[0];
    groupifyRebuild.allocate(rebuildStudents[0], oldGroup);
    groupifyRebuild.allocate(rebuildStudents[1], groupifyRebuild.groups[1]);

    groupifyRebuild.setNumberOfGroups(3);

    console.assert(
        groupifyRebuild.groups.length === 3,
        "setNumberOfGroups should replace groups with the new count"
    );
    console.assert(
        groupifyRebuild.groups[0].name === "Gruppe 1" &&
            groupifyRebuild.groups[1].name === "Gruppe 2" &&
            groupifyRebuild.groups[2].name === "Gruppe 3",
        "setNumberOfGroups should name groups Gruppe N"
    );
    console.assert(
        groupifyRebuild.unallocated.length() === rebuildStudents.length,
        "setNumberOfGroups should move all students to unallocated"
    );
    console.assert(
        groupifyRebuild.groups.includes(oldGroup) === false,
        "setNumberOfGroups should replace the previous Group objects"
    );

    // min = floor(3 / 3) = 1
    groupifyRebuild.allocate(rebuildStudents[0], groupifyRebuild.groups[0]);
    console.assert(
        groupifyRebuild.groups[0].isComplete() === true,
        "setNumberOfGroups should recompute min from the current roster"
    );

    errorThrown = null;
    try {
        groupifyRebuild.allocate(rebuildStudents[1], oldGroup);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "setNumberOfGroups should reject allocate into a replaced group"
    );

    errorThrown = null;
    try {
        groupifyRebuild.setNumberOfGroups(1.5);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof TypeError,
        "setNumberOfGroups must receive an integer"
    );
    console.assert(
        groupifyRebuild.groups.length === 3 &&
            groupifyRebuild.unallocated.length() === 2,
        "failed setNumberOfGroups should not change membership"
    );

    errorThrown = null;
    try {
        groupifyRebuild.setNumberOfGroups(0);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof RangeError,
        "setNumberOfGroups must be >= 1"
    );

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


    // ========================================
    // addStudent / removeStudent
    // ========================================

    const addGroup = new Group("Add Group", 0, 3);
    const addExisting = new Student("Paul Park");
    const groupifyAdd = new Groupify([addGroup], [addExisting]);

    const addNew = new Student("Rita Reis");
    groupifyAdd.addStudent(addNew);

    console.assert(
        groupifyAdd.unallocated.length() === 2,
        "addStudent should place the student in unallocated"
    );

    errorThrown = null;
    try {
        groupifyAdd.addStudent("Hallo");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof TypeError,
        "addStudent should require a Student object"
    );

    errorThrown = null;
    try {
        groupifyAdd.addStudent(addExisting);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "addStudent should reject a student already in Groupify"
    );
    console.assert(
        groupifyAdd.unallocated.length() === 2,
        "failed addStudent should not change membership"
    );

    errorThrown = null;
    try {
        groupifyAdd.addStudent(new Student("paul park"));
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "addStudent should reject a duplicate name case-insensitively"
    );
    console.assert(
        groupifyAdd.unallocated.length() === 2,
        "failed duplicate-name addStudent should not change membership"
    );

    groupifyAdd.allocate(addExisting, addGroup);
    groupifyAdd.removeStudent(addExisting);

    console.assert(
        addGroup.length() === 0,
        "removeStudent should remove an allocated student from the group"
    );
    console.assert(
        groupifyAdd.unallocated.length() === 1,
        "removeStudent should not leave the student in unallocated"
    );

    groupifyAdd.removeStudent(addNew);

    console.assert(
        groupifyAdd.unallocated.length() === 0,
        "removeStudent should remove an unallocated student"
    );

    errorThrown = null;
    try {
        groupifyAdd.removeStudent(addNew);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "removeStudent should reject a student that is not in Groupify"
    );

    errorThrown = null;
    try {
        groupifyAdd.removeStudent("Hallo");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof TypeError,
        "removeStudent should require a Student object"
    );

    // ========================================
    // addStudent: dynamic capacity
    // ========================================

    const capFirst = new Student("Cap One");
    const groupifyCap = new Groupify(3, [capFirst]);
    groupifyCap.allocate(capFirst, groupifyCap.groups[0]);

    groupifyCap.addStudent(new Student("Cap Two"));
    groupifyCap.addStudent(new Student("Cap Three"));
    groupifyCap.addStudent(new Student("Cap Four"));
    groupifyCap.addStudent(new Student("Cap Five"));

    console.assert(
        groupifyCap.groups[0].length() === 1 &&
            groupifyCap.groups[0].getStudent(0) === capFirst,
        "addStudent should not change existing allocations"
    );

    groupifyCap.randAssignAll();

    console.assert(
        groupifyCap.unallocated.length() === 0,
        "randAssignAll should empty unallocated after dynamic adds"
    );

    const capSizes = [
        groupifyCap.groups[0].length(),
        groupifyCap.groups[1].length(),
        groupifyCap.groups[2].length()
    ];
    console.assert(
        capSizes[0] + capSizes[1] + capSizes[2] === 5,
        "randAssignAll should assign all dynamically added students"
    );
    console.assert(
        Math.max(...capSizes) - Math.min(...capSizes) <= 1,
        "randAssignAll should keep group sizes within 1 after dynamic adds"
    );

    const groupifyEmptyCap = new Groupify(3, []);
    groupifyEmptyCap.addStudent(new Student("Empty A"));
    groupifyEmptyCap.addStudent(new Student("Empty B"));
    groupifyEmptyCap.addStudent(new Student("Empty C"));
    groupifyEmptyCap.addStudent(new Student("Empty D"));
    groupifyEmptyCap.randAssignAll();

    console.assert(
        groupifyEmptyCap.unallocated.length() === 0,
        "randAssignAll should work after adding into an empty Groupify"
    );

    const emptyCapSizes = [
        groupifyEmptyCap.groups[0].length(),
        groupifyEmptyCap.groups[1].length(),
        groupifyEmptyCap.groups[2].length()
    ];
    console.assert(
        emptyCapSizes[0] + emptyCapSizes[1] + emptyCapSizes[2] === 4,
        "randAssignAll should assign all students added to an empty Groupify"
    );
    console.assert(
        Math.max(...emptyCapSizes) - Math.min(...emptyCapSizes) <= 1,
        "randAssignAll should keep group sizes within 1 after empty-state adds"
    );

    // ========================================
    // renameGroup
    // ========================================

    const renameGroup = new Group("Group A", 0, 2);
    const renameOther = new Group("Group B", 0, 2);
    const groupifyRename = new Groupify(
        [renameGroup, renameOther],
        [new Student("Rename One")]
    );

    groupifyRename.renameGroup(renameGroup, "Gruppe X");
    console.assert(
        renameGroup.name === "Gruppe X",
        "renameGroup should update the group name"
    );

    errorThrown = null;
    try {
        groupifyRename.renameGroup("Hallo", "Gruppe Y");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof TypeError,
        "renameGroup should require a Group object"
    );

    errorThrown = null;
    try {
        groupifyRename.renameGroup(new Group("Foreign", 0, 2), "Gruppe Y");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "renameGroup should reject a foreign group"
    );
    console.assert(
        renameGroup.name === "Gruppe X",
        "failed foreign renameGroup should not change names"
    );

    errorThrown = null;
    try {
        groupifyRename.renameGroup(renameGroup, "");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof RangeError,
        "renameGroup should reject an invalid name via Group"
    );
    console.assert(
        renameGroup.name === "Gruppe X",
        "failed renameGroup should leave the old name unchanged"
    );

    errorThrown = null;
    try {
        groupifyRename.renameGroup(renameGroup, "Group B");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "renameGroup should reject a name that already exists"
    );
    console.assert(
        renameGroup.name === "Gruppe X",
        "failed duplicate renameGroup should leave the old name unchanged"
    );

    errorThrown = null;
    try {
        groupifyRename.renameGroup(renameGroup, "group b");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "renameGroup should reject a duplicate name case-insensitively"
    );

    groupifyRename.renameGroup(renameGroup, "Gruppe X");
    console.assert(
        renameGroup.name === "Gruppe X",
        "renameGroup should allow keeping the current name"
    );
}

runTests();