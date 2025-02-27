import {PartialContext} from "@builder/partial/PartialContext";
import {PartialDefinition} from "@builder/partial/types";
import {dockerfile} from './dockerfile';
import {dockerComposeYml} from './dockerComposeYml';
import {confirm} from '@inquirer/prompts';
import {nginxConf} from './nginxConf';

export default function (context: PartialContext): PartialDefinition {
    let handlesWebTraffic = true;
    return {
        key: 'node',
        name: 'Node.js',
        standalone: true,
        versions: ['23'],
        init: async () => {
            if (!context.isMainPartial()) {
                handlesWebTraffic = await confirm({
                    message: 'Node.js is not the main application. Should it handle web traffic?'
                });
            }
        },
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            await utils.loadAppSourcesRecursively('app', context)
        },
        fileBuilder: {
            'Dockerfile': {
                before: (...args) => dockerfile(context)(...args)
            },
            'docker-compose.yml': {
                before: (...args) => dockerComposeYml(handlesWebTraffic)(...args)
            },
            'nginx.conf': (...args) => nginxConf(handlesWebTraffic)(...args)
        }
    }
}
