import * as prompts from '@inquirer/prompts';
import type {Fragment} from '../../fragments/Fragment.js';
import {uiLogInfo} from '../../util/ui.js';

interface SelectMultipleFragmentsOptions {
    message: string;
    description?: string;
    descriptionTitle?: string;
    fragments: Fragment[];
    state: Fragment[];
    required?: boolean;
    validate?: ((choices: Array<{
        value: Fragment;
        name?: string;
    }>) => boolean | string | Promise<string | boolean>) | undefined;
}

async function selectMultipleFragments(options: SelectMultipleFragmentsOptions) {
    const choices = options.fragments.map(fragment => ({
        name: fragment.name,
        description: fragment.description,
        value: fragment,
        checked: options.state?.includes(fragment) ?? false
    }));

    if (options.description) {
        uiLogInfo(options.description, options.descriptionTitle);
    }

    while (true) {
        const selected = await prompts.checkbox({
            message: options.message,
            choices,
            required: options.required ?? false,
            validate: options.validate as any
        });

        if (selected.length === 0 && !await prompts.confirm({
            message: 'You have not selected any fragments. Is that right?',
            default: true
        })) {
            continue;
        }

        return selected;
    }
}

interface SelectSingleFragmentOptions {
    message: string;
    description?: string;
    descriptionTitle?: string;
    fragments: Fragment[];
    state: Fragment[];
}

async function selectSingleFragment(options: SelectSingleFragmentOptions) {
    const choices = options.fragments.map(fragment => ({
        name: fragment.name,
        description: fragment.description,
        value: fragment
    }));

    choices.unshift({
        name: 'None',
        value: null
    } as any as typeof choices[0]);

    if (options.description) {
        uiLogInfo(options.description, options.descriptionTitle);
    }

    const selection = await prompts.select({
        message: options.message,
        choices
    });

    if (selection === null) {
        return [];
    }

    return [selection];
}

interface ConfirmGateOptions {
    message: string;
    description?: string;
    descriptionTitle?: string;
    default?: boolean;
    gated: () => Promise<Fragment[]>;
    state: Fragment[];
}

async function confirmGate(options: ConfirmGateOptions): Promise<Fragment[]> {
    if (options.state.length === 0) {
        if (options.description) {
            uiLogInfo(options.description, options.descriptionTitle);
        }

        const openGate = await prompts.confirm({
            message: options.message,
            default: options.default ?? true
        });

        if (!openGate) {
            return [];
        }
    }

    return options.gated();
}

export const typeHandlerPrompts = {
    ...prompts,
    selectMultipleFragments,
    selectSingleFragment,
    confirmGate
};
