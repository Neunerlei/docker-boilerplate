import path from 'path';
import fs, {createWriteStream} from 'fs';
import {promisify} from 'util';
import os from 'os';
import https from 'https';
import {extract} from 'tar';
import type {WeaveWithNode} from './NodeProvider';
import {ensureDirectoryExists} from './utils';
import {logError, showSpinner} from './ui';

export async function installNode(weave: WeaveWithNode): Promise<WeaveWithNode | undefined> {
    try {
        await ensureDirectoryExists(weave.nodeInstallPath);
        await ensureDirectoryExists(weave.npmCachePath);

        if (!fs.existsSync(weave.nodeExecutable) || !fs.existsSync(weave.npmExecutable)) {
            const stopSpinner = showSpinner(`Preparing your weave (node v${weave.nodeVersion})`);

            try {
                await downloadNodeVersion(weave.nodeVersion, weave.nodeInstallPath);
            } finally {
                stopSpinner();
            }
        }

        await promisify(fs.chmod)(weave.nodeExecutable, '755');
        await promisify(fs.chmod)(weave.npmExecutable, '755');
        return weave;
    } catch (error: any) {
        logError('Error installing Node', error);
        return undefined;
    }
}

async function downloadNodeVersion(version: string, destinationPath: string) {
    const platform = os.platform();
    const arch = os.arch();

    let osStr: string;
    if (platform === 'darwin') {
        osStr = 'darwin';
    } else if (platform === 'win32') {
        osStr = 'win';
    } else {
        osStr = 'linux';
    }

    let archStr: string;
    if (arch === 'x64') {
        archStr = 'x64';
    } else if (arch === 'arm64') {
        archStr = 'arm64';
    } else {
        archStr = 'x86';
    }

    const downloadUrl = `https://nodejs.org/dist/v${version}/node-v${version}-${osStr}-${archStr}.tar.gz`;
    const tempFile = path.join(os.tmpdir(), `node-v${version}.tar.gz`);

    await new Promise<void>((resolve, reject) => {
        const file = createWriteStream(tempFile);
        https.get(downloadUrl, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', err => {
            fs.unlink(tempFile, () => {
            });
            reject(err);
        });
    });

    await ensureDirectoryExists(destinationPath);
    await extract({
        file: tempFile,
        cwd: destinationPath,
        strip: 1
    });

    await promisify(fs.unlink)(tempFile);
}
