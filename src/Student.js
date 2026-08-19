export class Student {

    static NAME_MIN_LEN = 2;
    static NAME_MAX_LEN = 50;

    #name;

    constructor(name){
        this.#validateName(name);
        this.#name = name;
    }

    #validateName(name) {
        if(typeof name !== "string") {
            throw new TypeError("name must be of type string!");
        }
        if(name.length < Student.NAME_MIN_LEN || name.length > Student.NAME_MAX_LEN) {
            throw new RangeError(`name must be between ${Student.NAME_MIN_LEN} and ${Student.NAME_MAX_LEN} characters`);
        }
    }

    get name() {
        return this.#name;
    }

    set name(newName) {
        this.#validateName(newName);
        this.#name = newName;
    }
}