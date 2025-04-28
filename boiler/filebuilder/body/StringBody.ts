import {AbstractBody} from "./AbstractBody";

export class StringBody extends AbstractBody {
    private _value: string;

    public constructor(data: string) {
        super();
        this._value = data;
    }

    public getValue(): string {
        return this._value;
    }

    public setValue(data: string): this {
        this._value = data;
        return this;
    }

    public append(data: string, newLine?: boolean): this {
        this._value += newLine ? '\n' + data : data;
        return this;
    }

    public prepend(data: string, newLine?: boolean): this {
        this._value = newLine ? data + '\n' + this._value : data + this._value;
        return this;
    }

    public toString(): string {
        return this._value;
    }
}
