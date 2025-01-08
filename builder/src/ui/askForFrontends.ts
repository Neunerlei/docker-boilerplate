import { readAddons } from "../addons";
import { DefinitionStructure } from "../types";
import { confirm, select } from "@inquirer/prompts";
import { askForMissingAddons } from "./askForMissingAddons";
import { setFrontendAddonUsed } from "../frontend";
export async function askForFrontends(def: DefinitionStructure) {
    if(!def.frontends) {
        return null;
    }

    const frontendAddons = readAddons(def.frontends);

    if(! await confirm({
        message: 'Do you want to use a dedicated frontend?',
    })) {
        return null;
    }

    const selectedFrontend = await select({
        message: 'Which frontend do you want to use?',
        choices: Object.keys(frontendAddons).map(key => ({
            value: key,
            name: frontendAddons[key].name
        })).concat([{
            value: 'none',
            name: 'None'
        }])
    });

    if(selectedFrontend === 'none') {
        return null;
    }

    const frontendAddon = frontendAddons[selectedFrontend];
    const requiredAddons = await askForMissingAddons([frontendAddon]);

    if ((requiredAddons).length > 1){
        console.log('The frontend requires the following addons:');
        console.log(requiredAddons
        .map(addon => addon.name)
        .filter(name => name !== frontendAddon.name)
        .join(', '));

        throw new Error('NOT IMPLEMENTED: Frontends requiring addons are not supported yet.');
    }

    frontendAddon.isFrontend = true;
    setFrontendAddonUsed();

    return frontendAddon;
}