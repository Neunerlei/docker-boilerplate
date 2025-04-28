import type {BodyBuilder} from '@boiler/partial/types.js';
import type {StringBody} from '@boiler/filebuilder/body/StringBody.js';

export const envTpl: BodyBuilder<StringBody> = async (body) => {
    body.append(`
# Redis
# ==========================
REDIS_PASSWORD=password
REDIS_PORT=6379
REDIS_DATABASES=1
# ==========================
`, true);
};

export const envRedisDockerComposeEnvironmentDefinition: () => Record<string, string> = () => {
    return {
        REDIS_PASSWORD: '${REDIS_PASSWORD}',
        REDIS_PORT: '${REDIS_PORT}',
        REDIS_DATABASES: '${REDIS_DATABASES}'
    };
};
