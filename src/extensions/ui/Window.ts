import { Button, Color, DrawLib, Entity } from "../../apate.js";
import { WindowComponent } from "./Component.js";
import { Button as WindowButton } from "./components/Button.js";

export class Window extends Entity {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
 
    // TODO: get/set ?
    public backColor: Color;
    public accentColor: Color;

    private visible: boolean;
    private showTitleBar: boolean;
    private titleBarCloseBtn: WindowButton;
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

    constructor(x: number, y: number, width: number, height: number, showTitleBar?: boolean) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.backColor = Color.white;
        this.accentColor = Color.avocado;

        this.showTitleBar = showTitleBar ?? false;
        this.titleBarHeld = false;
        this.titleBarHeldPrev = null;
        this.visible = false;

        this.components = [];
        this._selectedIndex = -1;
    }

    public setColors(backColor: Color | null, accentColor: Color | null) {
        this.backColor = backColor ?? null;
        this.accentColor = accentColor ?? null;
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    public show() {
        this.visible = true;
    }
    public hide() {
        this.visible = false;
        this.selectedIndex = -1;
    }

    /**
     * TODO: Remove this bevor release
     * @deprecated
     */
    public addComponent(component: WindowComponent) {
        this.add(component);
    }

    public add(component: WindowComponent) {
        // @ts-ignore
        component.parent = this;
        // @ts-ignore
        component.selected = false;
        // @ts-ignore
        component.apate = this.apate;
        // @ts-ignore
        component.init();
        this.components.push(component);
    }

    init(): void {
        if (this.showTitleBar) {
            // move close button to the right on macos :)
            this.titleBarCloseBtn = new WindowButton(this.apate.isHostAMac ? 1 : this.width - 4, -4, 3, 3);
            this.titleBarCloseBtn.setColors(null, this.apate.isHostAMac ? Color.red : Color.dark_indigo);
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
            this.add(this.titleBarCloseBtn);
        }

        this.apate.input.on("mouse", "down", () => {
            if (!this.visible) return;

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
            if (!this.visible) return;

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
            if (!this.visible) return;
            this.components[this.selectedIndex]?.keyDown?.(ev);
        });
        this.apate.input.on("keyboard", "up", (ev: KeyboardEvent) => {
            if (!this.visible) return;
            this.components[this.selectedIndex]?.keyUp?.(ev);
        });

        this.apate.input.on(new Button("Tab", ["Tab"], null, false), "down", (ev: KeyboardEvent) => {
            if (!this.visible) return;

            ev.preventDefault();
            if (this.selectedIndex < this.components.length - 1) {
                this.selectedIndex++;
            } else {
                this.selectedIndex = 0;
            }
        });
        this.apate.input.on(new Button("ShiftTab", ["Tab"], null, true), "down", (ev: KeyboardEvent) => {
            if (!this.visible) return;

            ev.preventDefault();
            if (this.selectedIndex > 0) {
                this.selectedIndex--;
            } else {
                this.selectedIndex = this.components.length - 1;
            }
        });
        this.apate.input.on(Button.down, "down", () => {
            if (!this.visible) return;
            if (this.selectedIndex < this.components.length - 1) {
                this.selectedIndex++;
            }
        });
        this.apate.input.on(Button.up, "down", () => {
            if (!this.visible) return;
            if (this.selectedIndex > 0) {
                this.selectedIndex--;
            }
        });
    }

    draw(draw: DrawLib): void {
        if (!this.visible) return;

        let prevOffset = draw.getOffset();
        draw.setOffset(0, 0);

        if (this.backColor != null) {
            // window background
            draw.rect(this.x, this.y, this.width, this.height, this.backColor);
        }

        if (this.showTitleBar) {
            // title bar frame
            draw.rect(this.x, this.y, this.width, 4, this.accentColor, false);

            // line next to the close button
            let lineX = this.apate.isHostAMac ? this.x + 4 : this.x + this.width - 5;
            draw.line(lineX, this.y, lineX, this.y + 4, this.accentColor);
        }

        draw.setOffset(this.x, this.showTitleBar ? this.y + 5 : this.y);
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].draw(draw);
        }
        draw.setOffset(prevOffset.x, prevOffset.y);
    }

    update(delta: number): void {
        if (!this.visible) return;

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
