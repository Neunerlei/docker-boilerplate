import { AddonStructure } from "../types";
import { readAddons } from "../addons";
import { confirm } from "@inquirer/prompts";

export async function askForMissingAddons(selectedAddons: AddonStructure[]) {
    const selectedAddonKeys = selectedAddons.map(addon => addon.key);
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

        let result = false;
        
        while(true){
            if (missingRequiredNonSubNames.length > 0) {
                result = await confirm({
                    message: `The following addons are required, because you selected addons that need them: ${Array.from(missingRequired).join(', ')}. They will be automatically added. Do you want to continue?`,
                });
            } else {
                result = true;
            }

            if (result) {
                return[...selectedAddons, ...Object.values(requiredAddons)];
            } else {
                console.log('Aborting, because you did not want to add the required addons.');
                process.exit(1);
            }
        }
    }

    return selectedAddons;
}
