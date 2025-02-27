import {checkbox} from "@inquirer/prompts";
import {askForVersionOfPartial} from "./askForVersionOfPartial";
import {BuildContext} from "../util/BuildContext";
import {askForMainAppPartial} from "./askForMainAppPartial";

export async function askForAtLeastOneStandalonePartial(context: BuildContext) {
    const registry = context.getPartialRegistry();
    const stack = context.getPartialStack();
    const availablePartials = registry.getStandalone().filter(partial => partial.selectable !== false);

    if (availablePartials.length === 0) {
        console.log('No standalone partials found. Please add at least one to the project.');
        process.exit(1);
    }

    const choices = availablePartials.map(partial => ({
        name: partial.name,
        value: partial.key
    }));

    const selected = await checkbox({
        message: 'Choose at least one of the following technologies:',
        choices,
        required: true
    });

    for (const key of selected) {
        const partial = registry.get(key)!;
        await askForVersionOfPartial(partial, context);
        await stack.add(partial);
    }

    await askForMainAppPartial(context, registry, selected);
}
