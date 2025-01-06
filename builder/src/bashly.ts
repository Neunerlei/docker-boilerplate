import path from "path";
import * as child_process from "node:child_process";
import fs from "fs";
import {distDir} from "./constants";

export function buildBashly(): void {
    child_process.execSync('bashly generate', {
        cwd: path.join(distDir, 'bin'),
        env: {
            BASHLY_SOURCE_DIR: '_env/src'
        }
    });
    fs.chmodSync(path.join(distDir, 'bin', 'env'), 0o755);
}
