import * as assert from "assert";
import * as vscode from "vscode";
import { activateExtension, uri } from "../helper";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** The lenses of the document once PHP Toolbox has indexed the workspace, which it does in the background. */
async function lensesOf(
    document: vscode.TextDocument,
): Promise<vscode.CodeLens[]> {
    for (let attempt = 0; attempt < 20; attempt++) {
        const lenses = await vscode.commands.executeCommand<vscode.CodeLens[]>(
            "vscode.executeCodeLensProvider",
            document.uri,
        );
        const counted = lenses.filter((lens) =>
            /\d+ (reads?|calls?)/.test(lens.command?.title ?? ""),
        );

        if (counted.length > 0) {
            return counted;
        }

        await sleep(500);
    }

    return [];
}

/**
 * Runs with PHP Toolbox loaded next to this extension: what Eloquent knows about an
 * accessor has to reach the lens PHP Toolbox writes above it.
 */
suite("Eloquent Attribute Lens Test Suite", () => {
    suiteSetup(async () => {
        await activateExtension();
    });

    test("counts the property reads and writes above an accessor, query and factory results included", async () => {
        const toolbox = vscode.extensions.getExtension("farrugia.php-toolbox");

        assert.ok(
            toolbox,
            "PHP Toolbox is not loaded: run this suite with its development path",
        );

        const document = await vscode.workspace.openTextDocument(
            uri("app/Models/Configuration.php"),
        );

        await vscode.window.showTextDocument(document);

        const line = document
            .getText()
            .split("\n")
            .findIndex((text) => text.includes("function formattedValue()"));
        const lens = (await lensesOf(document)).find(
            (candidate) => candidate.range.start.line === line,
        );

        assert.strictEqual(lens?.command?.title, "4 reads, 1 write");
    });
});
