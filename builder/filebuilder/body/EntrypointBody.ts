import {AbstractBody} from './AbstractBody';
import {SortedKeyedList} from '../../util/SortedKeyedList';

export class EntrypointBody extends AbstractBody {
    private readonly _commands: SortedKeyedList<string, string> = new SortedKeyedList();
    private _mainCommand: string;

    public constructor(command: string) {
        super();
        this._mainCommand = command;
    }

    public getMainCommand(): string {
        return this._mainCommand;
    }

    public setMainCommand(command: string): this {
        this._mainCommand = command;
        return this;
    }

    public hasCommand(key: string): boolean {
        return this._commands.has(key);
    }

    public getCommand(key: string): string | undefined {
        return this._commands.get(key);
    }

    public addCommand(key: string, command: string, override?: boolean): this {
        this._commands.add(key, command, override);
        return this;
    }

    public addCommandBefore(key: string, beforeKey: string, command: string, override?: boolean): this {
        this._commands.addBefore(key, beforeKey, command, override);
        return this;
    }

    public addCommandAfter(key: string, afterKey: string, command: string, override?: boolean): this {
        this._commands.addAfter(key, afterKey, command, override);
        return this;
    }

    public removeCommand(key: string): this {
        this._commands.remove(key);
        return this;
    }

    public getValue() {
        return {
            mainCommand: this._mainCommand,
            commands: this._commands.values().map(v => v.trim())
        }
    }

    public toString(): string {
        const content = ['#!/bin/bash'];

        const commands = [...this._commands.values(), this._mainCommand];

        for (const command of commands) {
            content.push(command);
        }

        return content.join('\n\n');
    }
}
