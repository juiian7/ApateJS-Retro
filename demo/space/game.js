import { Apate, Button, Color, Entity, Scene, spritelib, Transition } from "../../dist/apate.js";

import EnemySystem from "./scripts/enemySystem.js";
import Ship from "./scripts/ship.js";
import StarMap from "./scripts/starMap.js";

let apate = new Apate();

export var storage = {
    shipSprite: spritelib.loadSync(document.querySelector("#ship")),
    bulletSprite: spritelib.loadSync(document.querySelector("#bullet")),
    enemyFrames: spritelib.split(spritelib.loadSync(document.querySelector("#enemy")), 8, 8, 0),
};
export default apate;

apate.showInfo = true;
apate.clearColor = new Color(12, 10, 30);

let btnR = new Button("restart", ["KeyR"], 2);
apate.input.addButton(btnR);

let transition = new Transition(200);
transition.set({
    draw: function (drawlib) {
        drawlib.rect(0, 0, 128, Math.round(128 * this.progress), Color.white);
    },
});

class Game extends Scene {
    constructor() {
        super(transition, apate);

        this.isGameOver = false;
        this.starMap = new StarMap();
        this.enemySystem = new EnemySystem();
        this.ship = new Ship(this.starMap, this.enemySystem);

        this.add(this.starMap);
        this.add(this.enemySystem);
        this.add(this.ship);

        this.enemySystem.isRunning = true;
    }

    gameOver() {
        this.isGameOver = true;
        this.remove(this.ship);

        this.starMap.repeat = false;
        this.starMap.velocityModifier = 4;

        this.enemySystem.particlesPerSecond = 0;
        this.enemySystem.nextFrame = 0;
        this.enemySystem.velocityModifier = 4;

        let gameOver = new Entity();
        gameOver.storage.hasRestarted = false;
        gameOver.set({
            update: function (delta) {
                if (this.apate.input.isButtonDown(btnR) && !gameOver.storage.hasRestarted) {
                    restart();
                    gameOver.storage.hasRestarted = true;
                }
            },
            draw: function (draw) {
                draw.text(Math.round(64 - apate.draw.measureText("Game Over", 2) / 2), 60, "Game Over", Color.white, 2);
                draw.text(Math.round(64 - apate.draw.measureText("Press -R- to restart") / 2), 75, "Press -R- to restart", Color.white);
            },
        });

        this.add(gameOver);
    }
}

function restart() {
    new Game().load();
}
restart();

apate.run();
