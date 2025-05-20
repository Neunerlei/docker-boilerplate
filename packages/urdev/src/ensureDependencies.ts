import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {promisify} from 'util';
import {exec} from 'child_process';
import {logError, showSpinner} from './ui';
import type {WeaveWithNode} from './addNodeToWeave.js';

const execAsync = promisify(exec);

const HASH_FILENAME = 'package-json.md5';

export async function ensureDependencies(weave: WeaveWithNode) {
    try {
        const packageJsonPath = path.join(weave.urdevDirectory, 'package.json');
        const nodeModulesPath = path.join(weave.urdevDirectory, 'node_modules');
        const hashFilePath = path.join(nodeModulesPath, HASH_FILENAME);

        if (!fs.existsSync(packageJsonPath)) {
            logError('package.json not found', new Error('File not found'));
            return false;
        }

        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
        const currentHash = calculateMd5(packageJsonContent);

        const shouldInstall = shouldPerformInstallation(nodeModulesPath, hashFilePath, currentHash);

        if (shouldInstall) {
            const stopSpinner = showSpinner('Installing dependencies');

            try {
                await installDependencies(weave, weave.urdevDirectory);

                if (!fs.existsSync(nodeModulesPath)) {
                    fs.mkdirSync(nodeModulesPath, {recursive: true});
                }

                fs.writeFileSync(hashFilePath, currentHash);

                return true;
            } finally {
                stopSpinner();
            }
        }

        return true;
    } catch (error: any) {
        logError('Failed to install dependencies', error);
        return false;
    }
}

function shouldPerformInstallation(nodeModulesPath: string, hashFilePath: string, currentHash: string) {
    if (!fs.existsSync(nodeModulesPath)) {
        return true;
    }

    if (!fs.existsSync(hashFilePath)) {
        return true;
    }

    return fs.readFileSync(hashFilePath, 'utf8') !== currentHash;
}

function calculateMd5(content: string): string {
    return crypto
        .createHash('md5')
        .update(content)
        .digest('hex');
}

async function installDependencies(weave: WeaveWithNode, urdevDir: string) {
    const env = {
        ...process.env,
        npm_config_cache: weave.npmCachePath
    };

    const command = `"${weave.npmExecutable}" install --no-audit --no-fund --no-update-notifier`;

    await execAsync(command, {
        cwd: urdevDir,
        env
    });
}
