// Simple prototype:
// Read a CSV file, convert each row into a student object
// and display the students in the HTML.

const FILE_INPUT = document.getElementById("csv-input");
const OUTPUT = document.getElementById("student-list");
const BTN_EINZELN = document.getElementById("btn-aufteilen-einzeln");
const CONFIG_VALUE = document.getElementById("config-value");
const GROUPS_CONTAINER = document.getElementById("groups");

let students = [];
let groups = [];
let assignments = []; // Warteschlange: ein Eintrag = eine Klick-Zuweisung
let nextIndex = 0;

FILE_INPUT.addEventListener("change", loadFile);
BTN_EINZELN.addEventListener("click", aufteilenEinzeln);
CONFIG_VALUE.addEventListener("input", onConfigValueChange);

// beim Start Gruppenkarten aus dem Zahlenfeld bauen
buildGroupCards();

// read selected CSV file
function loadFile(event) {
    let file = event.target.files[0];
    if (!file) {
        return;
    }

    let reader = new FileReader();

    // execute callback function after the file has been read
    reader.onload = function () {
        // clear previous list, keep the heading
        OUTPUT.innerHTML = "<h2>Schülerliste</h2>";
        students = [];

        let lines = reader.result
            .trim()
            .split("\n")
            .slice(1); // skip header

        for (let i = 0; i < lines.length; i++) {
            // split CSV row into columns
            let [name, vorname] = lines[i].split(";");

            // create student object
            let student = {
                name: name.trim(),
                vorname: vorname.trim()
            };

            students.push(student);

            // display student in HTML
            let paragraph = document.createElement("p");
            paragraph.textContent = student.vorname + " " + student.name;

            OUTPUT.appendChild(paragraph);
        }

        console.log(students);

        buildGroupCards();
        shuffleStudents(students);
        createGroups();
    };

    // start reading file
    reader.readAsText(file);
}

// Gruppenkarten im HTML neu erzeugen
function buildGroupCards() {
    let numberOfGroups = Number(CONFIG_VALUE.value);

    if (numberOfGroups < 1) {
        numberOfGroups = 1;
    }

    GROUPS_CONTAINER.innerHTML = "";

    for (let i = 1; i <= numberOfGroups; i++) {
        let article = document.createElement("article");
        article.id = "gruppe-" + i;

        let heading = document.createElement("h2");
        heading.textContent = "Gruppe " + i;

        article.appendChild(heading);
        GROUPS_CONTAINER.appendChild(article);
    }
}



function onConfigValueChange() {
    buildGroupCards();
    // Wenn schon Schüler geladen sind: Gruppen neu berechnen
    if (students.length > 0) {
        shuffleStudents(students);
        createGroups();
    }
}



function createGroups() {
    let numberOfGroups = Number(CONFIG_VALUE.value);
    let numberOfStudents = students.length;

    // Grundmenge pro Gruppe + Rest, der auf die ersten Gruppen verteilt wird
    // Beispiel: 29 Schüler / 5 Gruppen → 5 pro Gruppe, Rest 4
    let studentsPerGroup = Math.floor(numberOfStudents / numberOfGroups);
    let remainingStudents = numberOfStudents % numberOfGroups;

    groups = [];
    let studentIndex = 0;

    // aufteilen in gruppen
    for (let i = 0; i < numberOfGroups; i++) {
        let groupSize = studentsPerGroup;

        // die ersten remainingStudents Gruppen bekommen einen Schüler mehr
        if (i < remainingStudents) {
            groupSize = groupSize + 1;
        }

        // gruppe erstellen
        let group = [];

        // schüler zur gruppe hinzufügen
        for (let j = 0; j < groupSize; j++) {
            group.push(students[studentIndex]);
            studentIndex = studentIndex + 1;
        }

        groups.push(group);
    }

    // flache Liste für "ein Klick = ein Schüler"
    assignments = [];
    nextIndex = 0;

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < groups[i].length; j++) {
            assignments.push({
                groupNumber: i + 1,
                student: groups[i][j]
            });
        }
    }

    console.log(groups);
}

function shuffleStudents(array) {
    let lastIndex = array.length - 1;
    while (lastIndex > 0) {
        let randIndex = Math.floor(Math.random() * (lastIndex + 1));

        let temp = array[lastIndex];
        array[lastIndex] = array[randIndex];
        array[randIndex] = temp;

        lastIndex--;
    }
}

// Ein Klick → ein Schüler erscheint in seiner Gruppe
function aufteilenEinzeln() {
    if (nextIndex >= assignments.length) {
        return;
    }

    let item = assignments[nextIndex];
    let article = document.getElementById("gruppe-" + item.groupNumber);

    let paragraph = document.createElement("p");
    paragraph.textContent = item.student.vorname + " " + item.student.name;
    article.appendChild(paragraph);

    nextIndex = nextIndex + 1;
}
