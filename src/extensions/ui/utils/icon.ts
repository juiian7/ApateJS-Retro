import { Color, DrawLib, PixelArray } from "../../../apate";

export class Icon {
    static rightArrow = new Icon([
        { x: 0, y: 3 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 2, y: 5 },
        { x: 3, y: 0 },
        { x: 3, y: 1 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 3, y: 6 },
    ]);

    static leftArrow = new Icon([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 0, y: 4 },
        { x: 0, y: 5 },
        { x: 0, y: 6 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 3 },
    ]);

    public readonly pixels: PixelArray;

    constructor(pixels: PixelArray) {
        this.pixels = pixels;
    }

    public draw(drawlib: DrawLib, x: number, y: number, color: Color): void {
        drawlib.pixelArr(x, y, color, this.pixels);
    }
}
