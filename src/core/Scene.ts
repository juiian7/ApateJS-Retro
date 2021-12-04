import type { DrawLib } from "../utils/drawlib.js";
import { Engine } from "./Engine.js";
import { Entity } from "./Entity.js";

export class Scene {
    private entities: Entity[] = [];
    private _apateInstance?: Engine;

    set apateInstance(value: Engine) {
        this._apateInstance = value;

        // automaticlly reinit entities when instance is changed
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].apate = value;
            this.entities[i].init();
            this.entities[i].isInitialized = true;
        }
    }

    constructor() {}

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
}
