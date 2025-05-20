import path from 'path';
import {execSync} from 'child_process';
import type {Weave} from './findWeave.js';
import {ensureDirectoryExists} from './utils';
import fs from 'node:fs';
import {logError} from './ui.js';
import {installNode} from './installNode.js';

export interface WeaveWithNode extends Weave {
    /**
     * The path to the .urdev directory in the user home where the downloaded node versions should be stored.
     */
    nodeInstallPath: string;

    /**
     * The selected node executable path. This can either be the global node installation, or a specific
     * installation inside the .urdev directory in the user home
     */
    nodeExecutable: string;

    /**
     * The selected npm executable path. This can either be the global npm installation, or a specific
     * installation inside the .urdev directory in the user home
     */
    npmExecutable: string;

    /**
     * A shared directory in the .urdev directory in the user where all urdev projects store their
     * npm cache. As most of the projects require the same dependencies, this will speed up the installation.
     */
    npmCachePath: string;
}

export async function addNodeToWeave(weave: Weave, urdevHome: string): Promise<WeaveWithNode | undefined> {
    const NODE_INSTALLATION_PATH = path.join(urdevHome, 'node');
    const NODE_CACHE_PATH = path.join(urdevHome, 'cache');

    try {
        const requiredVersion = weave.nodeVersion;
        const requiredMajorVersion = extractMajorVersion(requiredVersion);

        try {
            const globalVersionOutput = execSync('node --version').toString().trim();
            const globalVersion = globalVersionOutput.replace('v', '');
            const globalMajorVersion = extractMajorVersion(globalVersion);

            if (globalMajorVersion === requiredMajorVersion) {
                const nodeExecPath = execSync('command -v node').toString().trim();
                const npmExecPath = execSync('command -v npm').toString().trim();

                const resolvedNodeCachePath = path.join(NODE_CACHE_PATH, 'SYSTEM');
                await ensureDirectoryExists(resolvedNodeCachePath);

                return {
                    ...weave,
                    nodeInstallPath: path.dirname(nodeExecPath),
                    nodeExecutable: nodeExecPath,
                    npmExecutable: npmExecPath,
                    npmCachePath: resolvedNodeCachePath
                };
            }
        } catch (error) {
            // Global node not available or error checking version, continue to local installation
        }

        const weaveWithNode: WeaveWithNode = {
            ...weave,
            nodeInstallPath: path.join(NODE_INSTALLATION_PATH, `v${requiredVersion}`),
            nodeExecutable: path.join(NODE_INSTALLATION_PATH, `v${requiredVersion}`, 'bin', 'node'),
            npmExecutable: path.join(NODE_INSTALLATION_PATH, `v${requiredVersion}`, 'bin', 'npm'),
            npmCachePath: path.join(NODE_CACHE_PATH, `v${requiredVersion}`)
        };

        if (!fs.existsSync(weaveWithNode.nodeExecutable) || !fs.existsSync(weaveWithNode.npmExecutable)) {
            return await installNode(weaveWithNode);
        }

        return weaveWithNode;
    } catch (error: any) {
        logError('Error while resolving Node', error);
        return undefined;
    }
}

function extractMajorVersion(version: string): number {
    return parseInt(version.split('.')[0], 10);
}
