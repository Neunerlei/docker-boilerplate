import {Hooks} from '@boiler/filebuilder/body/docker/PartialHookConsumer.js';
import {Instructions} from './Instructions';

export class ServiceSection {
    private readonly _partialKey: string;
    private readonly _hooks: Hooks;
    private readonly _instructions: Record<string, Instructions> = {};

    public constructor(partialKey: string, hooks: Hooks) {
        this._partialKey = partialKey;
        this._hooks = hooks;
    }

    public getRoot(): Instructions {
        return this.get('root');
    }

    public getRootAlias(): string {
        return this.getAlias('root');
    }

    public setCommonRootInstructions(baseImage: string): this {
        this.remove('root');
        this.getRoot()
            .add('from', `FROM ${baseImage} AS ${this.getRootAlias()}`)
            .add('arg.app_env', 'ARG APP_ENV=prod')
            .add('env.app_env', 'ENV APP_ENV=${APP_ENV}')
            .add('arg.docker_runtime', 'ARG DOCKER_RUNTIME=docker')
            .add('arg.docker_gid', 'ARG DOCKER_GID=1000')
            .add('arg.docker_uid', 'ARG DOCKER_UID=1000')
        ;
        return this;
    }

    public getDev(): Instructions {
        return this.get('dev');
    }

    public getDevAlias(): string {
        return this.getAlias('dev');
    }

    public getProd(): Instructions {
        return this.get('prod');
    }

    public getProdAlias(): string {
        return this.getAlias('prod');
    }

    public get(name: string): Instructions {
        if (!this._instructions[name]) {
            this._instructions[name] = new Instructions(
                this.getRootAlias(),
                this.getAlias(name),
                this._hooks.getProvider(this._partialKey)
            );
        }
        return this._instructions[name];
    }

    public getAlias(name: string): string {
        return this._partialKey + '_' + name;
    }

    public has(name: string): boolean {
        return this._instructions[name] !== undefined && this._instructions[name].size() > 0;
    }

    public remove(name: string): this {
        delete this._instructions[name];
        return this;
    }

    public toString(): string {
        const contents: Array<{ name: string, content: string }> = [];
        const addContent = (name: string) => {
            if (this.has(name)) {
                contents.push({name, content: this.get(name).toString()});
            }
        }

        addContent('root');
        for (const setName in this._instructions) {
            // Ignore built-in sections
            if (['root', 'dev', 'prod'].includes(setName)) {
                continue;
            }
            addContent(setName);
        }
        addContent('dev');
        addContent('prod');


        const output: Array<string> = [];
        output.push(`# =====================================================
# ${this._partialKey.toUpperCase()} service
# =====================================================`);

        let isFirst = true;
        for (const content of contents) {
            if (!isFirst) {
                output.push('\n\n');
                output.push('# -----------------------------------------------------');
            } else {
                isFirst = false;
            }

            output.push(`
# ${this._partialKey.toUpperCase()} - ${content.name.toUpperCase()}
# -----------------------------------------------------
${content.content}
`);
        }

        return output.join('');
    }
}
