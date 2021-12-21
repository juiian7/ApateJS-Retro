type Sprite = ImageData;

class SpriteLib {
    canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.createElement("canvas");
    }

    async load(url: string): Promise<Sprite> {
        let img = new Image();
        img.crossOrigin = "Anonymous";

        try {
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
                img.src = url;
            });
        } catch {
            console.error("Couldn't load resource: " + url);
            return new ImageData(new Uint8ClampedArray([255, 0, 255, 255]), 1, 1);
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

            sprites.push(new ImageData(new Uint8ClampedArray(part), width, height));
        }

        return sprites;
    }

    filp(sprite: Sprite, horizontal: boolean = true, vertical: boolean = false): Sprite {
        this.canvas.width = sprite.width;
        this.canvas.height = sprite.height;
        let ctx = this.canvas.getContext("2d");

        ctx.putImageData(sprite, 0, 0);

        let tmpC = document.createElement("canvas");
        tmpC.width = this.canvas.width;
        tmpC.height = this.canvas.height;
        let tmpCtx = tmpC.getContext("2d");

        tmpCtx.translate(horizontal ? sprite.width : 0, vertical ? sprite.height : 0);
        tmpCtx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
        tmpCtx.drawImage(this.canvas, 0, 0);
        tmpCtx.setTransform(1, 0, 0, 1, 0, 0);

        return tmpCtx.getImageData(0, 0, sprite.width, sprite.height);
    }
}

export var spritelib = new SpriteLib();
