import type {NginxBody} from './filebuilder/NginxBody.js';
import type {PartialRegistry} from '@boiler/partial/PartialRegistry.js';
import type {Location, Locations} from './filebuilder/Locations.js';
import chalk from 'chalk';
import {uiLogInfo, uiTextNsGetter} from '@boiler/util/uiUtils.js';
import {confirm, input, select} from '@inquirer/prompts';

interface LocationHashes {
    dev: string;
    devSsl: string;
    prod: string;
}

type EnvironmentKey = 'dev' | 'devSsl' | 'prod' | 'dev+';

const nodeNs = uiTextNsGetter('Node');

export async function askForRouting(body: NginxBody, {app: {definition: {key: appKey}}}: PartialRegistry) {
    setAppKeyToRoot(body, appKey);

    uiLogInfo(nodeNs(`In the following list you can see the routes and their corresponding services. 
    Check if they match your needs and if not answer with "no" to change them in the next step.`), 'Everything on route?');

    let hashes: LocationHashes;
    while (true) {
        hashes = {
            dev: body.dev.toHash(),
            devSsl: body.devSsl.toHash(),
            prod: body.prod.toHash()
        };

        printBodyLocations(body, appKey);

        if (await confirm({
            message: nodeNs('Are these routes as you want them?'),
            default: true
        })) {
            break;
        }

        const env = await askForEnvironmentToEdit(hashes);
        const locations = getLocationsForEnv(env, body);
        const editLocation = await askForLocationToEdit(locations, appKey);
        const changedLocation = await askForNewLocationRoute(locations, editLocation);
        updateLocationForEnv(changedLocation, env, body);
    }
}

function printBodyLocations(body: NginxBody, appKey: string) {
    const devHash = body.dev.toHash();
    const devSslHash = body.devSsl.toHash();
    const prodHash = body.prod.toHash();

    if (devHash === devSslHash && devHash === prodHash) {
        console.log(chalk.bold.yellow('ALL ENVIRONMENTS:'));
        printLocations(body.dev, appKey);
    } else if (devHash === devSslHash && devHash !== prodHash) {
        console.log(chalk.bold.yellow('DEVELOPMENT (HTTP & HTTPS):'));
        printLocations(body.dev, appKey);
        console.log(chalk.bold.yellow('PRODUCTION:'));
        printLocations(body.prod, appKey);
    } else {
        console.log(chalk.bold.yellow('DEVELOPMENT (HTTP):'));
        printLocations(body.dev, appKey);
        console.log(chalk.bold.yellow('DEVELOPMENT (HTTPS):'));
        printLocations(body.devSsl, appKey);
        console.log(chalk.bold.yellow('PRODUCTION:'));
        printLocations(body.prod, appKey);
    }
}

function printLocations(locations: Locations, appKey: string) {
    for (const location of locations.all) {
        console.log(`  - ${chalk.bold(location.label)} route: ${location.route}${location.key === appKey ? ' (app)' : ''}`);
    }

    console.log('');
}

function askForEnvironmentToEdit(hashes: LocationHashes): Promise<EnvironmentKey> {
    return select<EnvironmentKey>({
        message: nodeNs('Which environment do you want to edit?'),
        choices: [
            {value: 'prod', name: 'Production'},
            ...(hashes.dev === hashes.devSsl ? [{
                value: 'dev+',
                name: 'Development (HTTP & HTTPS)'
            } as any] : [] as any[]),
            {value: 'dev', name: 'Development (HTTP)'},
            {value: 'devSsl', name: 'Development (HTTPS)'}
        ]
    });
}

function getLocationsForEnv(env: EnvironmentKey, body: NginxBody): Locations {
    if (env === 'prod') {
        return body.prod;
    } else if (env === 'dev' || env === 'dev+') {
        return body.dev;
    } else {
        return body.devSsl;
    }
}

async function askForLocationToEdit(locations: Locations, appKey: string) {
    const selectedKey = await select({
        message: nodeNs('Which location do you want to edit?'),
        choices: locations.all.map((location) => ({
            value: location.key,
            name: `${location.label} ${location.route}${location.key === appKey ? ' (app)' : ''}`
        }))
    });

    return locations.get(selectedKey)!;
}

async function askForNewLocationRoute(locations: Locations, location: Location) {
    const existingRoutes = locations.all.map((loc) => loc.route);

    const newRoute = await input({
        message: nodeNs('What is the new route?'),
        default: location.route,
        validate: (input: string) => {
            if (input.trim() === '') {
                return 'Please provide a route';
            }
            if (!input.startsWith('/')) {
                return 'The route must start with a slash';
            }
            if (existingRoutes.includes(input)) {
                return 'This route already exists';
            }
            return true;
        }
    });

    return {...location, route: newRoute};
}

function updateLocationForEnv(location: Location, env: EnvironmentKey, body: NginxBody) {
    if (env === 'prod') {
        body.prod.set(location);
    } else if (env === 'dev') {
        body.dev.set(location);
    } else if (env === 'dev+') {
        body.dev.set(location);
        body.devSsl.set(location);
    } else {
        body.devSsl.set(location);
    }
}

function setAppKeyToRoot(body: NginxBody, appKey: string) {
    const locationSets = [body.dev, body.devSsl, body.prod];
    for (const locations of locationSets) {
        const hasLocationWithSlashRoute = locations.all.some(location => location.route === '/');
        if (hasLocationWithSlashRoute) {
            continue;
        }

        const appLocation = locations.get(appKey);
        if (appLocation) {
            appLocation.route = '/';
            locations.set(appLocation);
        }
    }
}
