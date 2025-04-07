import {StringBody} from '@builder/filebuilder/body/StringBody';
import type {BodyBuilder} from '@builder/partial/types';

export const envTpl: BodyBuilder<StringBody> = async function (body) {
    body.append(`
# Mysql
# ==========================
MYSQL_ROOT_PASSWORD=root
MYSQL_HOST=mysql
MYSQL_DB_NAME=db
MYSQL_USER=db
MYSQL_PASSWORD=db
MYSQL_PORT=3306
# ==========================
`, true);
};

export function envMysqlDockerComposeEnvironmentDefinition(): Record<string, string> {
    return {
        MYSQL_HOST: '${MYSQL_HOST}',
        MYSQL_DB_NAME: '${MYSQL_DB_NAME}',
        MYSQL_USER: '${MYSQL_USER}',
        MYSQL_PASSWORD: '${MYSQL_PASSWORD}',
        MYSQL_PORT: '${MYSQL_PORT}'
    };
}

export function envMysqlDockerComposeEnvironmentSelfDefinition(): Record<string, string> {
    // Enhance normal definition with root password
    return {
        ...envMysqlDockerComposeEnvironmentDefinition(),
        MYSQL_ROOT_PASSWORD: '${MYSQL_ROOT_PASSWORD}'
    };
}
