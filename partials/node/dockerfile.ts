import {DockerfileBody} from "@builder/filebuilder/body/DockerfileBody";
import {FileBuilderCallback} from "@builder/partial/types";
import {PartialContext} from "@builder/partial/PartialContext";

export function dockerfile(context: PartialContext): FileBuilderCallback<DockerfileBody> {
    return async function (body) {
        const node = body.getForContext(context);
        const version = context.getVersion() ?? context.getDefinition().versions![0];
        const appSource = context.getBuildContext().getPartialDir(context.getKey())

        const image = 'node:' + version + '-alpine';

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
RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk rm -rf /etc/apk/cache && ln -s /var/cache/apk /etc/apk/cache && \\
    apk update && apk upgrade && apk add \\
    sudo \\
    bash \\
    curl

`)
            .add('run.recreateUser', `
# Recreate the www-data user and group with the current users id
RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk rm -rf /etc/apk/cache && ln -s /var/cache/apk /etc/apk/cache && \\
    apk update && apk upgrade && apk add shadow \\
    && (deluser $(getent passwd \${DOCKER_UID} | cut -d: -f1) || true) \\
    && (userdel -r www-data || true) \\
    && (groupdel -f www-data || true) \\
    && groupadd -g \${DOCKER_GID} www-data \\
    && adduser -u \${DOCKER_UID} -D -S -G www-data www-data
`)
            .add('entrypoint', 'ENTRYPOINT [ "npm", "run", "dev" ]')
            .add('user.wwwData', 'USER www-data')

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

    }
}
