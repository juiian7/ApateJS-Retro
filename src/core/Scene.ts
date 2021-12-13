import type { DrawLib } from "../utils/drawlib.js";
import { Engine } from "./Engine.js";
import { Entity } from "./Entity.js";
import { Transition } from "./Transition.js";

export class Scene {
    protected entities: Entity[] = [];
    private _apateInstance?: Engine;
    private _transition?: Transition;

    set apateInstance(value: Engine) {
        this._apateInstance = value;

        // automaticlly reinit entities when instance is changed
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].apate = value;
            this.entities[i].init();
            this.entities[i].isInitialized = true;
        }
    }

    get apateInstance() {
        return this._apateInstance;
    }

    constructor(transition?: Transition, apateInstace?: Engine) {
        this._transition = transition;
        this._apateInstance = apateInstace;
    }

    add(entity: Entity) {
        this.entities.push(entity);

        // init
        if (this._apateInstance) {
            entity.apate = this._apateInstance;
            entity.init();
            entity.isInitialized = true;
        }
    }
    remove(entity: Entity) {
        let i = this.entities.indexOf(entity);
        if (i > -1) this.entities.splice(i, 1);
    }
    update(delta: number) {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].doUpdate) this.entities[i].update(delta);
        }
    }
    draw(draw: DrawLib) {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].doDraw) this.entities[i].draw(draw);
        }
    }

    onLoad() {}

    async load() {
        if (this._apateInstance) {
            if (this._apateInstance.activeScene._transition) {
                this._apateInstance.activeScene.add(this._apateInstance.activeScene._transition);
                await this._apateInstance.activeScene._transition.do("start");
                this._apateInstance.activeScene.remove(this._apateInstance.activeScene._transition);
            }

            this.onLoad();
            this._apateInstance.activeScene = this;

            if (this._transition) {
                this.add(this._transition);
                await this._transition.do("end");
                this.remove(this._transition);
            }
        } else console.error("Can't load scene without apate instance");
    }
}
