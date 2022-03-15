import { DrawLib } from "../utils/drawlib.js";
import { Color } from "../utils/color.js";
import { Button } from "../utils/button.js";
import { Entity } from "./Entity.js";
import { Engine } from "./Engine.js";

export class Window extends Entity {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private color: Color;
    private showTitleBar: boolean;

    private components: WindowComponent[];
    private _selectedIndex: number;

    set selectedIndex(index) {
        console.log(`Selection changed ${this._selectedIndex} -> ${index}`);
        if (this._selectedIndex >= 0) {
            this.components[this._selectedIndex].selected = false;
        }
        this._selectedIndex = index;
        this.components[this._selectedIndex].selected = true;
    }
    get selectedIndex() {
        return this._selectedIndex;
    }

    constructor(x, y, width, height, color?, showTitleBar?) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color ?? Color.white;
        this.showTitleBar = showTitleBar ?? false;

        this.components = [];
        this._selectedIndex = -1;
    }

    public setSize(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public addComponent(component: WindowComponent) {
        component.apate = this.apate;
        component.selected = false;
        component.init();
        this.components.push(component);
    }

    init(): void {
        this.apate.input.on("mouse", "down", () => {
            let rx = Math.floor(this.apate.input.mousePos.x - this.x);
            let ry = Math.floor(this.apate.input.mousePos.y - this.y);

            for (let i = 0; i < this.components.length; i++) {
                const com = this.components[i];
                if (rx >= com.x && rx < com.x + com.width && ry >= com.y && ry < com.y + com.height) {
                    this.selectedIndex = i;
                    com.mouseDown?.(rx - com.x, ry - com.y);
                    break;
                }
            }
        });
        this.apate.input.on("mouse", "up", () => {
            const com = this.components[this.selectedIndex];
            if (com) {
                let rcx = Math.floor(this.apate.input.mousePos.x - this.x - com.x);
                let rcy = Math.floor(this.apate.input.mousePos.y - this.y - com.y);
                this.components[this.selectedIndex]?.mouseUp?.(rcx, rcy);
            }
        });

        this.apate.input.on("keyboard", "down", (ev: KeyboardEvent) => {
            this.components[this.selectedIndex]?.keyDown?.(ev);
        });
        this.apate.input.on("keyboard", "up", (ev: KeyboardEvent) => {
            this.components[this.selectedIndex]?.keyUp?.(ev);
        });

        this.apate.input.on("Tab", "down", (ev: KeyboardEvent) => {
            ev.preventDefault();
            if (this.selectedIndex < this.components.length - 1) {
                this.selectedIndex++;
            } else {
                this.selectedIndex = 0;
            }
        });
        this.apate.input.on(Button.down, "down", () => {
            if (this.selectedIndex < this.components.length - 1) {
                this.selectedIndex++;
            }
        });
        this.apate.input.on(Button.up, "down", () => {
            if (this.selectedIndex > 0) {
                this.selectedIndex--;
            }
        });
    }

    draw(draw: DrawLib): void {
        if (this.color != null) {
            draw.rect(this.x, this.y, this.width, this.height, this.color);
        }

        let offsetX = this.x;
        let offsetY = this.y;

        if (this.showTitleBar) {
            draw.rect(this.x, this.y, this.width, 4, Color.avocado, false);

            // move close button to the right on macos :)
            let lineX = this.apate.isHostAMac ? this.x + 4 : this.x + this.width - 5;
            let crossX = this.apate.isHostAMac ? this.x + 1 : this.x + this.width - 4;
            draw.line(lineX, this.y, lineX, this.y + 4, Color.avocado);
            draw.pixelArr(crossX, this.y + 1, Color.dark_indigo, [
                { x: 0, y: 0 },
                { x: 0, y: 2 },
                { x: 1, y: 1 },
                { x: 2, y: 0 },
                { x: 2, y: 2 },
            ]);
        }

        for (let i = 0; i < this.components.length; i++) {
            this.components[i].draw(draw, offsetX, offsetY);
        }
    }

    update(delta: number): void {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i]?.update(delta);
        }
    }
}

export abstract class WindowComponent {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public color: Color;

    public selected: boolean;
    public apate?: Engine;
    public init(): void {}

    public abstract draw(draw: DrawLib, offsetX: number, offsetY: number): void;
    public update(delta: number): void {}

    // all mouse and key functions are only triggered when the component is selected
    public mouseDown(x: number, y: number): void {}
    public mouseMove(): void {}
    public mouseUp(x: number, y: number): void {}

    public keyDown(ev: KeyboardEvent): void {}
    public keyUp(ev: KeyboardEvent): void {}
}

export class ClickableButton extends WindowComponent {
    public text: string;
    public textColor: Color;

    public onClick: () => void | null;

    constructor(x, y, width, height, color, text?, textColor?) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.text = text ?? null;
        this.textColor = textColor ?? Color.black;
    }

    draw(draw: DrawLib, offsetX: number, offsetY: number): void {
        draw.rect(offsetX + this.x, offsetY + this.y, this.width, this.height, this.color);
        if (this.text != null) {
            let textlength = draw.measureText(this.text);
            let tx = Math.round(offsetX + this.x + (this.width - textlength) / 2);
            let ty = Math.round(offsetY + this.y + (this.height - 6) / 2);
            draw.text(tx, ty, this.text, this.textColor);
        }
    }

    mouseDown(): void {
        this.onClick?.();
    }
}

export class DropDown extends WindowComponent {
    public readonly options: string[];
    public selectedOption: number;

    public onClick: () => void | null;

    constructor(x, y, color, options, selectedIndex) {
        super();
        this.x = x;
        this.y = y;
        this.width = 0;
        this.height = 0;
        this.color = color;
        this.options = options;
        this.selectedOption = selectedIndex;
    }

    draw(draw: DrawLib, offsetX: number, offsetY: number): void {
        /*draw.rect(xoffset + this.x, yoffset + this.y, this.width, this.height, this.color);
        if (this.text != null) {
            let textlength = draw.measureText(this.text);
            let tx = Math.round(xoffset + this.x + (this.width - textlength) / 2);
            let ty = Math.round(yoffset + this.y + (this.height - 6) / 2);
            draw.text(tx, ty, this.text, this.textColor);
        }*/
    }

    mouseDown(): void {
        this.onClick?.();
    }
}

export enum InputFieldAcceptedValues {
    ALL,
    NUMBERS,
    LETTERS,
}

export class InputField extends WindowComponent {
    public acceptedValues: InputFieldAcceptedValues;
    public text: string;
    public textColor: Color;

    constructor(x, y, width, height, text?: string, acceptedValues?: InputFieldAcceptedValues, backcolor?: Color, textcolor?: Color) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text ?? "";
        this.acceptedValues = acceptedValues ?? InputFieldAcceptedValues.ALL;
        this.color = backcolor ?? Color.light_gray;
        this.textColor = textcolor ?? Color.black;
    }

    draw(draw: DrawLib, offsetX: number, offsetY: number): void {
        draw.rect(offsetX + this.x, offsetY + this.y, this.width, this.height, this.color);
        let textlength = draw.measureText(this.text);
        let tx = Math.round(offsetX + this.x + (this.width - textlength) / 2);
        let ty = Math.round(offsetY + this.y + (this.height - 6) / 2);
        draw.text(tx, ty, this.text, this.textColor);
    }

    keyDown(ev: KeyboardEvent): void {
        if (ev.code === "Backspace") {
            this.text = this.text.slice(0, -1);
        } else if (this.isInputAccepted(ev)) {
            this.text += ev.key;
        }
    }

    private isInputAccepted(ev: KeyboardEvent): boolean {
        switch (this.acceptedValues) {
            case InputFieldAcceptedValues.ALL:
                return ev.which === 32 || (ev.which >= 48 && ev.which <= 90) || (ev.which >= 96 && ev.which <= 111) || (ev.which >= 186 && ev.which <= 222);
            case InputFieldAcceptedValues.NUMBERS:
                return (ev.which >= 48 && ev.which <= 57) || (ev.which >= 96 && ev.which <= 111);
            case InputFieldAcceptedValues.LETTERS:
                return ev.which >= 58 && ev.which <= 90;
            default:
                break;
        }
    }
}

export class NumericOption extends WindowComponent {
    public text: string;
    public value: number;
    public minValue: number;
    public maxValue: number;

    private blink: boolean;

    constructor(x, y, text, value, minValue = 0, maxValue = 100) {
        super();
        this.x = x;
        this.y = y;

        this.text = text;
        this.color = Color.black;
        this.value = value;
        this.minValue = minValue;
        this.maxValue = maxValue;

        this.width = 0;
        this.height = 7;

        this.blink = false;
        /*setInterval(() => {
            if (this.selected) {
                this.blink = !this.blink;
            } else if (this.blink) {
                this.blink = false;
            }
        }, 900);*/
    }

    draw(draw: DrawLib, offsetX: number, offsetY: number): void {
        let text = `${this.text}:${this.value}`;
        let textLength = draw.measureText(text);
        this.width = 4 + 2 + textLength + 2 + 4;
        draw.text(offsetX + this.x + 7, offsetY + this.y + 1, text, this.color);

        if (!this.blink) {
            // right arrow
            draw.pixelArr(offsetX + this.x, offsetY + this.y, Color.gray, [
                { x: 0, y: 3 },
                { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 1, y: 4 },
                { x: 2, y: 1 },
                { x: 2, y: 2 },
                { x: 2, y: 3 },
                { x: 2, y: 4 },
                { x: 2, y: 5 },
                { x: 3, y: 0 },
                { x: 3, y: 1 },
                { x: 3, y: 2 },
                { x: 3, y: 3 },
                { x: 3, y: 4 },
                { x: 3, y: 5 },
                { x: 3, y: 6 },
            ]);

            // left arrow
            draw.pixelArr(offsetX + this.x + 8 + textLength, offsetY + this.y, Color.gray, [
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 2 },
                { x: 0, y: 3 },
                { x: 0, y: 4 },
                { x: 0, y: 5 },
                { x: 0, y: 6 },
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 1, y: 4 },
                { x: 1, y: 5 },
                { x: 2, y: 2 },
                { x: 2, y: 3 },
                { x: 2, y: 4 },
                { x: 3, y: 3 },
            ]);
        }
    }

    mouseDown(x: number, y: number): void {
        if (x <= 3 && y <= 6) {
            if (this.value > this.minValue) {
                this.value--;
            }
        } else if (this.width - x <= 4 && this.height - y <= 7) {
            if (this.value < this.maxValue) {
                this.value++;
            }
        }
    }

    keyDown(ev: KeyboardEvent): void {
        const code = ev.code;
        if (code === "ArrowLeft" || code === "KeyA") {
            if (this.value > this.minValue) {
                this.value--;
            }
        } else if (code === "ArrowRight" || code === "KeyD") {
            if (this.value < this.maxValue) {
                this.value++;
            }
        }
    }
}
