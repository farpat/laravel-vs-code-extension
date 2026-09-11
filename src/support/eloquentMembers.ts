/** A member as PHP Toolbox asks about it when no class of the project types it. */
export interface MemberQuestion {
    owner: string;
    lineage: string[];
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

/**
 * Calls that start or extend a query of the model. Each answers with a builder of that
 * model, which for what comes next reads as the model itself: `->first()` is asked of it.
 */
const QUERY_METHODS = new Set([
    "query",
    "newQuery",
    "newModelQuery",
    "on",
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

/** Calls that hand one model back, from a builder or from the model itself. */
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

/**
 * The type Eloquent gives a call the model never declares.
 *
 * `Configuration::query()->where(...)->first()` is a Configuration from end to end: the
 * builder is generic over the model, so answering with the model at every link keeps a
 * chain of any length typed without modelling the builder itself.
 */
export function eloquentMemberType(member: MemberQuestion): string | null {
    if (!member.isCall) {
        return null;
    }

    if (!MODEL_BASES.some((base) => member.lineage.includes(base))) {
        return null;
    }

    return QUERY_METHODS.has(member.name) || MODEL_METHODS.has(member.name)
        ? member.owner
        : null;
}
