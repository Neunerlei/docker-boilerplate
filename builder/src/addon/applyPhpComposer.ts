import { AddonDoPhpComposerAction, AddonStructure } from "../types";
import path from "path";
import { distDir } from "../constants";
import fs from "fs";
import deepmerge from "deepmerge";
import { replaceFrontendServiceName } from "../frontend";

export function applyPhpComposer(action: AddonDoPhpComposerAction, addon: AddonStructure) {
    if (!action.source) {
        throw new Error('"source" not defined');
    }

    if (!action.target) {
        throw new Error('"target" not defined');
    }
    const targetPath = path.join(distDir, action.target);
    if (!fs.existsSync(targetPath)) {
        throw new Error(`Target file ${targetPath} not found`);
    }

    const targetRaw = fs.readFileSync(targetPath, 'utf8').toString();
    const target = JSON.parse(targetRaw);
    const source = action.source;
    const merged = deepmerge(target, source);

    fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2));

    replaceFrontendServiceName(targetPath, addon);
}
