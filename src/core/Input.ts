import { Button } from "../utils/Button.js";

// TODO: Controller handling
export class Input {
    private pressedKeys: string[] = [];
    public isMousePressed: boolean = true;

    private registeredButtons: { [name: string]: Button } = {};

    constructor(rootElement: HTMLElement) {
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));

        rootElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        rootElement.addEventListener("mouseup", this.onMouseUp.bind(this));

        for (const btn of [Button.up, Button.down, Button.left, Button.right, Button.action1, Button.action2, Button.cancel]) {
            this.registerButton(btn);
        }
    }

    private onKeyDown(ev: KeyboardEvent) {
        this.pressedKeys.push(ev.code);
    }
    private onKeyUp(ev: KeyboardEvent) {
        this.pressedKeys = this.pressedKeys.filter((code) => code != ev.code);
    }
    private onMouseDown(ev: MouseEvent) {}
    private onMouseUp(ev: MouseEvent) {}

    public registerButton(btn: Button) {
        this.registeredButtons[btn.name] = btn;
    }

    public isButtonDown(btn: Button | string): boolean {
        if (typeof btn == "string") {
            if (!this.registeredButtons[btn]) {
                console.warn("No button with this name registered: " + btn);
                return false;
            }

            btn = this.registeredButtons[btn];
        }

        for (let i = 0; i < btn.keybinds.length; i++) {
            if (this.pressedKeys.includes(btn.keybinds[i])) return true;
        }

        return false;
    }

    public getAxis(): { v: number; h: number } {
        let axis = { v: 0, h: 0 };

        if (this.isButtonDown(Button.up)) axis.v += 1;
        if (this.isButtonDown(Button.down)) axis.v -= 1;
        if (this.isButtonDown(Button.right)) axis.h += 1;
        if (this.isButtonDown(Button.left)) axis.h -= 1;

        return axis;
    }
}
