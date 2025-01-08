import fs from "fs";
import path from "path";
import { AddonDoAction, AddonDoActionType, AddonStructure, AddonStructureList, DefinitionStructure } from "./types";
import { addonDir } from "./constants";
import { applyDoFiles } from "./addon/applyDoFiles";
import { applyDoReplace } from "./addon/applyDoReplace";
import { applyDoCompose } from "./addon/applyDoCompose";
import { applyBashly } from "./addon/applyBashly";
import { parse } from "yaml";
import { applyAppendTo } from "./addon/applyAppendTo";
import { applyPhpComposer } from "./addon/applyPhpComposer";
import { applyNginxReplace } from "./addon/applyNginxReplace";
import { applyDockerfile } from "./addon/applyDockerfile";

const actions: Record<AddonDoActionType, (action: AddonDoAction, addon: AddonStructure) => void> = {
    files: applyDoFiles,
    replace: applyDoReplace,
    compose: applyDoCompose,
    bashly: applyBashly,
    appendTo: applyAppendTo,
    phpComposer: applyPhpComposer,
    nginxReplace: applyNginxReplace,
    dockerfile: applyDockerfile,
}

export function readAddons(available: string[]): AddonStructureList {
    if (available.length === 0) {
        return {};
    }

    const addons: AddonStructureList = {};
    for (const keyRaw of available) {
        const sourceDir = path.join(addonDir, keyRaw);
        const addonFile = path.join(sourceDir, 'addon.yaml');
        const isSub = keyRaw.startsWith('_');
        const key = isSub ? keyRaw.substring(1) : keyRaw;
        if (!fs.existsSync(addonFile)) {
            if (!isSub) {
                const suggestedSubAddonFile = path.join(addonDir, '_' + keyRaw, 'addon.yaml');
                if (fs.existsSync(suggestedSubAddonFile)) {
                    throw new Error(`Failed to read addon ${key}: The file ${addonFile} does not exist, but a sub-addon with the same name exists. Did you mean to use _${keyRaw}?`);
                }
            }
            throw new Error(`Failed to read addon ${key}: The file ${addonFile} does not exist`);
        }
        try {
            const content = fs.readFileSync(addonFile, 'utf8').toString();
            const addon = parse(content);
            if (!addon.name) {
                throw new Error(`Invalid addon file ${key}: Missing "name"`);
            }
            if (!Array.isArray(addon.do)) {
                throw new Error(`Invalid addon file ${key}: Missing "do", can\'t do anything without instructions`);
            }

            addons[key] = {
                ...addon,
                key: key,
                file: addonFile,
                isSub,
                sourceDir,
            };
        } catch (e) {
            throw new Error(`Error reading addon ${key}: ${e.message}`);
        }

    }

    return addons;
}

export function applyAddons(def: DefinitionStructure, addons: AddonStructure[]) {
    const dos = getActionsSortedByPriority(addons);

    for (const {action, addon, initialPosition} of dos) {
        try {
            if (typeof actions[action.type] === 'function') {
                actions[action.type](action, addon);
            }
        } catch (e) {
            throw new Error(`Failed to build definition ${def.name}, because addon ${addon.name} failed to perform action at position ${initialPosition} (${action.type}): ${e.message}`);
        }
    }
}

function getActionsSortedByPriority(addons: AddonStructure[]) {
    const sortedDos: Array<{action: AddonDoAction, addon: AddonStructure, priority: number, initialPosition: number}> = [];
    for (const addon of addons) {
        let i = 0;
        for (const action of addon.do) {
            sortedDos.push({ action, addon, priority: action.priority ?? 0, initialPosition: i});
            i++;
        }
    }
    return sortedDos.sort((a, b) => (b.priority - a.priority));
}