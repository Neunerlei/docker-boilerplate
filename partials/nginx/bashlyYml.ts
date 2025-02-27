import {ObjectBody} from "@builder/filebuilder/body/ObjectBody";
import {FileBuilderCallback} from "@builder/partial/types";

export const bashlyYml: FileBuilderCallback<ObjectBody> = async (body) => {
    body.merge({
        commands: [
            {
                name: "open",
                help: "opens the current project in your browser."
            }
        ]
    })
}
