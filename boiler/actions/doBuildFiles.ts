import {PartialDefinition} from '../partial/types';
import {BuildContext} from '../util/BuildContext';
import {FileBuilder} from '../filebuilder/FileBuilder';
import {DockerfileBody} from '../filebuilder/body/DockerfileBody.js';
import {DockerComposeBody} from '../filebuilder/body/DockerComposeBody.js';
import {EntrypointBody} from '../filebuilder/body/EntrypointBody.js';

export async function doBuildFiles(partial: PartialDefinition, context: BuildContext) {
    if (typeof partial.buildFiles !== 'function') {
        return;
    }

    const specialFactories = (await context.events.trigger('filebuilder:collect:specialFactories', {
        factories: {
            dockerfile: (_, context) => new DockerfileBody(context),
            dockerCompose: (_, context) => new DockerComposeBody(context),
            entrypoint: ({content}) => new EntrypointBody(content ?? '')
        }
    })).factories;
    
    const fileBuilderFactory = (filename: string) => new FileBuilder(
        filename,
        context,
        specialFactories
    );

    await partial.buildFiles(context.fs, fileBuilderFactory);
}
