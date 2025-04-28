import {DockerfileBody} from '@boiler/filebuilder/body/DockerfileBody';
import type {BodyBuilder} from '@boiler/partial/types';
import type {NodeUsage} from './askForUsage.js';
import type {ServiceSection} from '@boiler/filebuilder/body/docker/ServiceSection.js';

export function dockerfile(usage: NodeUsage): BodyBuilder<DockerfileBody> {
    return async function (body, {partial}) {
        const node = body.getForPartial(partial);
        const outputDirectory = partial.outputDirectory;

        const image = 'node:' + partial.version + '-bookworm';

        node.setCommonRootInstructions(image);

        // ROOT
        // ==========================================================
        node.getRoot()
            .addFromHook('root:dependencies')
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
    useradd -u \${DOCKER_UID} -g www-data -m www-data
`)
            .add('copy.entrypoint', 'COPY docker/node/node.entrypoint.dev.sh /usr/bin/app/entrypoint.sh')
            .add('run.entrypointPermissions', 'RUN chmod +x /usr/bin/app/entrypoint.sh')
            .add('entrypoint', 'ENTRYPOINT /usr/bin/app/entrypoint.sh')
            .add('user.wwwData', 'USER www-data');

        // PROD
        // ==========================================================
        if (usage.prodImageType === 'standalone') {
            defineStandaloneProdStep(node, outputDirectory);
        } else if (usage.prodImageType === 'copy') {
            defineCopyProdStep(body, node, outputDirectory, usage);
        } else if (usage.prodImageType === 'static') {
            defineStaticProdStep(node, outputDirectory, usage);
        }
    };
}

function defineStandaloneProdStep(node: ServiceSection, appSource: string): void {
    node.getProd()
        .addDefaultFrom()
        .add('copy.sources', `
# Add the app sources
COPY --chown=www-data:www-data .${appSource} .
`)
        .addFromHook('prod:copy')
        .add('run.binaryPermissions', `
# Ensure correct permissions on the binaries
RUN find /var/www/html/bin -type f -iname "*.sh" -exec chmod +x {} \\;
`)
        .add('run.install', 'RUN npm ci')
        .add('user.root', 'USER root')
        .add('entrypoint', 'ENTRYPOINT [ "npm", "run", "prod" ]')
    ;
}

function defineCopyProdStep(body: DockerfileBody, node: ServiceSection, outputDirectory: string, usage: NodeUsage): void {
    defineBuilderStep(node, outputDirectory);
    body.addHook('app', 'prod:copy', `
# Copy the build files
COPY --chmod=a+r --from=${node.getAlias('builder')} ${usage.copyPathSource} ${usage.copyPathTarget}
`);
}

function defineStaticProdStep(node: ServiceSection, outputDirectory: string, usage: NodeUsage): void {
    defineBuilderStep(node, outputDirectory);
    node.getProd()
        .add('from', 'FROM busybox:latest AS ' + node.getProdAlias())
        .add('workdir', 'WORKDIR ' + usage.copyPathTarget)
        .add('copy.node', `
# Copy the build files
COPY --chmod=a+r --from=${node.getAlias('builder')} ${usage.copyPathSource} ${usage.copyPathTarget}`)
        .add('volume', 'VOLUME ' + usage.copyPathTarget);
}

function defineBuilderStep(node: ServiceSection, outputDirectory: string): void {
    node.get('builder')
        .addDefaultFrom()
        .add('copy.sources', `
# Add the app sources
COPY --chown=www-data:www-data .${outputDirectory} .
`)
        .addFromHook('prod:copy')
        .add('run.install', 'RUN npm ci')
        .add('run.build', 'RUN npm run build');
}
