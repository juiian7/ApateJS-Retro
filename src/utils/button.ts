export class Button {
    static up = new Button("up", ["KeyW", "ArrowUp"]);
    static down = new Button("down", ["KeyS", "ArrowDown"]);
    static left = new Button("left", ["KeyA", "ArrowLeft"]);
    static right = new Button("right", ["KeyD", "ArrowRight"]);
    static action1 = new Button("action1", ["KeyZ", "KeyN", "KeyC", "Space"]);
    static action2 = new Button("action2", ["KeyX", "KeyM", "KeyV"]);

    name: string;
    keybinds: string[];

    constructor(name, keybinds) {
        this.name = name;
        this.keybinds = keybinds;
    }
}
