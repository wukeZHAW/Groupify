import { Groupify } from "../src/Groupify.js";
import { Student } from "../src/Student.js";
import { Group } from "../src/Group.js";

function runTests() {
    console.log("Starting Groupify.js tests ...");

    // Testdaten
    const group1 = new Group("Group 1");
    const group2 = new Group("Group 2");

    const student1 = new Student("Wu", "Kevin");
    const student2 = new Student("Müller", "Max");

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
        new Student("Albers", "Anna"),
        new Student("Bauer", "Bernd"),
        new Student("Conrad", "Clara"),
        new Student("Dunst", "Dora"),
        new Student("Engel", "Emil")
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
    console.assert(
        groupifyFromCount.groupSize === 3,
        "groupSize should be ceil(studentCount / numberOfGroups)"
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
        emptyGroupify.groups.length === 3 &&
            emptyGroupify.groupSize === 1,
        "empty roster should still create the requested groups"
    );
    console.assert(
        emptyGroupify.unallocated.length() === 0 &&
            emptyGroupify.groups[0].length() === 0 &&
            emptyGroupify.groups[1].length() === 0 &&
            emptyGroupify.groups[2].length() === 0,
        "empty roster should create empty groups and empty unallocated"
    );

    const lastStudent = new Student("One", "Last");
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

    groupifyLast.addStudent(new Student("Ok", "Again"));
    console.assert(
        groupifyLast.unallocated.length() === 1,
        "addStudent should work after Groupify became empty"
    );

    // ========================================
    // setNumberOfGroups
    // ========================================

    const rebuildStudents = [
        new Student("Frost", "Finn"),
        new Student("Grün", "Greta"),
        new Student("Hahn", "Hugo")
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
    console.assert(
        groupifyRebuild.groupSize === 1,
        "setNumberOfGroups should recompute groupSize from the current roster"
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
            groupifyRebuild.unallocated.length() === 3,
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
    // setStudentsPerGroup
    // ========================================

    const sizeStudents = [
        new Student("Iten", "Iris"),
        new Student("Jung", "Jonas"),
        new Student("Kurz", "Klara"),
        new Student("Lang", "Leo"),
        new Student("Meier", "Mira")
    ];
    const groupifySize = new Groupify(2, sizeStudents);
    const oldSizeGroup = groupifySize.groups[0];
    groupifySize.allocate(sizeStudents[0], oldSizeGroup);
    groupifySize.allocate(sizeStudents[1], groupifySize.groups[1]);

    // 5 students / 2 per group → ceil(5 / 2) = 3 groups
    groupifySize.setStudentsPerGroup(2);

    console.assert(
        groupifySize.groups.length === 3,
        "setStudentsPerGroup should create ceil(students / size) groups"
    );
    console.assert(
        groupifySize.groups[0].name === "Gruppe 1" &&
            groupifySize.groups[1].name === "Gruppe 2" &&
            groupifySize.groups[2].name === "Gruppe 3",
        "setStudentsPerGroup should name groups Gruppe N"
    );
    console.assert(
        groupifySize.unallocated.length() === sizeStudents.length,
        "setStudentsPerGroup should move all students to unallocated"
    );
    console.assert(
        groupifySize.groups.includes(oldSizeGroup) === false,
        "setStudentsPerGroup should replace the previous Group objects"
    );
    console.assert(
        groupifySize.groupSize === 2,
        "setStudentsPerGroup should keep the requested groupSize"
    );

    errorThrown = null;
    try {
        groupifySize.allocate(sizeStudents[1], oldSizeGroup);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "setStudentsPerGroup should reject allocate into a replaced group"
    );

    // size larger than roster → 1 group
    groupifySize.setStudentsPerGroup(10);
    console.assert(
        groupifySize.groups.length === 1 &&
            groupifySize.unallocated.length() === sizeStudents.length &&
            groupifySize.groupSize === 10,
        "setStudentsPerGroup should create 1 group when size exceeds roster"
    );

    errorThrown = null;
    try {
        groupifySize.setStudentsPerGroup(1.5);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof TypeError,
        "setStudentsPerGroup must receive an integer"
    );
    console.assert(
        groupifySize.groups.length === 1 &&
            groupifySize.unallocated.length() === sizeStudents.length,
        "failed setStudentsPerGroup should not change membership"
    );

    errorThrown = null;
    try {
        groupifySize.setStudentsPerGroup(0);
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof RangeError,
        "setStudentsPerGroup must be >= 1"
    );

    const emptySizeGroupify = new Groupify(3, []);
    emptySizeGroupify.setStudentsPerGroup(5);
    console.assert(
        emptySizeGroupify.groups.length === 1 &&
            emptySizeGroupify.unallocated.length() === 0 &&
            emptySizeGroupify.groupSize === 5,
        "setStudentsPerGroup with zero students should keep 1 empty group"
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
        groupify.allocate(student2, new Group("Foreign"));
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
        groupify.unallocate(student2, new Group("Foreign"));
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

    
    //fremde Source/Target-Group
    const moveGroupA = new Group("Move A");
    const moveGroupB = new Group("Move B");
    const foreignGroup = new Group("Foreign");
    const moveStudent = new Student("Conrad", "Clara");
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
    const raGroup1 = new Group("RandA One");
    const raGroup2 = new Group("RandA Two");
    const raStudent = new Student("Distel", "Dora");
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

    // kleinere Groups werden vor grösseren gewählt
    const raSmall = new Group("Rand Small");
    const raBig = new Group("Rand Big");
    const raFirst = new Student("Klein", "Ines");
    const raSecond = new Student("Klein", "Jonas");
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

    const raaGroup1 = new Group("RandAll One");
    const raaGroup2 = new Group("RandAll Two");
    const raaStudents = [
        new Student("Igel", "Ida"),
        new Student("Jungmann", "Jan"),
        new Student("Klein", "Kira")
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

    // Verteilung bleibt gleichmässig (kein 2,2,0)
    const evenA = new Group("Even A");
    const evenB = new Group("Even B");
    const evenC = new Group("Even C");
    const evenStudents = [
        new Student("Lang", "Lisa"),
        new Student("Kurz", "Mark"),
        new Student("Neu", "Nina"),
        new Student("Obst", "Otto")
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

    const addGroup = new Group("Add Group");
    const addExisting = new Student("Park", "Paul");
    const groupifyAdd = new Groupify([addGroup], [addExisting]);

    const addNew = new Student("Reis", "Rita");
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
        groupifyAdd.addStudent(new Student("park", "paul"));
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
    // addStudent: weitere Students
    // ========================================

    const capFirst = new Student("One", "Cap");
    const groupifyCap = new Groupify(3, [capFirst]);
    groupifyCap.allocate(capFirst, groupifyCap.groups[0]);

    groupifyCap.addStudent(new Student("Two", "Cap"));
    groupifyCap.addStudent(new Student("Three", "Cap"));
    groupifyCap.addStudent(new Student("Four", "Cap"));
    groupifyCap.addStudent(new Student("Five", "Cap"));

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
    groupifyEmptyCap.addStudent(new Student("Able", "Empty"));
    groupifyEmptyCap.addStudent(new Student("Best", "Empty"));
    groupifyEmptyCap.addStudent(new Student("Cain", "Empty"));
    groupifyEmptyCap.addStudent(new Student("Dale", "Empty"));
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

    const renameGroup = new Group("Group A");
    const renameOther = new Group("Group B");
    const groupifyRename = new Groupify(
        [renameGroup, renameOther],
        [new Student("One", "Rename")]
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
        groupifyRename.renameGroup(new Group("Foreign"), "Gruppe Y");
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

    // ========================================
    // groupSize
    // ========================================

    const thirtyStudents = [];
    for (let i = 1; i <= 30; i++) {
        thirtyStudents.push(new Student("Name" + i, "Vor" + i));
    }

    console.assert(
        new Groupify(7, thirtyStudents).groupSize === 5,
        "30 students / 7 groups should yield groupSize 5"
    );
    console.assert(
        new Groupify(5, thirtyStudents).groupSize === 6,
        "30 students / 5 groups should yield groupSize 6"
    );

    const threeStudents = [
        new Student("Aa", "One"),
        new Student("Bb", "Two"),
        new Student("Cc", "Three")
    ];
    console.assert(
        new Groupify(7, threeStudents).groupSize === 1,
        "3 students / 7 groups should yield groupSize 1"
    );

    const groupifyPerGroup = new Groupify(7, thirtyStudents);
    groupifyPerGroup.setStudentsPerGroup(5);
    console.assert(
        groupifyPerGroup.groupSize === 5 &&
            groupifyPerGroup.groups.length === 6,
        "setStudentsPerGroup(5) should set groupSize 5 and create 6 groups"
    );

    const sizeKeep = new Groupify(2, countStudents);
    sizeKeep.setStudentsPerGroup(4);
    console.assert(
        sizeKeep.groupSize === 4 && sizeKeep.groups.length === 2,
        "setStudentsPerGroup should not overwrite groupSize via setNumberOfGroups"
    );

    const overA = new Group("Over A");
    const overB = new Group("Over B");
    const over1 = new Student("One", "Over");
    const over2 = new Student("Two", "Over");
    const over3 = new Student("Three", "Over");
    const groupifyOver = new Groupify(
        [overA, overB],
        [over1, over2, over3]
    );
    groupifyOver.allocate(over1, overA);
    groupifyOver.allocate(over2, overA);
    groupifyOver.allocate(over3, overB);
    groupifyOver.move(overB, over3, overA);
    console.assert(
        overA.length() === 3 && groupifyOver.groupSize === 2,
        "move should allow a group to exceed groupSize"
    );

    // ========================================
    // getGroupStatus
    // ========================================

    const statusGroup = new Group("Status");
    const statusStudents = [
        new Student("Stat", "One"),
        new Student("Stat", "Two"),
        new Student("Stat", "Three"),
        new Student("Stat", "Four"),
        new Student("Stat", "Five"),
        new Student("Stat", "Six")
    ];
    const groupifyStatus = new Groupify(
        [statusGroup],
        statusStudents.slice(0, 5)
    );

    groupifyStatus.allocate(statusStudents[0], statusGroup);
    groupifyStatus.allocate(statusStudents[1], statusGroup);
    groupifyStatus.allocate(statusStudents[2], statusGroup);
    groupifyStatus.allocate(statusStudents[3], statusGroup);
    console.assert(
        groupifyStatus.groupSize === 5 &&
            groupifyStatus.getGroupStatus(statusGroup) === "under",
        "group below groupSize should be under"
    );

    groupifyStatus.allocate(statusStudents[4], statusGroup);
    console.assert(
        groupifyStatus.getGroupStatus(statusGroup) === "complete",
        "group at groupSize should be complete"
    );

    groupifyStatus.addStudent(statusStudents[5]);
    groupifyStatus.allocate(statusStudents[5], statusGroup);
    console.assert(
        statusGroup.length() === 6 &&
            groupifyStatus.getGroupStatus(statusGroup) === "over",
        "group above groupSize should be over"
    );

    errorThrown = null;
    try {
        groupifyStatus.getGroupStatus("Hallo");
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof TypeError,
        "getGroupStatus should require a Group object"
    );

    errorThrown = null;
    try {
        groupifyStatus.getGroupStatus(new Group("Foreign"));
    } catch (error) {
        errorThrown = error;
    }
    console.assert(
        errorThrown instanceof Error,
        "getGroupStatus should reject a foreign group"
    );
}

runTests();