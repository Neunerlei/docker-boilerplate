import {FileBuilderCallback} from '@builder/partial/types';
import {ObjectBody} from '@builder/filebuilder/body/ObjectBody';

export const bashlyYml: FileBuilderCallback<ObjectBody> = async (body) => {
    body.merge({
        commands: [
            {
                name: "mailhog",
                help: "starts the interface of the mailhog mailtrap in your browser"
            }
        ]
    })
}
