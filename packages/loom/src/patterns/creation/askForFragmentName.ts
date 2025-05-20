import {uiLogInfoOnce, uiTextBlock} from '../../util/ui.js';
import {confirm, input} from '@inquirer/prompts';
import type {Fragment} from '../../fragments/Fragment.js';

export async function askForFragmentName(fragment: Fragment, fragments: Fragment[]) {
    if (!fragment.definition.allowRenaming) {
        return;
    }

    uiLogInfoOnce('fragmentName', uiTextBlock(`Some fragments allow you to modify their name and identifiers. 
This will affect how they generate code, how docker compose services
are named and how you can reference them in "urdev" commands.`));

    if (!await confirm({
        message: `Do you want to modify the fragment name: ${fragment.name} (${fragment.key})?`,
        default: false
    })) {
        return;
    }

    const newName = await input({
        message: 'Please enter the new name for the fragment:',
        default: fragment.name
    });

    let suggestedKey = deriveKeyFromName(newName);
    if (suggestedKey !== fragment.key) {
        suggestedKey = numberScopeExistingKeys(suggestedKey, fragments);
    }

    const newKey = await input({
        message: 'Please enter the new key for the fragment:',
        default: suggestedKey,
        validate: (input) => {
            if (fragments.some(f => f.key === input)) {
                return `The key "${input}" is already in use. Please choose a different key.`;
            }
            return true;
        }
    });

    return {
        givenName: newName,
        givenKey: newKey
    };
}

function deriveKeyFromName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function numberScopeExistingKeys(key: string, fragments: Fragment[]): string {
    console.log(fragments);
    if (fragments.some(f => f.key === key)) {
        const existingKeys = fragments
            .filter(f => f.key.startsWith(key))
            .map(f => f.key);

        const maxNumber = existingKeys.reduce((max, k) => {
            const number = parseInt(k.replace(key, ''));
            return isNaN(number) ? max : Math.max(max, number);
        }, 0);

        return `${key}${maxNumber + 1}`;
    }

    return key;
}
