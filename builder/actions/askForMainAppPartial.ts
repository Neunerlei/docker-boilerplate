import {PartialRegistry} from "../partial/PartialRegistry";
import {BuildContext} from "../util/BuildContext";
import {select} from "@inquirer/prompts";

export async function askForMainAppPartial(context: BuildContext, registry: PartialRegistry, selected: string[]) {
    // Only one selected, that is our main partial
    if (selected.length === 1) {
        context.setAppPartialKey(selected[0]);
        return;
    }

    // Ask user to select the main partial
    console.log('You selected multiple "standalone"/service partials. Which one would you consider to to be the main app?');
    console.log('This should be the app you normally work with, or that serves as the entry point to your project.');
    console.log('The main app is the compose service that will be used when omitting a service name in the bin/env commands.');

    const choices = selected.map(key => ({
        name: registry.get(key)!.name,
        value: key
    }));

    const selectedKey = await select({
        message: 'Please select the main app:',
        choices
    });
    context.setAppPartialKey(selectedKey);
}
