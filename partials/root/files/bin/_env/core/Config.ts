import type {Paths} from './Paths.js';
import * as fs from 'node:fs';
import type {EnvFile} from './EnvFile.js';

let loadedEnvFile: EnvFile | undefined = undefined;
let loadedConfig: Map<string, any> = new Map();

export class Config {
    public registerAddon(key: string, addon: object) {
        Object.defineProperty(this, key, {
            get: () => addon
        });
    }
}

export function makeConfig(env: EnvFile, paths: Paths): Config {
    loadedEnvFile = env;
    loadConfigFromFile(paths);
    return new Config();
}

function loadConfigFromFile(paths: Paths) {
    if (fs.existsSync(paths.configFilePath)) {
        const content = fs.readFileSync(paths.configFilePath);
        for (const [key, value] of Object.entries(JSON.parse(content.toString('utf-8')))) {
            loadedConfig.set(key, value);
        }
    }
}

export function dumpConfigToFile(paths: Paths) {
    const obj = {};
    for (const [key, value] of loadedConfig) {
        obj[key] = value;
    }
    fs.writeFileSync(paths.configFilePath, JSON.stringify(obj, null, 4));
}

export function getConfigValue(key: string, fallback?: any, envKey?: string): any {
    if (loadedConfig.has(key)) {
        return loadedConfig.get(key);
    } else if (loadedEnvFile && envKey && loadedEnvFile.has(envKey)) {
        const v = loadedEnvFile.get(envKey);
        loadedConfig.set(key, v);
        return v;
    } else if (fallback) {
        loadedConfig.set(key, fallback);
        return fallback;
    } else {
        throw new Error(`Missing required option: ${key}`);
    }
}
