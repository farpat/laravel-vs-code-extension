import os from "os";
import { isLspClientRunning, sendLspRequest } from "@src/lsp/client";
import { info } from "./logger";
import { getPhpCommand } from "../lsp/php";

export const debugInfo: Record<string, string> = {};

export const collectDebugInfo = () => {
    debugInfo["os"] = os.platform();
    debugInfo["arch"] = os.arch();

    if (!isLspClientRunning()) {
        info(
            "No debug info from the Laravel language server: it is not running",
        );
        debugInfo["php_command"] = getPhpCommand().join(" ");

        return;
    }

    sendLspRequest<Record<string, string>>("laravel/data", {
        name: "debugInfo",
    })
        .then((output) => {
            if (output) {
                for (const key in output as Record<string, string>) {
                    // @ts-ignore
                    debugInfo[key] = output[key];
                }
            }
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            debugInfo["php_command"] = getPhpCommand().join(" ");
        });
};
