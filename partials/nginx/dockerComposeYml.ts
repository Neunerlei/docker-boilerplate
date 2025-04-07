import {DockerComposeBody} from '@builder/filebuilder/body/DockerComposeBody';
import type {BodyBuilder} from '@builder/partial/types.ts';

export const dockerComposeYml: BodyBuilder<DockerComposeBody> = async (body, _, context) => {
    body.setService('nginx', {
        image: 'nginx:1.27-alpine',
        container_name: '${PROJECT_NAME}-nginx',
        volumes: [
            './docker/nginx/config/ssl:/etc/nginx/certs',
            './docker/nginx/config/nginx.dev.conf:/etc/nginx/nginx.conf:ro'
        ],
        ports: [
            '${DOCKER_PROJECT_IP:-127.0.0.1}:80:80',
            '${DOCKER_PROJECT_IP:-127.0.0.1}:443:443'
        ],
        depends_on: [
            'app'
        ],
        healthcheck: {
            test: 'curl --fail http://localhost || exit 1',
            interval: '10s',
            timeout: '3s',
            retries: 3,
            start_period: '10s'
        }
    });
};
