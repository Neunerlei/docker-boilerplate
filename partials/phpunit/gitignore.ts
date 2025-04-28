import {StringBody} from '@boiler/filebuilder/body/StringBody';
import type {BodyBuilder} from '@boiler/partial/types';

export const gitignore: BodyBuilder<StringBody> = async function (body) {
    body.append(`
# PHPUnit
.phpunit.coverage
.phpunit.result.cache
.phpunit.cache

# Codecov
codecov
codecov.SHA256SUM
codecov.SHA256SUM.sig
`);
};
