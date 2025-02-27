import child_process from 'node:child_process';
import path from 'path';
import fs from 'fs';
import {Paths} from '../util/Paths';

export function doBuildBashly(paths: Paths): void {
    child_process.execSync('bashly generate', {
        cwd: path.join(paths.outputDir, 'bin'),
        env: {
            BASHLY_SOURCE_DIR: '_env/src'
        }
    });
    fs.chmodSync(path.join(paths.outputDir, 'bin', 'env'), 0o755);
}
