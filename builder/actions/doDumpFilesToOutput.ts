import * as fs from "fs";
import path from "path";
import {IFs} from "memfs";
import {Paths} from '../util/Paths';

export function doDumpFilesToOutput(fs: IFs, paths: Paths) {
    const outputDir = paths.outputDir;
    emptyDirectory(outputDir);
    recursivelyDumpFs(fs, '/', outputDir);
}

function emptyDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    fs.readdirSync(dirPath).forEach(file => {
        fs.rmSync(path.join(dirPath, file), {recursive: true, force: true});
    });
}

function recursivelyDumpFs(memFs: IFs, dirPath: string, targetPath: string) {
    const files = memFs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file + '');
        const targetFilePath = path.join(targetPath, file + '');
        if (memFs.statSync(filePath).isDirectory()) {
            fs.mkdirSync(targetFilePath);
            recursivelyDumpFs(memFs, filePath, targetFilePath);
        } else {
            const content = memFs.readFileSync(filePath, 'utf8');
            fs.writeFileSync(targetFilePath, content);
        }
    }
}
