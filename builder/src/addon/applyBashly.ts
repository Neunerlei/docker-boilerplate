import {AddonDoBashlyAction, AddonStructure} from "../types";
import path from "path";
import fs from "fs";
import {parse, stringify} from "yaml";
import deepmerge from "deepmerge";
import {distDir} from "../constants";

export function applyBashly(action: AddonDoBashlyAction, addon: AddonStructure) {
    if (!action.source) {
        throw new Error('"source" not defined');
    }

    const sourcePath = path.join(addon.sourceDir, action.source);
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source file ${sourcePath} not found`);
    }

    const targetPath = path.join(distDir, 'bin', '_env', 'src', 'bashly.yml');
    if (!fs.existsSync(targetPath)) {
        throw new Error(`Target file ${targetPath} not found`);
    }

    const targetRaw = fs.readFileSync(targetPath, 'utf8').toString();
    const target = parse(targetRaw);

    const sourceRaw = fs.readFileSync(sourcePath, 'utf8').toString();
    const source = parse(sourceRaw);

    const merged = deepmerge(target, source);
    fs.writeFileSync(targetPath, stringify(merged));
}
