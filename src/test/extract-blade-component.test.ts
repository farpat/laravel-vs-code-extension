import * as assert from "assert";
import {
    componentContents,
    componentTag,
    propsOf,
    toKebabCase,
} from "@src/commands/extractBladeComponent";

suite("Extract Blade Component Test Suite", () => {
    test("passes the variables the markup reads as props", () => {
        const markup = `<label for="{{ $id }}">{{ $label }}</label>`;

        assert.deepStrictEqual(propsOf(markup), ["id", "label"]);
    });

    test("leaves out what Blade fills in itself", () => {
        const markup = `<div {{ $attributes }}>{{ $slot }}@error($field)<p>{{ $errors->first() }}</p>@enderror</div>`;

        assert.deepStrictEqual(propsOf(markup), ["field"]);
    });

    test("leaves out the variables the markup declares", () => {
        const markup = `@foreach ($rows as $row)
    <li>{{ $row->label }}</li>
@endforeach`;

        assert.deepStrictEqual(propsOf(markup), ["rows"]);
    });

    test("leaves out a key and value pair of a loop", () => {
        const markup = `@foreach ($options as $value => $label)
    <option value="{{ $value }}">{{ $label }}</option>
@endforeach`;

        assert.deepStrictEqual(propsOf(markup), ["options"]);
    });

    test("leaves out a variable assigned inside the markup", () => {
        const markup = `@php $total = $rows->count(); @endphp
<span>{{ $total }}</span>`;

        assert.deepStrictEqual(propsOf(markup), ["rows"]);
    });

    test("writes each prop once, whatever the markup does with it", () => {
        const markup = `<input name="{{ $name }}" id="{{ $name }}">`;

        assert.deepStrictEqual(propsOf(markup), ["name"]);
    });

    test("writes the tag with the props in kebab case", () => {
        assert.strictEqual(
            componentTag("forms.text-input", ["label", "isRequired"]),
            `<x-forms.text-input :label="$label" :is-required="$isRequired" />`,
        );
    });

    test("writes a tag with no attribute when the markup reads nothing", () => {
        assert.strictEqual(
            componentTag("layout.divider", []),
            "<x-layout.divider />",
        );
    });

    test("converts a camel case prop name for the attribute only", () => {
        assert.strictEqual(toKebabCase("isRequired"), "is-required");
        assert.strictEqual(toKebabCase("label"), "label");
    });

    test("declares the props and drops the indentation the markup came with", () => {
        const markup = `            <label>{{ $label }}</label>
            <input name="{{ $name }}">`;

        assert.strictEqual(
            componentContents(markup, ["label", "name"]),
            `@props(['label', 'name'])

<label>{{ $label }}</label>
<input name="{{ $name }}">
`,
        );
    });

    test("writes no props line when the markup takes nothing", () => {
        assert.strictEqual(
            componentContents("<hr>", []),
            `<hr>
`,
        );
    });
});
