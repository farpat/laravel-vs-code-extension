import * as vscode from "vscode";
import {
    CodeLensMiddleware,
    CodeLensRequest,
    LanguageClient,
} from "vscode-languageclient/node";

/**
 * The one switch of every usages lens belongs to PHP Toolbox. The server counts whatever
 * happens; the counts are shown only while the switch is on, so a file shows every usages
 * lens, PHP members and Laravel names alike, or none at all.
 */
const USAGES_LENS_SETTING = "phpToolbox.usagesLens.enabled";

function isUsagesLensEnabled(): boolean {
    return vscode.workspace
        .getConfiguration()
        .get<boolean>(USAGES_LENS_SETTING, false);
}

export const usagesLensMiddleware: CodeLensMiddleware = {
    provideCodeLenses: (document, token, next) =>
        isUsagesLensEnabled() ? next(document, token) : [],
};

/** Redraws the lenses of the open editors when the switch moves. */
export function followUsagesLensSetting(
    client: LanguageClient,
): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
        if (!event.affectsConfiguration(USAGES_LENS_SETTING)) {
            return;
        }

        const feature = client.getFeature(CodeLensRequest.method);
        const emitters = new Set(
            vscode.window.visibleTextEditors
                .map(
                    (editor) =>
                        feature.getProvider(editor.document)
                            ?.onDidChangeCodeLensEmitter,
                )
                .filter((emitter) => emitter !== undefined),
        );

        emitters.forEach((emitter) => emitter.fire());
    });
}
