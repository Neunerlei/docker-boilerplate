import {AddonDoReplaceAction, AddonStructure} from "../types";
import path from "path";
import fs from "fs";
import {distDir} from "../constants";

export function applyDoReplace(action: AddonDoReplaceAction, addon: AddonStructure) {
    if (!action.target) {
        throw new Error('"target" not defined');
    }

    if (!action.sources) {
        throw new Error('"sources" not defined');
    }

    const targetPath = path.join(distDir, action.target);
    if (!fs.existsSync(targetPath)) {
        throw new Error(`Target file ${targetPath} not found`);
    }

    let targetContent = fs.readFileSync(targetPath, 'utf8').toString();
    for (const [placeholder, value] of Object.entries(action.sources)) {
        const regex = new RegExp('###{' + placeholder + '}###', 'g');

        let replacement: string;
        if (typeof value === 'object' && 'file' in value) {
            const sourcePath = path.join(addon.sourceDir, value.file);
            if (!fs.existsSync(sourcePath)) {
                throw new Error(`Source file ${sourcePath} not found`);
            }
            replacement = fs.readFileSync(sourcePath, 'utf8').toString();
        } else {
            replacement = value;
        }

        targetContent = targetContent.replace(regex, replacement);
    }

    fs.writeFileSync(targetPath, targetContent);
}
