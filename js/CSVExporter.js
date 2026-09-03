import { Groupify } from "./Groupify.js";

export class CsvExporter {

    export(groupify) {
        if (!(groupify instanceof Groupify)) {
            throw new TypeError("groupifiy must be a Groupify object");
        }

        let csv = "Name;Vorname;Gruppe\n";

        for (const group of groupify.groups) {
            for (let i = 0; i < group.length(); i++){
                const person = group.getPerson(i);

                csv += person.lastName + ";" + person.firstName + ";" + group.name + "\n";
            }
        }

        const unallocated = groupify.unallocated;
        for (let i = 0; i < unallocated.length(); i++) {
            const person = unallocated.getPerson(i);
            csv += person.lastName + ";" + person.firstName + ";" + unallocated.name + "\n";
        }
        return csv
    }

}