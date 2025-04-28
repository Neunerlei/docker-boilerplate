import {select} from '@inquirer/prompts';
import type {Partial} from '@builder/partial/Partial.js';
import type {PartialRegistry} from '@builder/partial/PartialRegistry.js';

export async function askForVersionOfPartial(partial: Partial, partialRegistry: PartialRegistry) {
    const {versions, key} = partial.definition;

    // Ignore if there are no versions
    if (!versions || !versions.length) {
        return;
    }

    // If only one version exists, set it and return
    if (versions.length === 1) {
        partialRegistry.useVersionOf(key, versions[0]);
        return;
    }

    // Ask for the version
    const choices = versions.map((version) => ({
        name: version,
        value: version
    }));

    const selectedVersion = await select({
        message: `Which version of ${partial.name} do you want to use?`,
        choices
    });

    partialRegistry.useVersionOf(key, selectedVersion);
}
