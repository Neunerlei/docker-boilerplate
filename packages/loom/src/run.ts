import {EventBus} from '@loom/EventBus.js';
import {CommonUi} from '@loom/CommonUi.js';
import {createContext, extendContext} from '@loom/Context.js';
import {memfs} from 'memfs';
import {Paths} from '@loom/Paths.js';
import {loadBundles} from '@loom/bundles/loadBundles.js';
import {createFragmentList, createFragmentTypeHandlerList} from '@loom/fragments/fragmentFactories.js';
import {createPatternList} from '@loom/patterns/patternFactories.js';
import {showBootLog} from '@loom/util/bootLog.js';
import {Summary} from '@loom/summary/Summary.js';

export async function run(indexFilename: string, args: string[]) {
    const events = new EventBus();
    const ui = new CommonUi(events);
    try {
        const paths = new Paths(indexFilename);
        const context = createContext(
            paths,
            events,
            ui,
            memfs().fs,
            new Summary()
        );

        extendContext(context, 'bundles', await loadBundles(context));
        extendContext(context, 'typeHandlers', await createFragmentTypeHandlerList(context));
        extendContext(context, 'fragments', await createFragmentList(context));
        extendContext(context, 'patterns', await createPatternList(context));

        console.log(ui.welcome);
        showBootLog();

        await context.events.trigger('booted', {context});

        const {program} = context;

        program
            .name('loom')
            .showSuggestionAfterError(true)
            .configureHelp({
                sortSubcommands: true
            });

        await events.trigger('commands:define', {program});
        await program.parseAsync(args);
    } catch (error) {
        if (error instanceof Error) {
            await events.trigger('error:before', {error});
            console.error(ui.renderError(error));
            await events.trigger('error:after', {error});
        }
        process.exit(1);
    }
}
