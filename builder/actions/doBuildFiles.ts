import {PartialDefinition} from '../partial/types';
import {BuildContext} from '../util/BuildContext';
import {FileBuilder} from '../filebuilder/FileBuilder';

export async function doBuildFiles(partial: PartialDefinition, context: BuildContext) {
    if (typeof partial.buildFiles !== 'function') {
        return;
    }

    const fileBuilderFactory = (filename: string) => new FileBuilder(filename, context);

    await partial.buildFiles(context.getFs(), fileBuilderFactory);
}
