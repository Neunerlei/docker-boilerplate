import type {DockerWriter} from '@loom/docker/internal/types.js';
import type {Context} from '@loom/Context.js';

export class DockerConfigWriter implements DockerWriter {
    public constructor(
        private readonly compose: DockerWriter,
        private readonly dockerfile: DockerWriter
    ) {
    }

    public async write(context: Context): Promise<void> {
        await this.compose.write(context);
        await this.dockerfile.write(context);
    }
}
