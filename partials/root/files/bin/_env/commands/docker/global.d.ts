import type {DockerContext} from './DockerContext.js';
import type {DockerConfig} from './DockerConfig.js';

declare module "@/Context.ts" {
    interface Context {
        readonly docker: DockerContext;
    }
}

declare module "@/Config.js" {
    interface Config {
        readonly docker: DockerConfig;
    }
}
