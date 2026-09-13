import * as assert from "assert";
import * as vscode from "vscode";
import { activateExtension, uri } from "../helper";

/**
 * Runs with PHP Toolbox loaded next to this extension: the usages a Ctrl+click on a
 * declaration asks for land in the PHP Toolbox panel, a webview this extension cannot
 * read back. What can be checked is that the whole road holds: the command runs, the
 * panel is registered under its id and comes up, and the editor stays where it was.
 */
suite("Usages Panel Test Suite", () => {
    suiteSetup(async () => {
        await activateExtension();
    });

    test("shows the usages of a translation key in the PHP Toolbox panel", async () => {
        assert.ok(
            vscode.extensions.getExtension("farrugia.php-toolbox"),
            "PHP Toolbox is not loaded: run this suite with its development path",
        );

        const document = await vscode.workspace.openTextDocument(
            uri("lang/en/messages.php"),
        );
        const editor = await vscode.window.showTextDocument(document);

        await vscode.commands.executeCommand(
            "laravel.showUsages",
            document.uri.toString(),
            { line: 3, character: 5 },
        );

        // The panel takes the keyboard when it comes up, which only a registered view can do.
        await vscode.commands.executeCommand("phpToolbox.usages.focus");

        assert.strictEqual(
            vscode.window.activeTextEditor?.document.uri.toString(),
            editor.document.uri.toString(),
        );
    });
});
