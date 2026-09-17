export class Person {

    static NAME_MIN_LEN = 1;
    static NAME_MAX_LEN = 50;
    static SCORE_MIN = 0;
    static SCORE_MAX = 5;

    #lastName;
    #firstName;
    #score;

    constructor(lastName, firstName, score = 0){
        this.#validateName(lastName);
        this.#validateName(firstName);
        this.#validateScore(score);
        this.#lastName = lastName;
        this.#firstName = firstName;
        this.#score = score;
    }

    #validateName(name) {
        if(typeof name !== "string") {
            throw new TypeError("name must be of type string!");
        }
        if(name.length < Person.NAME_MIN_LEN || name.length > Person.NAME_MAX_LEN) {
            throw new RangeError(`name must be between ${Person.NAME_MIN_LEN} and ${Person.NAME_MAX_LEN} characters`);
        }
    }

    #validateScore(score) {
        if (typeof score !== "number" || !Number.isInteger(score)) {
            throw new TypeError("score must be an integer");
        }
        if (score < Person.SCORE_MIN || score > Person.SCORE_MAX) {
            throw new RangeError(
                `score must be between ${Person.SCORE_MIN} and ${Person.SCORE_MAX}`
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

    get score() {
        return this.#score;
    }
}