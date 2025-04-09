import type {BodyBuilder} from '@builder/partial/types.ts';
import type {DockerfileBody} from '@builder/filebuilder/body/DockerfileBody.ts';

export const dockerfile: BodyBuilder<DockerfileBody> = async (body) => {
    const php = body.get('php');

    // Add composer to dev image
    php.getDev()
        .addAfter('copy.addComposer', 'run.addSudo', `
# Add Composer
COPY --from=index.docker.io/library/composer:latest /usr/bin/composer /usr/bin/composer
`);

    // Install composer dependencies for prod image
    php.getProd()
        .addAfter('run.composerInstall', 'copy.sources', `
# Install the composer dependencies, without running any scripts, this allows us to install the dependencies
# in a single layer and caching them even if the source files are changed
RUN --mount=type=cache,id=composer-cache,target=/var/www/html/.composer-cache \\
    --mount=type=bind,from=composer:2,source=/usr/bin/composer,target=/usr/bin/composer \\
    export COMPOSER_CACHE_DIR="/var/www/html/.composer-cache" \\
    && composer install --no-dev --no-progress --no-interaction --verbose --no-scripts --no-autoloader
`)
        .addBefore('run.composerAutoload', 'user.root', `
# Dump the autoload file and run the matching scripts, after all the project files are in the image
RUN --mount=type=bind,from=composer:2,source=/usr/bin/composer,target=/usr/bin/composer \\
    composer dump-autoload --no-dev --optimize --no-interaction --verbose --no-scripts --no-cache
`);
};
