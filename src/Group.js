export class Group {
    
    static NAME_MIN_LEN = 1;
    static NAME_MAX_LEN = 20;

    // Private fields
    #name;
    #members;

    constructor(name) {
        this.#validateName(name);
 
        this.#name = name;
        this.#members = [];
    }

    #validateName(name) {
        if(typeof name !== "string") {
            throw new TypeError("name must be of type string!");
        }
        if(name.length < Group.NAME_MIN_LEN || name.length > Group.NAME_MAX_LEN) {
            throw new RangeError(`name must be between ${Group.NAME_MIN_LEN} and ${Group.NAME_MAX_LEN} characters`);
        }
    }

    get name() {
        return this.#name;
    }

    set name(newName) {
        this.#validateName(newName);
        this.#name = newName;
    }

    getStudent(index){
        return this.#members[index];
    }

    length() {
        return this.#members.length;
    }

    addStudent(student) {
        if(this.#members.indexOf(student) >= 0) {
            throw new Error(`${this.name} already contains ${student}`);
        }
        this.#members.push(student);
    }

    removeStudent(student) {
        const idx = this.#members.indexOf(student);        
        if(idx < 0) {
            throw new Error("Element to be removed is not present");
        }
        this.#members.splice(idx,1);
    }
}
