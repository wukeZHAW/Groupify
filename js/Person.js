export class Person {

    static NAME_MIN_LEN = 1;
    static NAME_MAX_LEN = 50;
    static POINTS_MIN = 0;
    static POINTS_MAX = 5;

    #lastName;
    #firstName;
    #points;

    constructor(lastName, firstName, points = 0){
        this.#validateName(lastName);
        this.#validateName(firstName);
        this.#validatePoints(points);
        this.#lastName = lastName;
        this.#firstName = firstName;
        this.#points = points;
    }

    #validateName(name) {
        if(typeof name !== "string") {
            throw new TypeError("name must be of type string!");
        }
        if(name.length < Person.NAME_MIN_LEN || name.length > Person.NAME_MAX_LEN) {
            throw new RangeError(`name must be between ${Person.NAME_MIN_LEN} and ${Person.NAME_MAX_LEN} characters`);
        }
    }

    #validatePoints(points) {
        if (typeof points !== "number" || !Number.isInteger(points)) {
            throw new TypeError("points must be an integer");
        }
        if (points < Person.POINTS_MIN || points > Person.POINTS_MAX) {
            throw new RangeError(
                `points must be between ${Person.POINTS_MIN} and ${Person.POINTS_MAX}`
            );
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

    get points() {
        return this.#points;
    }
}
