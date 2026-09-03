import { CsvLoader } from "./CSVLoader.js";
import { CsvExporter } from "./CSVExporter.js";
import { Groupify } from "./Groupify.js";
import { Person } from "./Person.js";

const FILE_INPUT = document.getElementById("csv-input");
const OUTPUT = document.getElementById("person-list");
const FIRST_NAME_INPUT = document.getElementById("person-first-name");
const LAST_NAME_INPUT = document.getElementById("person-last-name");
const BTN_ADD_STUDENT = document.getElementById("btn-add-person");
const BTN_EINZELN = document.getElementById("btn-aufteilen-einzeln");
const BTN_ALLE = document.getElementById("btn-alle-aufteilen");
const BTN_ALLE_ZURUECK = document.getElementById("btn-alle-zurueck");
const BTN_EXPORT = document.getElementById("btn-export");
const CONFIG_VALUE = document.getElementById("config-value");
const CONFIG_SIZE = document.getElementById("config-size");
const GROUPS_CONTAINER = document.getElementById("groups");
const STUDENT_ADD_ERROR = document.getElementById("person-add-error");
const STUDENT_ADD_ERROR_TEXT = document.getElementById("person-add-error-text");
const DELETE_STUDENT_MODAL = document.getElementById("delete-person-modal");
const DELETE_STUDENT_BODY = document.getElementById("delete-person-body");
const BTN_CONFIRM_DELETE = document.getElementById("btn-confirm-delete");
const LOADER = new CsvLoader();
const EXPORTER = new CsvExporter();

let groupify = null;
let draggedPerson = null;
let draggedGroup = null;
let personToDelete = null;

FILE_INPUT.addEventListener("change", loadFile);
BTN_ADD_STUDENT.addEventListener("click", addPersonFromInput);
BTN_CONFIRM_DELETE.addEventListener("click", confirmDeletePerson);
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
                CONFIG_SIZE.value = groupify.groupSize;
            }
        } catch (error) {
            showErrorToast(error.message);
            FILE_INPUT.value = "";
        }

        render();
    };

    reader.readAsText(file);
}



function getPositiveInt(input) {
    const value = Number(input.value);
    if (!Number.isInteger(value) || value < 1) {
        input.value = 1;
        return 1;
    }
    return value;
}



function getNumberOfGroups() {
    return getPositiveInt(CONFIG_VALUE);
}



function getPersonsPerGroup() {
    return getPositiveInt(CONFIG_SIZE);
}



function createGroupify(persons) {
    let instance = new Groupify(getNumberOfGroups(), persons);
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
        groupify.setPersonsPerGroup(getPersonsPerGroup());
        CONFIG_VALUE.value = groupify.groups.length;
    }
    render();
}



function addPersonFromInput() {
    const firstName = FIRST_NAME_INPUT.value.trim();
    const lastName = LAST_NAME_INPUT.value.trim();
    if (firstName === "" || lastName === "") {
        showErrorToast("Bitte Vorname und Nachname eingeben.");
        return;
    }

    try {
        const person = new Person(lastName, firstName);
        if (!groupify) {
            groupify = createGroupify([person]);
        } else {
            groupify.addPerson(person);
        }
    } catch (error) {
        showErrorToast(error.message);
        return;
    }

    FIRST_NAME_INPUT.value = "";
    LAST_NAME_INPUT.value = "";
    render();
}

function showErrorToast(message) {
    STUDENT_ADD_ERROR_TEXT.textContent = message;
    bootstrap.Toast.getOrCreateInstance(STUDENT_ADD_ERROR).show();
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
    const person = unallocated.getPerson(index);
    groupify.randAssign(person);
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
            groupify.unallocate(group.getPerson(0), group);
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
        showErrorToast(error.message);
    }

}



function render() {
    renderPersons();
    renderGroups();
    updateButtonStates();
}



function updateButtonStates() {
    const hasUnallocated = groupify && groupify.unallocated.length() > 0;
    BTN_EINZELN.disabled = !hasUnallocated;
    BTN_ALLE.disabled = !hasUnallocated;

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
    BTN_EXPORT.disabled = !hasUnallocated && !hasAllocated;
}



// render Personlist
function renderPersons() {
    OUTPUT.innerHTML = "";
    if (!groupify) {
        return;
    }

    const unallocated = groupify.unallocated;
    for (let i = 0; i < unallocated.length(); i++) {
        OUTPUT.appendChild(createPersonRow(unallocated.getPerson(i), null));
    }
}



// rendern Groupscards number of groups
function renderGroups() {
    GROUPS_CONTAINER.innerHTML = "";

    if (groupify) {
        const groups = groupify.groups;
        for (let i = 0; i < groups.length; i++) {
            GROUPS_CONTAINER.appendChild(
                createGroupCard(groups[i].name, 
                groups[i])
            );
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
        groupCard.appendChild(createPersonRow(group.getPerson(i), group));
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
    input.setAttribute("maxlength", "20");
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
        showErrorToast(error.message);
    }

    renderGroupHeading(heading, group);
}



function createPersonRow(person, group) {
    const paragraph = document.createElement("p");
    paragraph.className = "person-row d-flex align-items-center justify-content-between gap-2 my-1";
    paragraph.draggable = true;
    paragraph._person = person;
    paragraph._group = group;

    const name = document.createElement("span");
    name.className = "min-w-0 flex-grow-1";
    name.textContent = person.name;
    paragraph.appendChild(name);

    const button = document.createElement("button");
    button.type = "button";
    button.addEventListener("mousedown", function (event) {
        event.stopPropagation();
    });

    if (group === null) {
        button.className = "btn-delete-person";
        const deleteIcon = document.createElement("i");
        deleteIcon.className = "bi bi-trash";
        deleteIcon.setAttribute("aria-hidden", "true");
        button.appendChild(deleteIcon);
        button.setAttribute("aria-label", person.name + " löschen");
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            deletePerson(person);
        });
    } else {
        button.className = "btn-unallocate-person";
        const unallocateIcon = document.createElement("i");
        unallocateIcon.className = "bi bi-caret-left";
        unallocateIcon.setAttribute("aria-hidden", "true");
        button.appendChild(unallocateIcon);
        let personNameDescription = person.name + " zurück zur Personenliste"
        button.title = personNameDescription;
        button.setAttribute("aria-label", personNameDescription);
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            groupify.unallocate(person, group);
            render();
        });
    }
    paragraph.appendChild(button);

    return paragraph;
}



function deletePerson(person) {
    if (!groupify) {
        return;
    }

    personToDelete = person;
    DELETE_STUDENT_BODY.textContent = person.name + " wirklich löschen?";
    bootstrap.Modal.getOrCreateInstance(DELETE_STUDENT_MODAL).show();
}

function confirmDeletePerson() {
    if (!groupify || !personToDelete) {
        return;
    }

    groupify.removePerson(personToDelete);
    CONFIG_SIZE.value = groupify.groupSize;
    personToDelete = null;
    bootstrap.Modal.getOrCreateInstance(DELETE_STUDENT_MODAL).hide();
    render();
}



// Starts dragging a person and stores the source group
function onDragStart(event) {
    if (event.target.closest(".btn-delete-person, .btn-unallocate-person")) {
        event.preventDefault();
        return;
    }

    const row = event.target.closest(".person-row");
    if (!row || !row._person) {
        return;
    }

    draggedPerson = row._person;
    draggedGroup = row._group;
    event.dataTransfer.setData("text/plain", draggedPerson.name);
    event.dataTransfer.effectAllowed = "move";
}



// Allows dropping a person onto a group
function onGroupDragOver(event) {
    const groupCard = event.target.closest("article");
    if (!groupCard || !groupCard._group || !draggedPerson) {
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



// Moves or allocates the dragged person to the target group
function onGroupDrop(event) {
    event.preventDefault();

    const groupCard = event.target.closest("article");
    if (groupCard) {
        groupCard.classList.remove("drop-target");
    }

    const targetGroup = groupCard && groupCard._group;
    if (!groupify || !draggedPerson || !targetGroup) {
        return;
    }

    if (draggedGroup === targetGroup) {
        return;
    }

    try {
        if (draggedGroup) {
            groupify.move(draggedGroup, draggedPerson, targetGroup);
        } else {
            groupify.allocate(draggedPerson, targetGroup);
        }
        render();
    } catch (error) {
        return;
    }
}



// Allows dragging a grouped person back into the person list
function onListDragOver(event) {
    if (!draggedPerson || !draggedGroup) {
        return;
    }

    event.preventDefault();
}



// Unallocates the dragged person back to the person list
function onListDrop(event) {
    event.preventDefault();

    if (!groupify || !draggedPerson || !draggedGroup) {
        return;
    }

    groupify.unallocate(draggedPerson, draggedGroup);
    render();
}



// Resets the drag state and removes drop highlights
function clearDrag() {
    draggedPerson = null;
    draggedGroup = null;

    const articles = GROUPS_CONTAINER.querySelectorAll("article");
    for (let i = 0; i < articles.length; i++) {
        articles[i].classList.remove("drop-target");
    }
}
