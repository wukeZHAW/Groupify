import assert from "node:assert/strict";
import { CsvExporter } from "../src/CSVExporter.js";
import { Groupify } from "../src/Groupify.js";
import { Group } from "../src/Group.js";
import { Student } from "../src/Student.js";

function runTests() {
    console.log("Starting CsvExporter.js tests ...");

    const EXPORTER = new CsvExporter();

    const group1 = new Group("Gruppe 1");
    const group2 = new Group("Gruppe 2");
    const student1 = new Student("Müller", "Max");
    const student2 = new Student("Meier", "Anna");
    const groupify = new Groupify(
        [group1, group2],
        [student1, student2]
    );

    groupify.allocate(student1, group1);
    groupify.allocate(student2, group2);

    // gültiger Export
    const CSV = EXPORTER.export(groupify);
    assert.equal(
        CSV,
        "Name;Vorname;Gruppe\nMüller;Max;Gruppe 1\nMeier;Anna;Gruppe 2\n",
        "Export should write Name;Vorname;Gruppe rows in group order"
    );

    // kein Groupify-Objekt
    assert.throws(
        () => EXPORTER.export("Hallo"),
        TypeError,
        "groupify must be a Groupify object"
    );

    assert.throws(
        () => EXPORTER.export(null),
        TypeError,
        "groupify must be a Groupify object"
    );

    // unallocated Students
    const leftover = new Student("Wu", "Kevin");
    const groupifyOpen = new Groupify(
        [new Group("Gruppe A")],
        [leftover]
    );

    assert.equal(
        EXPORTER.export(groupifyOpen),
        "Name;Vorname;Gruppe\nWu;Kevin;Unallocated\n",
        "unallocated students should export with group Unallocated"
    );

    // leere Gruppen werden übersprungen
    const onlyGroup = new Group("Gruppe 1");
    const emptyGroup = new Group("Gruppe 2");
    const onlyStudent = new Student("Lang", "Lisa");
    const groupifyEmptyGroup = new Groupify(
        [onlyGroup, emptyGroup],
        [onlyStudent]
    );
    groupifyEmptyGroup.allocate(onlyStudent, onlyGroup);

    assert.equal(
        EXPORTER.export(groupifyEmptyGroup),
        "Name;Vorname;Gruppe\nLang;Lisa;Gruppe 1\n",
        "Empty groups should not add student rows"
    );

    // leere Schülerliste
    const emptyGroupify = new Groupify(2, []);
    assert.equal(
        EXPORTER.export(emptyGroupify),
        "Name;Vorname;Gruppe\n",
        "Export without students should only contain the header"
    );

    // mehrere Students in einer Gruppe
    const multiGroup = new Group("Team X");
    const multiA = new Student("Igel", "Ida");
    const multiB = new Student("Jung", "Jan");
    const groupifyMulti = new Groupify(
        [multiGroup],
        [multiA, multiB]
    );
    groupifyMulti.allocate(multiA, multiGroup);
    groupifyMulti.allocate(multiB, multiGroup);

    assert.equal(
        EXPORTER.export(groupifyMulti),
        "Name;Vorname;Gruppe\nIgel;Ida;Team X\nJung;Jan;Team X\n",
        "Students in the same group should keep allocation order"
    );

    // einstellige Namen
    const eastGroup = new Group("Gruppe 1");
    const eastStudent = new Student("王", "小明");
    const groupifyEast = new Groupify([eastGroup], [eastStudent]);
    groupifyEast.allocate(eastStudent, eastGroup);

    assert.equal(
        EXPORTER.export(groupifyEast),
        "Name;Vorname;Gruppe\n王;小明;Gruppe 1\n",
        "1 character last names should export"
    );
}

runTests();
