import { getViews } from "@src/lsp/views";
import { projectPath } from "@src/support/project";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { commandName } from ".";

export const extractBladeComponentCommand = commandName(
    "laravel.extractBladeComponent",
);

// Blade fills these in itself, so a component never takes them as a prop.
const reservedVariables = [
    "slot",
    "attributes",
    "errors",
    "loop",
    "component",
    "this",
    "app",
    "__env",
    "__data",
];

const componentNamePattern =
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

const variablesIn = (markup: string): string[] => {
    return [...markup.matchAll(/\$([A-Za-z_]\w*)/g)].map((match) => match[1]);
};

// Variables the markup declares on its own: a loop item is not passed in from outside.
const declaredIn = (markup: string): string[] => {
    const declared = [
        ...[
            ...markup.matchAll(/@(?:foreach|forelse)\s*\(.+?\s+as\s+(.+?)\)/gs),
        ].flatMap((match) => variablesIn(match[1])),
        ...[...markup.matchAll(/@for\s*\(\s*\$(\w+)\s*=/g)].map(
            (match) => match[1],
        ),
        ...[...markup.matchAll(/\$(\w+)\s*=[^=]/g)].map((match) => match[1]),
    ];

    return declared;
};

export const propsOf = (markup: string): string[] => {
    const declared = new Set([...declaredIn(markup), ...reservedVariables]);

    return [...new Set(variablesIn(markup))].filter(
        (name) => !declared.has(name),
    );
};

export const toKebabCase = (name: string): string => {
    return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

// The markup leaves the indentation of the file it came from behind.
const dedent = (markup: string): string => {
    const lines = markup.replace(/\s+$/, "").split("\n");
    const widths = lines
        .filter((line) => line.trim() !== "")
        .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);
    const shortest = widths.length > 0 ? Math.min(...widths) : 0;

    return lines.map((line) => line.slice(shortest)).join("\n");
};

export const componentContents = (markup: string, props: string[]): string => {
    const declaration =
        props.length > 0
            ? `@props([${props.map((prop) => `'${prop}'`).join(", ")}])\n\n`
            : "";

    return `${declaration}${dedent(markup)}\n`;
};

export const componentTag = (name: string, props: string[]): string => {
    const attributes = props.map((prop) => ` :${toKebabCase(prop)}="$${prop}"`);

    return `<x-${name}${attributes.join("")} />`;
};

const viewsPath = async (): Promise<string> => {
    const views = (await getViews()).filter((view) => !view.isVendor);

    for (const view of views) {
        const suffix = path.join(...view.key.split("."), "") + ".blade.php";
        const normalized = view.path.replace(/\\/g, path.sep);

        if (normalized.endsWith(suffix)) {
            return normalized.slice(0, normalized.length - suffix.length);
        }
    }

    return projectPath("resources/views");
};

const askComponentName = () => {
    return vscode.window.showInputBox({
        title: "Extract Blade component",
        prompt: "Component name, dots for subdirectories",
        placeHolder: "forms.text-input",
        validateInput: (value) => {
            if (!componentNamePattern.test(value.trim())) {
                return "Lowercase words, dashes inside a name, dots between directories.";
            }

            return null;
        },
    });
};

export const extractBladeComponent = async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor || editor.selection.isEmpty) {
        vscode.window.showWarningMessage("Select the markup to extract first.");

        return;
    }

    const markup = editor.document.getText(editor.selection);
    const name = (await askComponentName())?.trim();

    if (!name) {
        return;
    }

    const target =
        path.join(await viewsPath(), "components", ...name.split(".")) +
        ".blade.php";

    if (fs.existsSync(target)) {
        vscode.window.showErrorMessage(
            `A component named ${name} already exists.`,
        );

        return;
    }

    const props = propsOf(markup);

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, componentContents(markup, props));

    await editor.edit((editBuilder) => {
        editBuilder.replace(editor.selection, componentTag(name, props));
    });

    await vscode.window.showTextDocument(vscode.Uri.file(target));
};
