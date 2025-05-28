import { Color, DrawLib } from "../../../apate.js";
import { ComponentBase } from "./ComponentBase.js";
import { Icon } from "../utils/icon.js";

export class TextSelection extends ComponentBase {
    public options: string[];
    public selectedIndex: number;

    constructor(x, y, options: string[], selectedIndex?: number) {
        super(x, y, 0, 7);
        this.setColors(null, Color.black, null, Color.red);

        this.options = options ?? [];

        if (selectedIndex >= this.options.length) {
            this.selectedIndex = this.options.length - 1;
        } else if (selectedIndex < 0) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex = selectedIndex ?? 0;
        }
    }

    draw(draw: DrawLib): void {
        let frontColor = this.selected ? this.highlightFrontColor : this.frontColor;
        let backColor = this.selected ? this.highlightBackColor : this.backColor;

        let text = this.options[this.selectedIndex];
        let textLength = draw.measureText(text);
        this.width = 4 + 2 + textLength + 2 + 4;

        if (backColor != null) {
            draw.rect(this.x, this.y, this.width, this.height, backColor);
        }

        Icon.rightArrow.draw(draw, this.x, this.y, this.parent.backColor === Color.gray ? Color.light_gray : Color.gray);
        draw.text(this.x + 7, this.y + 1, text, frontColor);
        Icon.leftArrow.draw(draw, this.x + 8 + textLength, this.y, this.parent.backColor === Color.gray ? Color.light_gray : Color.gray);
    }

    mouseDown(x: number, y: number): void {
        if (x <= 3 && y <= 6) {
            this.cycleOptions(false);
        } else if (this.width - x <= 4 && this.height - y <= 7) {
            this.cycleOptions(true);
        }
    }

    keyDown(ev: KeyboardEvent): void {
        const code = ev.code;
        if (code === "ArrowLeft" || code === "KeyA") {
            this.cycleOptions(false);
        } else if (code === "ArrowRight" || code === "KeyD") {
            this.cycleOptions(true);
        }
    }

    private cycleOptions(increase: boolean) {
        if (increase) {
            if (this.selectedIndex < this.options.length - 1) {
                this.selectedIndex++;
            } else {
                this.selectedIndex = 0;
            }
        } else {
            if (this.selectedIndex > 0) {
                this.selectedIndex--;
            } else {
                this.selectedIndex = this.options.length - 1;
            }
        }
    }
}
