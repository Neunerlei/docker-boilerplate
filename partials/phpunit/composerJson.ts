import {ObjectBody} from '@builder/filebuilder/body/ObjectBody';
import type {BodyBuilder} from '@builder/partial/types';

export const composerJson: BodyBuilder<ObjectBody> = async function (body) {
    body.merge({
        'require-dev': {
            'phpunit/phpunit': '^9.5'
        },
        'autoload-dev': {
            'psr-4': {
                'Tests\\': 'tests'
            }
        },
        'scripts': {
            'test:unit': 'phpunit --testsuite unit --exclude-group integration',
            'test:unit:coverage': 'XDEBUG_MODE=coverage phpunit --testsuite unit --exclude-group integration --coverage-html ./.phpunit.coverage; cp ./tests/coverage.dark.css .phpunit.coverage/_css/custom.css',
            'test:unit:coverage:text': 'XDEBUG_MODE=coverage phpunit --testsuite unit --exclude-group integration --coverage-text',
            'test:unit:coverage:clover': 'XDEBUG_MODE=coverage phpunit --testsuite unit --coverage-clover .phpunit.coverage/coverage-clover.xml'
        }
    });
};
