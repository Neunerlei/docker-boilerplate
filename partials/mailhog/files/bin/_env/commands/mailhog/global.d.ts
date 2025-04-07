import type {MailhogConfig} from './MailhogConfig';

declare module '@/Config.js' {
    interface Config {
        readonly mailhog: MailhogConfig;
    }
}
