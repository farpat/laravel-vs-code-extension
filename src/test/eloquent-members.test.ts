import * as assert from "assert";
import { eloquentMemberType } from "@src/support/eloquentMembers";

const MODEL = "App\\Models\\Configuration";

const question = (
    name: string,
    lineage: string[] = ["Illuminate\\Database\\Eloquent\\Model"],
    isCall = true,
) => ({
    owner: MODEL,
    lineage,
    name,
    isCall,
});

suite("Eloquent Members Test Suite", () => {
    test("types a query and what it hands back as the model", () => {
        assert.strictEqual(eloquentMemberType(question("query")), MODEL);
        assert.strictEqual(eloquentMemberType(question("where")), MODEL);
        assert.strictEqual(
            eloquentMemberType(question("firstOrCreate")),
            MODEL,
        );
    });

    test("recognises a model through the framework bases it may extend", () => {
        assert.strictEqual(
            eloquentMemberType(
                question("first", ["Illuminate\\Foundation\\Auth\\User"]),
            ),
            MODEL,
        );
    });

    test("has no say on what is not a model, not a call, or not a builder method", () => {
        assert.strictEqual(
            eloquentMemberType(question("first", ["App\\Services\\Base"])),
            null,
        );
        assert.strictEqual(
            eloquentMemberType(question("first", undefined, false)),
            null,
        );
        assert.strictEqual(eloquentMemberType(question("get")), null);
    });
});
