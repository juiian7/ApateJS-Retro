import { Screen } from "../core/Screen";
import { Color } from "./color.js";
import { Sprite, spritelib } from "./spritelib.js";

export type PixelArray = { x: number; y: number; c?: Color }[];

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
    public getOffset(): { x: number; y: number } {
        return { x: this._cameraOffsetX, y: this._cameraOffsetY };
    }

    public async loadFont(url: string, characters: string, charWidth: number) {
        let data: Sprite = await spritelib.load(url);
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
    }

    public pixel(x: number, y: number, c: Color) {
        this.screen.setPixel(x + this._cameraOffsetX, y + this._cameraOffsetY, c.r, c.g, c.b);
    }

    public pixelArr(x: number, y: number, c: Color, pixels: PixelArray) {
        for (let i = 0; i < pixels.length; i++) {
            this.pixel(x + pixels[i].x, y + pixels[i].y, pixels[i].c ?? c);
        }
    }

    public rect(x: number, y: number, w: number, h: number, c: Color, filled: boolean = true) {
        if (filled) {
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    this.pixel(i + x, j + y, c);
                }
            }
        } else {
            this.line(x, y, x + w - 1, y, c);
            this.line(x, y + h, x + w - 1, y + h, c);
            this.line(x, y, x, y + h, c);
            this.line(x + w - 1, y, x + w - 1, y + h - 1, c);
        }
    }

    private consoleCahe: string[] = [];
    private log(str: string) {
        if (!this.consoleCahe.includes(str)) {
            this.consoleCahe.push(str);
            console.log(str);
        }
    }

    public line(x1: number, y1: number, x2: number, y2: number, c: Color) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        if (Math.abs(dx) > Math.abs(dy)) {
            let k = dy / dx;
            this.log(`1 (${x1}, ${y1}, ${x2}, ${y2})\tdy(${dy}) / dx(${dx}) = k(${k})`);
            for (let x = 0; dx >= 0 ? x < dx : x > dx; dx >= 0 ? x++ : x--) {
                this.pixel(x + x1, Math.round(k * x) + y1, c);
            }
        } else {
            let k = dx / dy;
            this.log(`2 (${x1}, ${y1}, ${x2}, ${y2})\tdx(${dx}) / dy(${dy}) = k(${k})`);
            for (let y = 0; dy >= 0 ? y < dy : y > dy; dy >= 0 ? y++ : y--) {
                this.pixel(Math.round(k * y) + x1, y + y1, c);
            }
        }

        // draw begin and end to avoid ignoring those due to rounding
        this.pixel(x1, y1, c);
        this.pixel(x2, y2, c);
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
