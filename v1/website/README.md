# An awesome website!

## Development setup

- Install docker and docker compose (I suggest using docker compose >= v2)
- Open the project root dir in a cli
- Make our env cli executable `chmod +x ./bin/env`
- Receive a copy of the `.env.local` file, containing the dev secrets from your colleagues.
- If you are running in a Windows environment using WSL I heavily recommend performing the steps under "Windows with WSL
  installation" below.
- Run the init command `bin/env init`
- Start the project by `bin/env up`
- If you are running in a non-linux environment without WSL, update your hosts file to access $DOCKER_PROJECT_IP through
  $DOCKER_PROJECT_DOMAIN

### Windows with WSL installation

In order to run smoothly in a WSL environment, we need an additional package installed.

- On your Windows machine open an administrative PowerShell:
- Install [Chocolatey](https://chocolatey.org/install) by running:
  ```
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))`
   ```
- To install [mkcert](https://github.com/FiloSottile/mkcert), run: ```choco install -y mkcert```
- Run: ```mkcert -install``` and answer the prompt allowing the installation of the Certificate Authority.
- To configure WSL2 to use the Certificate Authority installed on the Windows side run:
  ```
  $env:CAROOT="$(mkcert -CAROOT)"; setx CAROOT $env:CAROOT; If ($Env:WSLENV -notlike "*CAROOT/up:*") { $env:WSLENV="CAROOT/up:$env:WSLENV"; setx WSLENV $Env:WSLENV }
  ```
    - In some cases it takes a reboot to work correctly!
- To install [gsudo](https://github.com/gerardog/gsudo) run: ```choco install -y gsudo``` or install it manually
- The Windows steps should be done, now go back to the normal setup steps to continue.

### Environment control cli

We are using a cli script to control the development environment, which is based on [bashly](https://bashly.dannyb.co/),
it should help to guide you through the most common tasks. Most of the daily work like `bin/env up` or `bin/env restart`
are simply wrappers around the normal docker-compose calls, with a bit of sugar in form of setting environment variables
for you.

You can use `bin/env --help` to see an overview of all the existing commands you can use.

#### Extending the cli

As stated above, we use bashly to generate the actual shell script. You can find its sources at `bin/_env/src`,
where you can see all the used code and library snippets, as well as bashly's config.yaml file.

After you did changes, you can either run `bin/env rebuild-cli` or (in case of a catastrophic error) call
`./bin/_env/bashly.sh generate` to regenerate the cli file.

#### Local SSL certificates

We utilize [mkcert](https://github.com/FiloSottile/mkcert) to create a locally-trusted ssl certificate for your dev
environment. Everything should work out for you out of the box, if you are running on linux,
and if you followed the steps described under "Windows with WSL installation". If not, you may want to install,
the mkcert root certificate in any of the documented ways.
