import type {Paths} from './Paths.js';
import * as fs from 'node:fs';
import {confirm, input} from '@inquirer/prompts';
import * as path from 'node:path';

let loadedEnvFile: EnvFile | undefined = undefined;

interface EnvFileState {
    filename: string;
    values: Map<string, string>;
    tpl: string;
}

export class EnvFile {
    private readonly _state: EnvFileState;

    public constructor(state: EnvFileState) {
        this._state = state;
    }

    public get(key: string, fallback?: string): string | undefined {
        return this._state.values.get(key) || fallback;
    }

    public has(key: string): boolean {
        return this._state.values.has(key);
    }

    public set(key: string, value: string): this {
        this._state.values.set(key, value);
        return this;
    }

    public write(): void {
        writeStateToFile(this._state);
    }
}

export async function makeEnvFile(paths: Paths): Promise<EnvFile> {
    if (!fs.existsSync(paths.envFilePath)) {
        if (!fs.existsSync(paths.envFileTemplatePath)) {
            throw new Error(`Env file template does not exist: ${paths.envFileTemplatePath}`);
        }

        if (!await confirm({
            message: 'The .env file is currently missing, should I create one for you based on the template: ' + paths.envFileTemplatePath + '?'
        })) {
            throw new Error('You can not continue without an .env file, sorry');
        }

        fs.copyFileSync(paths.envFileTemplatePath, paths.envFilePath);
    }

    const envFile = new EnvFile(loadEnvFileState(paths.envFilePath));

    if (!envFile.has('PROJECT_NAME') || envFile.get('PROJECT_NAME') === '' || envFile.get('PROJECT_NAME') === 'replace-me') {
        const projectName = await input({
            message: 'You need to define a project name, which can be used for your docker containers and generated urls. Please enter a project name:',
            validate: (input) => {
                return input.length > 0 && input.match(/^[a-z0-9-]+$/) ? true : 'The project name must only contain lowercase letters, numbers and dashes';
            },
            default: extractProjectNameFromPath(paths),
            required: true
        });

        envFile.set('PROJECT_NAME', projectName);
        envFile.write();
    }

    return loadedEnvFile = envFile;
}

export function getEnvValue(key: string, fallback?: string): string {
    if (loadedEnvFile && loadedEnvFile.has(key)) {
        return loadedEnvFile.get(key)!;
    } else if (process.env[key]) {
        return process.env[key]!;
    } else if (fallback) {
        return fallback;
    } else {
        console.log(loadedEnvFile, key);
        throw new Error(`Missing required env value: ${key}`);
    }
}

function loadEnvFileState(filename: string): EnvFileState {
    return {
        filename,
        ...parseFile(fs.readFileSync(filename).toString('utf-8'))
    };
}

function parseFile(content: string): {
    values: Map<string, string>;
    tpl: string;
} {
    const lines = content.split(/\r?\n/);
    const tpl: Array<string> = [];
    const values = new Map();

    // Iterate the lines
    lines.forEach(line => {
        let _line = line.trim();

        // Skip comments and empty lines
        if (_line.length === 0 || _line.charAt(0) === '#' || _line.indexOf('=') === -1) {
            tpl.push(line);
            return;
        }

        // Extract key value and store the line in the template
        tpl.push(_line.replace(/^([^=]*?)(?:\s+)?=(?:\s+)?(.*?)(\s#|$)/, (_, key, value, comment) => {
            // Prepare value
            value = value.trim();
            if (value.length === 0) {
                value = null;
            }

            // Handle comment only value
            if (typeof value === 'string' && value.charAt(0) === '#') {
                comment = ' ' + value;
                value = null;
            }

            key = key.trim();
            if (values.has(key)) {
                throw new Error('Invalid .env file! There was a duplicate key: ' + key);
            }
            values.set(key.trim(), value);
            return '{{pair}}' + ((comment + '').trim().length > 0 ? comment : '');
        }));
    });

    return {
        values: values,
        tpl: tpl.join('\n')
    };
}

function writeStateToFile(state: EnvFileState): void {
    // Build the content based on the template and the current storage
    const keys: Array<string> = Array.from(state.values.keys());
    let contents = state.tpl.replace(/{{pair}}/g, () => {
        const key = keys.shift();
        const value = state.values.get(key + '');
        return key + '=' + value;
    });

    if (keys.length > 0) {
        for (const key of keys) {
            const value = state.values.get(key);
            contents += '\n' + key + '=' + value;
        }
    }

    // Remove all spacing at the top and bottom of the file
    contents = contents.replace(/^\s+|\s+$/g, '');

    // Write the file
    fs.writeFileSync(state.filename, contents);
}

function extractProjectNameFromPath(paths: Paths): string {
    const projectPath = paths.projectDir;
    let projectName = path.basename(projectPath);
    if (projectName.length < 5) {
        const parentDir = path.dirname(projectPath);
        projectName = path.basename(parentDir) + '-' + projectName;
    }
    // Ensure only valid characters are used
    return projectName.replace(/[^a-z0-9-]/g, '-');
}
