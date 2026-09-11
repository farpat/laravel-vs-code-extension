/**
 * Functions returning an instance of the class they are handed: what the container does
 * behind `app(TenantStorage::class)` and `resolve(TenantStorage::class)`. Registered with
 * PHP Toolbox, a call on their result is a call on that class.
 */
export const CONTAINER_FACTORIES = ["app", "resolve"];
