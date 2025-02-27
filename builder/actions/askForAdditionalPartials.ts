import {checkbox} from "@inquirer/prompts";
import {askForVersionOfPartial} from "./askForVersionOfPartial";
import {BuildContext} from "../util/BuildContext";

export async function askForAdditionalPartials(context: BuildContext) {
    const registry = context.getPartialRegistry();
    const stack = context.getPartialStack();
    const possiblePartials = await registry.getNonStandaloneForSelectedStandaloneKeys(stack.getKeys());

    if (possiblePartials.length === 0) {
        return;
    }

    const choices = possiblePartials.map(partial => ({
        name: partial.name,
        value: partial.key
    }));

    const selected = await checkbox({
        message: 'You can also add the following tools:',
        choices
    });

    for (const key of selected) {
        const partial = registry.get(key)!;
        await askForVersionOfPartial(partial, context);
        await stack.add(partial);
    }
}
