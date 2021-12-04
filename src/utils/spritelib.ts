type Sprite = ImageData;

class SpriteLib {
    canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.createElement("canvas");
    }

    async load(url: string): Promise<Sprite> {
        let img = new Image();

        try {
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
                img.src = url;
            });
        } catch {
            console.error("Couldn't load resource: " + url);
            return { width: 1, height: 1, data: new Uint8ClampedArray([255, 0, 255, 255]) };
        }

        return this.loadSync(img);
    }

    loadSync(img: HTMLImageElement): Sprite {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        let ctx = this.canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        return ctx.getImageData(0, 0, img.width, img.height);
    }

    split(sprite: Sprite, width: number, height: number, yOffset: number = 0): Sprite[] {
        let sprites: Sprite[] = [];

        for (let i = 0; i < sprite.width / width; i++) {
            let part = [];
            for (let y = yOffset; y < yOffset + height; y++) {
                for (let x = i * width; x < i * width + width; x++) {
                    let ndx = (sprite.width * y + x) * 4;
                    part.push(sprite.data[ndx], sprite.data[ndx + 1], sprite.data[ndx + 2], sprite.data[ndx + 3]);
                }
            }
            sprites.push({ data: new Uint8ClampedArray(part), width, height });
        }

        return sprites;
    }
}

export var spritelib = new SpriteLib();
