import { Button } from "../utils/button.js";
import { Screen } from "./Screen.js";

interface RegisteredButtons {
    up: {
        btn: Button;
        action: (ev?: ButtonPressEvent) => void;
    }[];
    down: {
        btn: Button;
        action: (ev?: ButtonPressEvent) => void;
    }[];
}

type ButtonPressEvent = KeyboardEvent | null;

export class Input {
    private _screen: Screen;

    private pressedKeys: string[] = [];
    public isMousePressed: boolean = false;
    public mousePos = { x: 0, y: 0 };

    private buttons: { [name: string]: Button } = {};

    private registeredButtons: RegisteredButtons = { up: [], down: [] };

    private gamepads: Gamepad[] = [];
    private gamepadPressedButtons: boolean[] = [];
    public gamepadDeadzone: number = 0.18;

    constructor(screen: Screen) {
        this._screen = screen;

        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));

        screen.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        screen.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        screen.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));

        screen.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
        screen.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
        screen.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));

        window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));

        for (const btn of [Button.up, Button.down, Button.left, Button.right, Button.action1, Button.action2, Button.cancel]) {
            this.addButton(btn);
        }
    }

    private onKeyDown(ev: KeyboardEvent) {
        this.pressedKeys.push(ev.code);
        this.runRegisteredActions("down", "keyboard", ev);
        this.runRegisteredActions("down", ev.code, ev);
    }
    private onKeyUp(ev: KeyboardEvent) {
        this.pressedKeys = this.pressedKeys.filter((code) => code != ev.code);
        this.runRegisteredActions("up", "keyboard", ev);
        this.runRegisteredActions("up", ev.code, ev);
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

    public on(btn: Button | "mouse" | "keyboard" | string, type: "up" | "down", action: (ev?: ButtonPressEvent) => void) {
        if (typeof btn == "string") {
            this.registeredButtons[type].push({ btn: new Button(btn, [btn]), action });
        } else {
            this.registeredButtons[type].push({ btn, action });
        }
    }
    public clearRegisteredButtons() {
        this.registeredButtons = { up: [], down: [] };
    }
    private runRegisteredActions(type: "down" | "up", key: string, ev?: ButtonPressEvent) {
        for (let i = 0; i < this.registeredButtons[type].length; i++) {
            let btn = this.registeredButtons[type][i].btn;
            if (btn.keybinds.includes(key)) {
                if (btn.shiftKey != null && ((btn.shiftKey === false && ev?.shiftKey === true) || (btn.shiftKey === true && ev?.shiftKey === false))) continue;
                if (btn.ctrlKey != null && ((btn.ctrlKey === false && ev?.ctrlKey === true) || (btn.ctrlKey === true && ev?.ctrlKey === false))) continue;
                this.registeredButtons[type][i].action(ev);
            }
        }
    }
    private runRegisteredGamepadActions(type: "down" | "up", btnBind: number) {
        for (let i = 0; i < this.registeredButtons[type].length; i++) {
            if (this.registeredButtons[type][i].btn.controllerBind === btnBind) {
                this.registeredButtons[type][i].action();
            }
        }
    }

    private onGamepadConnected(ev: GamepadEvent) {
        let gamepad = ev.gamepad;
        console.log(`Gamepad connected! Index: ${gamepad.index}, Name: ${gamepad.id}`);
        this.gamepads[gamepad.index] = gamepad;
    }
    private onGamepadDisconnected(ev: GamepadEvent) {
        let gamepad = ev.gamepad;
        console.log(`Gamepad disconnected! Index: ${gamepad.index}`);
        delete this.gamepads[gamepad.index];
    }
    private updateGamepads() {
        // refresh gamepad list outside of Firefox
        if (!("ongamepadconnected" in window)) {
            // get gamepad object and convert it to an array
            this.gamepads = Object.entries(navigator.getGamepads()).map(([key, value]) => value);
        }

        let gamepad = this.getGamepad();
        if (gamepad) {
            for (let i = 0; i < gamepad.buttons.length; i++) {
                if (gamepad.buttons[i].pressed && !this.gamepadPressedButtons[i]) {
                    this.gamepadPressedButtons[i] = true;
                    this.runRegisteredGamepadActions("down", i);
                } else if (!gamepad.buttons[i].pressed && this.gamepadPressedButtons[i]) {
                    this.gamepadPressedButtons[i] = false;
                    this.runRegisteredGamepadActions("up", i);
                }
            }
        }
    }

    public addButton(btn: Button) {
        this.buttons[btn.name] = btn;
    }
    public getButton(btnName: string): Button {
        return this.buttons[btnName];
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

        if (btn.controllerBind != null && this.isGamepadConnected()) {
            if (this.getGamepad().buttons[btn.controllerBind].pressed) {
                return true;
            }
        }

        return false;
    }

    public getAxis(): { v: number; h: number } {
        if (this.isGamepadConnected()) {
            let gamepad = this.getGamepad();
            let ch = gamepad.axes[0];
            let cv = gamepad.axes[1] * -1;

            if (ch > this.gamepadDeadzone || ch < -this.gamepadDeadzone || cv > this.gamepadDeadzone || cv < -this.gamepadDeadzone) {
                return { v: cv, h: ch };
            }
        }

        let axis = { v: 0, h: 0 };

        if (this.isButtonDown(Button.up)) axis.v += 1;
        if (this.isButtonDown(Button.down)) axis.v -= 1;
        if (this.isButtonDown(Button.right)) axis.h += 1;
        if (this.isButtonDown(Button.left)) axis.h -= 1;

        return axis;
    }

    public isGamepadConnected(): boolean {
        return this.gamepads.filter((n) => n).length > 0;
    }

    public getGamepad(): Gamepad {
        if (this.isGamepadConnected()) {
            // get first non null element
            return this.gamepads.find((c) => c != null);
        } else {
            // TODO: return dummy gamepad?
            return null;
        }
    }
}
