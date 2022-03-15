import { Apate, Color, Entity, UI } from "../../dist/apate.js";

const apate = new Apate();
apate.showInfo = true;
apate.drawCursor = true;

var demoUI = new UI.Window(10, 10, 80, 50, Color.white, true);
let button = new UI.ClickableButton(10, 10, 40, 11, Color.agua, "Button");
button.onClick = () => {
    console.log("Click");
};
demoUI.addComponent(button);

let option = new UI.NumericOption(10, 24, "Test", 42);
demoUI.addComponent(option);

let input = new UI.InputField(10, 32, 50, 10);
demoUI.addComponent(input);

var entity = new Entity();
entity.set({
    draw: function (draw) {
        draw.text(1, 112, `Mouse X ${apate.input.mousePos.x}`, Color.white);
        draw.text(1, 120, `Mouse Y ${apate.input.mousePos.y}`, Color.white);
        draw.line(5, 66, 100, 100, Color.agua);
        draw.line(64, 64, 47, 100,  Color.agua);
    },
});

apate.activeScene.add(demoUI);
apate.activeScene.add(entity);
apate.run();
