import {PartialContext} from "@builder/partial/PartialContext";
import {PartialDefinition} from "@builder/partial/types";
import {bashlyYml} from "./bashlyYml";

export default function (context: PartialContext): PartialDefinition {
    return {
        key: 'phpComposer',
        name: 'PHP Composer',
        selectable: async (selected) => selected.includes('php'),
        sort: async r => r.after('php') && void 0,
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files');
        },
        buildFiles: async (fs, fb) => {
            await fb('composer.json')
                .setDestinationDirToService('php')
                .setContent({
                    "name": "new-project",
                    "description": "A boilerplate for creating new projects",
                    "type": "project",
                    "license": "Apache-2.0",
                    "require": {}
                })
                .build();
        },
        fileBuilder: {
            'bashly.yml': bashlyYml
        }
    }
}
