import {Partial} from '@boiler/partial/Partial.js';
import {PartialDefinition} from '@boiler/partial/types.js';
import {dockerfile} from './dockerfile.js';
import {dockerComposeYml, dockerComposeYmlNginxShare} from './dockerComposeYml.js';
import {nginxConf} from './nginxConf.js';
import {replaceInFile} from '@boiler/util/textUtils.js';
import {askForUsage, type NodeUsage} from './askForUsage.js';

export default function (partial: Partial): PartialDefinition {
    let usage: NodeUsage | undefined;

    return {
        key: 'node',
        name: 'Node.js',
        standalone: true,
        versions: ['23'],
        init: async () => {
            usage = await askForUsage(partial);
        },
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            await utils.loadAppSourcesRecursively('app', partial);
            fs.mkdirSync('/docker/node', {recursive: true});
            utils.loadRecursive('files', '/');
        },
        buildFiles: async (fs, fb) => {
            await fb('node.entrypoint.dev.sh')
                .setDestinationDir('/docker/node')
                .setSpecial('entrypoint')
                .setContent('npm install\nnpm run dev')
                .build();
            
            fs.chmodSync('/docker/node/node.entrypoint.dev.sh', 0o755);

            // Replace the node container in the npm command
            replaceInFile(
                fs,
                '/bin/_env/addons/node.addon.ts',
                '%NODE_SERVICE%',
                partial.key
            );
        },
        bodyBuilders: async (collector) => {
            if (!usage) {
                throw new Error('Usage is not set, something is wrong in the partial');
            }

            collector
                .add('Dockerfile', dockerfile(usage), 'before')
                .add('docker-compose.yml', dockerComposeYml(usage), 'before')
                .add('nginx.conf', nginxConf(usage));

            if (usage.createPublicShare) {
                collector.add('docker-compose.yml', dockerComposeYmlNginxShare);
            }
        }
    };
}
