/** A member as PHP Toolbox describes it when asking how else the code reaches it. */
export interface MemberSymbol {
    kind: "method" | "property" | "staticProperty" | "constant";
    name: string;
    className: string;
    returnType: string | null;
}

export interface MemberAlias {
    kind: "method" | "property";
    name: string;
}

const LEGACY_ACCESSOR = /^(?:get|set)([A-Z]\w*)Attribute$/;

function snakeCase(name: string): string {
    return name.replace(/[A-Z]/g, (letter, offset) =>
        offset === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`,
    );
}

/** What the model exposes under the accessor name: `formattedValue` reads as `formatted_value`. */
function attributeOf(method: MemberSymbol): string | null {
    if (method.kind !== "method") {
        return null;
    }

    if (/(?:^|\\)Attribute$/.test(method.returnType ?? "")) {
        return method.name;
    }

    const legacy = LEGACY_ACCESSOR.exec(method.name);

    return legacy
        ? legacy[1].charAt(0).toLowerCase() + legacy[1].slice(1)
        : null;
}

/**
 * The property names Eloquent serves an accessor under.
 *
 * `formattedValue(): Attribute` is never called: the model is read and written as
 * `->formatted_value`, and Eloquent answers `->formattedValue` the same way. The legacy
 * `getFormattedValueAttribute()` form is served under the same names.
 */
export function eloquentAttributeAliases(method: MemberSymbol): MemberAlias[] {
    const attribute = attributeOf(method);

    if (attribute === null) {
        return [];
    }

    const names = new Set([snakeCase(attribute), attribute]);

    return [...names].map((name) => ({ kind: "property", name }));
}
