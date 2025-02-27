import deepmerge from "deepmerge";
import {AbstractBody} from "./AbstractBody";

export class ObjectBody extends AbstractBody {
    private _value: Record<string, any>;

    public constructor(value: Record<string, any>) {
        super();
        this._value = value;
    }

    public get(key: string): any {
        return this._value[key];
    }

    public set(key: string, value: any): void {
        this._value[key] = value;
    }

    public getValue(): Record<string, any> {
        return this._value;
    }

    public merge(value: Record<string, any>): void {
        this._value = deepmerge(this._value, value);
    }
}
