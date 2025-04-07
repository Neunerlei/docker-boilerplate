import {DockerfileBody} from '@builder/filebuilder/body/DockerfileBody';
import type {BodyBuilder} from '@builder/partial/types.ts';

export const dockerfileFpmDebian: BodyBuilder<DockerfileBody> =
    async function (body, _, context) {
        const php = body.add('php');
        const version = context.getPartialVersion('php');
        const appSource = context.getPartialDir('php');

        const image = 'neunerlei/php:' + version + '-fpm-debian';

        php.setCommonRootInstructions(image);

        // DEV
        // ==========================================================
        php.getDev()
            .addDefaultFrom()
            .add('env.docker_runtime', 'ENV DOCKER_RUNTIME=${DOCKER_RUNTIME:-docker}')
            .add('env.app_env', 'ENV APP_ENV=dev')
            .add('run.addSudo', `
# Add sudo command
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get upgrade -y && apt-get install -y \
    sudo
`)
            .add('copy.addComposer', `
# Add Composer
COPY --from=index.docker.io/library/composer:latest /usr/bin/composer /usr/bin/composer
`)
            .add('run.replacePhpIni', `
# Because we inherit from the prod image, we don't actually want the prod settings
COPY docker/php/config/php.dev.ini /usr/local/etc/php/conf.d/zzz.app.dev.ini
RUN rm -rf /usr/local/etc/php/conf.d/zzz.app.prod.ini
`)
            .add('run.recreateUser', `
# Recreate the www-data user and group with the current users id
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y usermod && \
    groupdel -f www-data || true && \
    userdel -r www-data || true && \
    groupadd -g \${DOCKER_GID} www-data && \
    useradd -u \${DOCKER_UID} -g www-data www-data
`)
            .add('copy.entrypoint', 'COPY docker/php/php.entrypoint.dev.sh /user/bin/app/boot.local.sh')
            .add('user.wwwData', 'USER www-data');

        // PROD
        // ==========================================================
        php.getProd()
            .addDefaultFrom()
            .add('run.umask', 'RUN echo "umask 000" >> /root/.bashrc')
            .add('user.wwwData', 'USER www-data')
            .add('run.composerInstall', `
# Install the composer dependencies, without running any scripts, this allows us to install the dependencies
# in a single layer and caching them even if the source files are changed
RUN --mount=type=cache,id=composer-cache,target=/var/www/html/.composer-cache \\
    --mount=type=bind,from=composer:2,source=/usr/bin/composer,target=/usr/bin/composer \\
    export COMPOSER_CACHE_DIR="/var/www/html/.composer-cache" \\
    && composer install --no-dev --no-progress --no-interaction --verbose --no-scripts --no-autoloader
`)
            .add('copy.sources', `
# Add the app sources
COPY --chown=www-data:www-data .${appSource} .
`)
            .add('run.binaryPermissions', `
# Ensure correct permissions on the binaries
RUN find /var/www/html/bin -type f -iname "*.sh" -exec chmod +x {} \\;
`)
            .add('run.composerAutoload', `
# Dump the autoload file and run the matching scripts, after all the project files are in the image
RUN --mount=type=bind,from=composer:2,source=/usr/bin/composer,target=/usr/bin/composer \\
    composer dump-autoload --no-dev --optimize --no-interaction --verbose --no-scripts --no-cache
`
            )
            .add('user.root', 'USER root')
        ;

    };
