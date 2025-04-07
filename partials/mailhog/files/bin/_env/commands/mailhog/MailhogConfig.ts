import {getEnvValue} from '@/EnvFile';

export class MailhogConfig {
    public readonly port: string = getEnvValue('MAILHOG_PORT', '1025');
}
