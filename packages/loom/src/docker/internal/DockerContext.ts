import type {Context} from '@loom/Context.js';
import type {Fragment} from '@loom/fragments/Fragment.js';
import type {DockerConfig} from '@loom/docker/DockerConfig.js';

export class DockerContext {
    public readonly rootContext: Context;
    private _fragment: Fragment | undefined = undefined;
    private _config: DockerConfig | undefined = undefined;

    public constructor(rootContext: Context) {
        this.rootContext = rootContext;
    }

    public get fragment(): Fragment {
        if (!this._fragment) {
            throw new Error('Fragment is not set');
        }
        return this._fragment;
    }

    public setFragment(fragment: Fragment): this {
        this._fragment = fragment;
        return this;
    }

    public get config(): DockerConfig {
        if (!this._config) {
            throw new Error('Docker config is not set');
        }
        return this._config;
    }

    public setConfig(config: DockerConfig): this {
        if (this._config) {
            throw new Error('Docker config is already set');
        }
        this._config = config;
        return this;
    }
}
