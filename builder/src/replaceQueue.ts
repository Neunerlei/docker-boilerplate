import fs from "fs";
import { AddonStructure } from "./types";
import path from "path";

const queue: Map<string, Map<string, string>> = new Map();

export function addToReplaceQueue(file: string, placeholder: string, replacement: string) {
    if (!queue.has(file)) {
        queue.set(file, new Map());
    }

    let value = replacement;
    if (!queue.get(file)!.has(placeholder)) {
        value = replacement;
    } else {
        value = queue.get(file)!.get(placeholder) + "\n" + replacement;
    }

    queue.get(file)!.set(placeholder, value);
}

export function applyReplaceQueue() {
    queue.forEach((fileMap, file) => {
        replaceMultipleInFile(file, Array.from(fileMap.entries()).map(([placeholder, replacement]) => ({ placeholder, replacement })));
    });
    queue.clear();
}

export function replaceInFile(file: string, placeholder: string | RegExp, replacement: string) {
    replaceMultipleInFile(file, [{ placeholder, replacement }]);
}

export function replaceInString(str: string, placeholder: string | RegExp, replacement: string) {
    return replaceMultipleInString(str, [{ placeholder, replacement }]);
}

export function replaceMultipleInFile(file: string, replacements: Array<{ placeholder: string | RegExp, replacement: string }>) {
    fs.writeFileSync(file, replaceMultipleInString(fs.readFileSync(file, 'utf8').toString(), replacements));
}

export function replaceMultipleInString(str: string, replacements: Array<{ placeholder: string | RegExp, replacement: string }>) {
    for (const replacement of replacements) {
        str = str.replace(makeRegex(replacement.placeholder), replacement.replacement);
    }
    return str;
}

export function resolveReplacement(replacement: string | { file: string } | null | undefined, addon: AddonStructure) {
    if (replacement !== null && typeof replacement === 'object' && 'file' in replacement) {
        const sourcePath = path.join(addon.sourceDir, replacement.file);
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Source file ${sourcePath} not found`);
        }
        replacement = fs.readFileSync(sourcePath, 'utf8').toString();
    }
    return replacement ?? '';
}

function makeRegex(placeholder: string | RegExp) {
    if (typeof placeholder === 'string') {
        return new RegExp('###{' + placeholder + '}###', 'g');
    }
    return placeholder;
}
