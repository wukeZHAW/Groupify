import { Student } from "../src/Student.js";

function runTests(){
    console.log("Starting Student.js tests ...");

    const student1 = new Student("Kevin")
    console.assert(student1.name === "Kevin", "Valid student should be created");

    // Name unter Minimum
    let errorThrown = null;
    try {const student2 = new Student("Wu");} catch(error) {
        errorThrown = error
    }
    console.assert(
        errorThrown != null,
        `name must be between ${Student.NAME_MIN_LEN} and ${Student.NAME_MAX_LEN} characters`
    )

    // Name genau Minimum
    const studentMinName = new Student("Kevin");
    console.assert(
    studentMinName.name === "Kevin",
    "5 character name should be valid"
    )

    // Name genau Maximum
    const studentMaxName = new Student("MaximilianPeterMüler");
    console.assert(studentMaxName.name.length === Student.NAME_MAX_LEN, "20 character name should be valid");

    // Name kein String
    errorThrown = null;
    try {const studentNotString = new Student(1234);} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown instanceof TypeError, "name must be of type string");

    // Name über Maximum
    errorThrown = null;
    try {const student7 = new Student("HalloHalloHalloHallos");} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, `name must not exceed ${Student.NAME_MAX_LEN} characters`);

    // gültiger Name-Setter
    const studentNameSetter = new Student("Marco");
    studentNameSetter.name = "Philip";
    console.assert(studentNameSetter.name === "Philip", "Valid name setter should update the student name");

    // ungültiger Name-Setter
    errorThrown = null;
    try {studentNameSetter.name = "Hi"} catch(error) {
        errorThrown = error
    }
    console.assert(errorThrown != null, "Invalid name setter should throw");
    
    console.assert(studentNameSetter.name === "Philip", 
        "Invalid name setter should not change existing name"
    );
}

runTests()