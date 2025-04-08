import type {ConcreteInstaller} from './installer/concrete/types.ts';
import type {EnvFile} from './EnvFile.ts';

interface EventTypes {
    'docker:up:before': { args: Set<string> };
    'installer:before': { installer: ConcreteInstaller };
    'installer:dependencies:before': undefined;
    'installer:loopbackIp:before': { ip: string };
    'installer:domain:before': { domain: string, ip: string };
    'installer:certificates:before': undefined;
    'installer:envFile:filter': { envFile: EnvFile };
    'installer:after': undefined;
}

export class EventBus {
    private readonly _events: Map<keyof EventTypes, Set<(arg: EventTypes[keyof EventTypes]) => Promise<void>>> = new Map();

    public async trigger<E extends keyof EventTypes>(event: E, arg: EventTypes[E] = undefined): Promise<EventTypes[E]> {
        const callbacks = this._events.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                await callback(arg);
            }
        }
        return arg;
    }

    public on<E extends keyof EventTypes>(event: E, callback: (arg: EventTypes[E]) => Promise<void>): this {
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event)!.add(callback);
        return this;
    }
}


const b = new EventBus();
