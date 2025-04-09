import type {AddonEntrypoint} from '@/loadAddons.ts';

export const addon: AddonEntrypoint = async (context) => ({
    // Welcome to your own bin/env addon!
    // This is a great place to add your own commands, hooks and ui modifications.
    // You can use the `./project/` directory to add additional files for your addon.
    // If you need to install additional dependencies simply call `bin/env npm add <package> --npm`
    // and it will be added to your package.json.
});
