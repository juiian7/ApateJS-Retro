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
    protected screen: Screen;

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

        var lastTime = new Date().getTime();
        var time = 0;
        var delta = 0;

        var nextSecond = 100;

        var lastFrames = 0;
        var frameCounter = 0;

        var loop = () => {
            time = new Date().getTime();
            delta = time - lastTime;

            nextSecond -= delta;

            if (nextSecond < 0) {
                nextSecond = 1000;
                lastFrames = frameCounter;
                frameCounter = 0;
            }

            this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);

            // update
            this._activeScene.update(delta);
            this.physic.checkAllCollisions();

            // draw
            this._activeScene.draw(this.draw);
            if (this.showInfo) this.draw.text(1, 1, "FPS:" + lastFrames, Color.white);

            this.screen.updateScreen();

            lastTime = time;
            frameCounter++;

            if (!this.lastFrame) window.requestAnimationFrame(loop);
        };

        window.requestAnimationFrame(loop);
    }

    public clear() {
        this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);
    }

    public stop() {
        this.lastFrame = true;
    }

    public resize(width: number, height: number) {
        this.screen.resize(width, height);
    }

    public rescale(scale: number) {
        this.screen.scale = scale;
    }

    public get htmlElement(): HTMLElement {
        return this.screen.canvas;
    }
}
