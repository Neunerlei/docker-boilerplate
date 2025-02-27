import {PartialRegistry} from "./partial/PartialRegistry";
import {PartialStack} from "./partial/PartialStack";
import {Paths} from "./util/Paths";
import {BuildContext} from "./util/BuildContext";
import PrettyError from "pretty-error";
import {memfs} from "memfs";
import {RecursiveRequirementsResolver} from './partial/RecursiveRequirementsResolver';
import {doRegisterAvailablePartials} from './actions/doRegisterAvailablePartials';
import {doAddRootPartialToStack} from './actions/doAddRootPartialToStack';
import {askForAtLeastOneStandalonePartial} from './actions/askForAtLeastOneStandalonePartial';
import {askForAdditionalPartials} from './actions/askForAdditionalPartials';
import {PartialDefinition} from './partial/types';
import {doDumpFilesToOutput} from './actions/doDumpFilesToOutput';
import {doBuildBashly} from './actions/doBuildBashly';
import {FsUtils} from './util/FsUtils';
import {doBuildFiles} from './actions/doBuildFiles';

await (async function index() {
    try {
        const paths = new Paths(import.meta.filename);
        const fs = memfs().fs;
        const context = new BuildContext(paths, fs, (): PartialRegistry => registry, (): PartialStack => stack);
        const registry = new PartialRegistry(context);
        const stack = new PartialStack(new RecursiveRequirementsResolver(context));

        await doRegisterAvailablePartials(paths, registry);
        await doAddRootPartialToStack(stack, registry);
        await askForAtLeastOneStandalonePartial(context);
        await askForAdditionalPartials(context);

        const partials = (await stack.getSortedKeys()).map(key => registry.get(key)!);

        const runForEachPartial = async (fn: (partial: PartialDefinition) => Promise<void>) => {
            for (const partial of partials) {
                await fn(partial);
            }
        }

        const callIfSet = async (partial: PartialDefinition, key: keyof PartialDefinition, ...args: any[]) => {
            if (typeof partial[key] === 'function') {
                await partial[key].apply(partial[key], args);
            }
        }

        await runForEachPartial((partial) => callIfSet(partial, 'init'));
        await runForEachPartial((partial) => callIfSet(partial, 'loadFiles', fs, new FsUtils(fs)));
        await runForEachPartial((partial) => doBuildFiles(partial, context));
        await runForEachPartial((partial) => callIfSet(partial, 'apply'));
        await runForEachPartial((partial) => callIfSet(partial, 'applyPost'));

        doDumpFilesToOutput(fs, paths);
        doBuildBashly(paths);

        process.exit(0);
    } catch (e) {
        if (e instanceof Error && e.message.includes('User force closed the prompt with 0 null')) {
            process.exit(0);
        }

        console.log((new PrettyError()).render(e));
        process.exit(1);
    }
})()
