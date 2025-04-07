import type {Command} from 'commander';
import type {Context} from './Context.js';

export interface EnvPackageInfo {
    name: string,
    version: string,
    description: string
}

export type CommandEntrypoint = (program: Command, context: Context) => Promise<void>;
