import { CsvLoader } from "./src/CSVLoader.js";
import { CsvExporter } from "./src/CSVExporter.js";
import { Groupify } from "./src/Groupify.js";
import { Student } from "./src/Student.js";

const FILE_INPUT = document.getElementById("csv-input");
const OUTPUT = document.getElementById("student-list");
const FIRST_NAME_INPUT = document.getElementById("student-first-name");
const LAST_NAME_INPUT = document.getElementById("student-last-name");
const BTN_ADD_STUDENT = document.getElementById("btn-add-student");
const BTN_EINZELN = document.getElementById("btn-aufteilen-einzeln");
const BTN_ALLE = document.getElementById("btn-alle-aufteilen");
const BTN_ALLE_ZURUECK = document.getElementById("btn-alle-zurueck");
const BTN_EXPORT = document.getElementById("btn-export");
const CONFIG_VALUE = document.getElementById("config-value");
const CONFIG_SIZE = document.getElementById("config-size");
const GROUPS_CONTAINER = document.getElementById("groups");
const STUDENT_ADD_ERROR = document.getElementById("student-add-error");
const STUDENT_ADD_ERROR_TEXT = document.getElementById("student-add-error-text");
const STUDENT_ADD_ERROR_CLOSE = document.getElementById("student-add-error-close");
const LOADER = new CsvLoader();
const EXPORTER = new CsvExporter();

let groupify = null;
let draggedStudent = null;
let draggedGroup = null;

FILE_INPUT.addEventListener("change", loadFile);
BTN_ADD_STUDENT.addEventListener("click", addStudentFromInput);
STUDENT_ADD_ERROR_CLOSE.addEventListener("click", hideAddStudentError);
BTN_EINZELN.addEventListener("click", aufteilenEinzeln);
BTN_ALLE.addEventListener("click", aufteilenAlle);
BTN_ALLE_ZURUECK.addEventListener("click", alleZurueck);
BTN_EXPORT.addEventListener("click", exportCsv);
CONFIG_VALUE.addEventListener("change", onNumberOfGroupsChange);
CONFIG_SIZE.addEventListener("change", onGroupSizeChange);

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
            alert(error.message);
            FILE_INPUT.value = "";
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
    let instance = new Groupify(getNumberOfGroups(), students);
    return instance;
}



function onNumberOfGroupsChange() {
    if (groupify) {
        groupify.setNumberOfGroups(getNumberOfGroups());
        CONFIG_SIZE.value = groupify.groupSize;
    }
    render();
}

function onGroupSizeChange() {
    if (groupify) {
        groupify.setStudentsPerGroup(getStudentsPerGroup());
        CONFIG_VALUE.value = groupify.groups.length;
    }
    render();
}



function addStudentFromInput() {
    const firstName = FIRST_NAME_INPUT.value.trim();
    const lastName = LAST_NAME_INPUT.value.trim();
    if (firstName === "" || lastName === "") {
        showAddStudentError("Bitte Vorname und Nachname eingeben.");
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
        showAddStudentError(error.message);
        return;
    }

    FIRST_NAME_INPUT.value = "";
    LAST_NAME_INPUT.value = "";
    hideAddStudentError();
    render();
}

function showAddStudentError(message) {
    STUDENT_ADD_ERROR_TEXT.textContent = message;
    STUDENT_ADD_ERROR.classList.remove("d-none");
    STUDENT_ADD_ERROR.classList.add("show");
}

function hideAddStudentError() {
    STUDENT_ADD_ERROR.classList.add("d-none");
    STUDENT_ADD_ERROR.classList.remove("show");
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

function alleZurueck() {
    if (!groupify) {
        return;
    }

    const groups = groupify.groups;
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        while (group.length() > 0) {
            groupify.unallocate(group.getStudent(0), group);
        }
    }
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
    updateButtonStates();
}



function updateButtonStates() {
    const hasUnallocated = groupify && groupify.unallocated.length() > 0;
    BTN_EINZELN.disabled = !hasUnallocated;
    BTN_ALLE.disabled = !hasUnallocated;
    BTN_EXPORT.disabled = !FILE_INPUT.value;

    let hasAllocated = false;
    if (groupify) {
        const groups = groupify.groups;
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].length() > 0) {
                hasAllocated = true;
                break;
            }
        }
    }
    BTN_ALLE_ZURUECK.disabled = !hasAllocated;
}



// render Studentlist
function renderStudents() {
    OUTPUT.innerHTML = "";
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
    const groupCard = document.createElement("article");
    groupCard.className = "card shadow-sm p-3";
    groupCard._group = group;

    const heading = document.createElement("h2");
    heading.className = "card-title h5";
    heading.textContent = name;
    groupCard.appendChild(heading);

    if (!group) {
        return groupCard;
    }

    groupCard.classList.add("group-" + groupify.getGroupStatus(group));

    renderGroupHeading(heading, group);

    for (let i = 0; i < group.length(); i++) {
        groupCard.appendChild(createStudentRow(group.getStudent(i), group));
    }

    return groupCard;
}



function renderGroupHeading(heading, group) {
    heading.textContent = "";
    heading.className = "group-name card-title h5 d-flex align-items-center gap-1";

    const nameText = document.createElement("span");
    nameText.className = "group-name-text min-w-0 flex-grow-1";
    nameText.textContent = group.name;
    heading.appendChild(nameText);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-rename-group";
    button.title = "Gruppe umbenennen";
    button.setAttribute("aria-label", "Gruppe umbenennen");
    const renameIcon = document.createElement("i");
    renameIcon.className = "bi bi-pencil";
    renameIcon.setAttribute("aria-hidden", "true");
    button.appendChild(renameIcon);
    button.addEventListener("click", function () {
        startGroupRename(heading, group);
    });
    heading.appendChild(button);
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

    renderGroupHeading(heading, group);
}



function createStudentRow(student, group) {
    const paragraph = document.createElement("p");
    paragraph.className = "student-row d-flex align-items-center justify-content-between gap-2 my-1";
    paragraph.draggable = true;
    paragraph._student = student;
    paragraph._group = group;

    const name = document.createElement("span");
    name.className = "min-w-0 flex-grow-1";
    name.textContent = student.name;
    paragraph.appendChild(name);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-delete-student";
    button.addEventListener("mousedown", function (event) {
        event.stopPropagation();
    });

    if (group === null) {
        const deleteIcon = document.createElement("i");
        deleteIcon.className = "bi bi-trash";
        deleteIcon.setAttribute("aria-hidden", "true");
        button.appendChild(deleteIcon);
        button.setAttribute("aria-label", student.name + " löschen");
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            deleteStudent(student);
        });
    } else {
        const unallocateIcon = document.createElement("i");
        unallocateIcon.className = "bi bi-caret-left";
        unallocateIcon.setAttribute("aria-hidden", "true");
        button.appendChild(unallocateIcon);
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
    const groupCard = event.target.closest("article");
    if (!groupCard || !groupCard._group || !draggedStudent) {
        return;
    }

    event.preventDefault();
    groupCard.classList.add("drop-target");
}



// Removes the drop highlight when leaving a group
function onGroupDragLeave(event) {
    const groupCard = event.target.closest("article");
    if (!groupCard) {
        return;
    }
    if (groupCard.contains(event.relatedTarget)) {
        return;
    }
    groupCard.classList.remove("drop-target");
}



// Moves or allocates the dragged student to the target group
function onGroupDrop(event) {
    event.preventDefault();

    const groupCard = event.target.closest("article");
    if (groupCard) {
        groupCard.classList.remove("drop-target");
    }

    const targetGroup = groupCard && groupCard._group;
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
