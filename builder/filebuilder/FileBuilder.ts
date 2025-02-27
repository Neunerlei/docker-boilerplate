import {FileBuilderCallback} from "../partial/types";
import {AbstractBody} from "./body/AbstractBody";
import {BuildContext} from '../util/BuildContext';
import {StringBody} from './body/StringBody';
import {ObjectBody} from './body/ObjectBody';
import {DockerfileBody} from './body/DockerfileBody';
import {DockerComposeBody} from './body/DockerComposeBody';
import path from 'path';
import {parse as parseYaml, stringify as stringifyYaml} from 'yaml';
import {NginxBody} from './body/NginxBody';

export interface FileBuilderBodyConfig {
    filename: string;
    content?: any;
}

export type FileBuilderBodySaver<T = AbstractBody> = (args: {
    filename: string,
    content: string,
    body: T,
    context: BuildContext
}) => Promise<void>;
export type FileBuilderBodyBuilder = (config: FileBuilderBodyConfig) => AbstractBody;
export type FileBuilderParser = 'json' | 'yaml' | 'string';

const specialFactories = {
    dockerfile: (context: BuildContext) => new DockerfileBody(context),
    dockerCompose: (context: BuildContext) => new DockerComposeBody(context),
    nginx: (context: BuildContext) => new NginxBody(context)
}

export class FileBuilder {
    private readonly _filename: string;
    private readonly _context: BuildContext;
    private _bodyBuilder: FileBuilderBodyBuilder;
    private _parser: FileBuilderParser = 'string';
    private _sourceDir: string | undefined;
    private _destinationDir: string | undefined;
    private _special: keyof typeof specialFactories | undefined;
    private _content: any;
    private _saver: FileBuilderBodySaver<any> | undefined;

    public constructor(
        filename: string,
        context: BuildContext
    ) {
        this._filename = filename;
        this._context = context;

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
     * @param service
     */
    public setDestinationDirToService(service: string): this {
        return this.setDestinationDir(this._context.getPartialDir(service));
    }

    /**
     * Sets the special type of the body. Using this will disable the content reading and parsing.
     * It will also disable the default/defined body builder. This is used for internal body types like Dockerfile or Nginx.
     * @param special
     */
    public setSpecial(special: keyof typeof specialFactories): this {
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
     * @param builder
     */
    public setBodyBuilder(builder: FileBuilderBodyBuilder): this {
        this._bodyBuilder = builder;
        return this;
    }

    /**
     * Load the body, execute all callbacks and save the file to the file system.
     */
    public async build(): Promise<void> {
        const body = this.buildBody();
        await this.populateBody(body);
        this.persistBody(body);
    }

    private buildBody(): AbstractBody {
        return this.buildSpecialBody()
            ?? this.buildBodyWithContent(this.readBodyContent());
    }

    private buildSpecialBody(): AbstractBody | undefined {
        if (this._special) {
            if (specialFactories[this._special]) {
                return specialFactories[this._special](this._context);
            }

            throw new Error(`Unknown special file type: ${this._special}`);
        }
    }

    private buildBodyWithContent(content: any): AbstractBody {
        if (typeof this._bodyBuilder === 'function') {
            const config: FileBuilderBodyConfig = {
                filename: this._filename,
                content
            }
            return this._bodyBuilder(config);
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
                content = this._context.getFs().readFileSync(
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
        const before: FileBuilderCallback[] = [];
        const build: FileBuilderCallback[] = [];
        const after: FileBuilderCallback[] = [];

        const buildContext = this._context;

        for (const key of await buildContext.getPartialStack().getSortedKeys()) {
            const partial = buildContext.getPartialRegistry().get(key);
            let builder = partial?.fileBuilder?.[this._filename];
            if (builder === undefined) {
                continue;
            }

            if (typeof builder === 'function') {
                builder = {build: builder};
            }

            if (typeof builder.before === 'function') {
                before.push(builder.before);
            }
            if (typeof builder.build === 'function') {
                build.push(builder.build);
            }
            if (typeof builder.after === 'function') {
                after.push(builder.after);
            }
        }

        const stack = [...before, ...build, ...after];

        for (const fn of stack) {
            await fn(body, this._filename, buildContext);
        }
    }

    private persistBody(body: AbstractBody) {
        const filename = this._filename;
        const outputDir = this._destinationDir || this._sourceDir || '/';
        const outputPath = path.join(outputDir, filename);

        const outputParser = body.outputParser?.() || this._parser || 'string';
        const value = body.getValue();

        let content = '';
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
            (this._saver)({filename, content, body, context: this._context});
        } else {
            this._context.getFs().writeFileSync(outputPath, content);
        }
    }
}
