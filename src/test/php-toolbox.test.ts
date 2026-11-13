import * as assert from "assert";
import * as vscode from "vscode";
import { phpToolbox, PhpToolboxApi } from "@src/support/phpToolbox";

const extensionThatFails = {
    activate: () => Promise.reject(new Error("toolbox broke")),
} as unknown as vscode.Extension<PhpToolboxApi>;

suite("PHP Toolbox Test Suite", () => {
    test("gives no toolbox when the toolbox fails to start", async () => {
        assert.strictEqual(await phpToolbox(extensionThatFails), undefined);
    });
});
