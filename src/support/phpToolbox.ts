import * as vscode from "vscode";
import { error } from "./logger";
import { MemberAlias, MemberSymbol } from "./eloquentAttributes";
import { MemberQuestion } from "./eloquentMembers";

/**
 * The part of PHP Toolbox's API this extension relies on, spelt out here because nothing
 * of that extension can be imported: it is reached through its exports at runtime.
 */
export interface PhpToolboxUsageEntry {
    uri: vscode.Uri;
    range: vscode.Range;
    label: string;
    description?: string;
}

export interface PhpToolboxListing {
    subject: string;
    unit: string;
    groups: Array<{ label: string; entries: PhpToolboxUsageEntry[] }>;
}

export interface PhpToolboxApi {
    showUsages(listing: PhpToolboxListing): Promise<void>;
    registerMemberAliasProvider(provider: {
        aliasesOf(member: MemberSymbol): MemberAlias[];
    }): vscode.Disposable;
    registerInstanceFactories(functions: string[]): vscode.Disposable;
    registerMemberTypeProvider(provider: {
        typeOf(member: MemberQuestion): string | null;
    }): vscode.Disposable;
}

/**
 * The PHP Toolbox extension, activated, or nothing when it is not installed.
 *
 * A toolbox that fails to start gives nothing too: this extension then runs without the
 * toolbox features. The failure goes to the output channel, so it can be seen.
 */
export async function phpToolbox(
    extension = vscode.extensions.getExtension<PhpToolboxApi>(
        "farrugia.php-toolbox",
    ),
): Promise<PhpToolboxApi | undefined> {
    try {
        return await extension?.activate();
    } catch (failure) {
        error("PHP Toolbox failed to start, its features are off:", failure);

        return undefined;
    }
}
