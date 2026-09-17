import { Groupify } from "./Groupify.js";

export class CsvExporter {

    export(groupify) {
        if (!(groupify instanceof Groupify)) {
            throw new TypeError("groupify must be a Groupify object");
        }

        const includePoints = groupify.pointsBalancing;
        let csv = includePoints
            ? "Name;Vorname;Punkte;Gruppe\n"
            : "Name;Vorname;Gruppe\n";

        for (const group of groupify.groups) {
            for (let i = 0; i < group.length(); i++){
                const person = group.getPerson(i);
                csv += this.#personRow(person, group.name, includePoints);
            }
        }

        const unallocated = groupify.unallocated;
        for (let i = 0; i < unallocated.length(); i++) {
            const person = unallocated.getPerson(i);
            csv += this.#personRow(person, unallocated.name, includePoints);
        }
        return csv
    }

    #personRow(person, groupName, includePoints) {
        if (includePoints) {
            return person.lastName + ";" + person.firstName + ";"
                + person.points + ";" + groupName + "\n";
        }

        return person.lastName + ";" + person.firstName + ";" + groupName + "\n";
    }

}
