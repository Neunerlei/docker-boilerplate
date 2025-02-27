import {FileBuilderCallback} from '@builder/partial/types';
import {DockerfileBody} from '@builder/filebuilder/body/DockerfileBody';

export const dockerfile: FileBuilderCallback<DockerfileBody> = async (body) => {
    body
        .get('php')
        .getDev()
        .addAfter('run.xdebug', 'run.addSudo', `
# Install xdebug
RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk rm -rf /etc/apk/cache && ln -s /var/cache/apk /etc/apk/cache && \\
apk update && apk upgrade && apk add --no-cache $PHPIZE_DEPS \\
&& apk add --update linux-headers \\
&& pecl install xdebug-3.4.1 \\
&& docker-php-ext-enable xdebug
`)
}
