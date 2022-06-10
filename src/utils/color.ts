export class Color {
    static white = new Color(230, 230, 230);
    static black = new Color(20, 20, 20);
    static gray = new Color(40, 40, 40);
    static light_gray = new Color(60, 60, 60);
    static yellow = new Color(255, 215, 0);
    static ocher = new Color(190, 150, 0);
    static orange = new Color(255, 155, 0);
    static brown = new Color(165, 110, 30);
    static red = new Color(255, 75, 75);
    static dark_red = new Color(170, 50, 50);
    static pink = new Color(230, 85, 150);
    static magenta = new Color(185, 85, 110);
    static light_purple = new Color(170, 90, 190);
    static purple = new Color(110, 50, 120);
    static indigo = new Color(100, 100, 190);
    static dark_indigo = new Color(70, 70, 140);
    static blue = new Color(65, 90, 160);
    static dark_blue = new Color(50, 70, 120);
    static aqua = new Color(80, 170, 220);
    static dark_aqua = new Color(50, 135, 180);
    static cyan = new Color(60, 220, 180);
    static dark_cyan = new Color(40, 170, 155);
    static mint = new Color(70, 200, 140);
    static jade = new Color(40, 145, 100);
    static light_green = new Color(100, 220, 100);
    static green = new Color(50, 165, 50);
    static lime = new Color(190, 220, 90);
    static avocado = new Color(160, 190, 50);

    public r: number;
    public g: number;
    public b: number;

    /**
     * @param r red (0-255)
     * @param g green (0-255)
     * @param b blue (0-255)
     */
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}
