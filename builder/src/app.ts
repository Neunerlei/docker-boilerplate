import {checkbox, confirm, select} from "@inquirer/prompts";
import {AddonStructure, DefinitionStructure} from "./types";
import {readDefinitions} from "./definitions";
import {applyAddons, readAddons} from "./addons";
import {cleanDistDirRecursively, copyBaseFiles} from "./util";
import {buildBashly} from "./bashly";
import {distDir} from "./constants";

export async function app() {
    console.log('Welcome to the boilerplate builder!');
    try {
        const definition = await askForDefinition();
        const addons = await askForAddons(definition);
        cleanDistDirRecursively();
        copyBaseFiles();
        applyAddons(definition, addons);
        buildBashly();
        console.log('Done! Your boilerplate has been built:', distDir)
    } catch (e) {
        console.error('Oh no! Something went wrong :( -', e);
    }
}

async function askForDefinition(): Promise<DefinitionStructure> {
    const definitions = readDefinitions();

    const choices: Array<{ name: string, value: string }> = [];
    for (const defKey in definitions) {
        choices.push({
            value: defKey,
            name: definitions[defKey].name
        });
    }

    const selectedDefName = await select({
        message: 'Which definition do you want to build?',
        choices
    });

    return definitions[selectedDefName];
}

async function askForAddons(def: DefinitionStructure): Promise<AddonStructure[]> {
    const baseAddon = readAddons([def.base]);

    const addons = readAddons(def.addons);
    const choices: Array<{ name: string, value: string }> = [];
    for (const addonKey of def.addons) {
        const addon = addons[addonKey];
        if (addon.isSub) {
            continue;
        }
        choices.push({
            value: addonKey,
            name: addon.name
        });
    }

    let selectedAddons: AddonStructure[] = [];
    while (true) {
        const selectedAddonKeys = await checkbox({
            message: 'Which addons do you want to apply?',
            choices
        });

        let result = false;
        selectedAddons = selectedAddonKeys.map(key => addons[key]);
        if (selectedAddons.length === 0) {
            result = await confirm({
                message: 'You have not selected any addons. Do you want to continue without any addons?',
            });
        }

        if (selectedAddons.length > 0) {
            const selectedAddonNames = selectedAddons.map(addon => addon.name);
            result = await confirm({
                message: `You have selected the following addons: ${selectedAddonNames.join(', ')}. Do you want to continue?`,
            });
        }

        const missingRequired = new Set<string>();
        for (const addon of selectedAddons) {
            if (Array.isArray(addon.requiresAddons)) {
                addon.requiresAddons.forEach(requiredAddon => {
                    if (!selectedAddonKeys.includes(requiredAddon)) {
                        missingRequired.add(requiredAddon);
                    }
                });
            }
        }
        if (missingRequired.size > 0) {
            const requiredAddons = readAddons(Array.from(missingRequired));
            const missingRequiredNonSubNames = Object.values(requiredAddons)
                .filter(addon => !addon.isSub)
                .map(addon => addon.name);

            if (missingRequiredNonSubNames.length > 0) {
                result = await confirm({
                    message: `The following addons are required, because you selected addons that need them: ${Array.from(missingRequired).join(', ')}. They will be automatically added. Do you want to continue?`,
                });
            } else {
                result = true;
            }

            if (result) {
                selectedAddons = [...selectedAddons, ...Object.values(requiredAddons)];
            }
        }

        if (result) {
            break;
        }
    }

    return [...Object.values(baseAddon), ...selectedAddons];
}
