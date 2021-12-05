import { DrawLib } from "../utils/drawlib.js";
import type { Engine } from "./Engine.js";

interface ApateEventCollection {
    init?: () => void;
    update?: (delta: number) => void;
    draw?: (draw: DrawLib) => void;
    destroy?: () => void;
}

interface EntityConfig {
    allowOwnEvents?: boolean;
    bindThisOnEventAction?: boolean;
    storage?: any;
}

const defaultConfig: EntityConfig = {
    allowOwnEvents: false,
    bindThisOnEventAction: true,
    storage: {},
};

export class Entity {
    // init called from scene after entity is appended
    public isInitialized: boolean = false;
    // after init scene sets acitve engine
    public apate?: Engine;

    public doUpdate: boolean = true;
    public doDraw: boolean = true;

    public set isActive(value: boolean) {
        this.doUpdate = value;
        this.doDraw = value;
    }

    private config: EntityConfig;

    public storage: any; // used to save entity vars -> easily saveable

    constructor(config?: EntityConfig) {
        this.config = { ...defaultConfig, ...config };
        this.storage = this.config.storage;
    }

    public set(events: ApateEventCollection) {
        let newEvents = Object.keys(events);
        for (let i = 0; i < newEvents.length; i++) {
            if (this[newEvents[i]] || this.config.allowOwnEvents) {
                this[newEvents[i]] = this.config.bindThisOnEventAction ? events[newEvents[i]].bind(this) : events[newEvents[i]];
            } else {
                console.warn("Not allowed to use event " + newEvents[i]);
            }
        }
    }

    public on(event: string, action: Function) {
        let ev = {};
        ev[event] = action;
        this.set(ev);
    }

    public init() {}
    public update(delta: number) {}
    public draw(draw: DrawLib) {}
    public destroy() {}
}
