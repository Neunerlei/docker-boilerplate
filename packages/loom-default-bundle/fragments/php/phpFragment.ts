import {createLoomFragment} from '@urdev/loom/src/fragments/types.js';

export const phpFragment = createLoomFragment({
    name: 'PHP',
    description: 'Provides a container for executing PHP code.',
    allowRenaming: true,
    type: 'language',
    versions: ['8.4-debian'],
    provides: (version) => [
        'php',
        'php-fpm',
        version.endsWith('-debian') ? 'php-debian' : 'php-alpine'
    ]
}).withNode('default', {
    docker: async (docker) => {
        docker.addService().configure('dev', (service) => {
            service.enableBuildStep('neunerlei/php:8.4-debian');
            service.getBuildStep();
        });

        docker.mergeCompose({
            'foo': {}
        });
    }
});
