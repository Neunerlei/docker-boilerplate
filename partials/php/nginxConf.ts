import {FileBuilderCallback} from '@builder/partial/types';
import {NginxBody} from '@builder/filebuilder/body/NginxBody';

export const nginxConf: FileBuilderCallback<NginxBody> = async (body) => {
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
`)

    await body.setServiceLocation('php', `
fastcgi_pass   ${phpServiceName}:9000;
fastcgi_index  index.php;
fastcgi_param  SCRIPT_FILENAME  /var/www/html/public/index.php;
include        fastcgi_params;
`);
}
