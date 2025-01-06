import {AddonDoComposeAction, AddonStructure} from "../types";
import path from "path";
import fs from "fs";
import {parse, stringify} from "yaml";
import deepmerge from "deepmerge";
import {distDir} from "../constants";

export function applyDoCompose(action: AddonDoComposeAction, addon: AddonStructure) {
    if (!action.source) {
        throw new Error('"source" not defined');
    }

    const sourcePath = path.join(addon.sourceDir, action.source);
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source file ${sourcePath} not found`);
    }

    const targetPath = path.join(distDir, "docker-compose.yml");
    const targetRaw = fs.readFileSync(targetPath, 'utf8').toString();
    const target = parse(targetRaw);

    const sourceRaw = fs.readFileSync(sourcePath, 'utf8').toString();
    const source = parse(sourceRaw);

    // Merge the services first
    if (source.services) {
        mergeServices(target, source, action.mergeServices);
    }

    fs.writeFileSync(targetPath, stringify(deepmerge(target, source)));
}

function mergeServices(target: Record<string, any>, source: Record<string, any>, servicesToMerge?: string[]) {
    if (!source.services) {
        return;
    }
    if (!target.services) {
        target.services = {};
    }

    for (const [name, service] of Object.entries(source.services)) {
        if (servicesToMerge && servicesToMerge.includes(name)) {
            continue;
        }
        target.services[name] = service;
        delete source.services[name];
    }
}
