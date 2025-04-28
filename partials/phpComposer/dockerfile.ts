import type {BodyBuilder} from '@boiler/partial/types.js';
import type {DockerfileBody} from '@boiler/filebuilder/body/DockerfileBody.js';

export const dockerfile: BodyBuilder<DockerfileBody> = async (body) => {
    // Add composer to dev image
    body.addHook('php', 'root:dependencies', `
# Add Composer
COPY --from=index.docker.io/library/composer:latest /usr/bin/composer /usr/bin/composer
    `);

    // Install composer dependencies for prod image
    body.addHook('php', 'prod:copy', `
# Install the composer dependencies, without running any scripts, this allows us to install the dependencies
# in a single layer and caching them even if the source files are changed
RUN --mount=type=cache,id=composer-cache,target=/var/www/html/.composer-cache \\
    --mount=type=bind,from=composer:2,source=/usr/bin/composer,target=/usr/bin/composer \\
    export COMPOSER_CACHE_DIR="/var/www/html/.composer-cache" \\
    && composer install --no-dev --no-progress --no-interaction --verbose --no-scripts --no-autoloader    
`);
    body.addHook('php', 'php:composer-autoload', `
# Dump the autoload file and run the matching scripts, after all the project files are in the image
RUN --mount=type=bind,from=composer:2,source=/usr/bin/composer,target=/usr/bin/composer \\
    composer dump-autoload --no-dev --optimize --no-interaction --verbose --no-scripts --no-cache
    `);
};
