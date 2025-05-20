import {indentText} from '@boiler/util/textUtils';
import type {BodyBuilder} from '@boiler/partial/types';
import type {NginxBody} from '../nginx/filebuilder/NginxBody.js';

export const nginxConf = (createPublicShare: boolean): BodyBuilder<NginxBody> => {
    return async (body, {partial}) => {
        body.addToAll({
            key: 'fpm',
            label: 'PHP-FPM',
            route: '/fpm-',
            config: `
access_log off;
include fastcgi_params;
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
location /fpm-status {
    allow 127.0.0.1;
    # add additional IP's or Ranges
    deny all;
    fastcgi_pass ${partial.key}:9000;
    access_log off;
}
location /fpm-ping {
    fastcgi_pass ${partial.key}:9000;
    access_log off;
}
`
        });

        const fastcgiProxy = `
fastcgi_pass   ${partial.key}:9000;
fastcgi_index  index.php;
fastcgi_param  SCRIPT_FILENAME  /var/www/html/public/index.php;
include        fastcgi_params;
`;

        if (createPublicShare) {
            body.addToAll(body.getPartialLocation(partial, `
try_files $uri /var/www/html/${partial.key}_public/$uri /index.php?$query_string;
index index.php index.html index.htm;
location ~ .php$ {
${indentText(fastcgiProxy, 1)}
}
`));
        } else {
            body.addToAll(body.getPartialLocation(partial, fastcgiProxy));
        }
    };
};
