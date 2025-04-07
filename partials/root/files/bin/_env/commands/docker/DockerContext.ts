import type {Context} from '@/Context.ts';
import {promisify} from 'util';
import {exec, execSync, spawn} from 'node:child_process';
import {confirm} from '@inquirer/prompts';
import process from 'node:process';

const execAsync = promisify(exec);

// These are common exit codes for docker commands that are not errors
const nonErrorExitCodes = [0, 130, 137, 140, 143];

interface UpOptions {
    // Basically the opposite of -d, if true it will follow the output, by default it will run in detached mode
    follow?: boolean;
    // Additional arguments to pass to docker-compose
    args?: string[];
}

export class DockerContext {
    private _context: Context;
    private _dockerExecutable: string | null = null;
    private _dockerComposeExecutable: string | null = null;
    private _dockerRuntimeType: ('podman' | 'docker') | null = null;

    constructor(context: Context) {
        this._context = context;
    }

    /**
     * Executes a docker command
     * @param command the command to execute split in an array of strings. (e.g. ['ps', '-a'])
     * @param foreground If false, the output is not printed to the console (default: true)
     */
    public async executeDockerCommand(command: Array<string>, foreground?: boolean) {
        return this.executeCommand(await this.getDockerExecutable(), command, foreground);
    }

    /**
     * Executes a docker-compose command
     * @param command the command to execute split in an array of strings. (e.g. ['up', '-d'])
     * @param foreground If false, the output is not printed to the console (default: true)
     */
    public async executeComposeCommand(command: Array<string>, foreground?: boolean) {
        let composeCommand = await this.getComposeExecutable();

        // Special case for "docker compose" (v2) command, because it is not a real executable
        if (composeCommand.endsWith(' compose')) {
            composeCommand = composeCommand.substring(0, composeCommand.length - 8);
            command = ['compose', ...command];
        }

        return this.executeCommand(composeCommand, command, foreground);
    }

    /**
     * Executes a command inside a docker container
     * @param serviceName the name of the docker compose service to execute the command in
     * @param command the command to execute split in an array of strings.
     * @param execFlags additional flags to pass to the docker exec command (if omitted, -ti is used)
     * @param foreground If false, the output is not printed to the console (default: true)
     */
    public async executeCommandInService(serviceName: string, command: Array<string>, execFlags?: Array<string>, foreground?: boolean) {
        return this.executeCommandInContainer(
            await this.getContainerIdFromServiceName(serviceName),
            command,
            execFlags,
            foreground
        );
    }

    /**
     * The same as executeCommandInService, but with a container ID instead of a service name
     * @param containerId the ID of the container to execute the command in
     * @param command the command to execute split in an array of strings.
     * @param execFlags additional flags to pass to the docker exec command (if omitted, -ti is used)
     * @param foreground If false, the output is not printed to the console (default: true)
     */
    public async executeCommandInContainer(containerId: string, command: Array<string>, execFlags?: Array<string>, foreground?: boolean) {
        return this.executeCommand(
            await this.getDockerExecutable(),
            [
                'exec',
                ...(execFlags || ['-ti']),
                containerId,
                ...command
            ],
            foreground,
            undefined,
            async (_error, _stdout, stderr): Promise<boolean> => {
                if (stderr.match(/container .* is not running/ig)) {
                    const doRetry = await confirm({
                        message: 'One ore more services are not running. Should I do a docker-compose up and retry?',
                        default: true
                    });

                    if (!doRetry) {
                        console.error('Please start the required docker container and try again.');
                        process.exit(1);
                    }

                    await this.up();
                    return this.executeCommandInContainer(containerId, command)
                        .then(() => true)
                        .catch(() => false);
                }

                return false;
            }
        );
    }

    /**
     * Determines the docker executable path (docker or podman)
     */
    public async getDockerExecutable(): Promise<string> {
        if (this._dockerExecutable !== null) {
            return this._dockerExecutable;
        }

        try {
            // Check for podman first
            const podmanResult = await execAsync('command -v podman');
            const podmanPath = podmanResult.stdout.trim();

            if (podmanPath) {
                try {
                    // Check if podman service is active
                    await execAsync('systemctl is-active --quiet podman');
                    this._dockerExecutable = podmanPath;
                    return podmanPath;
                } catch (error) {
                    // Podman service is not active, continue to docker check
                }
            }
        } catch (error) {
            // Podman not found, continue to docker check
        }

        try {
            // Check for docker
            const dockerResult = await execAsync('command -v docker');
            const dockerPath = dockerResult.stdout.trim();

            if (dockerPath) {
                this._dockerExecutable = dockerPath;
                return dockerPath;
            }
        } catch (error) {
            // Docker not found
        }

        throw new Error('Sorry, but I did not find docker or podman on your system');
    }

    /**
     * Determines the compose executable path
     */
    public async getComposeExecutable(): Promise<string> {
        if (this._dockerComposeExecutable !== null) {
            return this._dockerComposeExecutable;
        }

        try {
            // Check for podman-compose first
            const podmanComposeResult = await execAsync('command -v podman-compose');
            const podmanComposePath = podmanComposeResult.stdout.trim();

            if (podmanComposePath) {
                try {
                    // Check if podman service is active
                    await execAsync('systemctl is-active --quiet podman');
                    this._dockerComposeExecutable = podmanComposePath;
                    return podmanComposePath;
                } catch (error) {
                    // Podman service is not active, continue to next check
                }
            }
        } catch (error) {
            // podman-compose not found, continue to next check
        }

        try {
            // Check for podman with compose subcommand
            const podmanResult = await execAsync('command -v podman');
            const podmanPath = podmanResult.stdout.trim();

            if (podmanPath) {
                try {
                    // Check if podman service is active
                    await execAsync('systemctl is-active --quiet podman');
                    const podmanCompose = `${podmanPath} compose`;
                    this._dockerComposeExecutable = podmanCompose;
                    return podmanCompose;
                } catch (error) {
                    // Podman service is not active, continue to next check
                }
            }
        } catch (error) {
            // podman not found, continue to next check
        }

        try {
            // Check for docker-compose
            const composeResult = await execAsync('command -v docker-compose');
            const composePath = composeResult.stdout.trim();

            if (composePath) {
                // Check if it's not in WSL path (not starting with /mnt/)
                if (!composePath.startsWith('/mnt/')) {
                    this._dockerComposeExecutable = composePath;
                    return composePath;
                }
            }
        } catch (error) {
            // docker-compose not found, continue to next check
        }

        try {
            // Check for docker compose v2
            const dockerExecutable = await this.getDockerExecutable();
            const composeVersionResult = await execAsync(`${dockerExecutable} compose version`);

            if (composeVersionResult.stdout.includes('v2')) {
                const dockerCompose = 'docker compose';
                this._dockerComposeExecutable = dockerCompose;
                return dockerCompose;
            }
        } catch (error) {
            // docker compose v2 not found
        }

        throw new Error('Sorry, but I did not find docker-compose or \'docker compose\' on your system');
    }

    /**
     * Determines if using docker or podman runtime
     */
    public async getRuntimeType(): Promise<'podman' | 'docker'> {
        if (this._dockerRuntimeType !== null) {
            return this._dockerRuntimeType;
        }

        const composeExecutable = await this.getComposeExecutable();
        if (composeExecutable.includes('podman')) {
            this._dockerRuntimeType = 'podman';
            return 'podman';
        }

        this._dockerRuntimeType = 'docker';
        return 'docker';
    }

    /**
     * Checks if a docker-compose service is running
     */
    public async isComposeServiceRunning(serviceName?: string): Promise<boolean> {
        try {
            const containerId = await this.getContainerIdFromServiceName(serviceName);
            return !!containerId;
        } catch (error) {
            return false;
        }
    }

    /**
     * Checks if a docker container is running
     */
    public async isContainerRunning(containerId: string): Promise<boolean> {
        try {
            const result = await this.executeDockerCommand(['inspect', '-f', '{{.State.Running}}', containerId], false);
            return result.stdout.trim() === 'true';
        } catch (error) {
            return false;
        }
    }

    /**
     * Checks if a docker container with a specific name is running
     */
    public async isContainerWithNameRunning(containerName: string): Promise<boolean> {
        try {
            const result = await this.executeDockerCommand(['ps', '-q', '-f', `name=${containerName}`], false);
            return !!result.stdout.trim();
        } catch (error) {
            return false;
        }
    }

    /**
     * Gets container ID from service name
     */
    public async getContainerIdFromServiceName(serviceName?: string): Promise<string> {
        const service = serviceName || this._context.getConfig().docker.defaultServiceName;

        let containerId: string | undefined;
        try {
            const result = await this.executeComposeCommand(['ps', '-a', '-q', service], false);
            containerId = result.stdout.trim();
        } catch (e) {
            // Silence...
        }

        if (!containerId) {
            throw new Error(`No container found for service: ${service}`);
        }

        return containerId;
    }

    /**
     * Starts containers
     */
    public async up(opt?: UpOptions) {
        const args = new Set(opt?.args || []);
        if (opt?.follow !== true) {
            args.add('-d');
        }
        args.add('--remove-orphans');

        await this.executeComposeCommand(['up', ...args]);
    }

    /**
     * Restarts the containers
     */
    public async restart(opt?: UpOptions & {
        // If true, a "down" and "up" is performed instead of a restart
        force?: boolean;
    }) {
        if (opt?.force) {
            await this.down();
        } else {
            await this.stop();
        }
        return this.up(opt);
    }

    /**
     * Stops containers
     */
    public async stop(args?: string[]) {
        await this.executeComposeCommand(['stop', ...(args ?? [])]);
    }

    /**
     * Stops and removes containers
     */
    public async down(args?: string[]) {
        await this.executeComposeCommand(['down', ...(args ?? [])]);
    }

    /**
     * Removes all containers and volumes of the project
     */
    public async clean(doConfirm?: boolean): Promise<void> {
        if (!doConfirm) {
            doConfirm = await confirm({
                message: 'Are you sure you want to remove all containers and volumes?',
                default: true
            });
        }

        if (!doConfirm) {
            return;
        }

        if (await this.getRuntimeType() === 'docker') {
            await this.executeComposeCommand(['down', '--rmi', 'all', '--volumes']);
            await this.executeComposeCommand(['rm', '--force', '--stop', '--volumes']);
        } else {
            await this.executeComposeCommand(['down']);
        }
    }

    /**
     * Shows the logs of the containers
     */
    public async logs(opts?: {
        all?: boolean,
        args?: Array<string>,
    }) {
        opts = opts || {};
        const args = new Set(opts.args || []);
        // Check if there are any args, that do not start with a dash (this means no service is specified)
        // But only, if "all" is not set
        if (!opts.all && Array.from(args).some(arg => !arg.startsWith('-'))) {
            args.add(this._context.getConfig().docker.defaultServiceName);
        }

        await this.executeComposeCommand(['logs', ...args]);
    }

    /**
     * Shows the status of the containers
     * @param args
     */
    public async ps(args?: Array<string>) {
        await this.executeComposeCommand(['ps', ...(args ?? [])]);
    }

    /**
     * Returns the help text of a docker-compose command
     * YOU MUST call the getDockerComposeExecutable() method before calling this method! This is a workaround because Command.addHelpText is synchronous and does not support async functions
     */
    public getComposeCommandHelp(command: string): string {
        if (!this._dockerComposeExecutable) {
            throw new Error('Please execute the DockerContext.getDockerComposeExecutable() method, first - This is a workaround because Command.addHelpText is synchronous and does not support async functions');
        }

        const composeExecutable = this._dockerComposeExecutable;
        const result = execSync(`${composeExecutable} ${command} --help`).toString();

        // Remove everything before the "options" section
        const resultTrimmed = result.substring(result.indexOf('Options:'));
        return `\n  Inherited "${command}" docker compose command ${resultTrimmed}`;
    }

    /**
     * Executes a command in a container or opens a shell
     */
    public async ssh(serviceName?: string, cmd?: string) {
        const service = serviceName ?? this._context.getConfig().docker.defaultServiceName;

        // Start the service if it's not running
        if (!(await this.isComposeServiceRunning(service))) {
            await this.up({args: [service]});
        }

        const containerId = await this.getContainerIdFromServiceName(service);
        const shell = await this.findShellOfContainer(containerId);

        const command = cmd ? [shell, '-c', cmd] : [shell];

        await this.executeCommandInContainer(containerId, command);
    }

    /**
     * Provides environment variables based on runtime type
     */
    protected async getEnvironmentVariables(): Promise<Record<string, string>> {
        const runtimeType = await this.getRuntimeType();
        const defaultUid = this._context.getConfig().docker.defaultUid;
        const defaultGid = this._context.getConfig().docker.defaultGid;

        const env: Record<string, string> = {
            ...process.env,
            FORCE_COLOR: '1',
            BUILDKIT_PROGRESS: 'plain',
            COMPOSE_DOCKER_CLI_BUILD: '1',
            DOCKER_BUILDKIT: '1'
        };

        if (runtimeType === 'podman') {
            env.DOCKER_RUNTIME = 'podman';
            env.DOCKER_USER = 'root';
        } else {
            env.DOCKER_RUNTIME = 'docker';
            env.DOCKER_USER = `${defaultUid}:${defaultGid}`;
            env.DOCKER_UID = defaultUid;
            env.DOCKER_GID = defaultGid;
        }

        return env;
    }

    /**
     * Internal helper to execute a command in a child process.
     * @param command The executable to run
     * @param args Array of arguments to pass to the executable
     * @param foreground If true, the output is printed to the console (default: true)
     * @param handleAsSuccess A callback that is called if the command IS CLOSED with a non-zero code. If it returns true, the error is handled as success.
     * @param handleError A callback that is called if the command exits with an error. If it returns true, the error is handled as success.
     * @protected
     */
    protected async executeCommand(
        command: string,
        args: Array<string>,
        foreground?: boolean,
        handleAsSuccess?: () => boolean,
        handleError?: (error: Error, stdout: string, stderr: string) => Promise<boolean>
    ): Promise<{
        stdout: string,
        stderr: string
    }> {
        // Remove empty strings or undefined/null values
        args = args.filter(arg => arg !== undefined && arg !== null && arg !== '');

        const child = spawn(
            command,
            args,
            {
                env: await this.getEnvironmentVariables(),
                cwd: process.cwd(),
                stdio: [
                    'inherit',
                    'pipe',
                    'pipe'
                ]
            }
        );

        let forceQuit = false;

        let stdout = '';
        child.stdout.on('data', (data) => {
            stdout += data.toString();
            if (foreground !== false) {
                process.stderr.write(data);
            }
        });

        let stderr = '';
        child.stderr.on('data', (data) => {
            stderr += data.toString();
            if (foreground !== false) {
                process.stderr.write(data);
            }
        });

        process.on('SIGINT', () => { // Catch Ctrl+C
            forceQuit = true;
            child.kill('SIGINT');
        });

        process.on('SIGTERM', () => {
            forceQuit = true;
            child.kill('SIGTERM');
        });

        return new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
            const executeHandleError = (error: Error) => {
                if (!handleError) {
                    reject(error);
                    return;
                }

                handleError(error, stdout, stderr)
                    .then((handled) => {
                        if (handled) {
                            resolve({stdout, stderr});
                        } else {
                            reject(error);
                        }
                    })
                    .catch(() => {
                        reject(error);
                    });
            };

            child.on('close', (code: number) => {
                if (nonErrorExitCodes.includes(code) || forceQuit || (handleAsSuccess && handleAsSuccess())) {
                    resolve({stdout, stderr});
                    return;
                }

                executeHandleError(new Error(`command "${command} ${args.join(' ')}" exited with code ${code}`));
            });

            child.on('error', executeHandleError);
        });
    }

    /**
     * Finds the shell of a container
     * @param containerId the ID of the container to find the shell for
     * @returns the path to the shell executable
     */
    protected async findShellOfContainer(containerId: string): Promise<string> {
        const shellOptions = this._context.getConfig().docker.shellsToUse;

        // Check if "which" or "command" are available
        let whichCommand: string[] | undefined;

        try {
            await this.executeDockerCommand(['exec', containerId, 'which', 'which'], false);
            whichCommand = ['which'];
        } catch (e) {
            try {
                await this.executeDockerCommand(['exec', containerId, 'command'], false);
                whichCommand = ['command', '-v'];
            } catch (e) {
                // Silence...
            }
        }

        // Method 1: Using `docker exec <container_name_or_id> which <shell>` to find the a shell
        if (whichCommand) {
            for (const shell of shellOptions) {
                try {
                    const result = await this.executeDockerCommand(['exec', containerId, ...whichCommand, shell], false);
                    return result.stdout.trim();
                } catch (e) {
                    // Silence...
                }
            }
        }

        // Method 2: Inspecting the image configuration
        try {
            const inspectResult = await this.executeDockerCommand(['inspect', containerId], false);
            const inspectData = JSON.parse(inspectResult.stdout);
            if (inspectData && inspectData.length > 0) {
                // Check for explicitly defined shell
                if (inspectData[0].Config && inspectData[0].Config.Shell) {
                    return inspectData[0].Config.Shell[0];
                }
            }
        } catch (e) {
            // Silence...
        }

        // Method 3: Looking at /etc/passwd for real shells
        try {
            const passwdContent = await this.executeDockerCommand(['exec', containerId, 'cat', '/etc/passwd'], false);
            const lines = passwdContent.stdout.split('\n').map(line => line.trim());
            for (const line of lines) {
                const fields = line.split(':');
                const shell = fields.pop();
                if (shell && shell.startsWith('/')) {
                    for (const commonShell of shellOptions) {
                        if (shell.endsWith(commonShell)) {
                            return shell;
                        }
                    }
                }
            }
        } catch (e) {
            // Silence...
        }

        // If we reached here, throw an error
        throw new Error('Unable to determine shell for container ' + containerId);
    }
}
