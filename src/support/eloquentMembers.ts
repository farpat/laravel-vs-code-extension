/** A member as PHP Toolbox asks about it when no class of the project types it. */
export interface MemberQuestion {
    owner: string;
    lineage: string[];
    /** What the owner is generic over: the model of a `Builder<Customer>`, a `HasMany<Invoice>` or a `Factory<Customer>`. */
    arguments: string[];
    name: string;
    isCall: boolean;
}

/** What a class has to extend, directly or through a base of the framework, to be a model. */
const MODEL_BASES = [
    "Illuminate\\Database\\Eloquent\\Model",
    "Illuminate\\Foundation\\Auth\\User",
    "Illuminate\\Database\\Eloquent\\Relations\\Pivot",
    "Illuminate\\Database\\Eloquent\\Relations\\MorphPivot",
];

const BUILDER = "Illuminate\\Database\\Eloquent\\Builder";
const FACTORY = "Illuminate\\Database\\Eloquent\\Factories\\Factory";
const RELATION = /^Illuminate\\Database\\Eloquent\\Relations\\/;

/** Calls that start a query, or a factory, from the model itself. */
const MODEL_STATIC_METHODS = new Set([
    "query",
    "newQuery",
    "newModelQuery",
    "on",
    "factory",
]);

/**
 * Calls that extend a query. Each answers with the builder it was called on, still
 * generic over the same model.
 */
const QUERY_METHODS = new Set([
    "where",
    "orWhere",
    "whereIn",
    "whereNotIn",
    "whereNull",
    "whereNotNull",
    "whereBetween",
    "whereDate",
    "whereKey",
    "whereHas",
    "whereDoesntHave",
    "whereRelation",
    "has",
    "doesntHave",
    "with",
    "withCount",
    "withTrashed",
    "withoutTrashed",
    "onlyTrashed",
    "withoutGlobalScope",
    "withoutGlobalScopes",
    "orderBy",
    "orderByDesc",
    "latest",
    "oldest",
    "limit",
    "take",
    "skip",
    "offset",
    "select",
    "addSelect",
    "distinct",
    "groupBy",
    "having",
    "join",
    "leftJoin",
    "when",
    "unless",
    "lockForUpdate",
    "sharedLock",
]);

/** Calls that hand one model back, from a builder, a relation or the model itself. */
const MODEL_METHODS = new Set([
    "first",
    "firstOrFail",
    "firstOrCreate",
    "firstOrNew",
    "firstOr",
    "firstWhere",
    "find",
    "findOrFail",
    "findOrNew",
    "findOr",
    "sole",
    "create",
    "make",
    "forceCreate",
    "updateOrCreate",
    "fresh",
    "refresh",
    "replicate",
    "load",
    "loadMissing",
    "loadCount",
    "fill",
    "forceFill",
    "setAttribute",
    "setRelation",
    "withoutRelations",
    "newInstance",
]);

/** Calls that shape a factory and answer with it. */
const FACTORY_CHAIN_METHODS = new Set([
    "count",
    "state",
    "for",
    "has",
    "sequence",
    "afterMaking",
    "afterCreating",
    "recycle",
    "connection",
]);

/** Calls that hand the factory's model back; `count(3)->create()` is a collection, read here as one model. */
const FACTORY_MODEL_METHODS = new Set([
    "create",
    "createOne",
    "createQuietly",
    "make",
    "makeOne",
    "createOneQuietly",
]);

/** The owner as it was asked about, generic arguments and all, for a fluent call. */
function itself(member: MemberQuestion): string {
    return member.arguments.length > 0
        ? `${member.owner}<${member.arguments.join(", ")}>`
        : member.owner;
}

/**
 * The type Eloquent gives a call nothing in the project declares.
 *
 * A builder, a relation or a factory is generic over its model: `Builder<Customer>`
 * written in a docblock, or `@extends Builder<Customer>` on a builder of the project.
 * A relation forwards what it does not answer itself to the query of its model, which
 * is where the scopes of a custom builder live.
 */
export function eloquentMemberType(member: MemberQuestion): string | null {
    if (!member.isCall) {
        return null;
    }

    const kinds = [member.owner, ...member.lineage];
    const model = member.arguments[0] ?? null;

    if (kinds.includes(FACTORY)) {
        if (FACTORY_CHAIN_METHODS.has(member.name)) {
            return itself(member);
        }

        return FACTORY_MODEL_METHODS.has(member.name) ? model : null;
    }

    if (kinds.some((kind) => RELATION.test(kind))) {
        if (MODEL_METHODS.has(member.name)) {
            return model;
        }

        return model === null ? null : `${model}::query()`;
    }

    if (kinds.includes(BUILDER)) {
        if (QUERY_METHODS.has(member.name)) {
            return itself(member);
        }

        return MODEL_METHODS.has(member.name) ? model : null;
    }

    if (!MODEL_BASES.some((base) => kinds.includes(base))) {
        return null;
    }

    // With no builder of its own known, the model stands for its builder as well.
    return MODEL_STATIC_METHODS.has(member.name) ||
        QUERY_METHODS.has(member.name) ||
        MODEL_METHODS.has(member.name)
        ? member.owner
        : null;
}
