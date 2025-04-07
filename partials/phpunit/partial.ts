import {PartialContext} from '@builder/partial/PartialContext';
import {PartialDefinition} from '@builder/partial/types';
import {composerJson} from './composerJson';
import {gitignore} from './gitignore';
import {dockerfile} from './dockerfile';

export default function (context: PartialContext): PartialDefinition {
    return {
        key: 'phpunit',
        name: 'PHPUnit',
        versions: ['9.5'],
        requires: ['php', 'phpComposer'],
        selectable: async (selected) => selected.includes('php'),
        sort: async r => r.after('php').after('phpComposer') && void 0,
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('appFiles', context.getBuildContext().getPartialDir('php'));
            utils.loadRecursive('files', '/');
        },
        bodyBuilders: async (collector) => {
            collector
                .add('composer.json', composerJson)
                .add('.gitignore', gitignore)
                .add('Dockerfile', dockerfile);
        }
    };
}
