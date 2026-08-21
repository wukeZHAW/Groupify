import { Groupify } from "./Groupify.js";

export class CsvExporter {

    export(groupify) {
        if (!(groupify instanceof Groupify)) {
            throw new TypeError("groupifiy must be a Groupify object");
        }

        if (groupify.unallocated.length() > 0) {
            throw new Error("all students must be allocated before export");
        }

        let csv = "Name;Vorname;Gruppe\n";

        for (const group of groupify.groups) {
            for (let i = 0; i < group.length(); i++){
                const student = group.getStudent(i);

                csv += student.lastName + ";" + student.firstName + ";" + group.name + "\n";
            }
        }
        return csv
    }

}