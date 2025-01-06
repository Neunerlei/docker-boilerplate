import path from "path";
import fs from "fs";
import { AddonDoNginxReplaceAction, AddonDoReplaceAction, AddonStructure } from "../types";
import { distDir } from "../constants";
import { applyDoReplace } from "./applyDoReplace";

export function applyNginxReplace(action: AddonDoNginxReplaceAction, addon: AddonStructure) {
    const knownNginxFiles = [
        'docker/nginx/config/nginx.default.conf',
        'docker/nginx/config/nginx.dev.conf',
        'docker/nginx/config/nginx.dev.ssl.conf',
    ];

    for (const nginxFile of knownNginxFiles) {
        const targetPath = path.join(distDir, nginxFile);

        if (!fs.existsSync(targetPath)) {
            console.warn(`Nginx file ${targetPath} not found, skipping`);
            continue;
        }

        const replaceAction: AddonDoReplaceAction = {
            type: "replace",
            target: nginxFile,
            sources: {
                proxy: action.source
            }
        }

        applyDoReplace(replaceAction, addon);
    }
}