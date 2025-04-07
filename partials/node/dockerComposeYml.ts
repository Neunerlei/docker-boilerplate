import {type BodyBuilder} from '@builder/partial/types';
import {DockerComposeBody} from '@builder/filebuilder/body/DockerComposeBody';

export function dockerComposeYml(handlesWebTraffic: boolean): BodyBuilder<DockerComposeBody> {
    return async (body, _, context) => {
        const key = context.getRealPartialKey('node');
        const appSource = context.getPartialDir('node');

        const service: Record<any, any> = {
            container_name: '${PROJECT_NAME}-' + key,
            image: '${PROJECT_NAME}-' + key + ':dev',
            build: {
                context: '.',
                target: key + '_dev',
                args: [
                    'DOCKER_RUNTIME=${DOCKER_RUNTIME:-docker}',
                    'DOCKER_GID=${DOCKER_GID:-1000}',
                    'DOCKER_UID=${DOCKER_UID:-1000}'
                ]
            },
            restart: 'no',
            volumes: [
                '.' + appSource + ':/var/www/html'
            ],
            extra_hosts: [
                'host.docker.internal:host-gateway'
            ]
        };

        if (handlesWebTraffic) {
            service.healthcheck = {
                test: 'curl --fail http://localhost:8000 || exit 1',
                interval: '10s',
                timeout: '5s',
                retries: 3,
                start_period: '10s'
            };
            service.ports = [
                '${DOCKER_PROJECT_IP:-127.0.0.1}:8000:8000'
            ];
        }

        body.setService('node', service);
    };
}
