import {PartialContext} from '@builder/partial/PartialContext';
import {PartialDefinition} from '@builder/partial/types';
import {bashlyYml} from './bashlyYml';
import {NginxBody} from '@builder/filebuilder/body/NginxBody';
import {replaceMarkerWithIndent} from '@builder/util/replaceMarkerWithIndent';
import {dockerComposeYml} from './dockerComposeYml';

export default function (context: PartialContext): PartialDefinition {
    return {
        key: 'nginx',
        name: 'Nginx',
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files', '/');
        },
        buildFiles: async (fs, fb) => {
            await fb('nginx.conf')
                .setSpecial('nginx')
                .setSaver<NginxBody>(async ({body, context}) => {
                    const fs = context.getFs();

                    const knownNginxFiles = [
                        '/docker/nginx/config/nginx.default.conf',
                        '/docker/nginx/config/nginx.dev.conf',
                        '/docker/nginx/config/nginx.dev.ssl.conf'
                    ];

                    const locations = body.toLocationString();
                    for (const nginxFile of knownNginxFiles) {
                        fs.writeFileSync(nginxFile,
                            replaceMarkerWithIndent(
                                '###{locations}###',
                                locations,
                                fs.readFileSync(nginxFile, 'utf-8') + ''
                            )
                        );
                    }
                })
                .build();
        },
        fileBuilder: {
            'bashly.yml': bashlyYml,
            'docker-compose.yml': {
                before: dockerComposeYml
            }
        }
    }
}
