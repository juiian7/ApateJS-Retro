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

    private _cameraOffsetX: number = 0;
    private _cameraOffsetY: number = 0;

    public setOffset(x: number, y: number) {
        this._cameraOffsetX = x;
        this._cameraOffsetY = y;
    }

    public async loadFont(url: string, characters: string, charWidth: number) {
        let data: Sprite;

        data = await spritelib.load(url);

        let chars = spritelib.split(data, charWidth, data.height, 0);

        if (chars.length != characters.length) console.error("Characters do not match with image!");
        for (let i = 0; i < characters.length; i++) {
            // color white for color addition
            for (let j = 0; j < chars[i].data.length; j += 4) {
                if (chars[i].data[j + 3] > 0) {
                    chars[i].data[j] = 255;
                    chars[i].data[j + 1] = 255;
                    chars[i].data[j + 2] = 255;
                }
            }
            this.fontMap[characters[i]] = chars[i];
        }

        console.log(this.fontMap);
    }

    public pixel(x: number, y: number, c: Color) {
        this.screen.setPixel(x + this._cameraOffsetX, y + this._cameraOffsetY, c.r, c.g, c.b);
    }

    public rect(x: number, y: number, w: number, h: number, c: Color) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.screen.setPixel(i + x + this._cameraOffsetX, j + y + this._cameraOffsetY, c.r, c.g, c.b);
            }
        }
    }

    public sprite(x: number, y: number, sprite: Sprite) {
        if (!sprite) {
            console.warn("Sprite not ready! skipping draw");
            return;
        }

        x += this._cameraOffsetX;
        y += this._cameraOffsetY;

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

    public spriteExt(x: number, y: number, sprite: Sprite, scale: number, color?: Color) {
        if (!sprite) {
            console.warn("Sprite not ready! skipping draw");
            return;
        }
        scale = Math.round(scale);

        x += this._cameraOffsetX;
        y += this._cameraOffsetY;

        let i, px, py, dx, dy;
        for (i = 0, px = 0, py = 0; i < sprite.data.length; i += 4, px += scale) {
            if (px >= sprite.width * scale) {
                px = 0;
                py += scale;
            }
            if (sprite.data[i + 3] > 0) {
                for (dx = 0; dx < scale; dx++) {
                    for (dy = 0; dy < scale; dy++) {
                        if (color) {
                            this.screen.setPixel(px + dx + x, py + dy + y, (sprite.data[i] + color.r) / 2, (sprite.data[i + 1] + color.g) / 2, (sprite.data[i + 2] + color.b) / 2);
                        } else {
                            this.screen.setPixel(px + dx + x, py + dy + y, sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]);
                        }
                    }
                }
            }
        }
    }

    public text(x: number, y: number, text: string, c: Color, scale: number = 1, leftMargin: number = 1) {
        text = text.toUpperCase();

        for (let i = 0, char; i < text.length; i++) {
            if (text[i] == " ") continue;
            char = this.fontMap[text[i]];

            if (char) {
                this.spriteExt(x + i * (char.width + leftMargin) * scale, y, char, scale, { r: (c.r - 128) * 2, g: (c.g - 128) * 2, b: (c.b - 128) * 2 }); // to overwrite color
            } else this.pixel(x + i * (4 + leftMargin) * scale, y, c);
        }
    }

    public measureText(text: string, scale: number = 1, leftMargin: number = 1): number {
        let sum = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] == " " || !this.fontMap[text[i]]) sum += (4 + leftMargin) * scale;
            else sum += (this.fontMap[text[i]].width + leftMargin) * scale;
        }
        return sum;
    }

    public fragment(x: number, y: number, sprite: Sprite, calc: (pixels: Uint8Array, ndx: number) => Color, scale: number = 1) {
        if (!sprite) {
            console.warn("Sprite not ready! skipping draw");
            return;
        }
        scale = Math.round(scale);

        x += this._cameraOffsetX;
        y += this._cameraOffsetY;

        let i, px, py, dx, dy;
        for (i = 0, px = 0, py = 0; i < sprite.data.length; i += 4, px += scale) {
            if (px >= sprite.width * scale) {
                px = 0;
                py += scale;
            }
            if (sprite.data[i + 3] > 0) {
                for (dx = 0; dx < scale; dx++) {
                    for (dy = 0; dy < scale; dy++) {
                        let color = calc(this.screen.pixelBuffer, (this.screen.width * (py + dy + y) + (px + dx + x)) * 3);
                        this.screen.setPixel(px + dx + x, py + dy + y, color.r, color.g, color.b);
                    }
                }
            }
        }
    }
}
