import { Group } from "./Group.js";
import { Student } from "./Student.js";

export class Groupify {
    #groups;
    #unallocated;

    // constructor
    constructor(groups, students){
        this.#validateGroups(groups);
        this.#validateStudents(students);
        
        this.#groups = groups;

        this.#unallocated = new Group(
            "Unallocated", 0, Math.max(1, students.length)
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


    get groups() {
        return this.#groups;
    }

    get unallocated() {
        return this.#unallocated;
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

        const randomIndex = Math.floor(
            Math.random() * availableGroups.length
        );

        const randomGroup = availableGroups[randomIndex];

        this.allocate(student, randomGroup);
    }

    randAssignAll(){
        while (this.#unallocated.length() > 0){
            const student = this.#unallocated.getStudent(0);
            this.randAssign(student);
        }
    }
}