import {PartialDefinition} from "../partial/types";
import {BuildContext} from "../util/BuildContext";
import {select} from "@inquirer/prompts";

export async function askForVersionOfPartial(partial: PartialDefinition, context: BuildContext) {
    const versions = partial.versions;

    // Ignore if there are no versions
    if (!versions || !versions.length) {
        return;
    }

    // If only one version exists, set it and return
    if (versions.length === 1) {
        context.setPartialVersion(partial.key, versions[0]);
        return;
    }

    // If version is already set, return
    if (context.getPartialVersion(partial.key)) {
        return;
    }

    // Ask for the version
    const choices = versions.map((version, index) => ({
        name: version,
        value: version
    }));

    const selectedVersion = await select({
        message: `Which version of ${partial.name} do you want to use?`,
        choices
    });

    context.setPartialVersion(partial.key, selectedVersion);
}
