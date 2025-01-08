import { select } from "@inquirer/prompts";
import { readDefinitions } from "../definitions";
import { DefinitionStructure } from "../types";

export async function askForDefinition(): Promise<DefinitionStructure> {
    const definitions = readDefinitions();

    const choices: Array<{ name: string, value: string }> = [];
    for (const defKey in definitions) {
        choices.push({
            value: defKey,
            name: definitions[defKey].name
        });
    }

    const selectedDefName = await select({
        message: 'Which definition do you want to build?',
        choices
    });

    return definitions[selectedDefName];
}