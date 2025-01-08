import { checkbox, confirm } from "@inquirer/prompts";
import { readAddons } from "../addons";
import { AddonStructure, DefinitionStructure } from "../types";
import { askForMissingAddons } from "./askForMissingAddons";

export async function askForAddons(def: DefinitionStructure): Promise<AddonStructure[]> {
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

        selectedAddons = await askForMissingAddons(selectedAddons);
        
        if (result) {
            break;
        }
    }

    return [...Object.values(baseAddon), ...selectedAddons];
}