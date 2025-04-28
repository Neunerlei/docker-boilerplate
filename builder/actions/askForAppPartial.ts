import {PartialRegistry} from '../partial/PartialRegistry';
import {select} from '@inquirer/prompts';
import {uiLogInfo, uiTextBlock} from '@builder/util/uiUtils.js';
import chalk from 'chalk';

export async function askForAppPartial(registry: PartialRegistry) {
    try {
        // If the app partial is already set, we don't need to ask, if not an error will be thrown which we catch
        // and start the selection process afterward...
        registry.app;
        return;
    } catch {
    }

    const used = registry.usedWithoutRoot;
    // Only one selected, that is our main partial
    if (used.length === 1) {
        registry.useAsApp(used[0].key);
        return;
    }

    uiLogInfo(uiTextBlock(`
In the last step you selected multiple "standalone" services, each of them could be ${chalk.bold('the main app')}.
The main app is the service you work with most of the time, or that you would want to be available on the "/" path of your domain.

If you are running a PHP app where Node.js is used for building assets, the PHP service is usually the main app.
However, if you are running a Node.js app with an SSR framework (e.g. Next.js), the Node.js service is usually the main app.

The main service is also the one that will be used when omitting a service name in the bin/env commands.
`), 'The main/app service');

    const choices = used.map(({key, name}) => ({
        name: name,
        value: key
    }));

    const selectedKey = await select({
        message: 'Please select the main service:',
        choices
    });

    registry.useAsApp(selectedKey);
}
