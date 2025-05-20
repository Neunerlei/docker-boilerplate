import {PartialDefinition} from '@boiler/partial/types';
import {dockerComposeYml} from './dockerComposeYml';
import {NginxBody} from './filebuilder/NginxBody.js';
import {askForRouting} from './askForRouting.js';
import type {Locations} from './filebuilder/Locations.js';
import {replaceMarkerWithIndent} from '@boiler/util/textUtils.js';

export default function (): PartialDefinition {
    return {
        key: 'nginx',
        name: 'Nginx',
        events: async (events) => {
            events.on('filebuilder:collect:specialFactories', async ({factories}) => {
                factories.nginx = () => new NginxBody();
            });
        },
        loadFiles: async (_, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files', '/');
        },
        buildFiles: async (_, fb) => {
            await fb('nginx.conf')
                .setSpecial('nginx')
                .setSaver<NginxBody>(async ({body, context: {fs, partials}}) => {
                    await askForRouting(body, partials);
                    const bodies: Array<{ locations: Locations, src: string }> = [
                        {locations: body.dev, src: '/docker/nginx/config/nginx.dev.conf'},
                        {locations: body.devSsl, src: '/docker/nginx/config/nginx.dev.ssl.conf'},
                        {locations: body.prod, src: '/docker/nginx/config/nginx.default.conf'}
                    ];

                    for (const {locations, src} of bodies) {
                        fs.writeFileSync(src,
                            replaceMarkerWithIndent(
                                '###{locations}###',
                                locations.toString(),
                                fs.readFileSync(src, 'utf-8') + ''
                            )
                        );
                    }
                })
                .build();
        },
        bodyBuilders: async (collector) => {
            collector.add('docker-compose.yml', dockerComposeYml, 'before');
        }
    };
}
