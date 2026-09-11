import * as vscode from "vscode";
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

/** The PHP Toolbox extension, activated, or nothing when it is not installed. */
export async function phpToolbox(): Promise<PhpToolboxApi | undefined> {
    const extension = vscode.extensions.getExtension<PhpToolboxApi>(
        "farrugia.php-toolbox",
    );

    return extension?.activate();
}
