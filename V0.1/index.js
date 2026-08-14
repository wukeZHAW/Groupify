// Simple prototype:
// Read a CSV file, convert each row into a student object
// and display the students in the HTML.

const FILE_INPUT = document.getElementById("csv-input");
const OUTPUT = document.getElementById("student-list");

let students = [];

FILE_INPUT.addEventListener("change", loadFile);

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

        shuffleStudents(students);
        createGroups(); // ← HIER
    };

    // start reading file
    reader.readAsText(file);
}

function createGroups() {
    let numberOfGroups = Number(document.getElementById("config-value").value);
    let numberOfStudents = students.length;

    // Grundmenge pro Gruppe + Rest, der auf die ersten Gruppen verteilt wird
    // Beispiel: 29 Schüler / 5 Gruppen → 5 pro Gruppe, Rest 4
    let studentsPerGroup = Math.floor(numberOfStudents / numberOfGroups);
    let remainingStudents = numberOfStudents % numberOfGroups;

    let groups = [];
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
            // schüler zur gruppe hinzufügen
            group.push(students[studentIndex]);
            studentIndex = studentIndex + 1;
        }

        groups.push(group);
    }

    //return groups;
    console.log(groups);
}


function shuffleStudents(array){
    let lastIndex = array.length - 1;
    while (lastIndex > 0) {
        let randIndex = Math.floor(Math.random() * (lastIndex + 1));

        let temp = array[lastIndex];
        array[lastIndex] = array[randIndex];
        array[randIndex] = temp;

        lastIndex --;
    }
}