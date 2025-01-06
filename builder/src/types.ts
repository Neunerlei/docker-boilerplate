export type AddonDoFilesAction = {
    type: "files",
    source: string,
}

export type AddonDoReplaceAction = {
    type: "replace",
    target: string,
    // Maps a placeholder to the value that should be replaced
    sources: Record<string, string | { file: string }>
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

export type AddonDoAction =
    AddonDoFilesAction
    | AddonDoReplaceAction
    | AddonDoComposeAction
    | AddonDoBashlyAction
    | AddonDoAppendToAction
    | AddonDoPhpComposerAction
    | AddonDoNginxReplaceAction;

export type AddonDoActionType = AddonDoAction['type'];

export type AddonStructureYaml = {
    name: string;
    do: AddonDoAction[];
    // Actions that are applied after ALL actions in ALL addons are applied
    doPost?: AddonDoAction[];
}

export type AddonStructure = AddonStructureYaml & {
    key: string;
    file: string;
    sourceDir: string;
    requiresAddons?: string[];
    // Sub addons can not be used directly, they are only used as a dependency for other addons
    // They will not be added to the list of available addons. To mark an addon as sub, prefix the directory with an underscore
    isSub?: boolean;
}

export type AddonStructureList = Record<string, AddonStructure>;

export type DefinitionStructureYaml = {
    name: string;
    base: string;
    addons: string[];
}

export type DefinitionStructure = DefinitionStructureYaml & {
    key: string;
    file: string;
}

export type DefinitionStructureList = Record<string, DefinitionStructure>;
