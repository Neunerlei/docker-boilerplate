import fs from "fs";
import path from "path";
import {baseDir, distDir} from "./constants";

export function cleanDistDirRecursively() {
    if (!fs.existsSync(distDir)) {
        return;
    }

    fs.readdirSync(distDir).forEach(file => {
        fs.rmSync(path.join(distDir, file), {recursive: true, force: true});
    });
}

export function copyBaseFiles() {
    fs.cpSync(baseDir, distDir, {recursive: true});
}
