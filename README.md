# Dev Boilerplates

This repository contains a shell script to generate boilerplates for web environments.

**important** The whole code is currently in a very early stage and may contain bugs, so don't trust it to work
flawlessly.

## Usage

```bash
bin/build.sh
```

The script will guide you through the process of generating a boilerplate.

### What can you select?

First you choose a base boilerplate, this is generally speaking the coding language and version you want to use.
Next you can select a list of addons, these are optional and can be used to add additional features to your boilerplate.
Finally, (if your base boilerplate supports it) you can select a frontend addon. This addon will add a frontend to your
boilerplate.
A frontend is generally probably a node environment, but it could also be a static site generator.

### What is the output?

The output is a complete boilerplate, including a docker compose file, nginx configuration, php configuration, etc.
There is also a complete cli tooling based on [bashly](https://bashly.dannyb.co/), which you can extend with your own
commands.

I would recommend copying it into your project directory and then start working from there.
Ensure to give the "bin/env" script the correct permissions to be executed `chmod +x bin/env`.

After that you can start working on your project. `bin/env up` will start the docker compose file and `bin/env down`
will stop it.
Everything else should be fairly straightforward and is explained in the `bin/env --help` command.

#### What is a project_name and why do I need it?

The project_name is basically the name of your project. It is used as a prefix for the docker container names.
It is also used to generate the local url for your project (if you choose to use it).
