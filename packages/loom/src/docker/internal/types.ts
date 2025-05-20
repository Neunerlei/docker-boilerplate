import type {Context} from '@loom/Context.js';

export interface DockerWriter {
    write(context: Context): Promise<void>;
}
