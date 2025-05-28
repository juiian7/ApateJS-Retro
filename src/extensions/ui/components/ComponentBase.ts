import { Apate, Color, DrawLib } from "../../../apate.js";
import { Window } from "../Window.js";

export abstract class ComponentBase {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public backColor: Color;
    public frontColor: Color;
    public highlightBackColor: Color;
    public highlightFrontColor: Color;

    public setColors(backColor: Color | null, frontColor: Color | null, highlightBackColor?: Color, highlightFrontColor?: Color) {
        this.backColor = backColor ?? null;
        this.frontColor = frontColor ?? null;
        this.highlightBackColor = highlightBackColor ?? backColor;
        this.highlightFrontColor = highlightFrontColor ?? frontColor;
    }

    public setHighlightColors(highlightBackColor: Color | null, highlightFrontColor: Color | null) {
        this.highlightBackColor = highlightBackColor ?? this.backColor;
        this.highlightFrontColor = highlightFrontColor ?? this.frontColor;
    }

    public readonly selected: boolean;
    public readonly parent: Window;
    protected readonly apate: Apate;
    protected init(): void {}

    public abstract draw(draw: DrawLib): void;
    public update(delta: number): void {}

    // all mouse and key functions are only triggered when the component is selected
    public mouseDown(x: number, y: number): void {}
    public mouseMove(): void {}
    public mouseUp(x: number, y: number): void {}

    public keyDown(ev: KeyboardEvent): void {}
    public keyUp(ev: KeyboardEvent): void {}
}
