import {PartialRegistry} from './partial/PartialRegistry';
import {Paths} from './util/Paths';
import {BuildContext} from './util/BuildContext';
import PrettyError from 'pretty-error';
import {memfs} from 'memfs';
import {doRegisterAvailablePartials} from './actions/doRegisterAvailablePartials';
import {doAddRootPartial} from './actions/doAddRootPartial.js';
import {askForAtLeastOneStandalonePartial} from './actions/askForAtLeastOneStandalonePartial';
import {askForAdditionalPartials} from './actions/askForAdditionalPartials';
import {PartialDefinition} from './partial/types';
import {FsUtils} from './util/FsUtils';
import {doBuildFiles} from './actions/doBuildFiles';
import {doFinalizeEnvScript} from './actions/doFinalizeEnvScript';
import {doShowSummary} from '@boiler/actions/doShowSummary.js';
import {Summary} from '@boiler/util/Summary.js';
import process from 'node:process';
import {doDumpFilesToOutput} from '@boiler/actions/doDumpFilesToOutput.js';
import {doShowWelcome} from '@boiler/actions/doShowWelcome.js';

await (async function index() {
    try {
        const paths = new Paths(import.meta.filename);
        const fs = memfs().fs;
        const summary = new Summary();
        const context = new BuildContext(paths, fs, (): PartialRegistry => registry, summary);
        const registry = new PartialRegistry(context);

        doShowWelcome();
        await doRegisterAvailablePartials(paths, registry);
        await doAddRootPartial(registry);
        await askForAtLeastOneStandalonePartial(context);
        await askForAdditionalPartials(context);

        const partials = await registry.sortedUsed;

        const runForEachPartial = async (fn: (partial: PartialDefinition) => Promise<void>) => {
            for (const partial of partials) {
                await fn(partial.definition);
            }
        };

        const callIfSet = async (partial: PartialDefinition, key: keyof PartialDefinition, ...args: any[]) => {
            if (typeof partial[key] === 'function') {
                await partial[key].apply(partial[key], args);
            }
        };

        await runForEachPartial((partial) => callIfSet(partial, 'init'));
        await runForEachPartial((partial) => callIfSet(partial, 'loadFiles', fs, new FsUtils(fs)));
        await runForEachPartial((partial) => doBuildFiles(partial, context));
        await runForEachPartial((partial) => callIfSet(partial, 'apply'));
        await runForEachPartial((partial) => callIfSet(partial, 'applyPost'));

        doDumpFilesToOutput(fs, paths);
        doFinalizeEnvScript(paths);
        await doShowSummary(context);

        process.exit(0);
    } catch (e) {
        if (e instanceof Error && e.message.includes('User force closed the prompt with 0 null')) {
            process.exit(0);
        }

        console.log((new PrettyError()).render(e));
        process.exit(1);
    }
})();
