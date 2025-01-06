import fs from "fs";
import path from "path";
import {definitionDir} from "./constants";
import {DefinitionStructureList} from "./types";
import {parse} from "yaml";

export function readDefinitions(): DefinitionStructureList {
    const defs: DefinitionStructureList = {};
    fs.readdirSync(definitionDir).forEach(file => {
        if (!file.endsWith('.yaml')) {
            return;
        }

        try {
            const defFile = path.join(definitionDir, file);
            const content = fs.readFileSync(defFile, 'utf8');
            const def = parse(content);

            if (!def.name) {
                throw new Error(`Invalid definition file ${file}: Missing "name"`);
            }
            if (!def.base) {
                throw new Error(`Invalid definition file ${file}: Missing "base" definition`);
            }

            const key = file.replace('.yaml', '');
            def.addons = def.addons ?? [];
            defs[key] = {
                ...def,
                key: key,
                file: defFile,
            };
        } catch (e) {
            throw new Error(`Error reading definition ${file}: ${e.message}`);
        }
    });
    return defs;
}
