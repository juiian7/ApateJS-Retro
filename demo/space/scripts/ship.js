import { Entity, Particle, ParticleSystem, spritelib } from "../../../dist/apate.js";
import apate, { storage } from "../game.js";
import EnemySystem from "./enemySystem.js";
import StarMap from "./starMap.js";

let bulletSystem = new ParticleSystem(true, 0, true);

export default class Ship extends Entity {
    /**
     *
     * @param {StarMap} starMap
     * @param {EnemySystem} enemySystem
     */
    constructor(starMap, enemySystem) {
        super({ bindThisOnEventAction: false, storage, allowOwnEvents: true });
        storage.shipX = 60;
        storage.shipY = 100;

        this.starMap = starMap;
        this.enemySystem = enemySystem;

        this.autoShoot = false;
        this.shootsPerSec = 2;
        this.nextShoot = 1000 / this.shootsPerSec;

        bulletSystem.lateUpdate = function () {
            let particles = this.particles;
            let enemies = enemySystem.enemies;

            for (let i = 0; i < particles.length; i++) {
                for (let j = 0; j < enemies.length; j++) {
                    if (this.apate.physic.isCollision(particles[i].x, particles[i].y, 8, 8, enemies[j].x, enemies[j].y, 8, 8)) {
                        enemySystem.kill(enemies[j]);
                    }
                }
            }
        };
    }

    async init() {
        this.shipSprite = await spritelib.load(document.querySelector("#ship"));
        this.bulletSprite = await spritelib.load(document.querySelector("#bullet"));

        this.apate.activeScene.add(bulletSystem);
    }

    update(delta) {
        let axis = apate.input.getAxis();
        storage.shipX += axis.h * delta * 0.1;
        storage.shipY -= axis.v * delta * 0.05;

        this.starMap.velocityModifier = axis.v;
        this.enemySystem.velocityModifier = axis.v < 0 ? 0.1 : axis.v * 1;

        this.nextShoot -= delta;
        if (this.nextShoot < 0 && this.apate.input.isButtonDown("action1")) {
            this.nextShoot = 1000 / this.shootsPerSec;

            bulletSystem.spawn(new Particle({ x: storage.shipX, y: storage.shipY - 6, sprite: this.bulletSprite, velY: -4 }));
        }

        apate.draw.sprite(Math.round(storage.shipX), Math.round(storage.shipY), this.shipSprite);
    }
}
