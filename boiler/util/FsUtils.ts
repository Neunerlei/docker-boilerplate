import {IFs} from 'memfs';
import * as fs from 'fs';
import * as path from 'path';
import {Partial} from '../partial/Partial.js';
import {askForAlternativeAppSourcesDirectory} from '../actions/askForAlternativeAppSourcesDirectory';

export class FsUtils {
    private _fs: IFs;
    private _basePath: string;

    constructor(fs: IFs) {
        this._fs = fs;
    }

    public setBasePath(path: string) {
        this._basePath = path;
    }

    public loadFile(filePath: string, targetPath?: string) {
        const content = fs.readFileSync(this.makeFullPath(filePath), 'utf8');
        this._fs.writeFileSync(targetPath ?? path.join('/', filePath), content);
    }

    public loadRecursive(dirPath: string, targetPath?: string) {
        const files = fs.readdirSync(this.makeFullPath(dirPath));
        targetPath = targetPath ?? path.join('/', dirPath);
        if (!this._fs.existsSync(targetPath)) {
            this._fs.mkdirSync(targetPath);
        }
        for (const file of files) {
            const filePath = `${dirPath}/${file}`;
            const targetFilePath = `${targetPath}/${file}`;
            if (fs.statSync(this.makeFullPath(filePath)).isDirectory()) {
                if (!this._fs.existsSync(targetFilePath)) {
                    this._fs.mkdirSync(targetFilePath);
                }
                this.loadRecursive(filePath, targetFilePath);
            } else {
                this.loadFile(filePath, targetFilePath);
            }
        }
    }

    public async loadAppSourcesRecursively(dirPath: string, partial: Partial) {
        let outputDirectory = partial.outputDirectory;
        if (outputDirectory === '/app' && !partial.isApp) {
            const realTargetPath = await askForAlternativeAppSourcesDirectory(
                partial.key,
                partial.buildContext.partials.app.key
            );
            outputDirectory = path.join('/', realTargetPath.replace(/^\//, ''));
            partial.buildContext.partials.useOutputDirectoryFor(partial.key, outputDirectory);
        }
        this.loadRecursive(dirPath, outputDirectory);
    }

    private makeFullPath(p: string) {
        if (!this._basePath) {
            return p;
        }

        return path.join(this._basePath, p);
    }
}
