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
let draggedStudent = null;
let draggedGroup = null;

FILE_INPUT.addEventListener("change", loadFile);
BTN_EINZELN.addEventListener("click", aufteilenEinzeln);
BTN_ALLE.addEventListener("click", aufteilenAlle);
CONFIG_VALUE.addEventListener("input", onConfigValueChange);

GROUPS_CONTAINER.addEventListener("dragstart", onDragStart);
GROUPS_CONTAINER.addEventListener("dragover", onGroupDragOver);
GROUPS_CONTAINER.addEventListener("dragleave", onGroupDragLeave);
GROUPS_CONTAINER.addEventListener("drop", onGroupDrop);

OUTPUT.addEventListener("dragstart", onDragStart);
OUTPUT.addEventListener("dragover", onListDragOver);
OUTPUT.addEventListener("drop", onListDrop);

document.addEventListener("dragend", clearDrag);

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
    // randAssign() ensures an even initial distribution.
    // max only defines the hard capacity and allows free manual redistribution.
    const minPerGroup = Math.floor(students.length / numberOfGroups);
    const maxPerGroup = students.length;

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

// render Studentlist
function renderStudents() {
    OUTPUT.innerHTML = "<h2>Schülerliste</h2>";
    if (!groupify) {
        return;
    }

    const unallocated = groupify.unallocated;
    for (let i = 0; i < unallocated.length(); i++) {
        OUTPUT.appendChild(createStudentRow(unallocated.getStudent(i), null));
    }
}

// rendern Groupscards number of groups
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
    article._group = group;

    const heading = document.createElement("h2");
    heading.textContent = name;
    article.appendChild(heading);

    if (!group) {
        return article;
    }

    for (let i = 0; i < group.length(); i++) {
        article.appendChild(createStudentRow(group.getStudent(i), group));
    }

    return article;
}

function createStudentRow(student, group) {
    const paragraph = document.createElement("p");
    paragraph.textContent = student.name;
    paragraph.draggable = true;
    paragraph._student = student;
    paragraph._group = group;
    return paragraph;
}

// Starts dragging a student and stores the source group
function onDragStart(event) {
    if (!event.target._student) {
        return;
    }

    draggedStudent = event.target._student;
    draggedGroup = event.target._group;
    event.dataTransfer.setData("text/plain", draggedStudent.name);
    event.dataTransfer.effectAllowed = "move";
}

// Allows dropping a student onto a group
function onGroupDragOver(event) {
    const article = event.target.closest("article");
    if (!article || !article._group || !draggedStudent) {
        return;
    }

    event.preventDefault();
    article.classList.add("drop-target");
}

// Removes the drop highlight when leaving a group
function onGroupDragLeave(event) {
    const article = event.target.closest("article");
    if (!article) {
        return;
    }
    if (article.contains(event.relatedTarget)) {
        return;
    }
    article.classList.remove("drop-target");
}

// Moves or allocates the dragged student to the target group
function onGroupDrop(event) {
    event.preventDefault();

    const article = event.target.closest("article");
    if (article) {
        article.classList.remove("drop-target");
    }

    const targetGroup = article && article._group;
    if (!groupify || !draggedStudent || !targetGroup) {
        return;
    }

    if (draggedGroup === targetGroup) {
        return;
    }

    try {
        if (draggedGroup) {
            groupify.move(draggedGroup, draggedStudent, targetGroup);
        } else {
            groupify.allocate(draggedStudent, targetGroup);
        }
        render();
    } catch (error) {
        return;
    }
}

// Allows dragging a grouped student back into the student list
function onListDragOver(event) {
    if (!draggedStudent || !draggedGroup) {
        return;
    }

    event.preventDefault();
}

// Unallocates the dragged student back to the student list
function onListDrop(event) {
    event.preventDefault();

    if (!groupify || !draggedStudent || !draggedGroup) {
        return;
    }

    groupify.unallocate(draggedStudent, draggedGroup);
    render();
}

// Resets the drag state and removes drop highlights
function clearDrag() {
    draggedStudent = null;
    draggedGroup = null;

    const articles = GROUPS_CONTAINER.querySelectorAll("article");
    for (let i = 0; i < articles.length; i++) {
        articles[i].classList.remove("drop-target");
    }
}
