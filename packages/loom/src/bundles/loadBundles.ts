import * as path from 'node:path';
import {glob} from 'glob';
import type {BundleList, LoadedLoomBundle, LoomBundleFactory} from './types.js';
import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import {sortObjectsByOrder} from '../util/sortUtils.js';
import type {Context} from '../Context.js';
import type {EventBus} from '../EventBus.js';
import {KeyedObjectList} from '../util/KeyedObjectList.js';
import {logBootError, logBootWarning} from '../util/bootLog.js';

const execAsync = promisify(exec);

type BundleFactoryMap = Map<string, LoomBundleFactory>;

export async function loadBundles(context: Context): Promise<BundleList> {
    const bundles = await initializeAndSortBundles(
        context,
        await normalizeCandidates(
            (await getGloballyInstalledBundleCandidates()).concat(getBuiltInBundleCandidate())
        )
    );

    await registerBundleEvents(context.events, bundles);

    return new KeyedObjectList(
        (await context.events.trigger('bundle:list:filter', {bundles})).bundles
    );
}

async function getGloballyInstalledBundleCandidates() {
    const globalPath = await getGlobalNodeModulesPath();
    const entrypointPattern = 'loom.bundle.{ts,js}';
    const directoryCandidates = [
        path.join('*', entrypointPattern), // Globally installed packages
        path.join('*', '*', entrypointPattern), // Globally installed packages with vendor/namespace
        path.join('@urdev', 'loom', 'node_modules', '@urdev', '*', entrypointPattern) // Built in default bundles
    ];
    return await glob(path.join(globalPath, `{${directoryCandidates.join(',')}}`), {windowsPathsNoEscape: true});
}

function getBuiltInBundleCandidate(): string {
    return path.join(import.meta.dirname, '..', 'builtin.loom.bundle.js');
}

async function getGlobalNodeModulesPath() {
    try {
        const npmPrefix = (await execAsync('npm config get prefix')).stdout.trim();

        // On Windows, global modules are installed directly under prefix/node_modules
        // On Unix-like systems, they're under prefix/lib/node_modules
        if (process.platform === 'win32') {
            return `${npmPrefix}\\node_modules`;
        } else {
            return `${npmPrefix}/lib/node_modules`;
        }
    } catch (error) {
        throw new Error(`Failed to get global node modules path: ${error.message}`);
    }
}

async function normalizeCandidates(candidates: Array<string>) {
    // Sort candidates by length in descending order
    const sortedCandidates = candidates.sort((a, b) => b.length - a.length);

    const bundles: BundleFactoryMap = new Map();

    for (const candidate of sortedCandidates) {
        const parts = candidate.split(path.sep);
        parts.pop(); // Remove the entrypoint
        const bundleName = parts.pop();
        const bundleVendor = parts.pop();
        const key = [(bundleVendor !== 'node_modules' ? bundleVendor : ''), bundleName].filter(Boolean).join('/');

        let module: any;
        try {
            module = await import(candidate);
        } catch (error) {
            logBootError(`Failed to import bundle "${key}" from "${candidate}"`, error);
            continue;
        }

        const bundle = module.default || module.bundle || undefined;
        if (!bundle) {
            logBootWarning(`Bundle "${key}" (${path.dirname(candidate)}) does not export a bundle as "default" or "bundle"`);
            continue;
        }

        if (typeof bundle !== 'function') {
            logBootWarning(`Bundle "${key}" (${path.dirname(candidate)}) does not export a function`);
            continue;
        }

        if (bundles.has(key)) {
            logBootWarning(`Bundle "${key}" was already registered, overwriting it with "${path.dirname(candidate)}"`);
        }

        bundles.set(key, bundle);
    }

    return bundles;
}

async function initializeAndSortBundles(context: Context, bundles: BundleFactoryMap) {
    const initializedBundles = await Promise.all(
        Array.from(bundles.entries()).map(async ([key, bundleFactory]) => {
            try {
                const bundle = await bundleFactory(context);
                return {
                    key,
                    ...bundle,
                    order: bundle.order ?? 10
                };
            } catch (error) {
                logBootError(`Failed to initialize bundle "${key}"`, error);
                return null;
            }
        })
    );

    return sortObjectsByOrder(
        initializedBundles.filter((bundle): bundle is LoadedLoomBundle => bundle !== null),
        -200
    );
}

async function registerBundleEvents(events: EventBus, bundles: LoadedLoomBundle[]) {
    for (const bundle of bundles) {
        if (typeof bundle.events === 'function') {
            await bundle.events(events);
        }
    }
}
