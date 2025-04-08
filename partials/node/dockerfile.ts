import {DockerfileBody} from '@builder/filebuilder/body/DockerfileBody';
import {PartialContext} from '@builder/partial/PartialContext';
import type {BodyBuilder} from '@builder/partial/types';

export function dockerfile(context: PartialContext): BodyBuilder<DockerfileBody> {
    return async function (body) {
        const node = body.getForContext(context);
        const version = context.getVersion() ?? context.getDefinition().versions![0];
        const appSource = context.getBuildContext().getPartialDir(context.getKey());

        const image = 'node:' + version + '-bookworm';

        node.setCommonRootInstructions(image);

        // ROOT
        // ==========================================================
        node.getRoot()
            .add('workdir', 'WORKDIR /var/www/html');

        // DEV
        // ==========================================================
        node.getDev()
            .addDefaultFrom()
            .add('env.docker_runtime', 'ENV DOCKER_RUNTIME=${DOCKER_RUNTIME:-docker}')
            .add('env.app_env', 'ENV APP_ENV=dev')
            .add('run.addBasics', `
# Add basics
RUN --mount=type=cache,id=apt-cache,target=/var/cache/apt,sharing=locked \\
    --mount=type=cache,id=apt-lib,target=/var/lib/apt,sharing=locked \\
    apt-get update && apt-get upgrade -y && apt-get install -y \\
    sudo
`)
            .add('run.recreateUser', `
# Recreate the www-data user and group with the current users id
RUN (userdel -r $(getent passwd "\${DOCKER_UID}" | cut -d: -f1) || true) && \\
    (groupdel -f $(getent group "\${DOCKER_GID}" | cut -d: -f1) || true) && \\
    groupdel -f www-data || true && \\
    userdel -r www-data || true && \\
    groupadd -g \${DOCKER_GID} www-data && \\
    useradd -u \${DOCKER_UID} -g www-data www-data
`)
            .add('copy.entrypoint', 'COPY docker/node/node.entrypoint.dev.sh /usr/bin/app/boot.sh')
            .add('run.entrypointPermissions', 'RUN chmod +x /usr/bin/app/boot.sh')
            .add('entrypoint', 'ENTRYPOINT /usr/bin/app/boot.sh')
            .add('user.wwwData', 'USER www-data');

        // PROD
        // ==========================================================
        node.getProd()
            .addDefaultFrom()
            .add('copy.sources', `
# Add the app sources
COPY --chown=www-data:www-data .${appSource} .
`)
            .add('run.binaryPermissions', `
# Ensure correct permissions on the binaries
RUN find /var/www/html/bin -type f -iname "*.sh" -exec chmod +x {} \\;
`)
            .add('user.root', 'USER root')
            .add('entrypoint', 'ENTRYPOINT [ "npm", "run", "prod" ]')
        ;

    };
}
