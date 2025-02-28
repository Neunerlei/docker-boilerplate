import {ObjectBody} from "@builder/filebuilder/body/ObjectBody";
import {FileBuilderCallback} from "@builder/partial/types";

export const bashlyYml: FileBuilderCallback<ObjectBody> = async (body) => {
    body.merge({
        commands: [
            {
                name: "mysql",
                alias: "db",
                help: "a list of database related sub-commands",
                commands: [
                    {
                        name: "dump",
                        help: "allows you to DUMP the state of a database onto your harddive",
                        args: [
                            {
                                name: "type",
                                help: "Defines the database you want to execute the dump for",
                                default: "@select",
                                validate: "mysql_addon_isAllowedType"
                            }
                        ]
                    },
                    {
                        name: "load",
                        help: "Loads a database dump from your harddrive and replaces all data in the main project database table with it.",
                        args: [
                            {
                                name: "type",
                                help: "Defines the database you want to load the dump for",
                                default: "@select",
                                validate: "mysql_addon_isAllowedType"
                            }
                        ]
                    },
                    {
                        name: "list",
                        help: "List all available database types to dump/load"
                    }
                ]
            }
        ]
    })
}
