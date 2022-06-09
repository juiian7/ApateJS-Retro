import { Color, DrawLib, PixelArray, Sprite } from "../../../apate.js";
import { WindowComponent } from "../Component.js";

// TODO: Input, blink?
export class Button extends WindowComponent {
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
            let textLength = draw.measureText(this.text);
            let tx = Math.round(this.x + (this.width - textLength) / 2);
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

    keyDown(ev: KeyboardEvent): void {
        if (ev.code === "Enter") {
            this.onClick?.();
        }
    }
}
