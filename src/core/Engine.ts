import { Scene } from "./Scene.js";
import { Screen } from "./Screen.js";
import { Input } from "./Input.js";

import { DrawLib } from "../utils/drawlib.js";
import { Color } from "../utils/Color.js";
import { Random } from "../utils/Random.js";
import { PhysicLib } from "../utils/physiclib.js";
import { spritelib } from "../utils/spritelib.js";

export class Engine {
    private _activeScene: Scene = new Scene();
    private _lastFrame: boolean = false;
    private _cursor: { img?: ImageData; x: number; y: number; scale: number } = { x: 0, y: 0, scale: 1 };

    protected screen: Screen;

    public draw: DrawLib;
    public input: Input;
    public random: Random;
    public physic: PhysicLib;

    public drawCursor: boolean = false;
    public showInfo: boolean = false;
    public autoScale: boolean = false;

    public clearColor: Color = Color.black;

    public set activeScene(value: Scene) {
        // Disable old scene
        if (this._activeScene.apateInstance) this._activeScene.apateInstance = null;

        this._activeScene = value;
        this._activeScene.apateInstance = this;
    }
    public get activeScene(): Scene {
        return this._activeScene;
    }

    constructor() {
        this._activeScene.apateInstance = this;

        this.screen = new Screen();
        this.screen.scale = this.screen.maxScale;

        this.draw = new DrawLib(this.screen);
        this.input = new Input(this.screen.canvas, this.screen);
        this.random = new Random();
        this.physic = new PhysicLib();

        this.draw.loadFont(
            "https://raw.githubusercontent.com/juiian7/ApateJS-Retro/4d178bfea79a0ef601130d7d0c6a69c473e7e1ae/res/default_text.png",
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ.!?:+-*/=()0123456789",
            4
        );

        this.screen.canvas.style.cursor = "none";
        document.body.append(this.screen.canvas);

        window.addEventListener("resize", this.onWindowResize.bind(this));

        this.loadCursor("https://raw.githubusercontent.com/juiian7/ApateJS-Retro/7ff7976ef459c20d3df18275aac089364e2aa731/res/default_cursor.png");
    }

    public async loadCursor(url: string, point?: { x: number; y: number }, scale: number = 1) {
        this._cursor = {
            img: await spritelib.load(url),
            x: point?.x ?? 0,
            y: point?.y ?? 0,
            scale,
        };
    }

    public async loadCursorSync(img: HTMLImageElement, point?: { x: number; y: number }, scale: number = 1) {
        this._cursor = {
            img: spritelib.loadSync(img),
            x: point?.x ?? 0,
            y: point?.y ?? 0,
            scale,
        };
    }

    public run() {
        this._lastFrame = false;

        var lastTime = new Date().getTime();
        var time = 0;
        var delta = 0;

        var nextSecond = 100;

        var lastFrames = 0;
        var frameCounter = 0;

        var tmp = 0;
        var calcCursorColor = (pixels: Uint8Array, ndx: number) => {
            tmp = 255 - (pixels[ndx] + pixels[ndx + 1] + pixels[ndx + 2]) / 3;
            return { r: tmp, g: tmp, b: tmp };
        };

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

            if (this.drawCursor) {
                this.draw.fragment(this.input.mousePos.x, this.input.mousePos.y, this._cursor.img, calcCursorColor, this._cursor.scale);
            }

            this.screen.updateScreen();

            lastTime = time;
            frameCounter++;

            if (!this._lastFrame) window.requestAnimationFrame(loop);
        };

        window.requestAnimationFrame(loop);
    }

    public clear() {
        this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);
    }

    public stop() {
        this._lastFrame = true;
    }

    public resize(width: number, height: number) {
        this.screen.resize(width, height);
        if (this.autoScale) {
            this.screen.scale = this.screen.maxScale;
        }
    }

    public rescale(scale: number) {
        this.screen.scale = scale;
    }

    public get htmlElement(): HTMLElement {
        return this.screen.canvas;
    }

    private onWindowResize(ev: UIEvent) {
        if (this.autoScale) {
            this.screen.scale = this.screen.maxScale;
        }
    }
}
