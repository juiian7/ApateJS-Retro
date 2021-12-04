import { Color, ParticleSystem } from "../../../dist/apate.js";

export default class StarMap extends ParticleSystem {
    constructor() {
        super(true, 0, false);

        this.repeat = true;
        this.velocityModifier = 0;
    }

    init() {
        for (let i = 0; i < 100; i++) {
            this.spawn({
                x: this.apate.random.betweenInt(0, 128),
                y: this.apate.random.betweenInt(-128, 128),
                velY: this.apate.random.between(1, 2),
                color: Color.white,
            });
        }
    }

    lateUpdate() {
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].y > 128 && this.repeat) this.particles[i].y -= 256;

            this.particles[i].y += this.velocityModifier;
        }
    }
}
