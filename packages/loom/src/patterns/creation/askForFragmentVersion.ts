import {select} from '@inquirer/prompts';
import type {Fragment} from '../../fragments/Fragment.js';

const DEFAULT_VERSION = 'latest';

export async function askForFragmentVersion(fragment: Fragment): Promise<string> {
    const versions = fragment.definition.versions ?? [];
    if (!Array.isArray(versions) || versions.length === 0) {
        return DEFAULT_VERSION;
    }

    if (versions.length === 1) {
        return versions[0];
    }

    const choices = versions.map(version => ({
        name: version,
        value: version
    }));

    return select({
        message: `Which version of ${fragment.name} do you want to use?`,
        choices
    });
}
