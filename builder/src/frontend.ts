import path from "path";
import fs from "fs";
import { AddonStructure } from "./types";
import { replaceInFile, replaceInString } from "./replaceQueue";

let frontendAddonUsed = false;

export function replaceFrontendServiceName(fileOrDir: string, addon: AddonStructure) {
    const serviceName = getServiceName(addon.isFrontend ?? false);

    try {
        if (fs.statSync(fileOrDir).isDirectory()) {
            replaceInDirRecursively(fileOrDir, serviceName);
        } else {
            replaceInFile(fileOrDir, 'service_name', serviceName);
        }
    } catch (error) {
       throw new Error(`Error replacing frontend service name in ${fileOrDir}: ${error}`);
    }
}

export function replaceFrontendServiceNameInString(str: string, addon: AddonStructure) {
    const serviceName = getServiceName(addon.isFrontend ?? false);
    return replaceInString(str, 'service_name', serviceName);
}

export function setFrontendAddonUsed() {
    frontendAddonUsed = true;
}

export function hasFrontendAddon() {
    return frontendAddonUsed;
}

function getServiceName(isFrontend: boolean) {
    return isFrontend ? 'frontend' : 'app';
}

function replaceInDirRecursively(dir: string, serviceName: string) {
    for (const file of fs.readdirSync(dir)) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            replaceInDirRecursively(filePath, serviceName);
            renameDirIfNeeded(filePath, serviceName);
        } else {
            replaceInFile(filePath, 'service_name', serviceName);
        }
    }
    renameDirIfNeeded(dir, serviceName);
}

function renameDirIfNeeded(dir: string, serviceName: string) {
    const baseName = path.basename(dir);
    if (baseName == '__service_name') {
        if(fs.existsSync(dir)) {
            fs.renameSync(dir, path.join(path.dirname(dir), serviceName));
        }
    }
}
