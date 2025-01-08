# Dev Boilerplates

This repository contains a shell script to generate boilerplates for web environments.

**important** The whole code is currently in a very early stage and may contain bugs, so don't trust it to work flawlessly.

## Usage
```bash
bin/build.sh
```
The script will guide you through the process of generating a boilerplate.

### What can you select?

First you choose a base boilerplate, this is generally speaking the coding language and version you want to use.
Next you can select a list of addons, these are optional and can be used to add additional features to your boilerplate.
Finally, (if your base boilerplate supports it) you can select a frontend addon. This addon will add a frontend to your boilerplate.
A frontend is generally probably a node environment, but it could also be a static site generator.

### What is the output?

The output is a complete boilerplate, including a docker compose file, nginx configuration, php configuration, etc.
There is also a complete cli tooling based on [bashly](https://bashly.dannyb.co/), which you can extend with your own commands.

I would recommend copying it into your project directory and then start working from there.
Ensure to give the "bin/env" script the correct permissions to be executed `chmod +x bin/env`.

After that you can start working on your project. `bin/env up` will start the docker compose file and `bin/env down` will stop it.
Everything else should be fairly straightforward and is explained in the `bin/env --help` command.

#### What is a project_name and why do I need it?

The project_name is basically the name of your project. It is used as a prefix for the docker container names.
It is also used to generate the local url for your project (if you choose to use it).

## Development

The system can be easily extended with new addons or base boilerplates.

### Base (./src/base)

This folder contains the files that are shared between all boilerplates.
It contains, for example the main runtime for the bashly cli tooling.

**Important:** it also contains a special "Dockerfile" which is used to build a shared header for all build steps generated for the app and the potential frontend.
The Dockerfile MUST have a `FROM base` statement. This statement will be automatically replaced with the correct base boilerplate. You CANNOT modify this statement or add an alias here!

### Base-Boilerplates (./src/boilerplates)

This folder contains the definitions for the base boilerplates.
Each boilerplate is a yaml file which contains the configuration for the boilerplate.
The structure of the yaml file is as follows:

```yaml
# The human readable name of the boilerplate
name: Node 23
# The name of the ADDON that is used as a base for this boilerplate (Must be the name of the addon in it's folder)
base: node-23
# A list of addons that are used for this boilerplate (Must be the name of the addon in it's folder)
addons:
  - nginx
  - mysql
  - mailhog
# An optional list of frontends that can be installed along with the basic boilerplate.
# This allows a boilerplate to generate the combined service for a react app and its api in a single docker compose file.
frontends:
  - node-23
```

### Addons (./src/addons)

This folder contains the definitions for the addons. Everything that is not part of the "base" directory is an addon, this includes both "base-boilerplates" and "frontends".
Each addon is a folder which contains the configuration, files and metadata for the addon.
To know what should be done in an addon you can look into the `addon.yaml` file in each directory.

The addon file contains everything that is done when an addon is selected.
The file structure is as follows:

```yaml
# The human readable name of the addon
name: Node 23
# A list of actions that are executed when the addon is selected
do:
  - type: files
    source: ./files
```

**important:** the addon file MUST be named `addon.yaml`!
**important 2:** whenever you work with "source" the paths is relative to the addon folder! "target" paths are always relative to the output folder!

### Actions

Actions are a predefined set of tasks that are executed when an addon is selected.
Each action has a type, which defines what should be done.
The following actions are currently supported:

#### files

Copies files from the addon to the output directory.
The content of the directory selected will be copied to the output directory.

```yaml
- type: files
  source: ./files
```

#### replace

Replaces a placeholder in a file with a value.
A placeholder is defined as string like `###{placeholder}###`.
The placeholder will be replaced with the value of the `sources` key.

```yaml
- type: replace
  # The target file to replace the placeholder in, relative to the output directory
  target: ./path/to/file.txt
  # Maps a placeholder to the value that should be replaced
  sources:
    # A simple value
    placeholder: value
    # You can also load the value from a file
    otherValue:
      file: ./path/to/other/file.txt
  # If immediate is true, the replacement will be done immediately, otherwise it will be done after all other actions have been executed
  # The default behaviour allows multiple addons to replace the same placeholder with different values. (Concatenation by a newline)
  immediate: true
```

#### compose

Merges the compose file of the addon with the compose file of the boilerplate.
This can be used to add additional services to the docker compose file, or to replace services of the boilerplate.

```yaml
- type: compose
  source: ./compose.yaml
  # An optional list of services that will be merged into the main docker-compose.yml file, instead of replacing it
  mergeServices:
    - service1
    - service2
```

#### bashly

Merges a defined bashly.yaml into the bashly.yaml of the boilerplate.

```yaml
- type: bashly
  source: ./bashly.yaml
```

#### appendTo

Appends a string or the content of a file to the target file.

```yaml
- type: appendTo
  target: ./path/to/file.txt
  source: 'some string'
  # Or the content of a file
  source: 
    file: ./path/to/other/file.txt
```

#### phpComposer (PHP only, obviously)

Merges the given composer.json configuration into the composer.json of the boilerplate.

```yaml
- type: phpComposer
  target: ./path/to/file.txt
  source:
    require-dev:
      phpunit/phpunit: "^9.5"
```

#### nginxReplace

Is only active, if the boilerplate uses the "nginx" addon.
It allows the addon to inject additional nginx configuration into the boilerplate.
The configuration is injected into all three of the following files:

- docker/nginx/config/nginx.default.conf (for production - always ssl)
- docker/nginx/config/nginx.dev.conf (for development)
- docker/nginx/config/nginx.dev.ssl.conf (for development with ssl)

```yaml
- type: nginxReplace
  source: ./nginx.conf
```

**important:** If the injected source contains a `location /` block (and is not the frontend itself), it will be replaced with a `location /backend` block, if the boilerplate has a frontend addon installed!

#### dockerfile

Builds the dockerfile configuration of the addon.
This is probably the most important and complex action. 

You need to understand how the dockerfile is built and how the different steps are created.

When you are using an app without a frontend, there will be probably three steps that get created:

- app_root is the most basic step that inherits from the base image. It is used to prepare some shared configuration for the environment and allows injection for the current user id and group id.
- app_dev is the development step that inherits from the app_root step. This is step is used as the state for your local development environment. You can use this step to install additional dependencies and to add additional configuration for your local development environment.
- app_prod is the production step that inherits from the app_root step. This is the step that is used for production. It is the most stripped down step and only contains the minimum configuration to run the application in production. It copies all files into the final image and ensures correct permissions on the binaries.

When you are using an app with a frontend, there will be more steps created. In addition to there will also be the following:

- frontend_root is the same concept as the app_root step, but for the frontend.
- frontend_dev is the same concept as the app_dev step, but for the frontend.
- frontend_builder is the builder step that inherits from the frontend_dev step. It is used to install the dependencies and to build the frontend.

When you are using a frontend you will probably notice that there is also a "COPY" step, that copies the built frontend into the app. If your frontend need server side rendering you will probably need to update the nginx configuration to point to the correct location of the rendered frontend.

```yaml
- type: dockerfile
  # The base image to use for the dockerfile (Used for the FROM statement of the app_root or frontend_root step)
  baseImage: node:23
  # The dockerfile for the development environment, MUST start with a FROM root statement, otherwise it is a normal dockerfile
  dev:
    source: 
        file: ./dockerfile.dev
  # The dockerfile for the production environment, MUST start with a FROM root statement, otherwise it is a normal dockerfile
  # Magic: You can create a magic comment like: ###BUILDER_COPY --chown=www-data:www-data ###{dist}### /var/www/html/public/frontend
  # which will automatically be replaced with the correct path to the dist folder of the frontend builder step (if there is one)
  prod:
    source: 
        file: ./dockerfile.prod
  # This node and its files are only used, if the addon is used as a frontend addon
  frontend:
    # The dockerfile to use for the frontend development environment, MUST start with a FROM root statement, otherwise it is a normal dockerfile
    source: 
        file: ./dockerfile.frontend
    # The dockerfile for the step that compiles the assets, before they are copied into the app. If not set there will not be any builder step created.
    builder:
        source: 
            file: ./dockerfile.builder
        # Defines where the built files should be copied from, when they get moved into the app.
        dist: ./dist
```

### Frontend special cases

I wanted to avoid having to clone a lot of code to use a "frontend" addon as such, or as a "base" addon.
So there are some special cases you need to be aware of:

- There is a "magic" placeholder called `###{service_name}###` which will be replaced with the correct service name (frontend or app), which works in ALL files automatically.
- Similar to the placeholder, when copying files you can call the source directory `__service_name__` and it will be replaced with the correct service name (frontend or app), after the files have been copied.
- Inside of nginx configuration files, the `location /` blocks will be replaced with `location /backend` if the frontend addon is used.