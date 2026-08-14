const fs = require("fs");

const CSV = fs.readFileSync("testcsv.csv", "utf-8");

// Convert the CSV data into an array of JavaScript objects.
// This makes it easier to access and work with individual students later,
// e.g. STUDENTS[0].name or STUDENTS[0].vorname.
// The first row is skipped because it contains the column headers.

const LINES = CSV
    .trim()
    .split("\n")
    .slice(1);


const STUDENTS = []

for (let i = 0; i < LINES.length; i++){
    const [name, vorname] = LINES[i].split(";");

    const STUDENT = {
        name: name.trim(),
        vorname: vorname.trim()
    };

    STUDENTS.push(STUDENT);
}

console.log(STUDENTS)