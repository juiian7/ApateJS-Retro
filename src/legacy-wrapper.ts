import { Apate as Engine, Color, Scene as Scene_O, Entity as Entity_O, spritelib, ParticleSystem as ParticleSystem_O, Random } from "./apate.js";

const random = new Random();

class PixelScreen {
    private _apate: Apate_M;
    constructor(apate: Apate_M) {
        this._apate = apate;
    }
    public resize(w, h) {
        this._apate.resize(w, h);
    }
    public get pixel() {
        return this._apate.screen_O.pixelBuffer;
    }
}

type Color_M = { r: number; g: number; b: number };

export function color(r, g, b) {
    return new Color(r, g, b);
}

class Screen {
    public pixelScreen: PixelScreen;
    public _apate: Apate_M;

    constructor(apate: Apate_M) {
        this.pixelScreen = new PixelScreen(apate);
        this._apate = apate;
    }
    drawPixel(x: number, y: number, c: Color_M) {
        this._apate.draw.pixel(Math.round(x), Math.round(y), c);
    }
    drawRect(x: number, y: number, w: number, h: number, c: Color_M) {
        this._apate.draw.rect(Math.round(x), Math.round(y), w, h, c);
    }
    drawSprite(x: number, y: number, spriteObj, scale: number) {
        this._apate.draw.spriteExt(Math.round(x), Math.round(y), spriteObj, scale, null);
    }
    drawText(x: number, y: number, text: string, c: Color_M, options) {
        let lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            this._apate.draw.text(Math.round(x), Math.round(y + i * (5 + (options?.topSpace ?? 1))), lines[i], c, Math.round(options?.scale ?? 1));
        }
    }
}

class Apate_M extends Engine {
    constructor() {
        super();
    }

    public get screen_O() {
        return this.screen;
    }
}

export default class Apate {
    private _apate: Apate_M;
    public screen: Screen;
    private _activeScene: Scene;

    public get random() {
        return this._apate.random;
    }

    public colors = Color;

    public keyMap = defaultkeyMap;

    public set activeScene(val: Scene) {
        this._activeScene = val;
        this._activeScene._scene.apateInstance = this._apate;
    }

    public get activeScene() {
        return this._activeScene;
    }

    constructor() {
        this._apate = new Apate_M();
        this._apate["test"] = "ok";
        this.screen = new Screen(this._apate);
        this.activeScene = new Scene();
        this.autoScale = true;
    }

    public autoPauseOnLeave: boolean = true;

    public setParentElement(el: HTMLElement) {
        el.append(this._apate.htmlElement);
    }

    public set autoScale(val) {
        this._apate.autoScale = val;
    }

    public set clearColor(val: Color) {
        this._apate.clearColor = val;
    }
    public get clearColor() {
        return this._apate.clearColor;
    }

    public on(ev, fun) {
        this[ev] = fun;
    }

    public run() {
        if (this["load"]) this["load"];
        if (this["init"]) this["init"];

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

            this._apate.screen_O.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);

            // update
            this._activeScene.run("update", delta);

            // draw
            this._activeScene.run("draw", this.screen);
            this._apate.draw.text(1, 1, "FPS:" + lastFrames, Color.white);

            this._apate.screen_O.updateScreen();

            lastTime = time;
            frameCounter++;

            window.requestAnimationFrame(loop);
        };

        window.requestAnimationFrame(loop);
    }

    public isButtonPressed(name) {
        return this._apate.input.isButtonDown(name.toLowerCase());
    }
    public loadObjFromBrowser(name: string) {
        return window.localStorage.getItem(name);
    }
    public saveObjToBrowser(name: string, obj) {
        window.localStorage.setItem(name, obj);
    }
}

class Scene_M extends Scene_O {
    constructor() {
        super();
    }
    public get entities_O() {
        return this.entities;
    }
}

export class Scene {
    public _scene: Scene_M;
    public _ents: Entity[] = [];
    constructor() {
        this._scene = new Scene_M();
    }
    init(e: Entity) {
        this._ents.push(e);

        this._scene.add(e._entity);

        this._ents.sort((a, b) => a.priority - b.priority);
    }
    run(ev, ...args) {
        for (let i = 0; i < this._ents.length; i++) {
            if (this._ents[i][ev]) this._ents[i][ev](...args);
        }
    }
}

export class Entity {
    public priority: number = 0;
    public _entity: Entity_O;
    constructor() {
        this._entity = new Entity_O({ allowOwnEvents: true, bindThisOnEventAction: true, storage: {} });
    }

    on(ev, fun) {
        this[ev] = fun;
    }

    update(delta) {}
    draw(draw) {}
}

const defaultkeyMap = {
    up: ["KeyW", "ArrowUp"],
    down: ["KeyS", "ArrowDown"],
    left: ["KeyA", "ArrowLeft"],
    right: ["KeyD", "ArrowRight"],

    action1: ["KeyZ", "KeyN", "KeyC", "Space"],
    action2: ["KeyX", "KeyM", "KeyV"],

    engine_menu: ["Escape"],
    engine_submit: ["Enter", "NumpadEnter"],
};

export class SpriteMgr {
    public imgToSprite(img: HTMLImageElement): ImageData {
        return spritelib.loadSync(img);
    }
    public subSprite(sprite: ImageData, x, y, w, h) {
        return spritelib.split(sprite, w, h, y)[x / w];
    }
}

export class ParticleSystem {
    private _particleSystem: ParticleSystem_O;
    /**
     * @param {ParticleSystemProperties} properties
     */
    constructor(properties: ParticleSystemProperties) {
        let emitDelay = properties?.emitDelay ?? -1;
        this._particleSystem = new ParticleSystem_O(false, emitDelay > 0 ? 1000 / emitDelay : 0, true);

        this._particleSystem.generateParticle = () => {
            return {
                lifetime: properties.lifetime ?? Infinity,
                scale: 1,
                velX: properties.velocity?.x ?? 0,
                velY: properties.velocity?.y ?? 0,
                x: random.betweenInt(properties.origin.x, properties.origin.x + properties.origin.w),
                y: random.betweenInt(properties.origin.y, properties.origin.y + properties.origin.h),
                color: new Color(properties.colors[0].r, properties.colors[0].g, properties.colors[0].b) ?? Color.magenta,
                gravityX: properties.gravity?.x ?? 0,
                gravityY: properties.gravity?.y ?? 0,
            };
        };
    }
    public start() {
        this._particleSystem.isRunning = true;
    }
    public reset() {
        this._particleSystem.clearAll();
    }
    public stop() {
        this._particleSystem.isRunning = false;
    }
    public update(delta) {
        this._particleSystem.update(delta);
    }
    public draw(screen: Screen) {
        this._particleSystem.draw(screen._apate.draw);
    }
}
export var spriteMgr = new SpriteMgr();

/**
 * @typedef ParticleSystemProperties
 * @property {number?} seed
 * @property {number?} amount
 * @property {number?} emitDelay
 * @property {{x:number, y: number, w: number, h: number}?} origin
 * @property {{x:number, y: number, randomMinX: number, randomMinY: number, randomMaxX: number, randomMaxY: number}?} velocity
 * @property {{x:number, y: number}?} gravity
 *
 * @property {number?} lifetime
 * @property {{r: number, g: number, b: number}[]?} colors
 */
interface ParticleSystemProperties {
    seed?: number;
    amount?: number;
    emitDelay?: number;
    origin?: { x?: number; y?: number; w?: number; h?: number };
    velocity?: { x?: number; y?: number; randomMinX?: number; randomMinY?: number; randomMaxX?: number; randomMaxY?: number };
    gravity?: { x?: number; y?: number };
    lifetime?: number;
    colors?: { r?: number; g?: number; b?: number }[];
}
