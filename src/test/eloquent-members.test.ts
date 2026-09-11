import * as assert from "assert";
import { eloquentMemberType } from "@src/support/eloquentMembers";

const MODEL = "App\\Models\\Customer";
const INVOICE = "App\\Models\\Invoice";
const BUILDER = "Illuminate\\Database\\Eloquent\\Builder";
const HAS_MANY = "Illuminate\\Database\\Eloquent\\Relations\\HasMany";
const FACTORY = "Illuminate\\Database\\Eloquent\\Factories\\Factory";

const question = (
    name: string,
    owner = MODEL,
    lineage: string[] = ["Illuminate\\Database\\Eloquent\\Model"],
    args: string[] = [],
    isCall = true,
) => ({ owner, lineage, arguments: args, name, isCall });

suite("Eloquent Members Test Suite", () => {
    test("lets a model stand for its own builder", () => {
        assert.strictEqual(eloquentMemberType(question("query")), MODEL);
        assert.strictEqual(eloquentMemberType(question("where")), MODEL);
        assert.strictEqual(
            eloquentMemberType(question("firstOrCreate")),
            MODEL,
        );
        assert.strictEqual(eloquentMemberType(question("factory")), MODEL);
    });

    test("keeps a builder generic over its model until it hands the model back", () => {
        const custom = question(
            "where",
            "App\\EloquentBuilders\\CustomerBuilder",
            [BUILDER],
            [MODEL],
        );

        assert.strictEqual(
            eloquentMemberType(custom),
            `App\\EloquentBuilders\\CustomerBuilder<${MODEL}>`,
        );
        assert.strictEqual(
            eloquentMemberType({ ...custom, name: "first" }),
            MODEL,
        );
        assert.strictEqual(
            eloquentMemberType({ ...custom, name: "get" }),
            null,
        );
    });

    test("hands a relation's model back, and forwards its scopes to the model's query", () => {
        const relation = question("create", HAS_MANY, [], [INVOICE, MODEL]);

        assert.strictEqual(eloquentMemberType(relation), INVOICE);
        assert.strictEqual(
            eloquentMemberType({ ...relation, name: "pending" }),
            `${INVOICE}::query()`,
        );
        assert.strictEqual(
            eloquentMemberType({ ...relation, arguments: [], name: "pending" }),
            null,
        );
    });

    test("shapes a factory and hands its model back", () => {
        const factory = question(
            "count",
            "Database\\Factories\\CustomerFactory",
            [FACTORY],
            [MODEL],
        );

        assert.strictEqual(
            eloquentMemberType(factory),
            `Database\\Factories\\CustomerFactory<${MODEL}>`,
        );
        assert.strictEqual(
            eloquentMemberType({ ...factory, name: "create" }),
            MODEL,
        );
        assert.strictEqual(
            eloquentMemberType({ ...factory, name: "raw" }),
            null,
        );
    });

    test("recognises a model through the framework bases it may extend", () => {
        assert.strictEqual(
            eloquentMemberType(
                question("first", MODEL, [
                    "Illuminate\\Foundation\\Auth\\User",
                ]),
            ),
            MODEL,
        );
    });

    test("has no say on what is not Eloquent's, not a call, or not a known method", () => {
        assert.strictEqual(
            eloquentMemberType(
                question("first", MODEL, ["App\\Services\\Base"]),
            ),
            null,
        );
        assert.strictEqual(
            eloquentMemberType(question("first", MODEL, undefined, [], false)),
            null,
        );
        assert.strictEqual(eloquentMemberType(question("get")), null);
    });
});
