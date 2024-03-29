import { Apate, Button, Color, Entity } from "../../dist/apate.js";

const apate = new Apate();
apate.showInfo = true;
apate.drawCursor = true;

var btnShiftA = new Button("shifta", ["KeyA"], null, true);
apate.input.addButton(btnShiftA);

var entity = new Entity();
entity.set({
    draw: function (drawlib) {
        drawlib.text(1, 20, `Up ${apate.input.isButtonDown("up") ? "true" : "false"}`, Color.white);
        drawlib.text(1, 28, `Down ${apate.input.isButtonDown("down") ? "true" : "false"}`, Color.white);
        drawlib.text(1, 36, `Left ${apate.input.isButtonDown("left") ? "true" : "false"}`, Color.white);
        drawlib.text(1, 44, `Right ${apate.input.isButtonDown("right") ? "true" : "false"}`, Color.white);
        drawlib.text(1, 52, `Action 1 ${apate.input.isButtonDown("action1") ? "true" : "false"}`, Color.white);
        drawlib.text(1, 60, `Action 2 ${apate.input.isButtonDown("action2") ? "true" : "false"}`, Color.white);
        drawlib.text(1, 68, `Cancel ${apate.input.isButtonDown("cancel") ? "true" : "false"}`, Color.white);

        drawlib.text(1, 80, `Axis H ${apate.input.getAxis().h.toFixed(7)}`, Color.white);
        drawlib.text(1, 88, `Axis V ${apate.input.getAxis().v.toFixed(7)}`, Color.white);

        drawlib.text(1, 100, `Mouse X ${apate.input.mousePos.x}`, Color.white);
        drawlib.text(1, 108, `Mouse Y ${apate.input.mousePos.y}`, Color.white);

        drawlib.text(1, 120, `Shift+A ${apate.input.isButtonDown(btnShiftA)}`, Color.white);
    },
});

apate.input.on(Button.action1, "down", () => {
    console.log("Nais");
});

apate.activeScene.add(entity);
apate.run();
