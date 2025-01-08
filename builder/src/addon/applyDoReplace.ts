import { AddonDoReplaceAction, AddonStructure } from "../types";
import path from "path";
import fs from "fs";
import { distDir } from "../constants";
import { addToReplaceQueue, replaceMultipleInFile, resolveReplacement } from "../replaceQueue";

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

    if (action.immediate) {
        replaceMultipleInFile(targetPath, Object.entries(action.sources)
            .map(([placeholder, value]) => ({ placeholder, replacement: resolveReplacement(value, addon) })));
    } else {
        for (const [placeholder, value] of Object.entries(action.sources)) {
            addToReplaceQueue(targetPath, placeholder, resolveReplacement(value, addon));
        }
    }
}
