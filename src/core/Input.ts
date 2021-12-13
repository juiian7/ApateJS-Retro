import { Button } from "../utils/Button.js";
import { Screen } from "./Screen.js";

interface RegisteredButtons {
    up: {
        btn: Button;
        action: Function;
    }[];
    down: {
        btn: Button;
        action: Function;
    }[];
}

// TODO: Controller handling
export class Input {
    private pressedKeys: string[] = [];
    public isMousePressed: boolean = false;
    public mousePos = { x: 0, y: 0 };

    private buttons: { [name: string]: Button } = {};

    private registeredButtons: RegisteredButtons = { up: [], down: [] };

    private controllers: Gamepad[] = [];

    private _screen: Screen;
    private _rootElement: HTMLElement;

    constructor(rootElement: HTMLElement, screen: Screen) {
        this._screen = screen;
        this._rootElement = rootElement;

        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));

        rootElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        rootElement.addEventListener("mouseup", this.onMouseUp.bind(this));
        rootElement.addEventListener("mousemove", this.onMouseMove.bind(this));

        rootElement.addEventListener("touchstart", this.onTouchStart.bind(this));
        rootElement.addEventListener("touchend", this.onTouchEnd.bind(this));
        rootElement.addEventListener("touchmove", this.onTouchMove.bind(this));

        window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));

        for (const btn of [Button.up, Button.down, Button.left, Button.right, Button.action1, Button.action2, Button.cancel]) {
            this.addButton(btn);
        }
    }

    private onGamepadConnected(ev: GamepadEvent) {
        console.log("Controller connected! Name: " + ev.gamepad.id);
        this.controllers = navigator.getGamepads();
        console.log(this.controllers);

        console.log(ev);
    }

    private onGamepadDisconnected(ev: GamepadEvent) {
        console.log("Controller disconnected!");
        this.controllers = navigator.getGamepads();
    }

    private onKeyDown(ev: KeyboardEvent) {
        this.pressedKeys.push(ev.code);

        this.runRegisteredActions("down", ev.code);
    }
    private onKeyUp(ev: KeyboardEvent) {
        this.pressedKeys = this.pressedKeys.filter((code) => code != ev.code);

        this.runRegisteredActions("up", ev.code);
    }

    private runRegisteredActions(ev: "down" | "up", key: string) {
        for (let i = 0; i < this.registeredButtons[ev].length; i++) {
            if (this.registeredButtons[ev][i].btn.keybinds.includes(key)) {
                this.registeredButtons[ev][i].action();
            }
        }
    }

    private onMouseDown(ev: MouseEvent) {
        this.isMousePressed = true;
        this.runRegisteredActions("down", "mouse");
    }
    private onMouseUp(ev: MouseEvent) {
        this.isMousePressed = false;
        this.runRegisteredActions("up", "mouse");
    }

    private onMouseMove(ev: MouseEvent) {
        this.mousePos.x = Math.floor(ev.offsetX / this._screen.scale);
        this.mousePos.y = Math.floor(ev.offsetY / this._screen.scale);
    }

    private onTouchStart(ev: TouchEvent) {
        this.isMousePressed = true;
        this.runRegisteredActions("down", "mouse");
    }
    private onTouchEnd(ev: TouchEvent) {
        this.isMousePressed = false;
        this.runRegisteredActions("up", "mouse");
    }

    private onTouchMove(ev: TouchEvent) {
        ev.preventDefault();

        this.mousePos.x = Math.floor(ev.touches[0].pageX / this._screen.scale);
        this.mousePos.y = Math.floor(ev.touches[0].pageY / this._screen.scale);
    }

    public on(btn: Button | "mouse" | string, ev: "up" | "down", action: Function) {
        if (typeof btn == "string") {
            this.registeredButtons[ev].push({ btn: new Button(btn, [btn]), action });
        } else {
            this.registeredButtons[ev].push({ btn, action });
        }
    }

    public addButton(btn: Button) {
        this.buttons[btn.name] = btn;
    }

    public removeButton(btn: Button) {
        delete this.buttons[btn.name];
    }

    public clearButtons() {
        this.buttons = {};
    }

    public isButtonDown(btn: Button | string): boolean {
        if (typeof btn == "string") {
            if (!this.buttons[btn]) {
                console.warn("No button with this name registered: " + btn);
                return false;
            }

            btn = this.buttons[btn];
        }

        for (let i = 0; i < btn.keybinds.length; i++) {
            if (this.pressedKeys.includes(btn.keybinds[i])) return true;
        }

        if (btn.controllerBind != null && this.controllers.length > 0) {
            this.controllers = navigator.getGamepads(); // need to call getGamepads to refresh list

            for (let i = 0; i < this.controllers.length; i++) {
                if (this.controllers[i].buttons[btn.controllerBind].pressed) {
                    return true;
                }
            }
        }

        return false;
    }

    public getAxis(): { v: number; h: number } {
        let axis = { v: 0, h: 0 };

        if (this.controllers.length > 0) {
            axis.h = navigator.getGamepads()[0].axes[0];
            axis.v = navigator.getGamepads()[0].axes[1] * -1;

            if (axis.h != 0 || axis.v != 0) return axis;
        }

        if (this.isButtonDown(Button.up)) axis.v += 1;
        if (this.isButtonDown(Button.down)) axis.v -= 1;
        if (this.isButtonDown(Button.right)) axis.h += 1;
        if (this.isButtonDown(Button.left)) axis.h -= 1;

        return axis;
    }
}
