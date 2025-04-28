import {Partial} from '@boiler/partial/Partial.js';
import {confirm, input} from '@inquirer/prompts';
import chalk from 'chalk';
import {uiLogInfo, uiTextBlock, uiTextNsGetter} from '@boiler/util/uiUtils.js';

export type NodeUsage = {
    runsInProduction: boolean;
    handlesWebTraffic: boolean;
    prodImageType: NodeProdImageType;
    port: number;
    copyPathSource: string;
    copyPathTarget: string;
}

export type NodeProdImageType = 'standalone' | 'copy' | 'static';

export async function askForUsage(partial: Partial): Promise<NodeUsage> {
    const {isApp, summary, buildContext} = partial;
    const isSoleStandalonePartial = buildContext.partials.usedStandalone.length === 1;

    uiLogInfo(uiTextBlock(`You added a Node.js service, which can be used in multiple ways.
Please answer a few questions to set it up correctly.`), 'Node.js setup');

    const nodeNs = uiTextNsGetter('Node');

    let runsInProduction = await confirm({
        message: nodeNs('Is Node running in production, or is it only a builder/development server?'),
        default: true
    });

    let handlesWebTraffic = isApp;
    let prodImageType: NodeProdImageType = 'standalone';
    if (runsInProduction) {
        handlesWebTraffic = await confirm({
            message: nodeNs('Is Node publicly available via a port or through a reverse proxy (e.g. nginx)?'),
            default: handlesWebTraffic
        });
    } else {
        handlesWebTraffic = await confirm({
            message: nodeNs('Do you plan on running a dev server that needs an open port?')
        });

        if (isSoleStandalonePartial) {
            prodImageType = 'static';
        } else if (!isApp && await confirm({
            message: nodeNs(`Node is not the main application, should the build output automatically be copied into the app (${partial.getOtherPartialOrFail('app').name}) image?`)
        })) {
            prodImageType = 'copy';
        } else {
            // Either we are NOT the main partial and should be standalone OR we are the main partial but not run in prod -> only solution static
            prodImageType = 'static';
        }
    }

    let port = 8000;
    if (handlesWebTraffic) {
        port = parseInt(await input({
            message: nodeNs('On which port should node be listening?'),
            default: port + '',
            validate: (input: string) => {
                if (isNaN(Number(input))) {
                    return 'Please provide a valid port number';
                }
                return true;
            }
        }));

        summary.addMessage(`will be publicly listening on port ${port}.`);
    }

    let copyPathSource = '/var/www/html/dist';
    let copyPathTarget = '/var/www/html/public/dist';
    if (prodImageType === 'copy') {
        copyPathSource = await input({
            message: nodeNs('From where should the build output be copied from?'),
            default: copyPathSource
        });
        copyPathTarget = await input({
            message: nodeNs('Where should the build output be copied to?'),
            default: copyPathTarget
        });
        summary.addMessage(
            `output will be copied from ${copyPathSource} to ${copyPathTarget} in the ${chalk.bold('app image')}.`
        );
    } else if (prodImageType === 'static') {
        uiLogInfo(uiTextBlock(`Because you do not need Node.js to run in production and do not want to copy the build output, we will create a static image. 
        This image is a simple busybox image that contains the build output and can be used to serve the files via nginx or similar.
        You will be asked to provide a directory to copy ${chalk.bold('from')} and ${chalk.bold('to')}.
        
        ${chalk.bold('from')} is a directory in your Node container that contains the build output.
        ${chalk.bold('to')} is a directory in the static image that contains the build output, you can use this directory as a volume in your nginx container.
        `), 'Static Image');

        copyPathSource = await input({
            message: nodeNs('FROM which directory should the data be copied?'),
            default: copyPathSource
        });
        copyPathTarget = await input({
            message: nodeNs('TO which directory of the static image should the data be copied?'),
            default: '/data'
        });
        summary.addMessage(
            `output will be copied from ${copyPathSource} to ${copyPathTarget} in a ${chalk.bold('static image')}.`
        );
    } else {
        summary.addMessage(
            `will run in a standalone image.`
        );
    }

    return {
        runsInProduction,
        handlesWebTraffic,
        prodImageType,
        port,
        copyPathSource,
        copyPathTarget
    };
}
