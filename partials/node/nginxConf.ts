import {type BodyBuilder} from '@builder/partial/types';
import {NginxBody} from '@builder/filebuilder/body/NginxBody';

export function nginxConf(handlesWebTraffic: boolean): BodyBuilder<NginxBody> {
    return async (body) => {
        if (!handlesWebTraffic) {
            return;
        }

        await body.setServiceLocation('node', `
proxy_pass http://${body.getRealServiceName('node')}:8000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
`);
    };
}
