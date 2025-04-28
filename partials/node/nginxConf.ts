import {type BodyBuilder} from '@builder/partial/types';
import {NginxBody, type NginxFileType} from '@builder/filebuilder/body/NginxBody';
import type {NodeUsage} from './askForUsage.js';

export function nginxConf(usage: NodeUsage): BodyBuilder<NginxBody> {
    return async (body, {partial}) => {
        if (!usage.handlesWebTraffic) {
            return;
        }

        // "undefined" means set this value in all variants
        const fileTypes: Array<NginxFileType> | undefined = usage.runsInProduction ? undefined : ['dev', 'devSsl'];

        await body.setPartialLocation('node', `
proxy_pass http://${partial.key}:${usage.port};
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
`, fileTypes);
    };
}
