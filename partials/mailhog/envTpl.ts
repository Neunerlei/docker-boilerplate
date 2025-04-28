import {type BodyBuilder} from '@builder/partial/types';
import {StringBody} from '@builder/filebuilder/body/StringBody';

export const envTpl: BodyBuilder<StringBody> = async function (body) {
    body.append(`
# Mailhog - Mailtrap
# ------------------------------------------------
# The port on your local machine on which you want to access mailhog on
MAILHOG_PORT=8025
`, true)
}
