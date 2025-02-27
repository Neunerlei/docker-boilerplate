import {Paths} from "../util/Paths";
import fs from "fs";
import path from "path";
import {PartialRegistry} from '../partial/PartialRegistry';

export async function doRegisterAvailablePartials(paths: Paths, registry: PartialRegistry) {
    const subDirNames = Array.from(fs.readdirSync(paths.partialsDir));
    for (const subDirName of subDirNames) {
        const subDirPath = path.join(paths.partialsDir, subDirName);
        if (!fs.statSync(subDirPath).isDirectory()) {
            continue;
        }

        const includePath = path.join(subDirPath, 'partial.ts');
        if (!fs.existsSync(includePath)) {
            continue;
        }

        const loaded = await import(includePath);

        if (!loaded.default) {
            throw new Error(`No default export found in ${includePath}`);
        }

        if (typeof loaded.default !== 'function') {
            throw new Error(`Default export in ${includePath} is not a function`);
        }

        registry.register(loaded.default);
    }
}
