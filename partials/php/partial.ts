import {PartialContext} from "@builder/partial/PartialContext";
import {PartialDefinition} from "@builder/partial/types";
import {dockerfileFpmAlpine} from "./dockerfile";
import {dockerComposeYml} from './dockerComposeYml';
import {nginxConf} from './nginxConf';

export default function (context: PartialContext): PartialDefinition {
    return {
        key: 'php',
        name: 'PHP',
        standalone: true,
        versions: ['8.4'],
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            await utils.loadAppSourcesRecursively('app', context);
            utils.loadRecursive('files', '/')
        },
        buildFiles: async (fs, fb) => {
            await fb('php.dev.ini')
                .setParser('string')
                .setSourceDir('/docker/php/config')
                .build();
        },
        fileBuilder: {
            'Dockerfile': {
                before: dockerfileFpmAlpine
            },
            'docker-compose.yml': {
                before: dockerComposeYml
            },
            'nginx.conf': nginxConf
        }
    }
}
