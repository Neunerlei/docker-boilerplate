import {NginxBody} from '@builder/filebuilder/body/NginxBody';
import {textUtils} from '@builder/util/textUtils';
import type {BodyBuilder} from '@builder/partial/types';

export const nginxConf = (createPublicShare: boolean): BodyBuilder<NginxBody> => {
    return async (body) => {
        const phpServiceName = body.getRealServiceName('php');

        body.setLocation('fpm', '/fpm-', `
access_log off;
include fastcgi_params;
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
location /fpm-status {
    allow 127.0.0.1;
    # add additional IP's or Ranges
    deny all;
    fastcgi_pass ${phpServiceName}:9000;
    access_log off;
}
location /fpm-ping {
    fastcgi_pass ${phpServiceName}:9000;
    access_log off;
}
`);

        const fastcgiProxy = `
fastcgi_pass   ${phpServiceName}:9000;
fastcgi_index  index.php;
fastcgi_param  SCRIPT_FILENAME  /var/www/html/public/index.php;
include        fastcgi_params;
`;

        if (createPublicShare) {
            await body.setServiceLocation('php', `
try_files $uri $uri/ /index.php?$query_string;
index index.php index.html index.htm;
location ~ .php$ {
${textUtils(fastcgiProxy, 1)}
}
`);
        } else {
            await body.setServiceLocation('php', fastcgiProxy);
        }
    };
};
