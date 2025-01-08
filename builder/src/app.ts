import { applyAddons } from "./addons";
import { cleanDistDirRecursively, copyBaseFiles } from "./util";
import { distDir } from "./constants";
import { applyReplaceQueue } from "./replaceQueue";
import { askForDefinition } from "./ui/askForDefinition";
import { askForAddons } from "./ui/askForAddons";
import { buildBashly } from "./bashly";
import { askForFrontends } from "./ui/askForFrontends";
import { applyDockerfileContext } from "./addon/applyDockerfile";

export async function app() {
    console.log('Welcome to the boilerplate builder!');
    try {
        const definition = await askForDefinition();
        const addons = await askForAddons(definition);
        const frontendAddon = await askForFrontends(definition);
        cleanDistDirRecursively();
        copyBaseFiles();
        applyAddons(definition, addons);
        if (frontendAddon){
            applyAddons(definition, [frontendAddon]);
        }
        applyReplaceQueue();
        applyDockerfileContext();
        buildBashly();
        console.log('Done! Your boilerplate has been built:', distDir)
    } catch (e) {
        console.error('Oh no! Something went wrong :( -', e);
    }
}
