import { Color } from "./Color";

class ColorLib {
    constructor() {}

    private componentToHex(c: number): string {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    public hexToColor(hex: string): Color {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return null;
        return { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) };
    }

    public colorToHex(color: Color): string {
        return "#" + this.componentToHex(color.r) + this.componentToHex(color.g) + this.componentToHex(color.b);
    }
}

export var colorlib = new ColorLib();
