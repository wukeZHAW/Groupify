import { Group } from "../src/Group.js";

describe("Group", () => {

    describe("constructor", () => {

        test("throws when min > max", () => {
            expect(() => new Group("Hallo", 2, 1))
                .toThrow(RangeError);
        });

        test("throws when min < 0", () => {
            expect(() => new Group("Hallo", -1, 1))
                .toThrow(RangeError);
        });

        test("throws when max < 1", () => {
            expect(() => new Group("Hallo", 0, 0))
                .toThrow(RangeError);
        });

        test("accepts name at minimum length", () => {
            const group = new Group("A", 1, 2);

            expect(group.name).toBe("A");
        });

        test("accepts name at maximum length", () => {
            const group = new Group("HalloHalloHalloHallo", 1, 2);

            expect(group.name.length).toBe(Group.NAME_MAX_LEN);
        });

        test("throws when name exceeds maximum length", () => {
            expect(() =>
                new Group("HalloHalloHalloHallos", 1, 2)
            ).toThrow(RangeError);
        });

        test("throws when name is not a string", () => {
            expect(() =>
                new Group(12345, 1, 2)
            ).toThrow(TypeError);
        });

        test("throws when min is not an integer", () => {
            expect(() =>
                new Group("Hallo", 1.5, 3)
            ).toThrow(TypeError);
        });

        test("throws when max is not an integer", () => {
            expect(() =>
                new Group("Hallo", 1, 3.5)
            ).toThrow(TypeError);
        });
    });


    describe("isFull", () => {

        test("is false below max and true at max", () => {
            const group = new Group("Hallo", 1, 2);

            group.addStudent("Max");
            expect(group.isFull()).toBe(false);

            group.addStudent("Anna");
            expect(group.isFull()).toBe(true);
        });
    });


    describe("isComplete", () => {

        test("is false below min and true at min", () => {
            const group = new Group("Hallo", 2, 3);

            group.addStudent("Max");
            expect(group.isComplete()).toBe(false);

            group.addStudent("Anna");
            expect(group.isComplete()).toBe(true);
        });
    });


    describe("addStudent", () => {

        test("throws when group is already full", () => {
            const group = new Group("Hallo", 1, 2);

            group.addStudent("Max");
            group.addStudent("Anna");

            expect(() =>
                group.addStudent("Peter")
            ).toThrow();
        });

        test("throws when student already exists", () => {
            const group = new Group("Hallo", 1, 2);

            group.addStudent("Max");

            expect(() =>
                group.addStudent("Max")
            ).toThrow();
        });
    });


    describe("removeStudent", () => {

        test("removes existing student", () => {
            const group = new Group("Hallo", 1, 2);

            group.addStudent("Max");
            group.removeStudent("Max");

            expect(group.length()).toBe(0);
        });

        test("throws when student does not exist", () => {
            const group = new Group("Hallo", 1, 2);

            expect(() =>
                group.removeStudent("Peter")
            ).toThrow();
        });
    });


    describe("name setter", () => {

        test("updates a valid name", () => {
            const group = new Group("Hallo", 1, 2);

            group.name = "Gruppe";

            expect(group.name).toBe("Gruppe");
        });

        test("rejects an invalid name", () => {
            const group = new Group("Hallo", 1, 2);

            expect(() => {
                group.name = "Hi";
            }).toThrow(RangeError);

            expect(group.name).toBe("Hallo");
        });
    });
});