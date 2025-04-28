import {checkbox} from '@inquirer/prompts';
import {askForVersionOfPartial} from './askForVersionOfPartial';
import {BuildContext} from '../util/BuildContext';
import {uiLogInfo, uiTextBlock} from '@builder/util/uiUtils.js';

export async function askForAdditionalPartials(context: BuildContext) {
    const {partials: partialRegistry} = context;
    const possiblePartials = await partialRegistry.nonStandaloneForUsed;

    if (possiblePartials.length === 0) {
        return;
    }

    const choices = possiblePartials.map(partial => ({
        name: partial.name,
        value: partial.key
    }));

    uiLogInfo(uiTextBlock(`After selecting the main technologies, you can now add additional tools to your environment.
    Note, that not all tools are available for all technologies. This step is optional, just press enter to skip.`), 'Additional tools and services');

    const used = await checkbox({
        message: 'Choose your toolbelt:',
        choices
    });

    for (const key of used) {
        await partialRegistry.use(key);
        await askForVersionOfPartial(partialRegistry.get(key)!, partialRegistry);
    }
}
