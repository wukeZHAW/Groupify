import { Person } from "./Person.js";

export class CsvLoader {
    /**
     * Parses CSV content into persons.
     *
     * @param {string} csvText CSV in Name;Vorname or Name;Vorname;Punkte format
     * @returns {Person[]} parsed persons
         * @throws {TypeError} if csvText is not a string
    * @throws {Error} if the CSV format is invalid
    */

    #pointsBalancing = false;

    get pointsBalancing() {
        return this.#pointsBalancing;
    }


    parse(csvText){
        
        this.#validateInput(csvText);

        const LINES = csvText
            .trim()
            .split("\n");
        
        const HEADER = LINES[0].trim();
        const POINTS_BALANCING = this.#isPointsHeader(HEADER);

        const PERSONS = [];

        //skip header
        const DATA_LINES = LINES.slice(1);
        const EXPECTED_COLUMNS = POINTS_BALANCING ? 3 : 2;

        for (let i = 0; i < DATA_LINES.length; i++) {
            const ROW = DATA_LINES[i];

            // ignore empty rows
            if (ROW.trim() === ""){
                continue;
            }

            this.#validateRow(ROW, EXPECTED_COLUMNS);

            const COLUMNS = ROW.split(";");
            const LAST_NAME = COLUMNS[0];
            const FIRST_NAME = COLUMNS[1];
            const POINTS = POINTS_BALANCING
                ? this.#parsePoints(COLUMNS[2])
                : 0;

            const PERSON = new Person(
                LAST_NAME.trim(),
                FIRST_NAME.trim(),
                POINTS
            );

            PERSONS.push(PERSON);
        }

        this.#pointsBalancing = POINTS_BALANCING;
        return PERSONS

        
    }

    #validateInput(csvText) {
        if(typeof csvText !== "string") {
            throw new TypeError("csvText must be of type string!");
        }

        // Name und Vorname sind nicht leer
        if (csvText.trim() === ""){
            throw new Error("csvText must not be empty");
        }
    }
    
    #isPointsHeader(header){
        if (header === "Name;Vorname"){
            return false;
        }
        if (header === "Name;Vorname;Punkte"){
            return true;
        }
        throw new Error("CSV header must be 'Name;Vorname' or 'Name;Vorname;Punkte'");
    }

    #validateRow(row, expectedColumns){
        const COLUMNS = row.split(";");

        if (COLUMNS.length !== expectedColumns){
            throw new Error(
                expectedColumns === 2
                    ? "CSV row must contain exactly two columns"
                    : "CSV row must contain exactly three columns"
            );
        }

        const LAST_NAME = COLUMNS[0];
        const FIRST_NAME = COLUMNS[1];

        if (LAST_NAME.trim() === "" || FIRST_NAME.trim() === ""){
            throw new Error("Name and Vorname must not be empty");
        }
    }

    #parsePoints(rawPoints) {
        const TRIMMED = rawPoints.trim();
        if (TRIMMED === "") {
            return 0;
        }

        const POINTS = Number(TRIMMED);
        if (!Number.isInteger(POINTS) || POINTS < 0 || POINTS > 5) {
            throw new Error("Punkte must be an integer between 0 and 5");
        }

        return POINTS;
    }
}
