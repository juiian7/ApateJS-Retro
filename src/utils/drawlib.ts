import { Screen } from "../core/Screen";
import { Color } from "./color.js";
import { spritelib } from "./spritelib.js";

type Sprite = ImageData;

export class DrawLib {
    private screen: Screen;

    private fontMap: { [key: string]: Sprite } = {};

    constructor(screen: Screen) {
        this.screen = screen;
    }

    public async loadFont(url: string, characters: string, charWidth: number) {
        let data: Sprite;

        data = await spritelib.load(url);

        let chars = spritelib.split(data, charWidth + 1, data.height, 0);

        if (chars.length != characters.length) console.error("Characters do not match with image!");
        for (let i = 0; i < characters.length; i++) {
            this.fontMap[characters[i]] = chars[i];
        }

        console.log(this.fontMap);
    }

    public pixel(x: number, y: number, c: Color) {
        this.screen.setPixel(x, y, c.r, c.g, c.b);
    }
    public rect(x: number, y: number, w: number, h: number, c: Color) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.screen.setPixel(i + x, j + y, c.r, c.g, c.b);
            }
        }
    }
    public sprite(x: number, y: number, sprite: Sprite) {
        if (!sprite) {
            console.warn("Sprite not ready! skipping draw");
            return;
        }

        for (let i = 0, px = 0, py = 0; i < sprite.data.length; i += 4, px++) {
            if (px >= sprite.width) {
                px = 0;
                py++;
            }
            if (sprite.data[i + 3] > 0) {
                this.screen.setPixel(px + x, py + y, sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]);
            }
        }
    }
    public text(x: number, y: number, text: string, c: Color) {
        text = text.toUpperCase();

        for (let i = 0, char; i < text.length; i++) {
            if (text[i] == " ") continue;
            char = this.fontMap[text[i]];

            if (char) {
                for (let p = 0; p < char.data.length; p += 4) {
                    if (char.data[p + 3] > 128) {
                        char.data[p] = c.r;
                        char.data[p + 1] = c.g;
                        char.data[p + 2] = c.b;
                    }
                }
                this.sprite(x + i * char.width, y, char);
            } else this.pixel(x + i * 4, y, c);
        }
    }

    public measureText(text: string): number {
        let sum = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] == " " || !this.fontMap[text[i]]) sum += 5;
            else sum += this.fontMap[text[i]].width;
        }
        return sum;
    }
}
