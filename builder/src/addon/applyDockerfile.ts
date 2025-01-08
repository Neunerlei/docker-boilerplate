import { AddonDoDockerfileAction, AddonStructure } from "../types";
import path from "path";
import fs from "fs";
import { distDir } from "../constants";
import { resolveReplacement } from "../replaceQueue";

type DockerfileContext = {
    filename?: string;
    root?: string;
    app?: {
        baseImage: string;
        dev: string;
        prod: string;
    }
    frontend?: {
        baseImage: string;
        dev: string;
        builder?: string;
        builderDist?: string;
    }
}

const dockerfileContext: DockerfileContext = {
    filename: undefined,
    root: undefined,
    app: undefined,
    frontend: undefined,
}

export function applyDockerfile(action: AddonDoDockerfileAction, addon: AddonStructure) {
    if(!action.dev || !action.prod){
        throw new Error(`The dockerfile addon ${addon.name} requires a dev and prod Dockerfile, but neither is set`);
    }

    if(!dockerfileContext.root){
        const distDockerfile = path.join(distDir, 'Dockerfile');
        if(!fs.existsSync(distDockerfile)){
            throw new Error(`The dist Dockerfile ${distDockerfile} does not exist`);
        }
        dockerfileContext.filename = distDockerfile;
        dockerfileContext.root = fs.readFileSync(distDockerfile, 'utf8');
        fs.writeFileSync(distDockerfile, '');
    }

    if (addon.isFrontend){
        if (!action.frontend) {
            throw new Error(`The frontend addon ${addon.name} requires a frontend Dockerfile, but it is not set`);
        }

        dockerfileContext.frontend = {
            baseImage: action.baseImage,
            dev: resolveReplacement(action.frontend.source, addon),
            ...(
                action.frontend.builder ? {
                    builder: resolveReplacement(action.frontend.builder.source, addon),
                    builderDist: action.frontend.builder.dist,
                } : {}
            )
        }
    } else {
        dockerfileContext.app = {
            baseImage: action.baseImage,
            dev: resolveReplacement(action.dev.source, addon),
            prod: resolveReplacement(action.prod.source, addon),
        }
    }
}

export function applyDockerfileContext() {
    if (!dockerfileContext.root || !dockerfileContext.app || !dockerfileContext.filename) {
        return;
    }

    const buildHeader = (content: string) => {
        return `
# ===============================
# ${content}
# ===============================
`;
    }

    const getStepAlias = (serviceName: string, stepName: string) => {
        return serviceName + '_' + stepName;
    }

    const extractFirstFromAndAs = (content: string) => {
        const fromMarker = /FROM (.*?)( AS (.*?))?\n/i;
        const m = content.match(fromMarker);
        const from = m?.[1];
        const as = m?.[3];
        if (!from) {
            throw new Error('No FROM found in Dockerfile');
        }
        return { from, as };
    }

    const buildFromPattern = (params: { from: string, as: string | undefined }) => {
        if(params.as){
            return new RegExp('FROM ' + params.from + ' AS ' + params.as + '\n', 'i');
        }
        return new RegExp('FROM ' + params.from + '\n', 'i');
    }

    const buildRoot = (baseImage: string, serviceName: string) => {
        let root = dockerfileContext.root!;
        const from = extractFirstFromAndAs(root);
        if(from.from !== 'base'){
            throw new Error('Root must be FROM base, but is FROM ' + from.from);
        }
        if (from.as) {
            throw new Error('Failed to build Dockerfile root, because the first FROM in the base code already has an alias, this is not allowed');
        }
        const alias = getStepAlias(serviceName, 'root');
        const realFrom = 'FROM ' + baseImage + ' as ' + alias + '\n';
        return buildHeader(`${serviceName} root`) + root.replace(buildFromPattern(from), realFrom);
    }

    const buildSteps = (serviceName: string, stepName: string, steps: string) => {
        const from = extractFirstFromAndAs(steps);
        if (!from.from) {
            throw new Error('No FROM found in Dockerfile');
        }
        if(from.as){
            throw new Error('Failed to build Dockerfile steps, because the first FROM in the code of ' + serviceName + ' already has an alias, this is not allowed');
        }
        let fromAlias = from.from;
        if(fromAlias === 'root'){
            fromAlias = getStepAlias(serviceName, 'root');
        } else {
            fromAlias = getStepAlias(serviceName, fromAlias);
        }
        const alias = getStepAlias(serviceName, stepName);
        const realFrom = 'FROM ' + fromAlias + ' AS ' + alias + '\n';
        return buildHeader(`${serviceName} ${stepName}`) + steps.replace(buildFromPattern(from), realFrom);
    }

    const content = [];

    content.push(buildRoot(dockerfileContext.app.baseImage, 'app'));
    content.push(buildSteps('app', 'dev', dockerfileContext.app.dev));

    let hasBuilder = false;
    if(dockerfileContext.frontend){
        content.push(buildRoot(dockerfileContext.frontend.baseImage, 'frontend'));
        content.push(buildSteps('frontend', 'dev', dockerfileContext.frontend.dev));
        if(dockerfileContext.frontend.builder){
            content.push(buildSteps('frontend', 'builder', dockerfileContext.frontend.builder));
            hasBuilder = true;
        }
    }

    let prodSteps = buildSteps('app', 'prod', dockerfileContext.app.prod);
    if(hasBuilder){
        const copyCommand = prodSteps.match(/###BUILDER_COPY (.*?)\n/);
        if(copyCommand){
            const distPart = '--from=frontend_builder ' + dockerfileContext.frontend?.builderDist;
            const realCopyCommand = 'COPY ' + copyCommand[1].replace('###{dist}###', distPart);
            prodSteps = prodSteps.replace(copyCommand[0], realCopyCommand);
        }
    }
    content.push(prodSteps);

    fs.writeFileSync(dockerfileContext.filename, content.join('\n'));
}
