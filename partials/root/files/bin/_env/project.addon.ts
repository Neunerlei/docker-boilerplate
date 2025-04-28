import type {AddonEntrypoint} from '@/loadAddons.js';

export const addon: AddonEntrypoint = async (context) => ({
    // Welcome to your own bin/env addon!
    // This is a great place to add your own commands, hooks and ui modifications.
    // You can use the `./project/` directory to add additional files for your addon.
    // If you need to install additional dependencies, call `bin/env bin:npm install <package>`
    // and it will be added to your package.json.
});
