import {ObjectBody} from "@builder/filebuilder/body/ObjectBody";
import {FileBuilderCallback} from "@builder/partial/types";

export const bashlyYml: FileBuilderCallback<ObjectBody> = async (body) => {
    body.merge({
        commands: [
            {
                name: 'composer',
                help: 'runs a certain composer command for the project',
                catch_all: true,
            }
        ]
    })
}
