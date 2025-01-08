export type AddonDoFilesAction = {
    type: "files",
    source: string,
}

export type AddonDoReplaceAction = {
    type: "replace",
    target: string,
    // Maps a placeholder to the value that should be replaced
    sources: Record<string, string | { file: string }>,
    // If true, the replacement will be applied immediately, instead of being added to the replace queue
    immediate?: boolean;
}

export type AddonDoNginxReplaceAction = {
    type: "nginxReplace",
    source: string | { file: string }
}

export type AddonDoComposeAction = {
    type: "compose",
    source: string,
    // Service names in this list will be merged into the main docker-compose.yml file, instead of replacing it
    mergeServices?: string[]
}

export type AddonDoBashlyAction = {
    type: "bashly",
    source: string,
}

export type AddonDoAppendToAction = {
    type: "appendTo",
    target: string,
    source: string | { file: string },
}

export type AddonDoPhpComposerAction = {
    type: "phpComposer",
    target: string,
    source: any
}

export type AddonDoDockerfileAction = {
    type: "dockerfile",
    baseImage: string,
    dev: { source: string | { file: string } },
    prod: { source: string | { file: string } },
    frontend?: { 
        source: string | { file: string },
        builder?: {
            source: string | { file: string },
            // Defines where the built files should be copied from.
            // If not set, the prod dockerfile will not have a COPY command for the built files
            dist: string
        },
    },
}

export type AddonDoAction =
    (
        AddonDoFilesAction
        | AddonDoReplaceAction
        | AddonDoComposeAction
        | AddonDoBashlyAction
        | AddonDoAppendToAction
        | AddonDoPhpComposerAction
        | AddonDoNginxReplaceAction
        | AddonDoDockerfileAction
    ) & {
            // The default priority is 0, the higher the number, the higher the priority
            // Actions with the same priority are applied in the order they are defined
            // Negative priorities are lower than positive priorities
            priority?: number
        };

export type AddonDoActionType = AddonDoAction['type'];

export type AddonStructureYaml = {
    name: string;
    do: AddonDoAction[];
}

export type AddonStructure = AddonStructureYaml & {
    key: string;
    file: string;
    sourceDir: string;
    requiresAddons?: string[];
    // Sub addons can not be used directly, they are only used as a dependency for other addons
    // They will not be added to the list of available addons. To mark an addon as sub, prefix the directory with an underscore
    isSub?: boolean;
    // If true, the addon is loaded as a frontend addon
    isFrontend?: boolean;
}

export type AddonStructureList = Record<string, AddonStructure>;

export type DefinitionStructureYaml = {
    name: string;
    base: string;
    addons: string[];
    frontends?: string[];
}

export type DefinitionStructure = DefinitionStructureYaml & {
    key: string;
    file: string;
}

export type DefinitionStructureList = Record<string, DefinitionStructure>;
