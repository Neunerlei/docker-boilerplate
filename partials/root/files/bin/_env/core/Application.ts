import {CommonUi} from './CommonUi.ts';
import {EventBus} from './EventBus.ts';
import {createPackageJson} from './PackageInfo.ts';
import {createPaths} from './Paths.ts';
import {createEnvFile} from './env/EnvFile.ts';
import {createPlatform} from './Platform.ts';
import {loadAddons} from './loadAddons.ts';
import {createContext, extendContext} from './Context.ts';
import {welcome} from '@/welcome.js';

export class Application {
    public async run(args: string[]) {
        const events = new EventBus();
        const ui = new CommonUi(events);
        try {
            const context = createContext(events, ui);
            extendContext(context, 'paths', createPaths());
            extendContext(context, 'platform', createPlatform());
            extendContext(context, 'pkg', createPackageJson(context.paths));
            await welcome(context);
            await loadAddons(context);
            extendContext(context, 'env', await createEnvFile(context));

            const {program, pkg} = context;

            program
                .name(pkg.name)
                .description(pkg.description)
                .version(pkg.version)
                .option('--env-verbose', 'Verbosity of the bin/env Node.js bootstrap script')
                .showSuggestionAfterError(true)
                .helpCommand(true)
                .addHelpText('beforeAll', () => ui.renderHelpIntro())
                .configureHelp({
                    sortSubcommands: true
                })
            ;

            await events.trigger('commands:define', {program});

            if (args.length < 3) {
                program.help();
                process.exit(0);
            }

            await program.parseAsync(args);
        } catch (error) {
            await events.trigger('error:before', {error});
            console.error(ui.renderError(error));
            await events.trigger('error:after', {error});
            process.exit(1);
        }
    }
}
