import type {EventBus} from './EventBus.js';
import PrettyError from 'pretty-error';
import chalk from 'chalk';

export class CommonUi {
    private _events: EventBus;

    constructor(events: EventBus) {
        this._events = events;
    }

    public get logo(): string {
        return `  █▄▄▄▄▄▄█
  ▐${chalk.gray('║║║║║║')}▌    ${chalk.blueBright('|')}
  ▐${chalk.gray('║║║║║║')}▌    ${chalk.blueBright('|    ,---.,---.,-.-.')}
  █${chalk.blueBright('▒▒▒▒░░')}█    ${chalk.blueBright('|    |   ||   || | |')}
  ▀${chalk.blueBright('░░░░░')} ▀    ${chalk.blueBright(`\`---'\`---'\`---'\` ' '`)}`;
    }

    public get logoBroken(): string {
        return `  ▄▄■▄▄▄▄▄
  ▐║ │║║║▀        |
  ▐║  ║ ║▌    ,---|,---.,---.,-.-.
  █▒▀▒▀░░█    |   ||   ||   || | |
   ░   ░ ▀    \`---'\`---'\`---'\` ' '`;
    }

    public get errorHeader(): string {
        const value = `
${chalk.red(this.logoBroken)}
`;
        return this._events.triggerSync('ui:filter:errorHeader', {value}).value;
    }

    public get welcome(): string {
        const value = `
${this.logo}

  ${chalk.bold('Weave docker environments with ease!')}
`;
        return this._events.triggerSync('ui:filter:welcome', {value}).value;
    }

    public renderError(error: Error): string {
        if (error.message.includes('User force closed the prompt')) {
            return '';
        }

        return [
            this.errorHeader,
            (new PrettyError()).render(error)
        ].join('\n');
    }
}
