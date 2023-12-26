# Addon: PHP Composer

This addon adds some useful commands to control PHP composer inside the container.

## Installation

To install this addon, you need to modify some of the files, but first, copy the content of `files`
into the project directory (where you normally call `bin/env`).

Modify the `bin/_env/src/bashly.yml` by adding the following lines:

```yaml
    - name: test
      help: allows you to run tests against the current codebase
      commands:
        - name: unit
          help: runs the unit test cases
          catch_all: true
          flags:
            - long: --coverage
              short: -c
              help: Generates a coverage report
    - name: composer
      help: runs a certain composer command for the project
      catch_all: true
```

Next, modify the `composer.json` of your project and append those scripts:

```json
{
  "scripts": {
    "test:unit": "phpunit unit",
    "test:unit:coverage": "XDEBUG_MODE=coverage phpunit --testsuite unit --coverage-html ./.phpunit.coverage",
    "test:unit:coverage:clover": "XDEBUG_MODE=coverage phpunit --testsuite unit --coverage-clover Tests/Coverage.xml"
  }
}
```

Finally run the `bin/env rebuild-cli` script. After that you should be good to go.
