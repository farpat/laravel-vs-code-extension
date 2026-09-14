import * as assert from "assert";
import * as vscode from "vscode";
import { activateExtension, uri } from "../helper";

const settle = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * A folder moved or deleted reaches a `**\/*.php` watcher as nothing at all: only the
 * folder is reported. The PHP Toolbox index has to drop what the old folder held and read
 * the new one, or a usage counts twice once its file is touched.
 */
suite("Usages Folder Rename Test Suite", () => {
    const root = () => vscode.workspace.workspaceFolders![0].uri;
    const subject = () => uri("app/ProbeSubject.php");
    const oldFolder = () => vscode.Uri.joinPath(root(), "app", "ProbeOld");
    const newFolder = () => vscode.Uri.joinPath(root(), "app", "ProbeNew");
    const usage = Buffer.from(
        "<?php\n\nnamespace App\\Probe;\n\nuse App\\ProbeSubject;\n\nfinal class Uses\n{\n    public function __construct(private ProbeSubject $subject) {}\n}\n",
    );

    async function referencesLens(): Promise<string | undefined> {
        const document = await vscode.workspace.openTextDocument(subject());
        const lenses = await vscode.commands.executeCommand<vscode.CodeLens[]>(
            "vscode.executeCodeLensProvider",
            document.uri,
        );

        return lenses.find((lens) => lens.command?.title.endsWith("references") || lens.command?.title.endsWith("reference"))
            ?.command?.title;
    }

    suiteSetup(async () => {
        await activateExtension();
        await vscode.workspace.fs.writeFile(
            subject(),
            Buffer.from("<?php\n\nnamespace App;\n\nfinal class ProbeSubject\n{\n}\n"),
        );
        await vscode.workspace.fs.createDirectory(oldFolder());
        await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(oldFolder(), "Uses.php"), usage);
        await settle(1500);
    });

    suiteTeardown(async () => {
        await vscode.workspace.fs.delete(subject());
        await vscode.workspace.fs.delete(newFolder(), { recursive: true });
        await settle(500);
    });

    test("counts a usage once after its folder moved and its file was saved again", async function () {
        this.timeout(20000);

        assert.strictEqual(await referencesLens(), "1 reference");

        await vscode.workspace.fs.rename(oldFolder(), newFolder());
        await settle(1500);
        await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(newFolder(), "Uses.php"), usage);
        await settle(1500);

        assert.strictEqual(await referencesLens(), "1 reference");
    });
});
