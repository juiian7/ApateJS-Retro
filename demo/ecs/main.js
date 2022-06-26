import { Apate, Color, Entity } from "../../dist/apate.js";
import { ECS } from "../../dist/extensions/index.js";

let apate = new Apate();
apate.random.seed = 123456;
apate.showInfo = true;
apate.run();

let storage = {
    world: new ECS.World(),
};

let ecsRunner = new Entity({ storage });
ecsRunner.set({
    init,
    update: (delta) => storage.world.tick(delta),
});

apate.activeScene.add(ecsRunner);

function randomColor() {
    let colors = Object.values(Color);
    return colors[apate.random.betweenInt(0, colors.length - 1)];
}

function init() {
    for (let i = 0; i < 1000; i++) {
        storage.world
            .spawn()
            .add("position", { x: apate.random.betweenInt(0, 128), y: apate.random.betweenInt(0, 128) })
            .add("color", randomColor())
            .add(i % 2 == 0 ? "static" : "move");
    }

    storage.world.system().for("move").do(update);
    storage.world.system().for("position", "color").do(draw);
}

function update(entities, delta) {
    for (let i = 0; i < entities.length; i++) {
        let pos = entities[i].get("position");

        pos.x += 1;
        pos.y += 1;

        if (pos.x > 128) pos.x = 0;
        if (pos.y > 128) pos.y = 0;
    }
}

function draw(entities, delta) {
    for (let i = 0; i < entities.length; i++) {
        let pos = entities[i].get("position");
        let color = entities[i].get("color");

        apate.draw.pixel(Math.round(pos.x), Math.round(pos.y), color);
    }
}
