import {execSync} from 'child_process';
import path from 'path';
import type {WeaveWithNode} from './addNodeToWeave.js';

export function routeCommands(weave: WeaveWithNode, args: string[], urdevHome: string): void {
    const [command, ...commandArgs] = args;
    const cmdBase = path.basename(command || '');

    try {
        const env = createEnv(weave, urdevHome);

        if (cmdBase === 'urnpm') {
            return handleNpmCommand(weave, commandArgs, env);
        }

        if (weave.urdevScripts && weave.urdevScripts.has(cmdBase)) {
            return handleScriptCommand(weave, cmdBase, commandArgs, env);
        }

        handleWeaveCommand(weave, args, env);
    } catch (error) {
        // If the command fails, exit with the same error code
        if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
            process.exit(error.status);
        } else {
            console.error('Error executing command:', error);
            process.exit(1);
        }
    }
}

function createEnv(weave: WeaveWithNode, urdevHome: string): NodeJS.ProcessEnv {
    return {
        ...process.env,
        PATH: `${path.dirname(weave.nodeExecutable)}${path.delimiter}${process.env.PATH}`,
        NODE_PATH: path.join(weave.nodeInstallPath, 'lib', 'node_modules'),
        npm_config_cache: weave.npmCachePath,
        WEAVE_PROJECT_DIR: weave.directory,
        WEAVE_URDEV_DIR: weave.urdevDirectory,
        WEAVE_URDEV_HOME: urdevHome,
        WEAVE_URDEV_SCRIPTS: Array.from(weave.urdevScripts.keys()).join(',')
    };
}

function handleNpmCommand(weave: WeaveWithNode, args: string[], env: NodeJS.ProcessEnv): void {
    const npmCommand = `"${weave.npmExecutable}" ${args.join(' ')}`;
    execSync(npmCommand, {
        stdio: 'inherit',
        env,
        cwd: weave.urdevDirectory
    });
}

function handleScriptCommand(weave: WeaveWithNode, cmdBase: string, args: string[], env: NodeJS.ProcessEnv): void {
    const originalScriptName = weave.urdevScripts.get(cmdBase);
    const scriptCommand = `"${weave.npmExecutable}" run --silent ${originalScriptName} -- ${args.join(' ')}`;
    execSync(scriptCommand, {
        stdio: 'inherit',
        env,
        cwd: weave.urdevDirectory
    });
}

function handleWeaveCommand(weave: WeaveWithNode, args: string[], env: NodeJS.ProcessEnv): void {
    const weaveCommand = `"${weave.npmExecutable}" run --silent weave -- ${args.join(' ')}`;
    execSync(weaveCommand, {
        stdio: 'inherit',
        env,
        cwd: weave.urdevDirectory
    });
}
