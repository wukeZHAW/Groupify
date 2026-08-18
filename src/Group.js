export class Group {
    
    static NAME_MIN_LEN = 5;
    static NAME_MAX_LEN = 20;

    // Private fields
    #min;
    #max;
    #name;
    #members;

    constructor(name, min, max) {

        if(!Number.isInteger(min) || !Number.isInteger(max)) {
            throw new TypeError("min and max must be integers");
        }

        if (min < 0 || max < 1 || min > max) {
            throw new RangeError("min and max must be positive with min >=0, max >= 1 and max >= min");
        }

        this.#validateName(name);
 
        this.#name = name;
        this.#min = min;
        this.#max = max;
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

    length() {
        return this.#members.length;
    }

    addStudent(student) {
        if (this.isFull()) {
            throw new Error(`${this.name} is already full.`);
        }
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

    isComplete() {
        return this.#members.length >= this.#min
    }

    isFull() {
        return this.#members.length === this.#max
    }
}