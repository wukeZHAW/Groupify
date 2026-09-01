import { Groupify } from "./Groupify.js";

export class CsvExporter {

    export(groupify) {
        if (!(groupify instanceof Groupify)) {
            throw new TypeError("groupifiy must be a Groupify object");
        }

        let csv = "Name;Vorname;Gruppe\n";

        for (const group of groupify.groups) {
            for (let i = 0; i < group.length(); i++){
                const student = group.getStudent(i);

                csv += student.lastName + ";" + student.firstName + ";" + group.name + "\n";
            }
        }

        const unallocated = groupify.unallocated;
        for (let i = 0; i < unallocated.length(); i++) {
            const student = unallocated.getStudent(i);
            csv += student.lastName + ";" + student.firstName + ";" + unallocated.name + "\n";
        }
        return csv
    }

}