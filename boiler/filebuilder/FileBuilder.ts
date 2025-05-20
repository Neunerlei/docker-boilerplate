import {AbstractBody} from './body/AbstractBody';
import {BuildContext} from '../util/BuildContext';
import {StringBody} from './body/StringBody';
import {ObjectBody} from './body/ObjectBody';
import path from 'path';
import {parse as parseYaml, stringify as stringifyYaml} from 'yaml';
import {BodyBuilderCollector, type BodyBuilderContextPartial, type BodyBuilderState} from './BodyBuilderCollector';

export interface FileBuilderBodyFactoryConfig {
    filename: string;
    content?: any;
}

export type FileBuilderBodySaver<T = AbstractBody> = (args: {
    filename: string,
    content: string,
    body: T,
    context: BuildContext
}) => Promise<void>;
export type FileBuilderBodyFactory = (
    config: FileBuilderBodyFactoryConfig,
    context: BuildContext
) => AbstractBody;
export type FileBuilderParser = 'json' | 'yaml' | 'string';

let bodyBuilderState: BodyBuilderState | undefined;

export class FileBuilder {
    private readonly _filename: string;
    private readonly _context: BuildContext;
    private readonly _specialFactories: Record<string, FileBuilderBodyFactory>;
    private _bodyFactory: FileBuilderBodyFactory;
    private _parser: FileBuilderParser = 'string';
    private _sourceDir: string | undefined;
    private _destinationDir: string | undefined;
    private _special: string | undefined;
    private _content: any;
    private _saver: FileBuilderBodySaver<any> | undefined;

    public constructor(
        filename: string,
        context: BuildContext,
        specialFactories: Record<string, FileBuilderBodyFactory>
    ) {
        this._filename = filename;
        this._context = context;
        this._specialFactories = specialFactories;

        if (filename.endsWith('.json')) {
            this._parser = 'json';
        } else if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
            this._parser = 'yaml';
        }
    }

    /**
     * Sets the initial content of the body, before it is passed along to the callbacks.
     * Setting this, will disable the file reading from the source directory as well as the "parser" setting.
     * @param content
     */
    public setContent(content: any): this {
        this._content = content;
        return this;
    }

    /**
     * By default, the suffix of the given filename is used to determine the parser.
     * You can always override this by setting the parser manually.
     * The parser is used to "read" the content of a file before it is passed along to the body builder
     * and to "write" the content of the body to a file. The input and output parser types are always the same.
     * @param parser
     */
    public setParser(parser: FileBuilderParser): this {
        this._parser = parser;
        return this;
    }

    /**
     * If given, the file can be read from the file system and used as the initial content of the body.
     * @param dir
     */
    public setSourceDir(dir: string): this {
        this._sourceDir = dir;
        return this;
    }

    /**
     * Defines the directory where the built file should be persisted.
     * If not configured, the source directory is used, meaning the file is overwritten.
     * @param dir
     */
    public setDestinationDir(dir: string): this {
        this._destinationDir = dir;
        return this;
    }

    /**
     * Does the same as "setDestinationDir", but uses the partial directory of the given service.
     * This will automatically place the file in the "app" directory, fi the service is the "app" service.
     * @param partialKey
     */
    public setDestinationDirToPartial(partialKey: string): this {
        return this.setDestinationDir(this._context.partials.getOrFail(partialKey).outputDirectory);
    }

    /**
     * Sets the special type of the body. Using this will disable the content reading and parsing.
     * It will also disable the default/defined body builder. This is used for internal body types like Dockerfile or Nginx.
     * @param special
     */
    public setSpecial(special: string): this {
        this._special = special;
        return this;
    }

    /**
     * Allows you to set a custom saver function, that is called after the body is built and populated.
     * This will replace the default file writing operation.
     *
     * @param saver
     */
    public setSaver<T = AbstractBody>(saver: FileBuilderBodySaver<T>): this {
        this._saver = saver;
        return this;
    }

    /**
     * A custom factory function that is used to build the body of the file.
     * This can be used if you want to extend
     * @param factory
     */
    public setBodyFactory(factory: FileBuilderBodyFactory): this {
        this._bodyFactory = factory;
        return this;
    }

    /**
     * Load the body, execute all callbacks and save the file to the file system.
     */
    public async build(): Promise<void> {
        const body = this.buildBody();
        await this.populateBody(body);
        await this.persistBody(body);
    }

    private buildBody(): AbstractBody {
        return this.buildSpecialBody()
            ?? this.buildBodyWithContent(this.readBodyContent());
    }

    private buildSpecialBody(): AbstractBody | undefined {
        if (this._special) {
            if (this._specialFactories[this._special]) {
                return this._specialFactories[this._special]({
                    filename: this._filename,
                    content: this._content
                }, this._context);
            }

            throw new Error(`Unknown special file type: ${this._special}`);
        }
    }

    private buildBodyWithContent(content: any): AbstractBody {
        if (typeof this._bodyFactory === 'function') {
            return this._bodyFactory({
                filename: this._filename,
                content
            }, this._context);
        }

        if (typeof content === 'object') {
            return new ObjectBody(content);
        }

        return new StringBody(content + '');
    }

    private readBodyContent(): any {
        let content = this._content;

        if (content === undefined) {
            if (this._sourceDir) {
                content = this._context.fs.readFileSync(
                    path.join(
                        this._sourceDir,
                        this._filename
                    ), 'utf-8'
                );
            }

            if (content) {
                if (this._parser === 'json') {
                    return JSON.parse(content + '');
                } else if (this._parser === 'yaml') {
                    return parseYaml(content + '');
                }
            }
        }

        return content;
    }

    private async populateBody(body: AbstractBody) {
        const builders = (await this.getResolvedBodyBuilders())?.get(this._filename);
        if (!builders) {
            return;
        }

        const stack = [...builders.before, ...builders.default, ...builders.after];

        for (const fn of stack) {
            await fn(body, this._filename);
        }
    }

    private async getResolvedBodyBuilders() {
        if (bodyBuilderState) {
            return bodyBuilderState;
        }

        const state: BodyBuilderState = new Map();
        const contextPartial: BodyBuilderContextPartial = {current: undefined};
        const collector = new BodyBuilderCollector(state, contextPartial);

        for (const partial of await this._context.partials.sortedUsed) {
            if (typeof partial?.definition.bodyBuilders !== 'function') {
                continue;
            }

            contextPartial.current = partial;
            await partial?.definition.bodyBuilders(collector);
            contextPartial.current = undefined;
        }

        bodyBuilderState = state;
        return state;
    }

    private async persistBody(body: AbstractBody) {
        const filename = this._filename;
        const outputDir = this._destinationDir || this._sourceDir || '/';
        const outputPath = path.join(outputDir, filename);

        const outputParser = body.outputParser?.() || this._parser || 'string';
        const value = body.getValue();

        let content: string;
        if (outputParser === 'json') {
            content = JSON.stringify(value, null, 2);
        } else if (outputParser === 'yaml') {
            content = stringifyYaml(value);
        } else {
            if (typeof (body as any).toString === 'function' && (body as any).toString !== Object.prototype.toString) {
                content = (body as any).toString();
            } else if (typeof value === 'string') {
                content = value;
            } else if (typeof value === 'object' && typeof value.toString === 'function') {
                content = value.toString();
            } else {
                content = JSON.stringify(value, null, 2);
            }
        }

        if (this._saver) {
            await (this._saver)({filename, content, body, context: this._context});
        } else {
            this._context.fs.writeFileSync(outputPath, content);
        }
    }
}
