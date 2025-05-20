import type {ComposeServiceWriter} from '@loom/docker/internal/ComposeServiceWriter.js';
import type {DockerWriter} from '@loom/docker/internal/types.js';
import type {Context} from '@loom/Context.js';

export class ComposeFileWriter implements DockerWriter {
    public constructor(compose: Record<string, any>, services: ComposeServiceWriter[]) {

    }

    public write(context: Context): Promise<void> {
        return Promise.resolve(undefined);
    }
}
