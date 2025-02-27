import {PartialContext} from "@builder/partial/PartialContext";
import {PartialDefinition} from "@builder/partial/types";

export default function (context: PartialContext): PartialDefinition {
    return {
        key: 'root',
        name: 'Root',
        standalone: true,
        versions: ['1.0'],
        selectable: false,
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files', '/');
        },
        buildFiles: async (fs, fb) => {
            await fb('bashly.yml').setSourceDir('/bin/_env/src').build();
            await fb('.gitignore').setSourceDir('/').build();
            await fb('.env.tpl').setSourceDir('/').build();
            await fb('Dockerfile').setSpecial('dockerfile').build();
            await fb('docker-compose.yml').setSpecial('dockerCompose').build();
        }
    }
}
