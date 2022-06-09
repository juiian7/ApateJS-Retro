import { Apate, Color, Entity, UI } from "../../dist/apate.js";

const apate = new Apate();
apate.showInfo = true;
apate.drawCursor = true;

var demoUI = new UI.Window(10, 10, 80, 60, true);
demoUI.setColors(Color.gray, Color.agua);

let button = new UI.Button(6, 2, 42, 9, "Button");
button.onClick = () => {
    console.log("Click");
};
demoUI.add(button);

let option = new UI.NumberSelection(6, 14, "Test", 42);
demoUI.add(option);

let input = new UI.TextBox(6, 24, 50, 9);
demoUI.add(input);

let dropDown = new UI.TextSelection(6, 36, ["Test1", "Test2", "Hello World"], 1);
demoUI.add(dropDown);

var entity = new Entity();
entity.set({
    draw: function (draw) {
        draw.text(1, 112, `Mouse X ${apate.input.mousePos.x}`, Color.white);
        draw.text(1, 120, `Mouse Y ${apate.input.mousePos.y}`, Color.white);
    },
});

demoUI.show();
apate.activeScene.add(demoUI);
apate.activeScene.add(entity);
apate.run();
