import { Apate, Button, Color, Entity } from "../../dist/apate.js";

const apate = new Apate();
apate.showInfo = true;

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
    },
});

apate.input.on(Button.action1, "down", () => {
    console.log("Nais");
});

apate.activeScene.add(entity);
apate.run();
