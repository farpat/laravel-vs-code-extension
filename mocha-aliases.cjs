// tsc emits the `@src/*` paths verbatim, so the compiled tests in out/ cannot resolve
// them. Mapping the alias back to out/ keeps the source imports as they are written.
const path = require("path");
const Module = require("module");

const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, ...args) {
    if (request.startsWith("@src/")) {
        request = path.join(__dirname, "out", request.slice("@src/".length));
    }

    return resolveFilename.call(this, request, ...args);
};
