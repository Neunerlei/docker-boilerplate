import type {LoomFragmentTypeHandler} from './types.js';

export const alwaysTypeHandler: LoomFragmentTypeHandler = async fragments => fragments;

export const languageTypeHandler: LoomFragmentTypeHandler = async (
    fragments,
    state,
    {prompts}
) =>
    prompts.selectMultipleFragments({
        fragments,
        state,
        descriptionTitle: 'Languages',
        description: 'Select one or multiple languages you want to work with in your project',
        message: 'Select your languages',
        required: true
    }).then(selected => selected.map(fragment => {
        // Languages are always allowed as app fragments
        fragment.definition.allowAsApp = true;
        return fragment;
    }));

export const databaseTypeHandler: LoomFragmentTypeHandler = async (
    fragments,
    state,
    {prompts}
) => prompts.confirmGate({
    state,
    descriptionTitle: 'Databases',
    description: 'Databases are used to store persistent data. If you are building a web application, you will likely need a database.',
    message: 'Do you want to use a database?',
    gated: () => prompts.selectMultipleFragments({
        fragments,
        state,
        message: 'Select your databases'
    })
});

export const cacheTypeHandler: LoomFragmentTypeHandler = async (
    fragments,
    state,
    {prompts}
) => prompts.confirmGate({
    state,
    descriptionTitle: 'Caches',
    description: 'Caches are used to store temporary data. If you are building a web application, you will likely need a cache.',
    message: 'Do you want to use a cache?',
    default: false,
    gated: () => prompts.selectMultipleFragments({
        fragments,
        state,
        message: 'Select your caches'
    })
});

export const webserverTypeHandler: LoomFragmentTypeHandler = async (
    fragments,
    state,
    {prompts}
) => prompts.confirmGate({
    state,
    descriptionTitle: 'Webservers',
    description: 'Webservers are used to serve your application to the world. A webserver also acts as a reverse proxy, load balancer, and static file server, depending on your configuration.',
    message: 'Do you want to use a webserver?',
    default: false,
    gated: () => prompts.selectSingleFragment({
        fragments,
        state,
        message: 'Select your webserver'
    })
});

export const utilityTypeHandler: LoomFragmentTypeHandler = async (
    fragments,
    state,
    {prompts}) => prompts.selectMultipleFragments({
    fragments,
    state,
    descriptionTitle: 'Utilities',
    description: 'Utilities are used to perform all kinds of tasks. They are not strictly necessary, but they can be very useful.',
    message: 'Select your utilities'
});
