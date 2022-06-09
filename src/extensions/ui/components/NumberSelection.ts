import { Color, DrawLib } from "../../../apate.js";
import { WindowComponent } from "../Component.js";
import { Icon } from "../utils/icon.js";

export class NumberSelection extends WindowComponent {
    public text: string;
    public value: number;
    public minValue: number;
    public maxValue: number;

    constructor(x, y, text, value, minValue = 0, maxValue = 100) {
        super(x, y, 0, 7);
        this.setColors(null, Color.black);

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

        Icon.rightArrow.draw(draw, this.x, this.y, this.parent.backColor === Color.gray ? Color.light_gray : Color.gray);
        draw.text(this.x + 7, this.y + 1, text, this.frontColor);
        Icon.leftArrow.draw(draw, this.x + 8 + textLength, this.y, this.parent.backColor === Color.gray ? Color.light_gray : Color.gray);
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
