import {PartialContext} from '@builder/partial/PartialContext.js';
import {PartialDefinition} from '@builder/partial/types.js';
import {dockerfile} from './dockerfile.js';
import {dockerComposeYml} from './dockerComposeYml.js';
import {confirm} from '@inquirer/prompts';
import {nginxConf} from './nginxConf.js';
import {replaceInFile} from '@builder/util/textUtils.js';

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
            await utils.loadAppSourcesRecursively('app', context);
            fs.constants;
            fs.mkdirSync('/docker/node', {recursive: true});
            utils.loadRecursive('files', '/');
        },
        buildFiles: async (fs, fb) => {
            await fb('node.entrypoint.dev.sh')
                .setDestinationDir('/docker/node')
                .setSpecial('entrypoint')
                .setContent('npm install\nnpm run dev')
                .build();

            // Replace the node container in the npm command
            replaceInFile(
                fs,
                '/bin/_env/commands/nodeCommands.ts',
                '%NODE_SERVICE%',
                context.getBuildContext().getRealPartialKey('node')
            );
        },
        bodyBuilders: async (collector) => {
            collector
                .add('Dockerfile', dockerfile(context), 'before')
                .add('docker-compose.yml', dockerComposeYml(handlesWebTraffic), 'before')
                .add('nginx.conf', nginxConf(handlesWebTraffic));
        }
    };
}
