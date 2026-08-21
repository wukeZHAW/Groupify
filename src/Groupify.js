import { Group } from "./Group.js";
import { Student } from "./Student.js";

export class Groupify {
    #groups;
    #unallocated;

    // constructor
    constructor(groups, students){
        if (typeof groups === "number") {
            this.#validateStudents(students);
            groups = this.#createGroups(groups, students.length);
        } else {
            this.#validateGroups(groups);
            this.#validateStudents(students);
        }

        this.#groups = groups;

        // Unallocated is a waiting pool and has no practical capacity limit.
        this.#unallocated = new Group(
            "Unallocated", 0, Number.MAX_SAFE_INTEGER
        );

        // alle Students in unallocated einfügen
        for (const student of students) {
            this.#unallocated.addStudent(student);
        }
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

    #validateStudents(students){
        if (!Array.isArray(students)) {
            throw new TypeError("students must be an array");
        }

        for (const student of students) {
            if (!(student instanceof Student)) {
                throw new TypeError(
                    "students must only contain Student objects"
                );
            }
        }
    }

    #createGroups(numberOfGroups, studentCount) {
        if (!Number.isInteger(numberOfGroups)) {
            throw new TypeError("numberOfGroups must be an integer");
        }

        if (numberOfGroups < 1) {
            throw new RangeError("numberOfGroups must be >= 1");
        }

        // randAssign() ensures an even initial distribution.
        // max only defines the hard capacity and allows free manual redistribution.
        // Group requires max >= 1, so an empty roster still gets a valid capacity.
        const minPerGroup = Math.floor(studentCount / numberOfGroups);
        const maxPerGroup = Math.max(1, studentCount);

        const groups = [];
        for (let i = 1; i <= numberOfGroups; i++) {
            groups.push(new Group("Gruppe " + i, minPerGroup, maxPerGroup));
        }

        return groups;
    }

    #collectStudents() {
        const students = [];

        for (let i = 0; i < this.#unallocated.length(); i++) {
            students.push(this.#unallocated.getStudent(i));
        }

        for (const group of this.#groups) {
            for (let i = 0; i < group.length(); i++) {
                students.push(group.getStudent(i));
            }
        }

        return students;
    }

    #hasStudentName(name) {
        const needle = name.toLowerCase();
        const students = this.#collectStudents();

        for (const student of students) {
            if (student.name.toLowerCase() === needle) {
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
        const students = this.#collectStudents();
        const groups = this.#createGroups(numberOfGroups, students.length);

        this.#groups = groups;
        this.#unallocated = new Group(
            "Unallocated", 0, Number.MAX_SAFE_INTEGER
        );

        for (const student of students) {
            this.#unallocated.addStudent(student);
        }
    }


    get groups() {
        return this.#groups;
    }

    get unallocated() {
        return this.#unallocated;
    }

    setStudentsPerGroup(studentsPerGroup) {
        if (!Number.isInteger(studentsPerGroup)) {
            throw new TypeError("studentsPerGroup must be an integer");
        }

        if (studentsPerGroup < 1) {
            throw new RangeError("studentsPerGroup must be >= 1");
        }

        const students = this.#collectStudents();

        // 0 students and 5 per group still yields 1 empty group.
        const numberOfGroups = Math.max(
            1, Math.ceil(students.length / studentsPerGroup)
        );

        this.setNumberOfGroups(numberOfGroups);
    }

    allocate(student, targetGroup) {
        if (!(student instanceof Student)) {
            throw new TypeError("student must be a Student object");
        }

        if (!(targetGroup instanceof Group)) {
            throw new TypeError("targetGroup must be a Group object");
        }

        if (!this.#groups.includes(targetGroup)) {
            throw new Error("targetGroup does not belong to Groupify");
        }

        if (targetGroup.isFull()) {
            throw new Error("targetGroup is already full");
        }

        // Erst NACH allen Prüfungen Zustand verändern
        this.#unallocated.removeStudent(student);
        targetGroup.addStudent(student);
    }

    unallocate(student, group){
        if (!(student instanceof Student)) {
            throw new TypeError("student must be a Student object");
        }

        if (!(group instanceof Group)) {
            throw new TypeError("Group must be a Group object");
        }

        if (!this.#groups.includes(group)) {
            throw new Error("Group does not belong to Groupify");
        }

        // Erst NACH allen Prüfungen Zustand verändern
        group.removeStudent(student);
        this.#unallocated.addStudent(student);
        
    }

    move(srcGroup, student, targetGroup){
        if (!(srcGroup instanceof Group)){
            throw new TypeError("srcGroup must be a Group object");
        }

        if (!(student instanceof Student)) {
            throw new TypeError("student must be a Student object");
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

        if (targetGroup.isFull()) {
            throw new Error("targetGroup is already full");
        }
        srcGroup.removeStudent(student);
        targetGroup.addStudent(student);
    }

    randAssign(student){
        if (!(student instanceof Student)) {
            throw new TypeError("student must be a Student object");
        }

        const availableGroups = [];

        for (const group of this.#groups){
            if (!group.isFull()) {
                availableGroups.push(group);
            }
        }

        if (availableGroups.length === 0) {
            throw new Error("No available groups");
        }

        let smallestSize = availableGroups[0].length();
        for (const group of availableGroups) {
            if (group.length() < smallestSize) {
                smallestSize = group.length();
            }
        }

        const candidates = [];
        for (const group of availableGroups) {
            if (group.length() === smallestSize) {
                candidates.push(group);
            }
        }

        const randomIndex = Math.floor(
            Math.random() * candidates.length
        );

        const randomGroup = candidates[randomIndex];

        this.allocate(student, randomGroup);
    }

    randAssignAll(){
        while (this.#unallocated.length() > 0){
            const student = this.#unallocated.getStudent(0);
            this.randAssign(student);
        }
    }

    addStudent(student){
        if (!(student instanceof Student)) {
            throw new TypeError("student must be a Student object");
        }

        if (this.#findGroup(student) !== null) {
            throw new Error("student already belongs to Groupify");
        }

        if (this.#hasStudentName(student.name)) {
            throw new Error("student name already exists");
        }

        this.#unallocated.addStudent(student);
        this.#ensureGroupCapacity();
    }

    #ensureGroupCapacity() {
        const newMax = Math.max(1, this.#collectStudents().length);

        for (const group of this.#groups) {
            if (newMax > group.max) {
                group.max = newMax;
            }
        }
    }

    removeStudent(student){
        if (!(student instanceof Student)) {
            throw new TypeError("student must be a Student object");
        }

        const group = this.#findGroup(student);
        if (group === null) {
            throw new Error("student does not belong to Groupify");
        }

        group.removeStudent(student);
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

    #findGroup(student) {
        for (let i = 0; i < this.#unallocated.length(); i++) {
            if (this.#unallocated.getStudent(i) === student) {
                return this.#unallocated;
            }
        }

        for (const group of this.#groups) {
            for (let i = 0; i < group.length(); i++) {
                if (group.getStudent(i) === student) {
                    return group;
                }
            }
        }

        return null;
    }
}