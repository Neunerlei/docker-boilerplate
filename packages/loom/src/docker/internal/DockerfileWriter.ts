import type {DockerWriter} from '@loom/docker/internal/types.js';
import type {Context} from '@loom/Context.js';

export class DockerfileWriter implements DockerWriter {
    public write(context: Context): Promise<void> {
        return Promise.resolve(undefined);
    }
}
