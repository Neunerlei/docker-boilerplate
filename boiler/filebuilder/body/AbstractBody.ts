import {FileBuilderParser} from '../FileBuilder';

export abstract class AbstractBody {
    public abstract getValue(): any;

    public outputParser?(): FileBuilderParser;
}
