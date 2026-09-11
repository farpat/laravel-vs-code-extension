import { defineConfig } from "@vscode/test-cli";

const mocha = {
    ui: "tdd",
    timeout: 20000,
    require: ["./mocha-aliases.cjs"],
};

export default defineConfig([
    {
        label: "extension",
        files: "out/test/*.test.js",
        workspaceFolder: "./src/test/fixtures/laravel-react",
        mocha,
    },
    {
        // PHP Toolbox is loaded from its checkout next to this one: what this extension
        // registers with it can only be checked with both running in the same window.
        label: "toolbox",
        files: "out/test/toolbox/*.test.js",
        extensionDevelopmentPath: [".", "../php-toolbox"],
        workspaceFolder: "./src/test/fixtures/laravel-react",
        mocha,
    },
]);
