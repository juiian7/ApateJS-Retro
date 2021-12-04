import { Color, Particle, ParticleSystem, spritelib } from "../../../dist/apate.js";

export default class EnemySystem extends ParticleSystem {
    constructor() {
        super(true, 1, true);

        this.fps = 10;
        this.nextFrame = 1000 / this.fps;

        this.velocityModifier = 0;

        this.explosionSystem = new ParticleSystem(true, 0, true);
    }

    get enemies() {
        return this.particles;
    }

    async init() {
        let sprite = spritelib.loadSync(document.querySelector("#enemy"));
        this.frames = spritelib.split(sprite, 8, 8, 0);

        this.apate.activeScene.add(this.explosionSystem);
    }

    lateUpdate(delta) {
        this.nextFrame -= delta;
        if (this.nextFrame < 0) {
            this.nextFrame = 1000 / this.fps;

            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].frame++;
                if (this.particles[i].frame >= this.frames.length) this.particles[i].frame = 0;

                this.particles[i].sprite = this.frames[this.particles[i].frame];
            }
        }

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].y += this.velocityModifier;

            if (!this.apate.activeScene.isGameOver && this.particles[i].y > 122) {
                this.apate.activeScene["gameOver"]();
            }
        }
    }

    kill(p) {
        for (let i = 0; i < 10; i++) {
            this.explosionSystem.spawn({ x: p.x, y: p.y, velX: this.apate.random.betweenInt(-1, 1), velY: -1, lifetime: 100, c: Color.red });
        }
        super.kill(p);
    }

    generateParticle() {
        return new Particle({ x: this.apate.random.betweenInt(0, 120), y: -10, sprite: this.frames[0], frame: 0, velY: 0.3 });
    }
}
