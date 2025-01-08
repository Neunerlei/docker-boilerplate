import path from "path";
import fs from "fs";
import { AddonDoNginxReplaceAction, AddonDoReplaceAction, AddonStructure } from "../types";
import { distDir } from "../constants";
import { applyDoReplace } from "./applyDoReplace";
import { resolveReplacement } from "../replaceQueue";
import { hasFrontendAddon, replaceFrontendServiceNameInString } from "../frontend";

export function applyNginxReplace(action: AddonDoNginxReplaceAction, addon: AddonStructure) {
    const knownNginxFiles = [
        'docker/nginx/config/nginx.default.conf',
        'docker/nginx/config/nginx.dev.conf',
        'docker/nginx/config/nginx.dev.ssl.conf',
    ];

    let proxy = replaceFrontendServiceNameInString(
        resolveReplacement(action.source, addon),
        addon
    );

    if(hasFrontendAddon() && !addon.isFrontend){
        proxy = proxy.replace('location / {', 'location /backend {' );
    }

    for (const nginxFile of knownNginxFiles) {
        const targetPath = path.join(distDir, nginxFile);

        if (!fs.existsSync(targetPath)) {
            continue;
        }
        
        const replaceAction: AddonDoReplaceAction = {
            type: "replace",
            target: nginxFile,
            sources: { proxy }
        }

        applyDoReplace(replaceAction, addon);
    }
}