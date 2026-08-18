const students = [
    "Max Mustermann", 
    "Erika Musterfrau", 
    "Hans Müller", 
    "Maria Schmidt", 
    "Peter Meier", 
    "Anna Wagner", 
    "Thomas Becker", 
    "Laura Neumann", 
    "Markus Klein", 
    "Julia Vogel"
];

const group1 = [];
const group2 = [];
const group3 = [];

const assignedStudents = [];

// schüler states geben im array, ob sie zugewiesen wurden oder nicht
const studentStates = students.map(student => {
    return {
        student: student,
        assigned: false
    }
});

// random sollte nicht mehr aus students array sondern aus unassignedStudents array
function randomStudent() {
    // fragen wer noch unassigned ist
    const unassignedStudents = studentStates.filter(student => {
        return student.assigned === false;
    });

    const randomStudent = 
        unassignedStudents[
            Math.floor(Math.random() * unassignedStudents.length)
        ];

    randomStudent.assigned = true;
    assignedStudents.push(randomStudent);

    return randomStudent;
}

console.log("Vorher:");
console.log(studentStates);

randomStudent();

console.log("Nachher:");
console.log(studentStates);

console.log("Assigned:");
console.log(assignedStudents);