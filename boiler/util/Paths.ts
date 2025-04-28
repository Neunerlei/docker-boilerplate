import * as path from "path";

export class Paths {
    private readonly _indexFilePath: string;
    private readonly _builderDir: string;
    private readonly _rootDir: string;
    private readonly _partialsDir: string;
    private readonly _outputDir: string;

    constructor(indexFilePath: string) {
        this._indexFilePath = indexFilePath;
        this._builderDir = path.dirname(indexFilePath);
        this._rootDir = path.dirname(this._builderDir);
        this._partialsDir = path.join(this._rootDir, 'partials');
        this._outputDir = path.join(this._rootDir, 'out');
    }

    public get indexFilePath() {
        return this._indexFilePath;
    }

    public get builderDir() {
        return this._builderDir;
    }

    public get rootDir() {
        return this._rootDir;
    }

    public get partialsDir() {
        return this._partialsDir;
    }

    public get outputDir() {
        return this._outputDir;
    }
}
