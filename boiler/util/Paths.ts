import * as path from 'path';

export class Paths {
    private readonly _partialsDir: string;
    private readonly _outputDir: string;

    constructor(applicationFilePath: string) {
        const coreDir = path.dirname(applicationFilePath);
        const boilerDir = path.dirname(coreDir);
        const rootDir = path.dirname(boilerDir);
        this._partialsDir = path.join(rootDir, 'partials');
        this._outputDir = path.join(rootDir, 'out');
    }

    public get partialsDir() {
        return this._partialsDir;
    }

    public get outputDir() {
        return this._outputDir;
    }
}
