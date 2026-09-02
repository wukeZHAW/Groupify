export class Person {

    static NAME_MIN_LEN = 1;
    static NAME_MAX_LEN = 50;

    #lastName;
    #firstName;

    constructor(lastName, firstName){
        this.#validateName(lastName);
        this.#validateName(firstName);
        this.#lastName = lastName;
        this.#firstName = firstName;
    }

    #validateName(name) {
        if(typeof name !== "string") {
            throw new TypeError("name must be of type string!");
        }
        if(name.length < Person.NAME_MIN_LEN || name.length > Person.NAME_MAX_LEN) {
            throw new RangeError(`name must be between ${Person.NAME_MIN_LEN} and ${Person.NAME_MAX_LEN} characters`);
        }
    }

    get firstName() {
        return this.#firstName;
    }

    get lastName() {
        return this.#lastName;
    }

    get name() {
        return this.#firstName + " " + this.#lastName;
    }
}