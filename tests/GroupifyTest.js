import assert from "node:assert/strict";
import { Groupify } from "../js/Groupify.js";
import { Person } from "../js/Person.js";
import { Group } from "../js/Group.js";

function runTests() {
    console.log("Starting Groupify.js tests ...");

    // Testdaten
    const group1 = new Group("Group 1");
    const group2 = new Group("Group 2");

    const person1 = new Person("Wu", "Kevin");
    const person2 = new Person("Müller", "Max");

    const groups = [group1, group2];
    const persons = [person1, person2];

    // gültiger Constructor
    const groupify = new Groupify(groups, persons);

    // groups ist kein Array
    assert.throws(
        () => new Groupify("Hallo", persons),
        TypeError,
        "groups must be an array"
    );

    // groups enthält etwas amderes als Group-Objekte
    assert.throws(
        () => new Groupify([group1, "hallo"], persons),
        TypeError,
        "groups must contain only Group objects"
    );

    // persons ist kein Array
    assert.throws(
        () => new Groupify(groups, "Hallo"),
        TypeError,
        "persons must be an array"
    );

    // persons enthält keine Person-Objekte
    assert.throws(
        () => new Groupify(groups, [person1, "hallo"]),
        TypeError,
        "persons must contain only Person objects"
    );

    // ========================================
    // constructor: numberOfGroups
    // ========================================

    const countPersons = [
        new Person("Albers", "Anna"),
        new Person("Bauer", "Bernd"),
        new Person("Conrad", "Clara"),
        new Person("Dunst", "Dora"),
        new Person("Engel", "Emil")
    ];
    const groupifyFromCount = new Groupify(2, countPersons);

    assert.equal(
        groupifyFromCount.groups.length,
        2,
        "numberOfGroups constructor should create that many groups"
    );
    assert.equal(
        groupifyFromCount.groups[0].name,
        "Gruppe 1",
        "numberOfGroups constructor should name groups Gruppe N"
    );
    assert.equal(
        groupifyFromCount.groups[1].name,
        "Gruppe 2",
        "numberOfGroups constructor should name groups Gruppe N"
    );
    assert.equal(
        groupifyFromCount.unallocated.length(),
        countPersons.length,
        "numberOfGroups constructor should put all persons in unallocated"
    );
    assert.equal(
        groupifyFromCount.groupSize,
        3,
        "groupSize should be ceil(personCount / numberOfGroups)"
    );

    assert.throws(
        () => new Groupify(1.5, countPersons),
        TypeError,
        "numberOfGroups must be an integer"
    );

    assert.throws(
        () => new Groupify(0, countPersons),
        RangeError,
        "numberOfGroups must be >= 1"
    );

    const emptyGroupify = new Groupify(3, []);
    assert.equal(
        emptyGroupify.groups.length,
        3,
        "empty roster should still create the requested groups"
    );
    assert.equal(
        emptyGroupify.groupSize,
        1,
        "empty roster should still create the requested groups"
    );
    assert.equal(
        emptyGroupify.unallocated.length(),
        0,
        "empty roster should create empty groups and empty unallocated"
    );
    assert.equal(
        emptyGroupify.groups[0].length(),
        0,
        "empty roster should create empty groups and empty unallocated"
    );
    assert.equal(
        emptyGroupify.groups[1].length(),
        0,
        "empty roster should create empty groups and empty unallocated"
    );
    assert.equal(
        emptyGroupify.groups[2].length(),
        0,
        "empty roster should create empty groups and empty unallocated"
    );

    const lastPerson = new Person("One", "Last");
    const groupifyLast = new Groupify(3, [lastPerson]);
    groupifyLast.removePerson(lastPerson);
    assert.equal(
        groupifyLast.groups.length,
        3,
        "removing the last person should leave Groupify empty but intact"
    );
    assert.equal(
        groupifyLast.unallocated.length(),
        0,
        "removing the last person should leave Groupify empty but intact"
    );

    groupifyLast.setNumberOfGroups(5);
    assert.equal(
        groupifyLast.groups.length,
        5,
        "setNumberOfGroups should work with zero persons"
    );
    assert.equal(
        groupifyLast.unallocated.length(),
        0,
        "setNumberOfGroups should work with zero persons"
    );

    groupifyLast.addPerson(new Person("Ok", "Again"));
    assert.equal(
        groupifyLast.unallocated.length(),
        1,
        "addPerson should work after Groupify became empty"
    );

    // ========================================
    // setNumberOfGroups
    // ========================================

    const rebuildPersons = [
        new Person("Frost", "Finn"),
        new Person("Grün", "Greta"),
        new Person("Hahn", "Hugo")
    ];
    const groupifyRebuild = new Groupify(2, rebuildPersons);
    const oldGroup = groupifyRebuild.groups[0];
    groupifyRebuild.allocate(rebuildPersons[0], oldGroup);
    groupifyRebuild.allocate(rebuildPersons[1], groupifyRebuild.groups[1]);

    groupifyRebuild.setNumberOfGroups(3);

    assert.equal(
        groupifyRebuild.groups.length,
        3,
        "setNumberOfGroups should replace groups with the new count"
    );
    assert.equal(
        groupifyRebuild.groups[0].name,
        "Gruppe 1",
        "setNumberOfGroups should name groups Gruppe N"
    );
    assert.equal(
        groupifyRebuild.groups[1].name,
        "Gruppe 2",
        "setNumberOfGroups should name groups Gruppe N"
    );
    assert.equal(
        groupifyRebuild.groups[2].name,
        "Gruppe 3",
        "setNumberOfGroups should name groups Gruppe N"
    );
    assert.equal(
        groupifyRebuild.unallocated.length(),
        rebuildPersons.length,
        "setNumberOfGroups should move all persons to unallocated"
    );
    assert.equal(
        groupifyRebuild.groups.includes(oldGroup),
        false,
        "setNumberOfGroups should replace the previous Group objects"
    );
    assert.equal(
        groupifyRebuild.groupSize,
        1,
        "setNumberOfGroups should recompute groupSize from the current roster"
    );

    assert.throws(
        () => groupifyRebuild.allocate(rebuildPersons[1], oldGroup),
        Error,
        "setNumberOfGroups should reject allocate into a replaced group"
    );

    assert.throws(
        () => groupifyRebuild.setNumberOfGroups(1.5),
        TypeError,
        "setNumberOfGroups must receive an integer"
    );
    assert.equal(
        groupifyRebuild.groups.length,
        3,
        "failed setNumberOfGroups should not change membership"
    );
    assert.equal(
        groupifyRebuild.unallocated.length(),
        3,
        "failed setNumberOfGroups should not change membership"
    );

    assert.throws(
        () => groupifyRebuild.setNumberOfGroups(0),
        RangeError,
        "setNumberOfGroups must be >= 1"
    );

    // ========================================
    // setPersonsPerGroup
    // ========================================

    const sizePersons = [
        new Person("Iten", "Iris"),
        new Person("Jung", "Jonas"),
        new Person("Kurz", "Klara"),
        new Person("Lang", "Leo"),
        new Person("Meier", "Mira")
    ];
    const groupifySize = new Groupify(2, sizePersons);
    const oldSizeGroup = groupifySize.groups[0];
    groupifySize.allocate(sizePersons[0], oldSizeGroup);
    groupifySize.allocate(sizePersons[1], groupifySize.groups[1]);

    // 5 persons / 2 per group → ceil(5 / 2) = 3 groups
    groupifySize.setPersonsPerGroup(2);

    assert.equal(
        groupifySize.groups.length,
        3,
        "setPersonsPerGroup should create ceil(persons / size) groups"
    );
    assert.equal(
        groupifySize.groups[0].name,
        "Gruppe 1",
        "setPersonsPerGroup should name groups Gruppe N"
    );
    assert.equal(
        groupifySize.groups[1].name,
        "Gruppe 2",
        "setPersonsPerGroup should name groups Gruppe N"
    );
    assert.equal(
        groupifySize.groups[2].name,
        "Gruppe 3",
        "setPersonsPerGroup should name groups Gruppe N"
    );
    assert.equal(
        groupifySize.unallocated.length(),
        sizePersons.length,
        "setPersonsPerGroup should move all persons to unallocated"
    );
    assert.equal(
        groupifySize.groups.includes(oldSizeGroup),
        false,
        "setPersonsPerGroup should replace the previous Group objects"
    );
    assert.equal(
        groupifySize.groupSize,
        2,
        "setPersonsPerGroup should keep the requested groupSize"
    );

    assert.throws(
        () => groupifySize.allocate(sizePersons[1], oldSizeGroup),
        Error,
        "setPersonsPerGroup should reject allocate into a replaced group"
    );

    // size larger than roster → 1 group
    groupifySize.setPersonsPerGroup(10);
    assert.equal(
        groupifySize.groups.length,
        1,
        "setPersonsPerGroup should create 1 group when size exceeds roster"
    );
    assert.equal(
        groupifySize.unallocated.length(),
        sizePersons.length,
        "setPersonsPerGroup should create 1 group when size exceeds roster"
    );
    assert.equal(
        groupifySize.groupSize,
        10,
        "setPersonsPerGroup should create 1 group when size exceeds roster"
    );

    assert.throws(
        () => groupifySize.setPersonsPerGroup(1.5),
        TypeError,
        "setPersonsPerGroup must receive an integer"
    );
    assert.equal(
        groupifySize.groups.length,
        1,
        "failed setPersonsPerGroup should not change membership"
    );
    assert.equal(
        groupifySize.unallocated.length(),
        sizePersons.length,
        "failed setPersonsPerGroup should not change membership"
    );

    assert.throws(
        () => groupifySize.setPersonsPerGroup(0),
        RangeError,
        "setPersonsPerGroup must be >= 1"
    );

    const emptySizeGroupify = new Groupify(3, []);
    emptySizeGroupify.setPersonsPerGroup(5);
    assert.equal(
        emptySizeGroupify.groups.length,
        1,
        "setPersonsPerGroup with zero persons should keep 1 empty group"
    );
    assert.equal(
        emptySizeGroupify.unallocated.length(),
        0,
        "setPersonsPerGroup with zero persons should keep 1 empty group"
    );
    assert.equal(
        emptySizeGroupify.groupSize,
        5,
        "setPersonsPerGroup with zero persons should keep 1 empty group"
    );

    // ========================================
    // allocate: gültige Zuweisung
    // ========================================

    // gültige Zuweisung
    groupify.allocate(person1, group1);

    // Person wurde der Zielgruppe hinzugefügt und aus unallocated entfernt
    assert.equal(
        group1.length(),
        1,
        "allocate should add person to target group"
    );

    assert.equal(
        groupify.unallocated.length(),
        1,
        "allocate should remove person from unallocated"
    );

    // allocate person ist kein person
    assert.throws(
        () => groupify.allocate("Hallo", group1),
        TypeError,
        "person must be a Person object"
    );

    // allocate group ist kein Group
    assert.throws(
        () => groupify.allocate(person2, "Hallo"),
        TypeError,
        "group must be a Group object"
    );

    // allocate: targetGroup ist nicht in Groupify
    assert.throws(
        () => groupify.allocate(person2, new Group("Foreign")),
        Error,
        "targetGroup does not belong to Groupify"
    );



    // ========================================
    // unallocate
    // ========================================

    // gültige Rückzuweisung
    groupify.unallocate(person1, group1);

    // Person wurde aus der Gruppe entfernt und zu unallocated hinzugefügt
    assert.equal(
        group1.length(),
        0,
        "unallocate should remove person from group"
    );

    assert.equal(
        groupify.unallocated.length(),
        2,
        "unallocate should add person back to unallocated"
    );


    //falscher Person/Group-Typ
    assert.throws(
        () => groupify.unallocate("Hallo", group1),
        TypeError,
        "person must be a Person object"
    );

    assert.throws(
        () => groupify.unallocate(person2, "Hallo"),
        TypeError,
        "group must be a Group object"
    );

    // fremde Gruppe
    // allocate: targetGroup ist nicht in Groupify
    assert.throws(
        () => groupify.unallocate(person2, new Group("Foreign")),
        Error,
        "targetGroup does not belong to Groupify"
    );


    // ========================================
    // move
    // ========================================
    //gültiger Move A → B
    groupify.allocate(person1, group1);
    groupify.move(group1, person1, group2);
    
    assert.equal(
        group1.length(),
        0,
        "move should remove person from srcGroup"
    );

    assert.equal(
        group2.length(),
        1,
        "move should add person to targetGroup"
    );

    
    //fremde Source/Target-Group
    const moveGroupA = new Group("Move A");
    const moveGroupB = new Group("Move B");
    const foreignGroup = new Group("Foreign");
    const movePerson = new Person("Conrad", "Clara");
    const groupifyMove = new Groupify(
        [moveGroupA, moveGroupB],
        [movePerson]
    );

    groupifyMove.allocate(movePerson, moveGroupA);

    // fremde Source-Group
    assert.throws(
        () => groupifyMove.move(foreignGroup, movePerson, moveGroupB),
        Error,
        "move from a foreign srcGroup should throw"
    );

    // fremde Target-Group
    assert.throws(
        () => groupifyMove.move(moveGroupA, movePerson, foreignGroup),
        Error,
        "move to a foreign targetGroup should throw"
    );


    //Person nicht in Source
    assert.throws(
        () => groupifyMove.move(moveGroupB, movePerson, moveGroupA),
        Error,
        "move should throw when person is not in srcGroup"
    );
    assert.equal(
        moveGroupA.length(),
        1,
        "failed move should not change group membership"
    );
    assert.equal(
        moveGroupB.length(),
        0,
        "failed move should not change group membership"
    );


    // ========================================
    // randAssign
    // ========================================

    // Person landet in einer verfügbaren Group + verschwindet aus unallocated
    const raGroup1 = new Group("RandA One");
    const raGroup2 = new Group("RandA Two");
    const raPerson = new Person("Distel", "Dora");
    const groupifyRand = new Groupify([raGroup1, raGroup2], [raPerson]);

    groupifyRand.randAssign(raPerson);

    assert.equal(
        raGroup1.length() + raGroup2.length(),
        1,
        "randAssign should place person in an available group"
    );
    assert.equal(
        groupifyRand.unallocated.length(),
        0,
        "randAssign should remove person from unallocated"
    );

    // kleinere Groups werden vor grösseren gewählt
    const raSmall = new Group("Rand Small");
    const raBig = new Group("Rand Big");
    const raFirst = new Person("Klein", "Ines");
    const raSecond = new Person("Klein", "Jonas");
    const groupifyEven = new Groupify(
        [raSmall, raBig],
        [raFirst, raSecond]
    );

    groupifyEven.allocate(raFirst, raBig);
    groupifyEven.randAssign(raSecond);

    assert.equal(
        raSmall.length(),
        1,
        "randAssign should choose a smallest available group"
    );
    assert.equal(
        raBig.length(),
        1,
        "randAssign should choose a smallest available group"
    );


    // ========================================
    // randAssignAll
    // ========================================

    const raaGroup1 = new Group("RandAll One");
    const raaGroup2 = new Group("RandAll Two");
    const raaPersons = [
        new Person("Igel", "Ida"),
        new Person("Jungmann", "Jan"),
        new Person("Klein", "Kira")
    ];
    const groupifyAll = new Groupify([raaGroup1, raaGroup2], raaPersons);

    groupifyAll.randAssignAll();

    // alle Persons werden zugewiesen
    assert.equal(
        raaGroup1.length() + raaGroup2.length(),
        raaPersons.length,
        "randAssignAll should assign all persons to groups"
    );

    // unallocated ist leer
    assert.equal(
        groupifyAll.unallocated.length(),
        0,
        "randAssignAll should empty unallocated"
    );

    // Verteilung bleibt gleichmässig (kein 2,2,0)
    const evenA = new Group("Even A");
    const evenB = new Group("Even B");
    const evenC = new Group("Even C");
    const evenPersons = [
        new Person("Lang", "Lisa"),
        new Person("Kurz", "Mark"),
        new Person("Neu", "Nina"),
        new Person("Obst", "Otto")
    ];
    const groupifyEvenAll = new Groupify(
        [evenA, evenB, evenC],
        evenPersons
    );

    groupifyEvenAll.randAssignAll();

    const evenSizes = [evenA.length(), evenB.length(), evenC.length()];
    assert.equal(
        evenSizes[0] + evenSizes[1] + evenSizes[2],
        4,
        "randAssignAll should assign all persons evenly"
    );
    assert(
        Math.max(...evenSizes) - Math.min(...evenSizes) <= 1,
        "randAssignAll should keep group sizes within 1 of each other"
    );


    // ========================================
    // addPerson / removePerson
    // ========================================

    const addGroup = new Group("Add Group");
    const addExisting = new Person("Park", "Paul");
    const groupifyAdd = new Groupify([addGroup], [addExisting]);

    const addNew = new Person("Reis", "Rita");
    groupifyAdd.addPerson(addNew);

    assert.equal(
        groupifyAdd.unallocated.length(),
        2,
        "addPerson should place the person in unallocated"
    );

    assert.throws(
        () => groupifyAdd.addPerson("Hallo"),
        TypeError,
        "addPerson should require a Person object"
    );

    assert.throws(
        () => groupifyAdd.addPerson(addExisting),
        Error,
        "addPerson should reject a person already in Groupify"
    );
    assert.equal(
        groupifyAdd.unallocated.length(),
        2,
        "failed addPerson should not change membership"
    );

    assert.throws(
        () => groupifyAdd.addPerson(new Person("park", "paul")),
        Error,
        "addPerson should reject a duplicate name case-insensitively"
    );
    assert.equal(
        groupifyAdd.unallocated.length(),
        2,
        "failed duplicate-name addPerson should not change membership"
    );

    groupifyAdd.allocate(addExisting, addGroup);
    groupifyAdd.removePerson(addExisting);

    assert.equal(
        addGroup.length(),
        0,
        "removePerson should remove an allocated person from the group"
    );
    assert.equal(
        groupifyAdd.unallocated.length(),
        1,
        "removePerson should not leave the person in unallocated"
    );

    groupifyAdd.removePerson(addNew);

    assert.equal(
        groupifyAdd.unallocated.length(),
        0,
        "removePerson should remove an unallocated person"
    );

    assert.throws(
        () => groupifyAdd.removePerson(addNew),
        Error,
        "removePerson should reject a person that is not in Groupify"
    );

    assert.throws(
        () => groupifyAdd.removePerson("Hallo"),
        TypeError,
        "removePerson should require a Person object"
    );

    // ========================================
    // addPerson: weitere Persons
    // ========================================

    const capFirst = new Person("One", "Cap");
    const groupifyCap = new Groupify(3, [capFirst]);
    groupifyCap.allocate(capFirst, groupifyCap.groups[0]);

    groupifyCap.addPerson(new Person("Two", "Cap"));
    groupifyCap.addPerson(new Person("Three", "Cap"));
    groupifyCap.addPerson(new Person("Four", "Cap"));
    groupifyCap.addPerson(new Person("Five", "Cap"));

    assert.equal(
        groupifyCap.groups[0].length(),
        1,
        "addPerson should not change existing allocations"
    );
    assert.equal(
        groupifyCap.groups[0].getPerson(0),
        capFirst,
        "addPerson should not change existing allocations"
    );

    groupifyCap.randAssignAll();

    assert.equal(
        groupifyCap.unallocated.length(),
        0,
        "randAssignAll should empty unallocated after dynamic adds"
    );

    const capSizes = [
        groupifyCap.groups[0].length(),
        groupifyCap.groups[1].length(),
        groupifyCap.groups[2].length()
    ];
    assert.equal(
        capSizes[0] + capSizes[1] + capSizes[2],
        5,
        "randAssignAll should assign all dynamically added persons"
    );
    assert(
        Math.max(...capSizes) - Math.min(...capSizes) <= 1,
        "randAssignAll should keep group sizes within 1 after dynamic adds"
    );

    const groupifyEmptyCap = new Groupify(3, []);
    groupifyEmptyCap.addPerson(new Person("Able", "Empty"));
    groupifyEmptyCap.addPerson(new Person("Best", "Empty"));
    groupifyEmptyCap.addPerson(new Person("Cain", "Empty"));
    groupifyEmptyCap.addPerson(new Person("Dale", "Empty"));
    groupifyEmptyCap.randAssignAll();

    assert.equal(
        groupifyEmptyCap.unallocated.length(),
        0,
        "randAssignAll should work after adding into an empty Groupify"
    );

    const emptyCapSizes = [
        groupifyEmptyCap.groups[0].length(),
        groupifyEmptyCap.groups[1].length(),
        groupifyEmptyCap.groups[2].length()
    ];
    assert.equal(
        emptyCapSizes[0] + emptyCapSizes[1] + emptyCapSizes[2],
        4,
        "randAssignAll should assign all persons added to an empty Groupify"
    );
    assert(
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
        [new Person("One", "Rename")]
    );

    groupifyRename.renameGroup(renameGroup, "Gruppe X");
    assert.equal(
        renameGroup.name,
        "Gruppe X",
        "renameGroup should update the group name"
    );

    assert.throws(
        () => groupifyRename.renameGroup("Hallo", "Gruppe Y"),
        TypeError,
        "renameGroup should require a Group object"
    );

    assert.throws(
        () => groupifyRename.renameGroup(new Group("Foreign"), "Gruppe Y"),
        Error,
        "renameGroup should reject a foreign group"
    );
    assert.equal(
        renameGroup.name,
        "Gruppe X",
        "failed foreign renameGroup should not change names"
    );

    assert.throws(
        () => groupifyRename.renameGroup(renameGroup, ""),
        RangeError,
        "renameGroup should reject an invalid name via Group"
    );
    assert.equal(
        renameGroup.name,
        "Gruppe X",
        "failed renameGroup should leave the old name unchanged"
    );

    assert.throws(
        () => groupifyRename.renameGroup(renameGroup, "Group B"),
        Error,
        "renameGroup should reject a name that already exists"
    );
    assert.equal(
        renameGroup.name,
        "Gruppe X",
        "failed duplicate renameGroup should leave the old name unchanged"
    );

    assert.throws(
        () => groupifyRename.renameGroup(renameGroup, "group b"),
        Error,
        "renameGroup should reject a duplicate name case-insensitively"
    );

    groupifyRename.renameGroup(renameGroup, "Gruppe X");
    assert.equal(
        renameGroup.name,
        "Gruppe X",
        "renameGroup should allow keeping the current name"
    );

    // ========================================
    // groupSize
    // ========================================

    const thirtyPersons = [];
    for (let i = 1; i <= 30; i++) {
        thirtyPersons.push(new Person("Name" + i, "Vor" + i));
    }

    assert.equal(
        new Groupify(7, thirtyPersons).groupSize,
        5,
        "30 persons / 7 groups should yield groupSize 5"
    );
    assert.equal(
        new Groupify(5, thirtyPersons).groupSize,
        6,
        "30 persons / 5 groups should yield groupSize 6"
    );

    const threePersons = [
        new Person("Aa", "One"),
        new Person("Bb", "Two"),
        new Person("Cc", "Three")
    ];
    assert.equal(
        new Groupify(7, threePersons).groupSize,
        1,
        "3 persons / 7 groups should yield groupSize 1"
    );

    const groupifyPerGroup = new Groupify(7, thirtyPersons);
    groupifyPerGroup.setPersonsPerGroup(5);
    assert.equal(
        groupifyPerGroup.groupSize,
        5,
        "setPersonsPerGroup(5) should set groupSize 5 and create 6 groups"
    );
    assert.equal(
        groupifyPerGroup.groups.length,
        6,
        "setPersonsPerGroup(5) should set groupSize 5 and create 6 groups"
    );

    const sizeKeep = new Groupify(2, countPersons);
    sizeKeep.setPersonsPerGroup(4);
    assert.equal(
        sizeKeep.groupSize,
        4,
        "setPersonsPerGroup should not overwrite groupSize via setNumberOfGroups"
    );
    assert.equal(
        sizeKeep.groups.length,
        2,
        "setPersonsPerGroup should not overwrite groupSize via setNumberOfGroups"
    );

    const overA = new Group("Over A");
    const overB = new Group("Over B");
    const over1 = new Person("One", "Over");
    const over2 = new Person("Two", "Over");
    const over3 = new Person("Three", "Over");
    const groupifyOver = new Groupify(
        [overA, overB],
        [over1, over2, over3]
    );
    groupifyOver.allocate(over1, overA);
    groupifyOver.allocate(over2, overA);
    groupifyOver.allocate(over3, overB);
    groupifyOver.move(overB, over3, overA);
    assert.equal(
        overA.length(),
        3,
        "move should allow a group to exceed groupSize"
    );
    assert.equal(
        groupifyOver.groupSize,
        2,
        "move should allow a group to exceed groupSize"
    );

    // ========================================
    // getGroupStatus
    // ========================================

    const statusGroup = new Group("Status");
    const statusPersons = [
        new Person("Stat", "One"),
        new Person("Stat", "Two"),
        new Person("Stat", "Three"),
        new Person("Stat", "Four"),
        new Person("Stat", "Five"),
        new Person("Stat", "Six")
    ];
    const groupifyStatus = new Groupify(
        [statusGroup],
        statusPersons.slice(0, 5)
    );

    groupifyStatus.allocate(statusPersons[0], statusGroup);
    groupifyStatus.allocate(statusPersons[1], statusGroup);
    groupifyStatus.allocate(statusPersons[2], statusGroup);
    groupifyStatus.allocate(statusPersons[3], statusGroup);
    assert.equal(
        groupifyStatus.groupSize,
        5,
        "group below groupSize should be under"
    );
    assert.equal(
        groupifyStatus.getGroupStatus(statusGroup),
        "under",
        "group below groupSize should be under"
    );

    groupifyStatus.allocate(statusPersons[4], statusGroup);
    assert.equal(
        groupifyStatus.getGroupStatus(statusGroup),
        "complete",
        "group at groupSize should be complete"
    );

    groupifyStatus.addPerson(statusPersons[5]);
    groupifyStatus.allocate(statusPersons[5], statusGroup);
    assert.equal(
        statusGroup.length(),
        6,
        "group above groupSize should be over"
    );
    assert.equal(
        groupifyStatus.getGroupStatus(statusGroup),
        "over",
        "group above groupSize should be over"
    );

    assert.throws(
        () => groupifyStatus.getGroupStatus("Hallo"),
        TypeError,
        "getGroupStatus should require a Group object"
    );

    assert.throws(
        () => groupifyStatus.getGroupStatus(new Group("Foreign")),
        Error,
        "getGroupStatus should reject a foreign group"
    );

    const deleteSizePersons = [];
    for (let i = 1; i <= 24; i++) {
        deleteSizePersons.push(new Person("Name" + i, "Vor" + i));
    }
    const groupifyDeleteSize = new Groupify(6, deleteSizePersons);
    assert.equal(
        groupifyDeleteSize.groupSize,
        4,
        "24 persons / 6 groups should start with groupSize 4"
    );
    groupifyDeleteSize.randAssignAll();

    for (let i = 0; i < 6; i++) {
        const sourceGroup = groupifyDeleteSize.groups[i];
        const person = sourceGroup.getPerson(0);
        groupifyDeleteSize.unallocate(person, sourceGroup);
        groupifyDeleteSize.removePerson(person);
    }

    assert.equal(
        groupifyDeleteSize.groups.length,
        6,
        "deleting persons should not change the number of groups"
    );
    assert.equal(
        groupifyDeleteSize.groupSize,
        3,
        "after deleting 6 of 24 persons, groupSize should be ceil(18 / 6)"
    );
    assert.equal(
        groupifyDeleteSize.getGroupStatus(groupifyDeleteSize.groups[0]),
        "complete",
        "groups of 3 should be complete after groupSize is recalculated"
    );

    // ========================================
    // toJSON / fromJSON (Local-Storage Persistenz)
    // ========================================

    const roundTrip = (instance) =>
        Groupify.fromJSON(JSON.parse(JSON.stringify(instance.toJSON())));

    // toJSON liefert eine rein serialisierbare Struktur (keine Instanzen)
    const jsonPersons = [
        new Person("Wu", "Kevin"),
        new Person("Müller", "Max"),
        new Person("Meier", "Anna")
    ];
    const jsonGroupify = new Groupify(2, jsonPersons);
    jsonGroupify.allocate(jsonPersons[0], jsonGroupify.groups[0]);
    jsonGroupify.allocate(jsonPersons[1], jsonGroupify.groups[1]);
    jsonGroupify.renameGroup(jsonGroupify.groups[0], "Team Alpha");

    const json = jsonGroupify.toJSON();
    assert.equal(json.version, 1, "toJSON should include the schema version");
    assert.equal(
        json.groupSize,
        jsonGroupify.groupSize,
        "toJSON should store the exact groupSize"
    );
    assert.equal(json.groups.length, 2, "toJSON should store all groups");
    assert.equal(
        json.groups[0].name,
        "Team Alpha",
        "toJSON should store custom group names"
    );
    assert.equal(
        json.groups[0].members[0].firstName,
        "Kevin",
        "toJSON should store person raw fields"
    );
    assert.equal(
        json.unallocated.length,
        1,
        "toJSON should store unallocated persons"
    );
    assert.doesNotThrow(
        () => JSON.stringify(json),
        "toJSON output must be JSON serializable"
    );

    // fromJSON erzeugt echte Instanzen
    const restored = roundTrip(jsonGroupify);
    assert.ok(
        restored instanceof Groupify,
        "fromJSON should return a Groupify instance"
    );
    assert.ok(
        restored.groups[0] instanceof Group,
        "fromJSON should rebuild real Group instances"
    );
    assert.ok(
        restored.groups[0].getPerson(0) instanceof Person,
        "fromJSON should rebuild real Person instances"
    );

    // Round-Trip erhält Struktur, Namen, Zuteilung und groupSize
    assert.equal(
        restored.groups.length,
        jsonGroupify.groups.length,
        "round-trip should preserve the number of groups"
    );
    assert.equal(
        restored.groupSize,
        jsonGroupify.groupSize,
        "round-trip should preserve the exact groupSize"
    );
    assert.equal(
        restored.groups[0].name,
        "Team Alpha",
        "round-trip should preserve group names"
    );
    assert.equal(
        restored.groups[0].length(),
        1,
        "round-trip should preserve group membership"
    );
    assert.equal(
        restored.groups[0].getPerson(0).name,
        "Kevin Wu",
        "round-trip should preserve allocated persons"
    );
    assert.equal(
        restored.unallocated.length(),
        1,
        "round-trip should preserve unallocated persons"
    );
    assert.equal(
        restored.unallocated.getPerson(0).name,
        "Anna Meier",
        "round-trip should preserve the unallocated person"
    );

    // Edge: leerer Roster
    const emptyRestored = roundTrip(new Groupify(3, []));
    assert.equal(
        emptyRestored.groups.length,
        3,
        "round-trip should preserve empty groups"
    );
    assert.equal(
        emptyRestored.unallocated.length(),
        0,
        "round-trip should preserve an empty unallocated pool"
    );

    // Edge: exakte groupSize nach setPersonsPerGroup (nicht neu berechnet)
    const persistSizePersons = [];
    for (let i = 1; i <= 5; i++) {
        persistSizePersons.push(new Person("Last" + i, "First" + i));
    }
    const persistSizeGroupify = new Groupify(2, persistSizePersons);
    persistSizeGroupify.setPersonsPerGroup(4);
    assert.equal(
        persistSizeGroupify.groupSize,
        4,
        "precondition: setPersonsPerGroup should set groupSize 4"
    );
    const persistSizeRestored = roundTrip(persistSizeGroupify);
    assert.equal(
        persistSizeRestored.groupSize,
        4,
        "round-trip must keep the exact groupSize, not recompute it"
    );

    // Edge: alle Personen zugewiesen
    const persistAllPersons = [
        new Person("A", "One"),
        new Person("B", "Two")
    ];
    const allGroupify = new Groupify(2, persistAllPersons);
    allGroupify.allocate(persistAllPersons[0], allGroupify.groups[0]);
    allGroupify.allocate(persistAllPersons[1], allGroupify.groups[1]);
    const allRestored = roundTrip(allGroupify);
    assert.equal(
        allRestored.unallocated.length(),
        0,
        "round-trip should keep everyone allocated"
    );
    assert.equal(
        allRestored.groups[0].length() + allRestored.groups[1].length(),
        2,
        "round-trip should preserve full allocation"
    );

    // Ungültige Daten
    assert.throws(
        () => Groupify.fromJSON(null),
        TypeError,
        "fromJSON should reject null"
    );
    assert.throws(
        () => Groupify.fromJSON({ version: 99, groups: [], unallocated: [] }),
        Error,
        "fromJSON should reject an unsupported version"
    );
    assert.throws(
        () => Groupify.fromJSON({ version: 1, groups: {}, unallocated: [] }),
        TypeError,
        "fromJSON should reject non-array groups"
    );
}

runTests();
