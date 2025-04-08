import {getConfigValue} from '@/Config.ts';
import {getEnvValue} from '@/EnvFile.js';

export class DockerConfig {
    public readonly defaultServiceName: string = getConfigValue('defaultServiceName', 'app', 'SERVICE_NAME');
    public readonly defaultUid: string = getConfigValue('dockerUId', '1000', 'ENV_UID');
    public readonly defaultGid: string = getConfigValue('dockerGid', '1000', 'ENV_GID');
    public readonly projectDomainSuffix: string = getConfigValue('projectDomainSuffix', '.dev.local');
    public readonly projectName: string = getEnvValue('PROJECT_NAME');
    public readonly projectProtocol: string = getEnvValue('DOCKER_PROJECT_PROTOCOL', 'http');
    public readonly projectDomain: string = getEnvValue('DOCKER_PROJECT_DOMAIN', 'localhost');
    public readonly projectIp: string = getEnvValue('DOCKER_PROJECT_IP', '127.0.0.1');
    public readonly projectPort: string = getEnvValue('DOCKER_PROJECT_PORT', '80');
    public readonly shellsToUse: string[] = getConfigValue('shellList', 'bash,sh,zsh,dash,ksh', 'SHELLS_TO_USE').split(',').map((shell) => shell.trim());

    public get projectHost(): string {
        const expectedPort = this.projectProtocol === 'http' ? '80' : '443';
        const port = this.projectPort === expectedPort ? '' : `:${this.projectPort}`;
        return `${this.projectProtocol}://${this.projectDomain}${port}`;
    }
}
