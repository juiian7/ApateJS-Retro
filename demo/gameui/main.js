import { Apate, Color, Entity, UI } from "../../dist/apate.js";

const apate = new Apate();
apate.showInfo = true;
apate.drawCursor = true;

var demoUI = new UI.Window(10, 10, 80, 60, Color.white, true);
let button = new UI.ClickableButton(6, 2, 42, 9, "Button");
button.onClick = () => {
    console.log("Click");
};
demoUI.addComponent(button);

let option = new UI.NumericOption(6, 14, "Test", 42);
demoUI.addComponent(option);

let input = new UI.InputField(6, 24, 50, 9);
demoUI.addComponent(input);

let dropDown = new UI.OptionSelection(6, 36, ["Test1", "Test2", "Hello World"], 1);
demoUI.addComponent(dropDown);

let first = false;

var entity = new Entity();
entity.set({
    draw: function (draw) {
        draw.text(1, 112, `Mouse X ${apate.input.mousePos.x}`, Color.white);
        draw.text(1, 120, `Mouse Y ${apate.input.mousePos.y}`, Color.white);
        if (!first) {
            console.log("---------------------------------------");
        }
        draw.line(50, 90, 5, 75, Color.agua);
        draw.line(50, 90, 50, 75, Color.agua);
        draw.line(50, 90, 90, 75, Color.agua);
        draw.line(50, 90, 90, 90, Color.agua);
        draw.line(50, 90, 90, 105, Color.agua);
        draw.line(50, 90, 50, 105, Color.agua);
        draw.line(50, 90, 5, 105, Color.agua);
        draw.line(50, 90, 5, 90, Color.agua);

        if (!first) {
            console.log("---------------------------------------");
            first = true;
        }

        draw.line(125, 75, 100, 105, Color.agua);
        draw.line(100, 75, 125, 90, Color.agua);
    },
});

demoUI.show();
apate.activeScene.add(demoUI);
apate.activeScene.add(entity);
apate.run();
