import * as assert from "assert";
import * as vscode from "vscode";
import { activateExtension, uri } from "../helper";

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

    test("says the server is not running instead of failing", async () => {
        const shown: string[] = [];
        const original = vscode.window.showWarningMessage;

        // Catch the message instead of showing it.
        (vscode.window as { showWarningMessage: unknown }).showWarningMessage =
            async (message: string) => {
                shown.push(message);

                return undefined;
            };

        try {
            await vscode.commands.executeCommand(
                "laravel.showUsages",
                uri("lang/en/messages.php").toString(),
                { line: 3, character: 5 },
            );
        } finally {
            (
                vscode.window as { showWarningMessage: unknown }
            ).showWarningMessage = original;
        }

        assert.deepStrictEqual(shown, [
            "The Laravel language server is not running",
        ]);
    });
});
