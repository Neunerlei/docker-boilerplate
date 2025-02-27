import {StringBody} from "@builder/filebuilder/body/StringBody";
import {FileBuilderCallback} from "@builder/partial/types";

export const gitignore: FileBuilderCallback<StringBody> = async function (body) {
    body.append(`
# PHPUnit
.phpunit.coverage
.phpunit.result.cache
.phpunit.cache

# Codecov
codecov
codecov.SHA256SUM
codecov.SHA256SUM.sig
`)
}
