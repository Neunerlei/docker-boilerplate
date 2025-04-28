import * as fs from 'fs';
import {Paths} from '../util/Paths';
import path from 'path';

export function doFinalizeEnvScript(paths: Paths): void {
    const envScriptPath = path.join(paths.outputDir, 'bin/env');
    fs.chmodSync(envScriptPath, 0o755);
}
