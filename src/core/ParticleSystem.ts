import { Color } from "../utils/color.js";
import { Entity } from "./Entity.js";

type Sprite = ImageData;

export class Particle {
    x: number = 0;
    y: number = 0;
    c: Color = Color.magenta;
    sprite?: Sprite;
    velX: number = 0;
    velY: number = 0;
    lifetime: number = Infinity;

    constructor(particle?: Particle) {
        if (!particle) particle = {} as any;
        let k = Object.keys(particle);
        for (let i = 0; i < k.length; i++) {
            this[k[i]] = particle[k[i]];
        }
    }
}
const defaultParticle = new Particle();

export class ParticleSystem extends Entity {
    particles: Particle[] = [];
    public isRunning: boolean;
    public particlesPerSecond: number;

    private nextSpawn: number;
    private applyDelta: boolean;

    constructor(autoStart: boolean = true, pps: number = 1, applyDelta: boolean = false) {
        super({ allowOwnEvents: true });

        this.isRunning = autoStart;
        this.particlesPerSecond = pps;
        this.nextSpawn = 1000 / pps;

        this.applyDelta = applyDelta;
    }

    init() {}

    spawn(particle: Particle) {
        this.particles.push({ ...defaultParticle, ...particle });
    }

    update(delta: number) {
        if (!this.isRunning) return;

        this.nextSpawn -= delta;
        if (this.nextSpawn < 0) {
            this.nextSpawn = 1000 / this.particlesPerSecond;

            this.spawn(this.generateParticle());
        }

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].lifetime -= delta;

            if (this.particles[i].lifetime < 0) {
                this.particles.splice(i, 1);
                i--;
                continue;
            }

            if (this.applyDelta) {
                this.particles[i].x += this.particles[i].velX * delta * 0.05;
                this.particles[i].y += this.particles[i].velY * delta * 0.05;
            } else {
                this.particles[i].x += this.particles[i].velX;
                this.particles[i].y += this.particles[i].velY;
            }

            if (this.particles[i].sprite) {
                this.apate.draw.sprite(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].sprite);
            } else this.apate.draw.pixel(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].c);
        }

        this.lateUpdate(delta);
    }

    kill(particle: Particle) {
        let i = this.particles.indexOf(particle);
        if (i > -1) this.particles.splice(i, 1);
    }

    clearAll() {
        this.particles = [];
    }

    lateUpdate(delta) {}

    generateParticle() {
        return defaultParticle;
    }

    destroy() {}
}
