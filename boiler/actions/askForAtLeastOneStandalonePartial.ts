import {checkbox} from '@inquirer/prompts';
import {askForVersionOfPartial} from './askForVersionOfPartial';
import {BuildContext} from '../util/BuildContext';
import {askForAppPartial} from './askForAppPartial.js';
import {uiLogInfo, uiTextBlock} from '@boiler/util/uiUtils.js';
import chalk from 'chalk';

export async function askForAtLeastOneStandalonePartial(context: BuildContext) {
    const {partials: partialRegistry} = context;
    const availablePartials = partialRegistry.getStandalone().filter(partial => partial.selectable !== false);

    if (availablePartials.length === 0) {
        console.log('No standalone partials found. Please add at least one to the project.');
        process.exit(1);
    }

    const choices = availablePartials.map(partial => ({
        name: partial.name,
        value: partial.key
    }));

    uiLogInfo(uiTextBlock(`To get started you need to select some technologies you want to work with.
    Each technology is represented by a docker ${chalk.bold('service')} in the created environment. 
    Feel free to select a single or multiple services.`), 'Services, technologies and the app');

    const selected = await checkbox({
        message: 'Choose at least one of the following technologies:',
        choices,
        required: true
    });

    for (const key of selected) {
        await partialRegistry.use(key);
        await askForVersionOfPartial(partialRegistry.get(key)!, partialRegistry);
    }

    await askForAppPartial(partialRegistry);
}
