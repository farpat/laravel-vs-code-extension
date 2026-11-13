import * as assert from "assert";
import * as vscode from "vscode";
import { activateExtension } from "../helper";

/**
 * Runs with a server path that does not exist, so the first server start fails. The
 * server can still start later (after a phpCommand change), and its usages lens needs
 * the command to be there.
 */
suite("Show Usages Command Without Server Test Suite", () => {
    suiteSetup(async () => {
        await activateExtension();
    });

    test("registers the usages command when the server did not start", async () => {
        const commands = await vscode.commands.getCommands(true);

        assert.ok(commands.includes("laravel.showUsages"));
    });
});
