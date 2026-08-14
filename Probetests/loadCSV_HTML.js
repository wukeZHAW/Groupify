// Simple prototype:
// Read a CSV file, convert each row into a student object
// and display the students in the HTML.

const FILE_INPUT = document.getElementById("fileInput");
const OUTPUT = document.getElementById("output");

FILE_INPUT.addEventListener("change", loadFile);

// read selected CSV file
function loadFile(event) {
    let file = event.target.files[0];
    let reader = new FileReader();

    // execute callback function after the file has been read
    reader.onload = function () {
        let lines = reader.result
            .trim()
            .split("\n")
            .slice(1); // skip header

        let students = [];

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
    };

    // start reading file
    reader.readAsText(file);
}