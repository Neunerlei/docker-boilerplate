import type {Paths} from './Paths.js';
import * as fs from 'node:fs';
import {confirm, input} from '@inquirer/prompts';
import {parse as parseEnv} from 'dotenv';
import * as path from 'node:path';

let loadedEnvFile: EnvFile | undefined = undefined;

export class EnvFile {
    private readonly _values: Map<string, string>;

    public constructor(values: Map<string, string>) {
        this._values = values;
    }

    public get(key: string, fallback?: string): string | undefined {
        return this._values.get(key) || fallback;
    }

    public has(key: string): boolean {
        return this._values.has(key);
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

    return loadedEnvFile = await ensureEnvFileContainsProjectName(loadEnvFile(paths), paths);
}

export function getEnvValue(key: string, fallback?: string): string {
    if (loadedEnvFile && loadedEnvFile.has(key)) {
        return loadedEnvFile.get(key)!;
    } else if (fallback) {
        return fallback;
    } else {
        throw new Error(`Missing required env value: ${key}`);
    }
}

function loadEnvFileContent(paths: Paths): string {
    if (!fs.existsSync(paths.envFilePath)) {
        throw new Error(`Env file does not exist: ${paths.envFilePath}`);
    }

    return fs.readFileSync(paths.envFilePath).toString('utf-8');
}

function loadEnvFile(paths: Paths): EnvFile {
    return new EnvFile(new Map(Object.entries(parseEnv(loadEnvFileContent(paths)))));
}

async function ensureEnvFileContainsProjectName(envFile: EnvFile, paths: Paths) {
    if (!envFile.has('PROJECT_NAME') || envFile.get('PROJECT_NAME') === '' || envFile.get('PROJECT_NAME') === 'replace-me') {
        const projectName = await input({
            message: 'You need to define a project name, which can be used for your docker containers and generated urls. Please enter a project name:',
            validate: (input) => {
                return input.length > 0 && input.match(/^[a-z0-9-]+$/) ? true : 'The project name must only contain lowercase letters, numbers and dashes';
            },
            default: extractProjectNameFromPath(paths),
            required: true
        });

        let envContent = loadEnvFileContent(paths);
        if (envContent.includes('PROJECT_NAME=replace-me')) {
            envContent = envContent.replace('PROJECT_NAME=replace-me', `PROJECT_NAME=${projectName}`);
        } else {
            envContent += (envContent.length > 0 ? `\n` : '') + `PROJECT_NAME=${projectName}`;
        }

        fs.writeFileSync(paths.envFilePath, envContent);
        return loadEnvFile(paths);
    }

    return envFile;
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
