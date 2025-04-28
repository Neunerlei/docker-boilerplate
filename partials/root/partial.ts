import {PartialDefinition} from '@builder/partial/types.js';
import {ObjectBody} from '@builder/filebuilder/body/ObjectBody.ts';

export default function (): PartialDefinition {
    return {
        key: 'root',
        name: 'Root',
        standalone: true,
        versions: ['1.0'],
        selectable: false,
        loadFiles: async (_, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files', '/');
        },
        buildFiles: async (_, fb) => {
            await fb('.gitignore').setSourceDir('/').build();
            await fb('.env.tpl').setSourceDir('/').build();
            await fb('Dockerfile').setSpecial('dockerfile').build();
            await fb('docker-compose.yml').setSpecial('dockerCompose').build();
            await fb('_env/package.json').setSourceDir('/bin/').build();

            // We MUST generate this file dynamically, otherwise the IDE gets confused in the partial directory
            await fb('_env/tsconfig.json')
                .setDestinationDir('/bin/')
                .setBodyFactory(() => new ObjectBody({
                    compilerOptions: {
                        target: 'esnext',
                        module: 'Preserve',
                        moduleResolution: 'node',
                        allowImportingTsExtensions: true,
                        noEmit: true,
                        paths: {
                            '@/*': ['./core/*']
                        }
                    }
                }))
                .build();
        }
    };
}
