import * as fs from 'fs';
import * as path from 'path';
import {logError} from './ui.js';

export interface Weave {
    /**
     * The Node.js version specified in the weave configuration.
     * If not specified, defaults to '22.14.0'.
     */
    nodeVersion: string;

    /**
     * The directory where the weave configuration is located.
     * This is the project directory that contains the `.urdev` folder.
     */
    directory: string;

    /**
     * The path to the `.urdev` directory inside the project directory.
     */
    urdevDirectory: string;

    /**
     * Extracted from the "scripts" section of the package.json file, these are the scripts
     * that will be executed low level and never forwarded to the weave npm executable.
     * IMPORTANT! All scripts in this array can only be executed by prefixing them with "ur",
     * meaning: "tsc" becomes "urtsc", "npm" becomes "urnpm", etc. The "weave" script
     * is the internal bridge and will never be in this list.
     */
    urdevScripts: Map<string, string>;
}

const DEFAULT_NODE_VERSION = '22.14.0';

interface PackageJsonInfo {
    packageJsonPath: string;
    projectDirectory: string;
    urdevDirectory: string;
}

/**
 * Searches for a weave configuration by traversing up the directory tree.
 *
 * @returns A `WeaveConfig` object if a valid configuration is found, or `undefined` if none is found.
 */
export function findWeave(urdevDirname: string): Weave | undefined {
    const packageJsonInfo = findPackageJson(urdevDirname);
    if (!packageJsonInfo) {
        return undefined;
    }

    return parseWeaveFromPackageJson(packageJsonInfo);
}

/**
 * Searches for a package.json file within an .urdev directory by traversing up the directory tree.
 *
 * @returns Information about the found package.json or undefined if not found
 */
function findPackageJson(urdevDirname: string): PackageJsonInfo | undefined {
    let currentDir = process.cwd();

    while (true) {
        const urdevPath = path.join(currentDir, urdevDirname);

        if (fs.existsSync(urdevPath) && fs.statSync(urdevPath).isDirectory()) {
            const packageJsonPath = path.join(urdevPath, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                return {
                    packageJsonPath,
                    projectDirectory: currentDir,
                    urdevDirectory: urdevPath
                };
            }
        }

        const parentDir = path.dirname(currentDir);

        if (parentDir === currentDir) {
            return undefined;
        }

        currentDir = parentDir;
    }
}

/**
 * Parses a package.json file into a Weave configuration object.
 *
 * @param packageJsonInfo Information about the found package.json
 * @returns A Weave configuration or undefined if the package.json is invalid
 */
function parseWeaveFromPackageJson(packageJsonInfo: PackageJsonInfo): Weave | undefined {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonInfo.packageJsonPath, 'utf8'));

        // Check scripts section
        if (!packageJson.scripts || !packageJson.scripts.weave) {
            logError(`Missing required "weave" script in package.json`, new Error('File not found'));
            return undefined;
        }

        // Parse scripts into urdevScripts map (excluding the weave script)
        const urdevScripts = new Map<string, string>();
        for (const scriptName of Object.keys(packageJson.scripts)) {
            if (scriptName !== 'weave') {
                urdevScripts.set(`ur${scriptName}`, scriptName);
            }
        }

        // Get node version from engines
        let nodeVersion = DEFAULT_NODE_VERSION;
        if (packageJson.engines && packageJson.engines.node) {
            const engineNodeVersion = packageJson.engines.node;

            // Check if it's a single explicit version (no semver operators)
            if (/^\d+\.\d+\.\d+$/.test(engineNodeVersion)) {
                nodeVersion = engineNodeVersion;
            } else {
                logError(`Node version in engines (${engineNodeVersion}) must be an explicit version (e.g., ${DEFAULT_NODE_VERSION}) without semver operators`);
                return undefined;
            }
        }

        return {
            nodeVersion,
            directory: packageJsonInfo.projectDirectory,
            urdevDirectory: packageJsonInfo.urdevDirectory,
            urdevScripts
        };
    } catch (error: any) {
        logError('Failed to parse package.json', error);
        return undefined;
    }
}
