import type {MailhogContext} from './MailhogContext.js';

declare module '@/Context.ts' {
    interface Context {
        readonly mailhog: MailhogContext;
    }
}
