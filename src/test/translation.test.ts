import * as assert from "assert";
import * as vscode from "vscode";
import {
    assertCompletions,
    assertDiagnostics,
    assertHovers,
    assertLinks,
} from "./assertions";
import { activateExtension, uri } from "./helper";

suite("Translation Test Suite", () => {
    suiteSetup(async () => {
        await activateExtension();
    });

    test("provides translation completions", async () => {
        await assertCompletions({
            doc: await vscode.workspace.openTextDocument(
                uri("app/translation-helper.php"),
            ),
            lines: [
                "__('messages.welcome');",
                "trans('messages.goodbye');",
                "trans_choice('messages.welcome', 1);",
            ],
            expects: ["messages.welcome", "messages.goodbye"],
        });
    });

    test("provides translation links", async () => {
        await assertLinks({
            doc: await vscode.workspace.openTextDocument(
                uri("app/translation-helper.php"),
            ),
            lines: [
                {
                    line: "__('messages.welcome');",
                    target: "lang/en/messages.php",
                },
                {
                    line: "__('messages.nested');",
                    target: "lang/en/messages.php",
                },
            ],
        });
    });

    test("provides translation hovers", async () => {
        await assertHovers({
            doc: await vscode.workspace.openTextDocument(
                uri("app/translation-helper.php"),
            ),
            lines: [
                {
                    line: "__('messages.welcome');",
                    contains: ["Welcome test message", "lang/en/messages.php"],
                },
                {
                    line: "__('messages.nested');",
                    contains: ["lang/en/messages.php"],
                },
            ],
        });
    });

    test("provides translation diagnostics", async () => {
        await assertDiagnostics({
            doc: await vscode.workspace.openTextDocument(
                uri("app/translation-helper.php"),
            ),
            lines: [
                {
                    line: "__('messages.missing');",
                    code: "translation",
                    contains: ["messages.missing", "not found"],
                },
            ],
        });
    });

    test("counts the usages of a key above its line in the lang file", async () => {
        const doc = await vscode.workspace.openTextDocument(
            uri("lang/en/messages.php"),
        );
        const lenses = await vscode.commands.executeCommand<vscode.CodeLens[]>(
            "vscode.executeCodeLensProvider",
            doc.uri,
        );
        const welcome = lenses.find((lens) => lens.range.start.line === 3);

        assert.strictEqual(welcome?.command?.title, "2 usages");
        assert.ok(
            !lenses.some((lens) => lens.range.start.line === 6),
            "nested.child is never read, so no lens should sit above it",
        );
    });

    // Ctrl+click on a key runs the same command as the lens above it.
    test("links a key of the lang file to its usages", async () => {
        const doc = await vscode.workspace.openTextDocument(
            uri("lang/en/messages.php"),
        );
        const links = await vscode.commands.executeCommand<
            vscode.DocumentLink[]
        >("vscode.executeLinkProvider", doc.uri);
        const welcome = links.find((link) => link.range.start.line === 3);

        assert.ok(welcome, "the key should carry a link");
        assert.strictEqual(doc.getText(welcome.range), "welcome");
        assert.strictEqual(welcome.target?.scheme, "command");
        assert.strictEqual(welcome.target?.path, "laravel.showUsages");
        assert.deepStrictEqual(JSON.parse(welcome.target?.query ?? ""), [
            doc.uri.toString(),
            { line: 3, character: 5 },
        ]);
    });
});
