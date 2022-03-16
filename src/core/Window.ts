import { DrawLib, PixelArray } from "../utils/drawlib.js";
import { Color } from "../utils/color.js";
import { Button } from "../utils/button.js";
import { Sprite } from "../utils/spritelib";
import { Entity } from "./Entity.js";
import { Engine } from "./Engine.js";

export class Window extends Entity {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private color: Color;
    private visable: boolean;

    private showTitleBar: boolean;
    private titleBarCloseBtn: ClickableButton;
    private titleBarHeld: boolean;
    private titleBarHeldPrev: { x: number; y: number } | null;

    private components: WindowComponent[];
    private _selectedIndex: number;

    set selectedIndex(index) {
        console.log(`UI selection changed ${this._selectedIndex} -> ${index}`);
        if (this._selectedIndex >= 0) {
            // @ts-ignore
            this.components[this._selectedIndex].selected = false;
        }
        this._selectedIndex = index;

        if (index >= 0) {
            // @ts-ignore
            this.components[this._selectedIndex].selected = true;
        }
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

        this.titleBarHeld = false;
        this.titleBarHeldPrev = null;
        this.visable = false;

        this.components = [];
        this._selectedIndex = -1;
    }

    public setSize(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public show() {
        this.visable = true;
    }
    public hide() {
        this.visable = false;
        this.selectedIndex = -1;
    }

    public addComponent(component: WindowComponent) {
        // @ts-ignore
        component.parentWindow = this;
        // @ts-ignore
        component.selected = false;
        // @ts-ignore
        component.apate = this.apate;
        // @ts-ignore
        component.init();
        this.components.push(component);
    }

    init(): void {
        // move close button to the right on macos :)
        this.titleBarCloseBtn = new ClickableButton(this.apate.isHostAMac ? 1 : this.width - 4, -4, 3, 3);
        this.titleBarCloseBtn.setColors(null, Color.dark_indigo);
        this.titleBarCloseBtn.setDisplay([
            { x: 0, y: 0 },
            { x: 0, y: 2 },
            { x: 1, y: 1 },
            { x: 2, y: 0 },
            { x: 2, y: 2 },
        ]);
        this.titleBarCloseBtn.onClick = () => {
            this.hide();
        };
        this.addComponent(this.titleBarCloseBtn);

        this.apate.input.on("mouse", "down", () => {
            if (!this.visable) return;

            let rx = Math.floor(this.apate.input.mousePos.x - this.x);
            let ry = Math.floor(this.apate.input.mousePos.y - this.y);

            if (this.showTitleBar) {
                if (rx < this.width && ry >= 0 && ry <= 4) {
                    this.titleBarHeld = true;
                    this.titleBarHeldPrev = { ...this.apate.input.mousePos };
                }
                ry -= 5;
            }

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
            if (!this.visable) return;

            if (this.showTitleBar && this.titleBarHeld) {
                this.titleBarHeld = false;
                this.titleBarHeldPrev = null;
            }

            const com = this.components[this.selectedIndex];
            if (com) {
                let rcx = Math.floor(this.apate.input.mousePos.x - this.x - com.x);
                let rcy = Math.floor(this.apate.input.mousePos.y - this.y - com.y);
                this.components[this.selectedIndex]?.mouseUp?.(rcx, rcy);
            }
        });

        this.apate.input.on("keyboard", "down", (ev: KeyboardEvent) => {
            if (!this.visable) return;
            this.components[this.selectedIndex]?.keyDown?.(ev);
        });
        this.apate.input.on("keyboard", "up", (ev: KeyboardEvent) => {
            if (!this.visable) return;
            this.components[this.selectedIndex]?.keyUp?.(ev);
        });

        this.apate.input.on("Tab", "down", (ev: KeyboardEvent) => {
            if (!this.visable) return;

            ev.preventDefault();
            if (this.selectedIndex < this.components.length - 1) {
                this.selectedIndex++;
            } else {
                this.selectedIndex = 0;
            }
        });
        this.apate.input.on(Button.down, "down", () => {
            if (!this.visable) return;
            if (this.selectedIndex < this.components.length - 1) {
                this.selectedIndex++;
            }
        });
        this.apate.input.on(Button.up, "down", () => {
            if (!this.visable) return;
            if (this.selectedIndex > 0) {
                this.selectedIndex--;
            }
        });
    }

    draw(draw: DrawLib): void {
        if (!this.visable) return;

        let prevOffset = draw.getOffset();
        draw.setOffset(0, 0);

        if (this.color != null) {
            draw.rect(this.x, this.y, this.width, this.height, this.color);
        }

        if (this.showTitleBar) {
            draw.rect(this.x, this.y, this.width, 4, Color.avocado, false);

            // line next to the close button
            let lineX = this.apate.isHostAMac ? this.x + 4 : this.x + this.width - 5;
            draw.line(lineX, this.y, lineX, this.y + 4, Color.avocado);
        }

        draw.setOffset(this.x, this.showTitleBar ? this.y + 5 : this.y);
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].draw(draw);
        }
        draw.setOffset(prevOffset.x, prevOffset.y);
    }

    update(delta: number): void {
        if (!this.visable) return;

        if (this.showTitleBar && this.titleBarHeld) {
            this.x = this.x + this.apate.input.mousePos.x - this.titleBarHeldPrev.x;
            this.y = this.y + this.apate.input.mousePos.y - this.titleBarHeldPrev.y;
            this.titleBarHeldPrev = { ...this.apate.input.mousePos };
        }

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

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public backColor: Color;
    public frontColor: Color;
    public markedBackColor: Color;
    public markedFrontColor: Color;

    public setColors(backColor: Color | null, frontColor: Color | null, markedBackColor?: Color, markedFrontColor?: Color) {
        this.backColor = backColor ?? null;
        this.frontColor = frontColor ?? null;
        this.markedBackColor = markedBackColor ?? backColor;
        this.markedFrontColor = markedFrontColor ?? frontColor;
    }

    public readonly selected: boolean;
    public readonly parentWindow?: Window;
    protected readonly apate?: Engine;
    protected init(): void {}

    public abstract draw(draw: DrawLib): void;
    public update(delta: number): void {}

    // all mouse and key functions are only triggered when the component is selected
    public mouseDown(x: number, y: number): void {}
    public mouseMove(): void {}
    public mouseUp(x: number, y: number): void {}

    public keyDown(ev: KeyboardEvent): void {}
    public keyUp(ev: KeyboardEvent): void {}
}

// TODO
export enum TextAlignment {
    LEFT,
    CENTER,
    RIGHT,
}

// TODO Input, blink?
export class ClickableButton extends WindowComponent {
    private text: string;
    private pixelArr: PixelArray;
    private sprite: Sprite;

    public onClick: () => void | null;

    constructor(x, y, width, height, displayObj?: string | PixelArray | Sprite) {
        super(x, y, width, height);
        this.setColors(Color.blue, Color.black);

        if (displayObj != null) {
            this.setDisplay(displayObj);
        }
    }

    public setDisplay(obj: string | PixelArray | Sprite) {
        if (typeof obj == "string") {
            this.text = obj as string;
        } else if (obj?.[0]?.x != null && obj?.[0]?.y != null) {
            this.pixelArr = obj as PixelArray;
        } else if (obj instanceof ImageData) {
            // TODO: check if this works
            console.log("Setting button sprite");
            this.sprite = obj as Sprite;
        }
    }

    draw(draw: DrawLib): void {
        if (this.backColor != null) {
            draw.rect(this.x, this.y, this.width, this.height, this.backColor);
        }

        if (this.text != null) {
            let textlength = draw.measureText(this.text);
            let tx = Math.round(this.x + (this.width - textlength) / 2);
            let ty = Math.round(this.y + (this.height - 5) / 2);
            draw.text(tx, ty, this.text, this.frontColor);
        }
        if (this.pixelArr != null) {
            draw.pixelArr(this.x, this.y, this.frontColor, this.pixelArr);
        }
        if (this.sprite != null) {
            draw.sprite(this.x, this.y, this.sprite);
        }
    }

    mouseDown(): void {
        this.onClick?.();
    }
}

export enum TextInputType {
    ALL,
    NUMBERS,
    LETTERS,
}

export class InputField extends WindowComponent {
    public acceptedValues: TextInputType;
    public text: string;

    constructor(x, y, width, height?: number, text?: string, acceptedValues?: TextInputType) {
        super(x, y, width, height ?? 9);
        this.setColors(Color.black, Color.white);

        this.text = text ?? "";
        this.acceptedValues = acceptedValues ?? TextInputType.ALL;
    }

    draw(draw: DrawLib): void {
        if (this.backColor) {
            draw.rect(this.x, this.y, this.width, this.height, this.backColor);
        }

        let textlength = draw.measureText(this.text);
        let tx = Math.round(this.x + (this.width - textlength) / 2);
        let ty = Math.round(this.y + (this.height - 5) / 2);
        draw.text(tx, ty, this.text, this.frontColor);
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
            case TextInputType.ALL:
                return ev.which === 32 || (ev.which >= 48 && ev.which <= 90) || (ev.which >= 96 && ev.which <= 111) || (ev.which >= 186 && ev.which <= 222);
            case TextInputType.NUMBERS:
                return (ev.which >= 48 && ev.which <= 57) || (ev.which >= 96 && ev.which <= 111);
            case TextInputType.LETTERS:
                return ev.which >= 58 && ev.which <= 90;
            default:
                return true;
        }
    }
}

export class OptionSelection extends WindowComponent {
    public options: string[];
    public selectedOption: number;

    constructor(x, y, options: string[], selectedIndex?: number) {
        super(x, y, 0, 7);
        this.setColors(null, Color.black);

        this.options = options ?? [];
        this.selectedOption = selectedIndex ?? 0;
    }

    draw(draw: DrawLib): void {
        let text = this.options[this.selectedOption];
        let textLength = draw.measureText(text);
        this.width = 4 + 2 + textLength + 2 + 4;

        if (this.backColor != null) {
            draw.rect(this.x, this.y, this.width, this.height, this.backColor);
        }

        drawRightArrow(draw, this.x, this.y);
        draw.text(this.x + 7, this.y + 1, text, this.frontColor);
        drawLeftArrow(draw, this.x + 8 + textLength, this.y);
    }

    mouseDown(x: number, y: number): void {
        if (x <= 3 && y <= 6) {
            this.cycleOption(false);
        } else if (this.width - x <= 4 && this.height - y <= 7) {
            this.cycleOption(true);
        }
    }

    keyDown(ev: KeyboardEvent): void {
        const code = ev.code;
        if (code === "ArrowLeft" || code === "KeyA") {
            this.cycleOption(false);
        } else if (code === "ArrowRight" || code === "KeyD") {
            this.cycleOption(true);
        }
    }

    private cycleOption(increase: boolean) {
        if (increase) {
            if (this.selectedOption < this.options.length - 1) {
                this.selectedOption++;
            } else {
                this.selectedOption = 0;
            }
        } else {
            if (this.selectedOption > 0) {
                this.selectedOption--;
            } else {
                this.selectedOption = this.options.length - 1;
            }
        }
    }
}

export class NumericOption extends WindowComponent {
    public text: string;
    public value: number;
    public minValue: number;
    public maxValue: number;

    constructor(x, y, text, value, minValue = 0, maxValue = 100) {
        super(x, y, 0, 7);
        this.setColors(Color.white, Color.black);

        this.text = text;
        this.value = value;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    draw(draw: DrawLib): void {
        let text = `${this.text}:${this.value}`;
        let textLength = draw.measureText(text);
        this.width = 4 + 2 + textLength + 2 + 4;

        if (this.backColor != null) {
            draw.rect(this.x, this.y, this.width, this.height, this.backColor);
        }

        drawRightArrow(draw, this.x, this.y);
        draw.text(this.x + 7, this.y + 1, text, this.frontColor);
        drawLeftArrow(draw, this.x + 8 + textLength, this.y);
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

function drawRightArrow(draw: DrawLib, x: number, y: number) {
    draw.pixelArr(x, y, Color.gray, [
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
}
function drawLeftArrow(draw: DrawLib, x: number, y: number) {
    draw.pixelArr(x, y, Color.gray, [
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
