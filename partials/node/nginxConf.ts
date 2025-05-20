import {type BodyBuilder} from '@boiler/partial/types';
import type {NodeUsage} from './askForUsage.js';
import type {NginxBody} from '../nginx/filebuilder/NginxBody.js';

export function nginxConf(usage: NodeUsage): BodyBuilder<NginxBody> {
    return async (body, {partial}) => {
        if (!usage.handlesWebTraffic) {
            return;
        }

        const location = body.getPartialLocation(partial, `
proxy_pass http://${partial.key}:${usage.port};
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
`);

        if (usage.runsInProduction) {
            body.addToAll(location);
        } else {
            body.addToAllDev(location);
            if (usage.createPublicShare) {
                body.prod.set(body.getPartialLocation(partial, `alias /var/www/html/${partial.key}_public;`));
            }
        }
    };
}
