import * as vscode from "vscode";
import { sendLspRequest } from "../lsp/client";
import { phpToolbox, PhpToolboxUsageEntry } from "../support/phpToolbox";

type LspPosition = { line: number; character: number };

type LspLocation = {
    uri: string;
    range: { start: LspPosition; end: LspPosition };
};

const MAX_SUBJECT = 60;

function toLocation(location: LspLocation): vscode.Location {
    return new vscode.Location(
        vscode.Uri.parse(location.uri),
        new vscode.Range(
            location.range.start.line,
            location.range.start.character,
            location.range.end.line,
            location.range.end.character,
        ),
    );
}

/** Each location with the line it sits on, files opened once however many lines they hold. */
async function toEntries(
    locations: vscode.Location[],
): Promise<PhpToolboxUsageEntry[]> {
    const documents = new Map<string, vscode.TextDocument>();

    for (const location of locations) {
        const key = location.uri.toString();

        if (!documents.has(key)) {
            documents.set(
                key,
                await vscode.workspace.openTextDocument(location.uri),
            );
        }
    }

    return locations.map((location) => ({
        uri: location.uri,
        range: location.range,
        label: documents
            .get(location.uri.toString())!
            .lineAt(location.range.start.line)
            .text.trim(),
    }));
}

/**
 * Opens the usages the language server counted above a declaration.
 *
 * The lens hands over the line it sits on; run from the palette, the cursor says
 * instead. Only the server is asked, so the listing shows exactly what the count stood
 * for. PHP Toolbox lists it in its panel when installed, so every usage search of the
 * editor reads the same; the peek stands in otherwise.
 */
export async function showUsagesCommand(
    uri?: string,
    position?: LspPosition,
): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const documentUri = uri ?? editor?.document.uri.toString();
    const at = position ?? editor?.selection.active;

    if (!documentUri || !at) {
        return;
    }

    const found = await sendLspRequest<LspLocation[] | null>(
        "textDocument/references",
        {
            textDocument: { uri: documentUri },
            position: { line: at.line, character: at.character },
            context: { includeDeclaration: false },
        },
    );
    const locations = (found ?? []).map(toLocation);
    const toolbox = await phpToolbox();

    if (!toolbox) {
        await vscode.commands.executeCommand(
            "editor.action.showReferences",
            vscode.Uri.parse(documentUri),
            new vscode.Position(at.line, at.character),
            locations,
        );

        return;
    }

    const declaration = await vscode.workspace.openTextDocument(
        vscode.Uri.parse(documentUri),
    );
    const subject = declaration.lineAt(at.line).text.trim();

    await toolbox.showUsages({
        subject:
            subject.length > MAX_SUBJECT
                ? `${subject.slice(0, MAX_SUBJECT)}…`
                : subject,
        unit: "usages",
        groups: [{ label: "Usages", entries: await toEntries(locations) }],
    });
}
