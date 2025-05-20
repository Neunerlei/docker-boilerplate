import chalk from 'chalk';

const errors: string[] = [];
const warnings: string[] = [];

export function logBootError(message: string, reason?: any) {
    if (typeof reason === 'object' && typeof reason.message === 'string') {
        message += `: ${reason.message}`;
    }
    errors.push(message);
}

export function logBootWarning(message: string) {
    warnings.push(message);
}

export function showBootLog() {
    if (errors.length > 0) {
        console.error(chalk.red.bold('There were errors while booting:'));
        for (const error of errors) {
            console.error(chalk.red(` - ${error}`));
        }
    }

    if (warnings.length > 0) {
        console.warn(chalk.yellow.bold('There were warnings while booting:'));
        for (const warning of warnings) {
            console.warn(chalk.yellow(` - ${warning}`));
        }
    }
}
