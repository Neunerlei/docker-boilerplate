export class ServiceSection {
    private readonly _serviceName: string;
    private readonly _instructions: Record<string, Instructions> = {};

    public constructor(serviceName: string) {
        this._serviceName = serviceName;
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
            this._instructions[name] = new Instructions(this.getRootAlias(), this.getAlias(name));
        }
        return this._instructions[name];
    }

    public getAlias(name: string): string {
        return this._serviceName + '_' + name;
    }

    public has(name: string): boolean {
        return this._instructions[name] !== undefined && this._instructions[name].getInstructions().length > 0;
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


        const output = [];
        output.push(`# =====================================================
# ${this._serviceName.toUpperCase()} service
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
# ${this._serviceName.toUpperCase()} - ${content.name.toUpperCase()}
# -----------------------------------------------------
${content.content}
`);
        }

        return output.join('');
    }
}

import {Instructions} from "./Instructions";
