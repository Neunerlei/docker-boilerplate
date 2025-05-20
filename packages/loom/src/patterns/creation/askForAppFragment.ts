import type {Context} from '../../Context.js';
import chalk from 'chalk';
import {uiLogInfo, uiTextBlock} from '../../util/ui.js';
import {select} from '@inquirer/prompts';

export async function askForAppFragment(context: Context) {
    const {patternWriter} = context;

    if (!patternWriter) {
        throw new Error('Pattern writer is not defined, cannot ask for app fragment');
    }

    const appableFragments = context.fragments.filter(f => f.definition.allowAsApp === true);
    if (!appableFragments.length) {
        throw new Error('There are no fragments that can be used as an app, this should not happen :/');
    }

    if (appableFragments.length === 1) {
        patternWriter.setAppFragment(appableFragments[0]);
        return;
    }

    uiLogInfo(uiTextBlock(`
There are multiple fragments that could be ${chalk.bold('the main app')}.
The main app is the service you work with most of the time, or that you would want to be available on the "/" path of your domain.

If you are running a PHP app where Node.js is used for building assets, the PHP service is usually the main app.
However, if you are running a Node.js app with an SSR framework (e.g. Next.js), the Node.js service is usually the main app.

The main service is also the one that will be used when omitting a service name in the "urdev" commands.
`), 'The main/app service');

    const choices = appableFragments.map(fragment => ({
        name: fragment.name,
        value: fragment
    }));

    patternWriter.setAppFragment(await select({
        message: 'Please select the main service:',
        choices
    }));
}
