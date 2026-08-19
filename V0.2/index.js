import { CsvLoader } from "../src/CSVLoader.js";
import { Group } from "../src/Group.js";
import { Groupify } from "../src/Groupify.js";

const FILE_INPUT = document.getElementById("csv-input");
const OUTPUT = document.getElementById("student-list");
const BTN_EINZELN = document.getElementById("btn-aufteilen-einzeln");
const BTN_ALLE = document.getElementById("btn-alle-aufteilen");
const CONFIG_VALUE = document.getElementById("config-value");
const GROUPS_CONTAINER = document.getElementById("groups");
const LOADER = new CsvLoader();

let students = [];
let groupify = null;

FILE_INPUT.addEventListener("change", loadFile);
BTN_EINZELN.addEventListener("click", aufteilenEinzeln);
BTN_ALLE.addEventListener("click", aufteilenAlle);
CONFIG_VALUE.addEventListener("input", onConfigValueChange);

render();

function loadFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            students = LOADER.parse(reader.result);
        } catch (error) {
            students = [];
            groupify = null;
            OUTPUT.innerHTML = "<h2>Schülerliste</h2>";
            const paragraph = document.createElement("p");
            paragraph.textContent = error.message;
            OUTPUT.appendChild(paragraph);
            renderGroups();
            return;
        }

        setupGroupify();
        render();
    };

    reader.readAsText(file);
}

function getNumberOfGroups() {
    const value = Number(CONFIG_VALUE.value);
    if (!Number.isInteger(value) || value < 1) {
        return 1;
    }
    return value;
}

function setupGroupify() {
    if (students.length === 0) {
        groupify = null;
        return;
    }

    const numberOfGroups = getNumberOfGroups();
    const minPerGroup = Math.floor(students.length / numberOfGroups);
    const maxPerGroup = Math.ceil(students.length / numberOfGroups);

    const groups = [];
    for (let i = 1; i <= numberOfGroups; i++) {
        groups.push(new Group("Gruppe " + i, minPerGroup, maxPerGroup));
    }

    groupify = new Groupify(groups, students);
}

function onConfigValueChange() {
    if (students.length > 0) {
        setupGroupify();
    } else {
        groupify = null;
    }
    render();
}

function aufteilenEinzeln() {
    if (!groupify || groupify.unallocated.length() === 0) {
        return;
    }

    const unallocated = groupify.unallocated;
    const index = Math.floor(Math.random() * unallocated.length());
    const student = unallocated.getStudent(index);
    groupify.randAssign(student);
    render();
}

function aufteilenAlle() {
    if (!groupify || groupify.unallocated.length() === 0) {
        return;
    }

    groupify.randAssignAll();
    render();
}

function render() {
    renderStudents();
    renderGroups();
}

function renderStudents() {
    OUTPUT.innerHTML = "<h2>Schülerliste</h2>";
    if (!groupify) {
        return;
    }

    const unallocated = groupify.unallocated;
    for (let i = 0; i < unallocated.length(); i++) {
        const paragraph = document.createElement("p");
        paragraph.textContent = unallocated.getStudent(i).name;
        OUTPUT.appendChild(paragraph);
    }
}

function renderGroups() {
    GROUPS_CONTAINER.innerHTML = "";

    if (groupify) {
        const groups = groupify.groups;
        for (let i = 0; i < groups.length; i++) {
            GROUPS_CONTAINER.appendChild(createGroupCard(groups[i].name, groups[i]));
        }
        return;
    }

    const numberOfGroups = getNumberOfGroups();
    for (let i = 1; i <= numberOfGroups; i++) {
        GROUPS_CONTAINER.appendChild(createGroupCard("Gruppe " + i, null));
    }
}

function createGroupCard(name, group) {
    const article = document.createElement("article");
    const heading = document.createElement("h2");
    heading.textContent = name;
    article.appendChild(heading);

    if (!group) {
        return article;
    }

    for (let i = 0; i < group.length(); i++) {
        const paragraph = document.createElement("p");
        paragraph.textContent = group.getStudent(i).name;
        article.appendChild(paragraph);
    }

    return article;
}
