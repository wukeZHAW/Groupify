import { CsvLoader } from "../src/CSVLoader.js";
import { CsvExporter } from "../src/CSVExporter.js";
import { Groupify } from "../src/Groupify.js";
import { Student } from "../src/Student.js";

const FILE_INPUT = document.getElementById("csv-input");
const OUTPUT = document.getElementById("student-list");
const FIRST_NAME_INPUT = document.getElementById("student-first-name");
const LAST_NAME_INPUT = document.getElementById("student-last-name");
const STUDENT_ADD_ERROR = document.getElementById("student-add-error");
const BTN_ADD_STUDENT = document.getElementById("btn-add-student");
const BTN_EINZELN = document.getElementById("btn-aufteilen-einzeln");
const BTN_ALLE = document.getElementById("btn-alle-aufteilen");
const BTN_EXPORT = document.getElementById("btn-export");
const CONFIG_VALUE = document.getElementById("config-value");
const CONFIG_SIZE = document.getElementById("config-size");
const CONFIG_MODE_SIZE = document.getElementById("config-mode-size");
const GROUPS_CONTAINER = document.getElementById("groups");
const LOADER = new CsvLoader();
const EXPORTER = new CsvExporter();

let groupify = null;
let draggedStudent = null;
let draggedGroup = null;

FILE_INPUT.addEventListener("change", loadFile);
BTN_ADD_STUDENT.addEventListener("click", addStudentFromInput);
BTN_EINZELN.addEventListener("click", aufteilenEinzeln);
BTN_ALLE.addEventListener("click", aufteilenAlle);
BTN_EXPORT.addEventListener("click", exportCsv);
CONFIG_VALUE.addEventListener("input", onConfigChange);
CONFIG_SIZE.addEventListener("input", onConfigChange);
document.querySelectorAll("input[name='config-mode']").forEach((radio) => {
    radio.addEventListener("change", onConfigChange);
});

GROUPS_CONTAINER.addEventListener("dragstart", onDragStart);
GROUPS_CONTAINER.addEventListener("dragover", onGroupDragOver);
GROUPS_CONTAINER.addEventListener("dragleave", onGroupDragLeave);
GROUPS_CONTAINER.addEventListener("drop", onGroupDrop);

OUTPUT.addEventListener("dragstart", onDragStart);
OUTPUT.addEventListener("dragover", onListDragOver);
OUTPUT.addEventListener("drop", onListDrop);

document.addEventListener("dragend", clearDrag);

groupify = createGroupify([]);
render();

function loadFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const roster = LOADER.parse(reader.result);
            if (roster.length === 0) {
                groupify = null;
            } else {
                groupify = createGroupify(roster);
            }
        } catch (error) {
            groupify = null;
            OUTPUT.innerHTML = "<h2>Schülerliste</h2>";
            const paragraph = document.createElement("p");
            paragraph.textContent = error.message;
            OUTPUT.appendChild(paragraph);
            renderGroups();
            updateExportButton();
            return;
        }

        render();
    };

    reader.readAsText(file);
}

function getPositiveInt(input) {
    const value = Number(input.value);
    if (!Number.isInteger(value) || value < 1) {
        return 1;
    }
    return value;
}

function getNumberOfGroups() {
    return getPositiveInt(CONFIG_VALUE);
}

function getStudentsPerGroup() {
    return getPositiveInt(CONFIG_SIZE);
}

function createGroupify(students) {
    const instance = new Groupify(getNumberOfGroups(), students);
    if (CONFIG_MODE_SIZE.checked) {
        instance.setStudentsPerGroup(getStudentsPerGroup());
    }
    return instance;
}

function applyGroupConfig() {
    if (!groupify) {
        return;
    }

    if (CONFIG_MODE_SIZE.checked) {
        groupify.setStudentsPerGroup(getStudentsPerGroup());
    } else {
        groupify.setNumberOfGroups(getNumberOfGroups());
    }
}

function addStudentFromInput() {
    const firstName = FIRST_NAME_INPUT.value.trim();
    const lastName = LAST_NAME_INPUT.value.trim();
    if (firstName === "" || lastName === "") {
        showAddError("Bitte Vorname und Nachname eingeben.");
        return;
    }

    try {
        const student = new Student(lastName, firstName);
        if (!groupify) {
            groupify = createGroupify([student]);
        } else {
            groupify.addStudent(student);
        }
    } catch (error) {
        showAddError(error.message);
        return;
    }

    FIRST_NAME_INPUT.value = "";
    LAST_NAME_INPUT.value = "";
    hideAddError();
    render();
}

function showAddError(message) {
    STUDENT_ADD_ERROR.textContent = message;
    STUDENT_ADD_ERROR.hidden = false;
}

function hideAddError() {
    STUDENT_ADD_ERROR.textContent = "";
    STUDENT_ADD_ERROR.hidden = true;
}

function onConfigChange() {
    applyGroupConfig();
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

function exportCsv() {

    try {
        const csv = EXPORTER.export(groupify);

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8"
        });
        
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "groupify.csv";
        link.click();

        URL.revokeObjectURL(url);
    } catch (error) {
        alert(error.message);
    }

}

function render() {
    renderStudents();
    renderGroups();
    updateExportButton();
}

function updateExportButton() {
    BTN_EXPORT.disabled = !groupify || groupify.unallocated.length() > 0;
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

    article.classList.add("group-" + groupify.getGroupStatus(group));

    heading.className = "group-name";
    heading.title = "Doppelklick zum Umbenennen";
    heading.addEventListener("dblclick", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startGroupRename(heading, group);
    });

    for (let i = 0; i < group.length(); i++) {
        article.appendChild(createStudentRow(group.getStudent(i), group));
    }

    return article;
}

function startGroupRename(heading, group) {
    if (heading.querySelector("input")) {
        return;
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = "group-name-input";
    input.value = group.name;

    heading.textContent = "";
    heading.appendChild(input);

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            input.blur();
        }
        if (event.key === "Escape") {
            input.value = group.name;
            input.blur();
        }
    });

    input.addEventListener("mousedown", function (event) {
        event.stopPropagation();
    });

    input.addEventListener("blur", function () {
        finishGroupRename(heading, group, input);
    });

    window.setTimeout(function () {
        input.focus();
        input.select();
    }, 0);
}

function finishGroupRename(heading, group, input) {
    try {
        if (groupify) {
            groupify.renameGroup(group, input.value.trim());
        }
    } catch (error) {
        alert(error.message);
    }

    heading.textContent = group.name;
}

function createStudentRow(student, group) {
    const paragraph = document.createElement("p");
    paragraph.className = "student-row";
    paragraph.draggable = true;
    paragraph._student = student;
    paragraph._group = group;

    const name = document.createElement("span");
    name.textContent = student.name;
    paragraph.appendChild(name);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-delete-student";
    button.addEventListener("mousedown", function (event) {
        event.stopPropagation();
    });

    if (group === null) {
        button.textContent = "×";
        button.setAttribute("aria-label", student.name + " löschen");
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            deleteStudent(student);
        });
    } else {
        button.textContent = "←";
        button.title = student.name + " zurück zur Schülerliste";
        button.setAttribute("aria-label", student.name + " zurück zur Schülerliste");
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            groupify.unallocate(student, group);
            render();
        });
    }
    paragraph.appendChild(button);

    return paragraph;
}

function deleteStudent(student) {
    if (!groupify) {
        return;
    }

    if (!confirm(student.name + " wirklich löschen?")) {
        return;
    }

    groupify.removeStudent(student);
    render();
}

// Starts dragging a student and stores the source group
function onDragStart(event) {
    if (event.target.closest(".btn-delete-student")) {
        event.preventDefault();
        return;
    }

    const row = event.target.closest(".student-row");
    if (!row || !row._student) {
        return;
    }

    draggedStudent = row._student;
    draggedGroup = row._group;
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
