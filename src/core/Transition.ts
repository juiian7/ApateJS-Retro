import { Entity } from "./Entity.js";

export class Transition extends Entity {
    private index: number = 0;

    protected type: "start" | "end";
    protected duration: number = 200;
    protected progress: number = 0;

    constructor(duration?: number) {
        super();

        this.duration = duration;
    }

    private done() {}

    update(delta: number) {
        if (this.index < 0) return;

        this.index -= delta;

        this.progress = this.index / this.duration;
        if (this.type == "start") this.progress = 1 - this.progress;

        if (this.index < 0) this.done();
    }

    do(type: "start" | "end"): Promise<void> {
        return new Promise((res, rej) => {
            this.index = this.duration;
            this.type = type;
            this.done = res;
            setTimeout(res, this.duration * 2);
        });
    }
}
