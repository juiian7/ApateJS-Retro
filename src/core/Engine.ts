import { Scene } from "./Scene.js";
import { Screen } from "./Screen.js";
import { Input } from "./Input.js";

import { DrawLib } from "../utils/drawlib.js";
import { Color } from "../utils/color.js";
import { Random } from "../utils/random.js";
import { PhysicLib } from "../utils/physiclib.js";
import { spritelib } from "../utils/spritelib.js";

export class Engine {
    private _activeScene: Scene = new Scene();
    private _lastFrame: boolean = false;
    private _cursor: { img?: ImageData; x: number; y: number; scale: number } = { x: 0, y: 0, scale: 1 };
    private _camera: { x: number; y: number } = { x: 0, y: 0 };

    public get screenOffset() {
        return { x: -this._camera.x, y: this._camera.y };
    }

    protected screen: Screen;

    public draw: DrawLib;
    public input: Input;
    public random: Random;
    public physic: PhysicLib;

    public drawCursor: boolean = false;
    public showInfo: boolean = false;
    public autoScale: boolean = true;

    public clearColor: Color = Color.black;

    public set activeScene(value: Scene) {
        this._activeScene = value;
        this._activeScene.apateInstance = this;

        this._activeScene.onLoad();
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
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAAAFCAYAAAAua4JmAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA3KADAAQAAAABAAAABQAAAADuh69NAAACAklEQVRYCa2UW04DQQwECeL+Vw5pkopKjWdn0TJSsPvhtsNHbh/Pd3/V26PShwrOg9vp8U4e5qPnde6TPc8zn7lkTzsnjTnf49mdnkw/ZnvuDPbdzvFt7DqTF29nMg+PB569wexAY8b34DGH3xno7Qd7Jj274JkPzkzr+K7Uo8xJa864+9zV3zWen/duHij9FZxAz+8wXmr8fuHRuuJrD77o1v4De+eqP7sfX1dyuZeKzzp9NPSpwuFPbc44PZjK7ArDU9nRmBxXeya+9R3eZXg+fWPPu8dHPavhu3/RVSWQXxfkxvD2h2tsrvvg3Ute/2J4prWd3/fROw+O3Mb2/rXnf0h25sknC9xe854jC52cVDLM2UfvjJ6JBz05zKQ3D0ZHA0c/+7yTHGaNycYPjje+fNDC9XNWaxNeZbFnmnlzn68uIatD3+bymOeLwTUO7y826cym+pbg+JsLv3o7/7Q/+eHz0NnZ+Ok6/us8cjIBD+ed1uHh8Adfeewnf/pu7LIXLruZme6YZo785HUW9zUf3LeEw88uMPd4Jn5e+JWGxzW5kz8cO+3/1Xs4vT+Y4YLpU3nmzLcebP1ozlrnoK3y7MfDXioe687d8dM8nHfQk2288tuLn3uozTcmGz/Y2WietW+lk4EXH7j1CePtWfjpJrQr9Uzu5GnOuHtjbg13/wZnlB52mTDTXwAAAABJRU5ErkJggg==",
            "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÜÖ0123456789.!?':+-*/=()<>[]",
            4
        );

        this.screen.canvas.style.cursor = "none";
        document.body.append(this.screen.canvas);

        window.addEventListener("resize", this.onWindowResize.bind(this));

        this.loadCursor(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAqADAAQAAAABAAAAAgAAAADtGLyqAAAAEElEQVQIHWP8DwQMIABjAABXzAf6jU4fqAAAAABJRU5ErkJggg=="
        );
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

            if (delta > 400) {
                console.info("Skipping frame");
                window.requestAnimationFrame(loop);
                lastTime = time;
                return;
            }

            this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);

            this.draw.setOffset(this._camera.x, this._camera.y);

            // update
            // @ts-ignore
            this.input.updateGamepads();
            this._activeScene.update(delta);
            this.physic.checkAllCollisions();

            // draw
            this._activeScene.draw(this.draw);

            this.draw.setOffset(0, 0);
            if (this.showInfo) {
                this.draw.text(1, 1, "FPS:" + lastFrames, Color.white);
            }
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

    public camera(x: number, y: number) {
        this._camera.x = x;
        this._camera.y = y;
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
