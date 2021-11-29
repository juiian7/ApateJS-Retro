import { Scene } from "./Scene.js";
import { Screen } from "./Screen.js";
import { Input } from "./Input.js";

import { DrawLib } from "../utils/drawlib.js";
import { Color } from "../utils/color.js";
import { Random } from "../utils/random.js";
import { PhysicLib } from "../utils/physiclib.js";

export class Engine {
    public isCursorVisible: boolean = false;
    private _activeScene: Scene = new Scene();
    private lastFrame: boolean = false;
    private screen: Screen;

    public draw: DrawLib;
    public input: Input;
    public random: Random;
    public physic: PhysicLib;

    public showInfo: boolean = false;

    public clearColor: Color = Color.black;

    public set activeScene(value: Scene) {
        this._activeScene = value;
        this._activeScene.apateInstance = this;
    }
    public get activeScene(): Scene {
        return this._activeScene;
    }

    constructor() {
        this._activeScene.apateInstance = this;

        this.random = new Random();

        this.screen = new Screen();
        this.screen.scale = 8;

        this.draw = new DrawLib(this.screen);
        this.input = new Input(this.screen.canvas);

        this.physic = new PhysicLib();

        this.draw.loadFont("/res/default_text.png", "ABCDEFGHIJKLMNOPQRSTUVWXYZ.!?:+-*/=()0123456789", 4);

        document.body.append(this.screen.canvas);
    }

    public run() {
        this.lastFrame = false;

        let lastTime = new Date().getTime();
        let time = 0;
        let delta = 0;

        let nextSecond = 100;

        let lastFrames = 0;
        let frameCounter = 0;

        let loop = function () {
            time = new Date().getTime();
            delta = time - lastTime;

            nextSecond -= delta;

            if (nextSecond < 0) {
                nextSecond = 1000;
                lastFrames = frameCounter;
                frameCounter = 0;
            }

            this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);

            this._activeScene.update(delta);
            if (this.showInfo) this.draw.text(1, 1, "FPS:" + lastFrames, Color.white);

            this.physic.checkAllCollisions();

            this.screen.updateScreen();

            lastTime = time;
            frameCounter++;

            if (!this.lastFrame) window.requestAnimationFrame(loop);
        };

        loop = loop.bind(this);
        window.requestAnimationFrame(loop);
    }

    public stop() {
        this.lastFrame = true;
    }
}
