import * as assert from "assert";
import * as client from "@src/lsp/client";
import { collectDebugInfo, debugInfo } from "@src/support/debug";

/** This copy of the modules never started a server, so no client is there. */
suite("Debug Info Without Server Test Suite", () => {
    test("asks nothing of the server when it is not running", () => {
        const asked: string[] = [];
        const original = client.sendLspRequest;

        // Count the requests instead of sending them.
        (client as { sendLspRequest: unknown }).sendLspRequest = async (
            method: string,
        ) => {
            asked.push(method);
        };

        try {
            collectDebugInfo();
        } finally {
            (client as { sendLspRequest: unknown }).sendLspRequest = original;
        }

        assert.deepStrictEqual(asked, []);
        assert.ok(debugInfo["php_command"] !== undefined);
    });
});
