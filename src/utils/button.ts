export class Button {
    static up = new Button("up", ["KeyW", "ArrowUp"], 12);
    static down = new Button("down", ["KeyS", "ArrowDown"], 13);
    static left = new Button("left", ["KeyA", "ArrowLeft"], 14);
    static right = new Button("right", ["KeyD", "ArrowRight"], 15);
    static action1 = new Button("action1", ["KeyZ", "KeyN", "KeyC", "Space"], 0);
    static action2 = new Button("action2", ["KeyX", "KeyM", "KeyV"], 2);
    static cancel = new Button("cancel", ["Backspace", "Escape"], 1);

    public name: string;
    public keybinds: string[];
    public controllerBind?: number;
    public shiftKey: boolean | null;
    public ctrlKey: boolean | null;

    constructor(name: string, keybinds: string[], controllerBind?: number, shiftKey = null, ctrlKey = null) {
        this.name = name;
        this.keybinds = keybinds;
        this.controllerBind = controllerBind;
        this.shiftKey = shiftKey;
        this.ctrlKey = ctrlKey;
    }

    public addKeybind(key: string) {
        this.keybinds.push(key);
    }

    public removeKeybind(key: string) {
        let i = this.keybinds.indexOf(key);
        if (i > -1) this.keybinds.splice(i, 1);
    }
}
