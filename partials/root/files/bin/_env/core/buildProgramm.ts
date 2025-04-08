import {type Command, program} from 'commander';
import {Context, WritableFlags} from './Context.ts';
import type {Paths} from './Paths.ts';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type {EnvPackageInfo} from './types.ts';
import {getPrettyHelpHeader, showNiceIntro} from './ui.js';
import {globSync} from 'glob';
import {makeConfig} from './Config.js';
import {makeEnvFile} from './EnvFile.js';
import {makePlatform} from './Platform.ts';
import {EventBus} from './EventBus.ts';

export async function buildProgramm(
    paths: Paths
): Promise<Command> {
    const events = new EventBus();
    const pkg = readPackageJson(paths);
    const env = await makeEnvFile(paths);
    const config = makeConfig(env, paths);
    const flags = new WritableFlags();
    const platform = makePlatform();

    const context = new Context(
        pkg,
        env,
        paths,
        program,
        flags,
        config,
        platform,
        events
    );

    const inheritFlagsFromOpts = () => {
        for (const key of Object.keys(flags)) {
            const publicKey = key.replace(/^_/, '');
            if (program.opts()[publicKey] !== undefined) {
                flags.set(key, program.opts()[publicKey]);
            }
        }
    };

    program
        .name(pkg.name)
        .description(pkg.description)
        .version(pkg.version)
        .option('-q, --quiet', 'Do not output any message')
        .showSuggestionAfterError(true)
        .helpCommand(true)
        .hook('preAction', () => {
            inheritFlagsFromOpts();
            showNiceIntro(context);
        })
        .addHelpText('beforeAll', getPrettyHelpHeader(context))
    ;

    // Override the default parse method to show help if no arguments are passed
    const _realParse = program.parse;
    program.parse = function () {
        if (process.argv.length < 3) {
            program.help();
        }
        return _realParse.call(program, ...arguments);
    };

    await readCommandEntryPoints(program, context);

    return program;
}

export function readPackageJson(paths: Paths): EnvPackageInfo {
    const content = fs.readFileSync(path.resolve(paths.envDir, 'package.json'));
    const pkg: Record<string, any> = JSON.parse(content.toString('utf-8'));

    return {
        name: (pkg.name ?? 'bin/env').replace(/^@/, ''),
        version: pkg.version ?? '1.0.0',
        description: pkg.description ?? ''
    };
}

async function readCommandEntryPoints(program: Command, context: Context) {
    for (const commandPath of context.getPaths().commandPaths) {
        const entrypointGlob = path.join(commandPath, '**', '*Commands.ts');
        for (const entrypointFile of globSync(entrypointGlob)) {
            const mod = await import(entrypointFile);
            if (!mod.default || typeof mod.default !== 'function') {
                throw new Error(`Command entrypoint must export a default function: ${entrypointFile}`);
            }

            await mod.default(program, context);
        }
    }
}
