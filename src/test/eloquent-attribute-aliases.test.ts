import * as assert from "assert";
import { eloquentAttributeAliases } from "@src/support/eloquentAttributes";

const method = (name: string, returnType: string | null) => ({
    kind: "method" as const,
    name,
    className: "App\\Models\\Configuration",
    returnType,
});

suite("Eloquent Attribute Aliases Test Suite", () => {
    test("serves an Attribute accessor as its snake case property", () => {
        assert.deepStrictEqual(
            eloquentAttributeAliases(method("formattedValue", "Attribute")),
            [
                { kind: "property", name: "formatted_value" },
                { kind: "property", name: "formattedValue" },
            ],
        );
    });

    test("reads the return type however it is qualified", () => {
        assert.deepStrictEqual(
            eloquentAttributeAliases(
                method(
                    "name",
                    "\\Illuminate\\Database\\Eloquent\\Casts\\Attribute",
                ),
            ),
            [{ kind: "property", name: "name" }],
        );
    });

    test("serves a legacy accessor under the attribute it names", () => {
        assert.deepStrictEqual(
            eloquentAttributeAliases(method("getFullNameAttribute", "string")),
            [
                { kind: "property", name: "full_name" },
                { kind: "property", name: "fullName" },
            ],
        );
    });

    test("leaves any other method alone", () => {
        assert.deepStrictEqual(
            eloquentAttributeAliases(method("formatValue", "string")),
            [],
        );
        assert.deepStrictEqual(
            eloquentAttributeAliases({
                ...method("value", null),
                kind: "property",
            }),
            [],
        );
    });
});
