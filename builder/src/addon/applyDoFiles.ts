import {AddonDoFilesAction, AddonStructure} from "../types";
import path from "path";
import fs from "fs";
import {distDir} from "../constants";

export function applyDoFiles(action: AddonDoFilesAction, addon: AddonStructure) {
    if (!action.source) {
        throw new Error('"source" not defined');
    }

    const sourcePath = path.join(addon.sourceDir, action.source);
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source file ${sourcePath} not found`);
    }

    fs.cpSync(sourcePath, distDir, {recursive: true});
}
