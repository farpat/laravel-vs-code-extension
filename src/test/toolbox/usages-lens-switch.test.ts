import * as assert from "assert";
import * as vscode from "vscode";
import { activateExtension, uri } from "../helper";

const SWITCH = "phpToolbox.usagesLens.enabled";

/**
 * Runs with PHP Toolbox loaded next to this extension: its switch is the one every usages
 * lens hangs on, the counts the Laravel server writes above a translation key included.
 */
suite("Usages Lens Switch Test Suite", () => {
    suiteSetup(async () => {
        await activateExtension();
    });

    async function lensesOfLangFile(): Promise<vscode.CodeLens[]> {
        const document = await vscode.workspace.openTextDocument(
            uri("lang/en/messages.php"),
        );

        return vscode.commands.executeCommand<vscode.CodeLens[]>(
            "vscode.executeCodeLensProvider",
            document.uri,
        );
    }

    test("shows the count only while the switch is on", async () => {
        const configuration = vscode.workspace.getConfiguration();

        assert.ok(
            (await lensesOfLangFile()).some(
                (lens) => lens.command?.title === "2 usages",
            ),
            "the workspace turns the switch on, so the count should show",
        );

        await configuration.update(
            SWITCH,
            false,
            vscode.ConfigurationTarget.Workspace,
        );

        try {
            assert.deepStrictEqual(await lensesOfLangFile(), []);
        } finally {
            await configuration.update(
                SWITCH,
                true,
                vscode.ConfigurationTarget.Workspace,
            );
        }
    });

    test("flips the switch where it is set, from the PHP Toolbox command", async () => {
        await vscode.commands.executeCommand("phpToolbox.toggleCodeLens");

        try {
            assert.strictEqual(
                vscode.workspace.getConfiguration().inspect<boolean>(SWITCH)
                    ?.workspaceValue,
                false,
            );
            assert.deepStrictEqual(await lensesOfLangFile(), []);
        } finally {
            await vscode.workspace
                .getConfiguration()
                .update(SWITCH, true, vscode.ConfigurationTarget.Workspace);
        }
    });
});
