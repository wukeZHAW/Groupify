import { Groupify } from "./Groupify.js";

export class CsvExporter {

    export(groupify) {
        if (!(groupify instanceof Groupify)) {
            throw new TypeError("groupify must be a Groupify object");
        }

        const includeScore = groupify.scoreBalancing;
        let csv = includeScore
            ? "Name;Vorname;Score;Gruppe\n"
            : "Name;Vorname;Gruppe\n";

        for (const group of groupify.groups) {
            for (let i = 0; i < group.length(); i++){
                const person = group.getPerson(i);
                csv += this.#personRow(person, group.name, includeScore);
            }
        }

        const unallocated = groupify.unallocated;
        for (let i = 0; i < unallocated.length(); i++) {
            const person = unallocated.getPerson(i);
            csv += this.#personRow(person, unallocated.name, includeScore);
        }
        return csv
    }

    #personRow(person, groupName, includeScore) {
        if (includeScore) {
            return person.lastName + ";" + person.firstName + ";"
                + person.score + ";" + groupName + "\n";
        }

        return person.lastName + ";" + person.firstName + ";" + groupName + "\n";
    }

}