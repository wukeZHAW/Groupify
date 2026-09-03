import { Person } from "./Person.js";

export class CsvLoader {
    /**
     * Parses CSV content into persons.
    *
     * @param {string} csvText CSV in Name;Vorname format
     * @returns {Person[]} parsed persons
         * @throws {TypeError} if csvText is not a string
    * @throws {Error} if the CSV format is invalid
    */


    parse(csvText){
        
        this.#validateInput(csvText);

        const LINES = csvText
            .trim()
            .split("\n");
        
        const HEADER = LINES[0];
        this.#validateHeader(HEADER);

        const PERSONS = [];

        //skip header
        const DATA_LINES = LINES.slice(1);

        for (let i = 0; i < DATA_LINES.length; i++) {
            const ROW = DATA_LINES[i];

            // ignore empty rows
            if (ROW.trim() === ""){
                continue;
            }

            this.#validateRow(ROW);

            const [LAST_NAME, FIRST_NAME] = ROW.split(";");

            const STUDENT = new Person(
                LAST_NAME.trim(),
                FIRST_NAME.trim()
            );

            PERSONS.push(STUDENT);
        }

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
    
    #validateHeader(header){
        if (header.trim() !== "Name;Vorname"){
            throw new Error("CSV header must be 'Name;Vorname'");
        }
    }

    #validateRow(row){
        const COLUMNS = row.split(";");

        if (COLUMNS.length !== 2){
            throw new Error("CSV row must contain exactly two columns");
        }

        const [LAST_NAME, FIRST_NAME] = COLUMNS;

        if (LAST_NAME.trim() === "" || FIRST_NAME.trim() === ""){
            throw new Error("Name and Vorname must not be empty");
        }
    }
}