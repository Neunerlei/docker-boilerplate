import {PartialDefinition} from '@boiler/partial/types';
import {NginxBody, type NginxFileType} from '@boiler/filebuilder/body/NginxBody';
import {replaceMarkerWithIndent} from '@boiler/util/textUtils.js';
import {dockerComposeYml} from './dockerComposeYml';

export default function (): PartialDefinition {
    return {
        key: 'nginx',
        name: 'Nginx',
        loadFiles: async (_, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files', '/');
        },
        buildFiles: async (_, fb) => {
            await fb('nginx.conf')
                .setSpecial('nginx')
                .setSaver<NginxBody>(async ({body, context: {fs}}) => {
                    const knownNginxFiles: Array<{ type: NginxFileType, src: string }> = [
                        {type: 'prod', src: '/docker/nginx/config/nginx.default.conf'},
                        {type: 'dev', src: '/docker/nginx/config/nginx.dev.conf'},
                        {type: 'devSsl', src: '/docker/nginx/config/nginx.dev.ssl.conf'}
                    ];

                    for (const {type, src: nginxFile} of knownNginxFiles) {
                        const locations = body.toLocationString(type);
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
        bodyBuilders: async (collector) => {
            collector.add('docker-compose.yml', dockerComposeYml, 'before');
        }
    };
}
