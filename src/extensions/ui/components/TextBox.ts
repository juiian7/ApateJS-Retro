import { Color, DrawLib } from "../../../apate.js";
import { WindowComponent } from "../Component.js";

// TODO
export enum TextAlignment {
    LEFT,
    CENTER,
    RIGHT,
}

export enum TextInputType {
    ALL,
    NUMBERS,
    LETTERS,
}

export class TextBox extends WindowComponent {
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

        let textLength = draw.measureText(this.text);
        let tx = Math.round(this.x + (this.width - textLength) / 2);
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
