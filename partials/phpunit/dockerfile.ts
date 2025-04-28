import {DockerfileBody} from '@boiler/filebuilder/body/DockerfileBody';
import type {BodyBuilder} from '@boiler/partial/types';

export const dockerfile: BodyBuilder<DockerfileBody> = async (body) => {
    body.addHook('php', 'root:dependencies', `
# Install xdebug
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \\
    --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \\
    apt-get update && apt-get upgrade -y \\
    && apt-get install -y $PHPIZE_DEPS \\
    && pecl install xdebug-3.4.1 \\
    && docker-php-ext-enable xdebug
    `);
};
