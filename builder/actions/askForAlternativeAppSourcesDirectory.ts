import {input} from "@inquirer/prompts";

export function askForAlternativeAppSourcesDirectory(
    partialKey: string
): Promise<string> {
    return input({
        message: `The service "${partialKey}" is not registered as the default service, but wants to add an "app" directory. To avoid conflicts, please specify an alternative directory name:`,
        default: partialKey,
        validate: (input: string) => {
            if (input.trim() === '') {
                return 'Please provide a directory name';
            }
            if (input === 'app' || input === '/app') {
                return 'The directory name "app" is reserved for the default service';
            }

            return true;
        }
    })
}
