import { Group } from "./Group.js";
import { Person } from "./Person.js";

export class Groupify {
    #groups;
    #unallocated;
    #groupSize;

    // constructor
    constructor(groups, persons){
        if (typeof groups === "number") {
            this.#validatePersons(persons);
            const numberOfGroups = groups;
            groups = this.#createGroups(numberOfGroups);
            this.#groupSize = Math.max(
                1, Math.ceil(persons.length / numberOfGroups)
            );
        } else {
            this.#validateGroups(groups);
            this.#validatePersons(persons);
            const groupCount = groups.length === 0 ? 1 : groups.length;
            this.#groupSize = Math.max(
                1, Math.ceil(persons.length / groupCount)
            );
        }

        this.#groups = groups;

        this.#unallocated = new Group("nicht zugewiesen");

        // alle Persons in unallocated einfügen
        for (const person of persons) {
            this.#unallocated.addPerson(person);
        }
    }

    toJSON() {
        const serializeGroup = (group) => {
            const members = [];
            for (let i = 0; i < group.length(); i++) {
                const person = group.getPerson(i);
                members.push({
                    lastName: person.lastName,
                    firstName: person.firstName
                });
            }
            return members;
        };

        const groups = [];
        for (const group of this.#groups) {
            groups.push({
                name: group.name,
                members: serializeGroup(group)
            });
        }

        return {
            version: 1,
            groupSize: this.#groupSize,
            groups: groups,
            unallocated: serializeGroup(this.#unallocated)
        };
    }

    static fromJSON(data) {
        if (data === null || typeof data !== "object") {
            throw new TypeError("data must be an object");
        }

        if (data.version !== 1) {
            throw new Error("unsupported state version");
        }

        if (!Array.isArray(data.groups) || !Array.isArray(data.unallocated)) {
            throw new TypeError("groups and unallocated must be arrays");
        }

        const toPerson = (raw) => new Person(raw.lastName, raw.firstName);

        const groups = data.groups.map((raw) => new Group(raw.name));

        const allPersons = [];
        for (const raw of data.unallocated) {
            allPersons.push(toPerson(raw));
        }

        const groupMembers = data.groups.map((raw) => {
            const persons = raw.members.map(toPerson);
            allPersons.push(...persons);
            return persons;
        });

        const instance = new Groupify(groups, allPersons);

        for (let i = 0; i < groups.length; i++) {
            for (const person of groupMembers[i]) {
                instance.allocate(person, groups[i]);
            }
        }

        if (!Number.isInteger(data.groupSize) || data.groupSize < 1) {
            throw new RangeError("groupSize must be an integer >= 1");
        }
        instance.#groupSize = data.groupSize;

        return instance;
    }

    #validateGroups(groups){
        if (!Array.isArray(groups)){
            throw new TypeError("groups must be an array");
        }

        for (const group of groups){
            if (!(group instanceof Group)) {
                throw new TypeError("groups must only contain Group objects");
            }
        }
    }

    #validatePersons(persons){
        if (!Array.isArray(persons)) {
            throw new TypeError("persons must be an array");
        }

        for (const person of persons) {
            if (!(person instanceof Person)) {
                throw new TypeError(
                    "persons must only contain Person objects"
                );
            }
        }
    }

    #createGroups(numberOfGroups) {
        if (!Number.isInteger(numberOfGroups)) {
            throw new TypeError("numberOfGroups must be an integer");
        }

        if (numberOfGroups < 1) {
            throw new RangeError("numberOfGroups must be >= 1");
        }

        const groups = [];
        for (let i = 1; i <= numberOfGroups; i++) {
            groups.push(new Group("Gruppe " + i));
        }

        return groups;
    }

    #collectPersons() {
        const persons = [];

        for (let i = 0; i < this.#unallocated.length(); i++) {
            persons.push(this.#unallocated.getPerson(i));
        }

        for (const group of this.#groups) {
            for (let i = 0; i < group.length(); i++) {
                persons.push(group.getPerson(i));
            }
        }

        return persons;
    }

    #hasPersonName(name) {
        const needle = name.toLowerCase();
        const persons = this.#collectPersons();

        for (const person of persons) {
            if (person.name.toLowerCase() === needle) {
                return true;
            }
        }

        return false;
    }

    #hasGroupName(name, exceptGroup) {
        const needle = name.toLowerCase();

        for (const group of this.#groups) {
            if (group === exceptGroup) {
                continue;
            }
            if (group.name.toLowerCase() === needle) {
                return true;
            }
        }

        return false;
    }

    setNumberOfGroups(numberOfGroups) {
        const persons = this.#collectPersons();
        const groups = this.#createGroups(numberOfGroups);

        this.#groupSize = Math.max(
            1, Math.ceil(persons.length / numberOfGroups)
        );
        this.#groups = groups;
        this.#unallocated = new Group("Unallocated");

        for (const person of persons) {
            this.#unallocated.addPerson(person);
        }
    }


    get groups() {
        return this.#groups;
    }

    get unallocated() {
        return this.#unallocated;
    }

    get groupSize() {
        return this.#groupSize;
    }

    setPersonsPerGroup(personsPerGroup) {
        if (!Number.isInteger(personsPerGroup)) {
            throw new TypeError("personsPerGroup must be an integer");
        }

        if (personsPerGroup < 1) {
            throw new RangeError("personsPerGroup must be >= 1");
        }

        const persons = this.#collectPersons();

        // 0 persons and 5 per group still yields 1 empty group.
        const numberOfGroups = Math.max(
            1, Math.ceil(persons.length / personsPerGroup)
        );
        const groups = this.#createGroups(numberOfGroups);

        this.#groupSize = personsPerGroup;
        this.#groups = groups;
        this.#unallocated = new Group("Unallocated");

        for (const person of persons) {
            this.#unallocated.addPerson(person);
        }
    }

    allocate(person, targetGroup) {
        if (!(person instanceof Person)) {
            throw new TypeError("person must be a Person object");
        }

        if (!(targetGroup instanceof Group)) {
            throw new TypeError("targetGroup must be a Group object");
        }

        if (!this.#groups.includes(targetGroup)) {
            throw new Error("targetGroup does not belong to Groupify");
        }

        // Erst NACH allen Prüfungen Zustand verändern
        this.#unallocated.removePerson(person);
        targetGroup.addPerson(person);
    }

    unallocate(person, group){
        if (!(person instanceof Person)) {
            throw new TypeError("person must be a Person object");
        }

        if (!(group instanceof Group)) {
            throw new TypeError("Group must be a Group object");
        }

        if (!this.#groups.includes(group)) {
            throw new Error("Group does not belong to Groupify");
        }

        // Erst NACH allen Prüfungen Zustand verändern
        group.removePerson(person);
        this.#unallocated.addPerson(person);
        
    }

    move(srcGroup, person, targetGroup){
        if (!(srcGroup instanceof Group)){
            throw new TypeError("srcGroup must be a Group object");
        }

        if (!(person instanceof Person)) {
            throw new TypeError("person must be a Person object");
        }

        if (!(targetGroup instanceof Group)){
            throw new TypeError("targetGroup must be a Group object");
        }

        if (!this.#groups.includes(srcGroup)) {
            throw new Error("srcGroup does not belong to Groupify");
        }

        if (!this.#groups.includes(targetGroup)) {
            throw new Error("targetGroup does not belong to Groupify");
        }

        srcGroup.removePerson(person);
        targetGroup.addPerson(person);
    }

    randAssign(person){
        if (!(person instanceof Person)) {
            throw new TypeError("person must be a Person object");
        }

        if (this.#groups.length === 0) {
            throw new Error("No available groups");
        }

        let smallestSize = this.#groups[0].length();
        for (const group of this.#groups) {
            if (group.length() < smallestSize) {
                smallestSize = group.length();
            }
        }

        const candidates = [];
        for (const group of this.#groups) {
            if (group.length() === smallestSize) {
                candidates.push(group);
            }
        }

        const randomIndex = Math.floor(
            Math.random() * candidates.length
        );

        const randomGroup = candidates[randomIndex];

        this.allocate(person, randomGroup);
    }

    randAssignAll(){
        while (this.#unallocated.length() > 0){
            const person = this.#unallocated.getPerson(0);
            this.randAssign(person);
        }
    }

    addPerson(person){
        if (!(person instanceof Person)) {
            throw new TypeError("person must be a Person object");
        }

        if (this.#findGroup(person) !== null) {
            throw new Error("person already belongs to Groupify");
        }

        if (this.#hasPersonName(person.name)) {
            throw new Error("person name already exists");
        }

        this.#unallocated.addPerson(person);
    }

    removePerson(person){
        if (!(person instanceof Person)) {
            throw new TypeError("person must be a Person object");
        }

        const group = this.#findGroup(person);
        if (group === null) {
            throw new Error("person does not belong to Groupify");
        }

        group.removePerson(person);

        const groupCount = this.#groups.length === 0 ? 1 : this.#groups.length;
        this.#groupSize = Math.max(
            1, Math.ceil(this.#collectPersons().length / groupCount)
        );
    }

    renameGroup(group, newName) {
        if (!(group instanceof Group)) {
            throw new TypeError("group must be a Group object");
        }

        if (!this.#groups.includes(group)) {
            throw new Error("group does not belong to Groupify");
        }

        const trimmedNewName = newName.trim();

        if (this.#hasGroupName(trimmedNewName, group)) {
            throw new Error("group name already exists");
        }

        group.name = trimmedNewName;
    }

    getGroupStatus(group) {
        if (!(group instanceof Group)) {
            throw new TypeError("group must be a Group object");
        }

        if (!this.#groups.includes(group)) {
            throw new Error("group does not belong to Groupify");
        }

        if (group.length() < this.#groupSize) {
            return "under";
        }

        if (group.length() > this.#groupSize) {
            return "over";
        }

        return "complete";
    }

    #findGroup(person) {
        for (let i = 0; i < this.#unallocated.length(); i++) {
            if (this.#unallocated.getPerson(i) === person) {
                return this.#unallocated;
            }
        }

        for (const group of this.#groups) {
            for (let i = 0; i < group.length(); i++) {
                if (group.getPerson(i) === person) {
                    return group;
                }
            }
        }

        return null;
    }
}