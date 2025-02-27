import {ObjectBody} from "@builder/filebuilder/body/ObjectBody";
import {FileBuilderCallback} from "@builder/partial/types";

export const bashlyYml: FileBuilderCallback<ObjectBody> = async (body) => {
    body.merge({
        commands: [
            {
                name: "test",
                help: "allows you to run tests against the current codebase",
                commands: [
                    {
                        name: "unit",
                        help: "runs the unit test cases",
                        catch_all: true,
                        flags: [
                            {
                                long: "--coverage",
                                short: "-c",
                                help: "Generates a coverage report"
                            }
                        ]
                    }
                ]
            }
        ]
    })
}
