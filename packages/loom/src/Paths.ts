import * as path from 'path';

export class Paths {
    public readonly loomDir: string;

    constructor(indexFilePath: string) {
        this.loomDir = path.dirname(indexFilePath);
    }

}
