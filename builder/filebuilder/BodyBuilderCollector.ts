import type {BodyBuilder} from '../partial/types';
import {StringBody} from './body/StringBody';
import {ObjectBody} from './body/ObjectBody';
import {DockerfileBody} from './body/DockerfileBody';
import {DockerComposeBody} from './body/DockerComposeBody';
import {NginxBody} from './body/NginxBody';
import {EntrypointBody} from './body/EntrypointBody';

export type BodyBuilderPosition = 'before' | 'after';

export type BodyBuilderState = Map<string, {
    before: Set<BodyBuilder>,
    after: Set<BodyBuilder>,
    default: Set<BodyBuilder>
}>;

export class BodyBuilderCollector {
    private readonly _state: BodyBuilderState;

    constructor(state: BodyBuilderState) {
        this._state = state;
    }

    public add(filename: '.gitignore', builder: BodyBuilder<StringBody>, position?: BodyBuilderPosition): this;
    public add(filename: '.env.tpl', builder: BodyBuilder<StringBody>, position?: BodyBuilderPosition): this;
    public add(filename: 'composer.json', builder: BodyBuilder<ObjectBody>, position?: BodyBuilderPosition): this;
    public add(filename: 'package.json', builder: BodyBuilder<ObjectBody>, position?: BodyBuilderPosition): this;
    public add(filename: '_env/package.json', builder: BodyBuilder<ObjectBody>, position?: BodyBuilderPosition): this;
    public add(filename: '_env/tsconfig.json', builder: BodyBuilder<ObjectBody>, position?: BodyBuilderPosition): this;
    public add(filename: 'Dockerfile', builder: BodyBuilder<DockerfileBody>, position?: BodyBuilderPosition): this;
    public add(filename: 'docker-compose.yml', builder: BodyBuilder<DockerComposeBody>, position?: BodyBuilderPosition): this;
    public add(filename: 'nginx.conf', builder: BodyBuilder<NginxBody>, position?: BodyBuilderPosition): this;
    public add(filename: 'php.dev.ini', builder: BodyBuilder<StringBody>, position?: BodyBuilderPosition): this;
    public add(filename: 'php.entrypoint.dev.sh', builder: BodyBuilder<EntrypointBody>, position?: BodyBuilderPosition): this;
    public add(filename: 'node.entrypoint.dev.sh', builder: BodyBuilder<EntrypointBody>, position?: BodyBuilderPosition): this;

    public add(filename: string, builder: BodyBuilder, position?: BodyBuilderPosition): this {
        if (!this._state.has(filename)) {
            this._state.set(filename, {before: new Set(), after: new Set(), default: new Set()});
        }

        if (position === 'before') {
            this._state.get(filename)!.before.add(builder);
        } else if (position === 'after') {
            this._state.get(filename)!.after.add(builder);
        } else {
            this._state.get(filename)!.default.add(builder);
        }

        return this;
    }
}
