import {makePaths} from '@/Paths.js';
import {buildProgramm} from '@/buildProgramm.js';
import * as process from 'node:process';
import {showPrettyError} from '@/ui.js';

try {
    await (await buildProgramm(makePaths())).parseAsync(process.argv);
} catch (error) {
    showPrettyError(error);
    process.exit(1);
}
