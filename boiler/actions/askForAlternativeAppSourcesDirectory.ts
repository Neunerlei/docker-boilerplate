import {input} from '@inquirer/prompts';
import chalk from 'chalk';
import {uiLogInfoOnce, uiTextBlock} from '@boiler/util/uiUtils.js';

export function askForAlternativeAppSourcesDirectory(
    partialKey: string,
    appPartialKey: string
): Promise<string> {
    uiLogInfoOnce(
        'app.sources.directory',
        uiTextBlock(`Multiple services want to create an "app" directory. 
To avoid conflicts, we need to make sure that only the "main" service ${chalk.bold(appPartialKey)} uses it.
For all other services, you will be asked to provide an alternative directory name.`),
        'Service directories'
    );

    return input({
        message: `The service "${partialKey}" is not the "main" service, to avoid conflicts, please set an alternative directory:`,
        default: partialKey,
        validate: (input: string) => {
            if (input.trim() === '') {
                return 'Please provide a directory name';
            }
            if (input === 'app' || input === '/app') {
                return 'The directory name "app" is reserved for the default service';
            }

            return true;
        }
    })
}
