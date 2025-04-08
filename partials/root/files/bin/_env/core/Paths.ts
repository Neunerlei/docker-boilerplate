import * as process from 'node:process';
import * as path from 'node:path';
import * as fs from 'node:fs';

export class Paths {
    public readonly scriptDir: string;
    public readonly envDir: string;
    public readonly projectDir: string;
    public readonly commandPaths: string[];
    public readonly envFilePath: string;
    public readonly envFileTemplatePath: string;
    public readonly configFilePath: string;
    public readonly envHomeDir: string;
    public readonly certsDir: string;

    public constructor(
        scriptDir: string,
        envDir: string,
        projectDir: string,
        commandPaths: string[],
        envFilePath: string,
        envFileTemplatePath: string,
        configFilePath: string,
        envHomeDir: string,
        certsDir: string
    ) {
        this.scriptDir = scriptDir;
        this.envDir = envDir;
        this.projectDir = projectDir;
        this.commandPaths = commandPaths;
        this.envFilePath = envFilePath;
        this.envFileTemplatePath = envFileTemplatePath;
        this.configFilePath = configFilePath;
        this.envHomeDir = envHomeDir;
        this.certsDir = certsDir;
    }
}

export function makePaths(
    commandPaths?: string[]
): Paths {
    if (!process.env.SCRIPT_DIR) {
        throw new Error('SCRIPT_DIR is not defined');
    }
    if (!fs.existsSync(process.env.SCRIPT_DIR)) {
        throw new Error(`SCRIPT_DIR does not exist: ${process.env.SCRIPT_DIR}`);
    }
    const scriptDir = process.env.SCRIPT_DIR;

    if (!process.env.ENV_DIR) {
        throw new Error('ENV_DIR is not defined');
    }
    if (!fs.existsSync(process.env.ENV_DIR)) {
        throw new Error(`ENV_DIR does not exist: ${process.env.ENV_DIR}`);
    }
    const envDir = process.env.ENV_DIR;

    if (!process.env.PROJECT_DIR) {
        throw new Error('PROJECT_DIR is not defined');
    }
    if (!fs.existsSync(process.env.PROJECT_DIR)) {
        throw new Error(`PROJECT_DIR does not exist: ${process.env.PROJECT_DIR}`);
    }
    const projectDir = process.env.PROJECT_DIR;

    if (!process.env.ENV_HOME) {
        throw new Error('ENV_HOME is not defined');
    }
    if (!fs.existsSync(process.env.ENV_HOME)) {
        throw new Error(`ENV_HOME does not exist: ${process.env.ENV_HOME}`);
    }
    const envHomeDir = process.env.ENV_HOME;

    commandPaths = commandPaths || [];
    commandPaths = commandPaths.map((p) => path.resolve(envDir, p));
    const builtInCommandsPath = path.resolve(envDir, 'commands');
    if (!commandPaths.includes(builtInCommandsPath)) {
        commandPaths.push(builtInCommandsPath);
    }

    const envFilePath = path.resolve(projectDir, '.env');
    const envFileTemplatePath = path.resolve(projectDir, '.env.tpl');
    const configFilePath = path.resolve(projectDir, 'env.config.json');
    const certsDir = path.resolve(projectDir, 'docker/certs');

    return new Paths(
        scriptDir,
        envDir,
        projectDir,
        commandPaths,
        envFilePath,
        envFileTemplatePath,
        configFilePath,
        envHomeDir,
        certsDir
    );
}
