import assert from "node:assert/strict";
import { CsvExporter } from "../src/CSVExporter.js";
import { Groupify } from "../src/Groupify.js";
import { Group } from "../src/Group.js";
import { Person } from "../src/Person.js";

function runTests() {
    console.log("Starting CsvExporter.js tests ...");

    const EXPORTER = new CsvExporter();

    const group1 = new Group("Gruppe 1");
    const group2 = new Group("Gruppe 2");
    const person1 = new Person("Müller", "Max");
    const person2 = new Person("Meier", "Anna");
    const groupify = new Groupify(
        [group1, group2],
        [person1, person2]
    );

    groupify.allocate(person1, group1);
    groupify.allocate(person2, group2);

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

    // unallocated Persons
    const leftover = new Person("Wu", "Kevin");
    const groupifyOpen = new Groupify(
        [new Group("Gruppe A")],
        [leftover]
    );

    assert.equal(
        EXPORTER.export(groupifyOpen),
        "Name;Vorname;Gruppe\nWu;Kevin;nicht zugewiesen\n",
        "unallocated persons should export with group nicht zugewiesen"
    );

    // leere Gruppen werden übersprungen
    const onlyGroup = new Group("Gruppe 1");
    const emptyGroup = new Group("Gruppe 2");
    const onlyPerson = new Person("Lang", "Lisa");
    const groupifyEmptyGroup = new Groupify(
        [onlyGroup, emptyGroup],
        [onlyPerson]
    );
    groupifyEmptyGroup.allocate(onlyPerson, onlyGroup);

    assert.equal(
        EXPORTER.export(groupifyEmptyGroup),
        "Name;Vorname;Gruppe\nLang;Lisa;Gruppe 1\n",
        "Empty groups should not add person rows"
    );

    // leere Schülerliste
    const emptyGroupify = new Groupify(2, []);
    assert.equal(
        EXPORTER.export(emptyGroupify),
        "Name;Vorname;Gruppe\n",
        "Export without persons should only contain the header"
    );

    // mehrere Persons in einer Gruppe
    const multiGroup = new Group("Team X");
    const multiA = new Person("Igel", "Ida");
    const multiB = new Person("Jung", "Jan");
    const groupifyMulti = new Groupify(
        [multiGroup],
        [multiA, multiB]
    );
    groupifyMulti.allocate(multiA, multiGroup);
    groupifyMulti.allocate(multiB, multiGroup);

    assert.equal(
        EXPORTER.export(groupifyMulti),
        "Name;Vorname;Gruppe\nIgel;Ida;Team X\nJung;Jan;Team X\n",
        "Persons in the same group should keep allocation order"
    );

    // einstellige Namen
    const eastGroup = new Group("Gruppe 1");
    const eastPerson = new Person("王", "小明");
    const groupifyEast = new Groupify([eastGroup], [eastPerson]);
    groupifyEast.allocate(eastPerson, eastGroup);

    assert.equal(
        EXPORTER.export(groupifyEast),
        "Name;Vorname;Gruppe\n王;小明;Gruppe 1\n",
        "1 character last names should export"
    );
}

runTests();
