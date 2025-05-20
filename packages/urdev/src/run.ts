import {findWeave} from './findWeave.js';
import {hasLoggedErrors, printError, printLoggedErrors} from './ui.js';
import {addNodeToWeave} from './addNodeToWeave.js';
import path from 'path';
import os from 'os';
import {ensureDirectoryExists} from './utils.js';
import * as process from 'node:process';
import {routeCommands} from './routeCommands.js';
import {ensureDependencies} from './ensureDependencies.js';

export async function run() {
    const URDEV_DIRNAME = '.urdev';
    const URDEV_HOME = path.join(os.homedir(), URDEV_DIRNAME);
    await ensureDirectoryExists(URDEV_HOME);

    const weave = findWeave(URDEV_DIRNAME);
    if (!weave) {
        if (hasLoggedErrors()) {
            printError('The weave configuration is invalid!');
            printLoggedErrors();
            return;
        }

        printError('There is no weave configuration in this folder tree.');
        return;
    }

    const weaveWithNode = await addNodeToWeave(weave, URDEV_HOME);
    if (!weaveWithNode) {
        printError('Failed to find a Node.js installation.');
        printLoggedErrors();
        return;
    }

    if (!await ensureDependencies(weaveWithNode)) {
        printError('Failed to install dependencies.');
        printLoggedErrors();
        return;
    }

    routeCommands(weaveWithNode, process.argv.slice(2), URDEV_HOME);
}
