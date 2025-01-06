import {AddonDoAppendToAction, AddonStructure} from "../types";
import path from "path";
import {distDir} from "../constants";
import fs from "fs";

export function applyAppendTo(action: AddonDoAppendToAction, addon: AddonStructure) {
    if (!action.target) {
        throw new Error('"target" not defined');
    }

    if (!action.source) {
        throw new Error('"source" not defined');
    }

    const targetPath = path.join(distDir, action.target);
    if (!fs.existsSync(targetPath)) {
        throw new Error(`Target file ${targetPath} not found`);
    }

    let source = action.source;
    if (typeof source === 'object' && 'file' in source) {
        const sourcePath = path.join(addon.sourceDir, source.file);
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Source file ${sourcePath} not found`);
        }
        source = fs.readFileSync(sourcePath, 'utf8').toString();
    } else {
        source = source.toString();
    }

    fs.appendFileSync(targetPath, "\n" + source);
}
