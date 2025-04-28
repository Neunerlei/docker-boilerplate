import {DockerfileBody} from '@boiler/filebuilder/body/DockerfileBody';
import type {BodyBuilder} from '@boiler/partial/types.js';

export const dockerfileFpmDebian: BodyBuilder<DockerfileBody> =
    async function (body, {partial}) {
        const php = body.add('php');
        const {version, outputDirectory} = partial;

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
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \\
    --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \\
    apt-get update && apt-get upgrade -y && apt-get install -y \\
    sudo
`)
            .addFromHook('root:dependencies')
            .add('run.replacePhpIni', `
# Because we inherit from the prod image, we don't actually want the prod settings
COPY docker/php/config/php.dev.ini /usr/local/etc/php/conf.d/zzz.app.dev.ini
RUN rm -rf /usr/local/etc/php/conf.d/zzz.app.prod.ini
`)
            .add('run.recreateUser', `
# Recreate the www-data user and group with the current users id
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \\
    --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \\
    apt-get update && apt-get install -y usermod && \\
    groupdel -f www-data || true && \\
    userdel -r www-data || true && \\
    groupadd -g \${DOCKER_GID} www-data && \\
    useradd -u \${DOCKER_UID} -g www-data www-data
`)
            .add('copy.entrypoint', 'COPY docker/php/php.entrypoint.dev.sh /user/bin/app/entrypoint.local.sh')
            .add('user.wwwData', 'USER www-data');

        // PROD
        // ==========================================================
        php.getProd()
            .addDefaultFrom()
            .add('run.umask', 'RUN echo "umask 000" >> /root/.bashrc')
            .add('user.wwwData', 'USER www-data')
            .add('copy.sources', `
# Add the app sources
COPY --chown=www-data:www-data .${outputDirectory} .
`)
            .addFromHook('prod:copy')
            .add('run.binaryPermissions', `
# Ensure correct permissions on the binaries
RUN find /var/www/html/bin -type f -iname "*.sh" -exec chmod +x {} \\; || true
`)
            .addFromHook('php:composer-autoload')
            .add('user.root', 'USER root');
    };

export const dockerfileRedisAddon: BodyBuilder<DockerfileBody> = async (body) => {
    const php = body.get('php').getRoot();

    php.add('run.installRedis', `
# Install redis extension
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \\
    --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked\\
    --mount=type=bind,from=mlocati/php-extension-installer:1.5,source=/usr/bin/install-php-extensions,target=/usr/local/bin/install-php-extensions \\
    install-php-extensions \\
    redis
`);
};
