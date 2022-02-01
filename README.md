# ApateJS

A simple 2D retro game engine which runs directly in your browser.

## Developers

|                                                                                                           | Author                                | Role         | Links                                                                            |
| --------------------------------------------------------------------------------------------------------- | :------------------------------------ | :----------- | :------------------------------------------------------------------------------- |
| <img src="https://avatars3.githubusercontent.com/u/44403676" alt="ZupaJul Avatar" width="32" height="32"> | [ZupaJul](https://github.com/juiian7) | Project Lead | [Contributions](https://github.com/juiian7/ApateJS-Retro/commits?author=juiian7) |
| <img src="https://avatars3.githubusercontent.com/u/94066019" alt="l1ino Avatar" width="32" height="32">   | [l1ino](https://github.com/l1ino)     | Developer    | [Contributions](https://github.com/juiian7/ApateJS-Retro/commits?author=l1ino)   |

## Usage

```js
import { Apate } from "./apate.js";

var apate = new Apate();
```

**NOTE:**

-   Include javascript game file as a module

```html
<script type="module" src="main.js"></script>
```

## Hello World!

```js
import { Apate, Entity, Color } from "./apate.js";

var apate = new Apate();
var entity = new Entity();

entity.set({
    draw: function (drawlib) {
        drawlib.text(1, 1, "Hello World!", Color.white);
    },
});

apate.activeScene.add(entity);
apate.run();
```

## Scenes and Entities

Scenes are basicly just collections of entities.

Enities can overwrite events which are needed to run a game.

## Entity Events

There are a few events called, which will help to run your game:
| Name | Time of execution | Parameters |
|-------------|--------|------------|
| `init` | Once an entity is added to a scene | - |
| `update` | Called every frame | delta: `number` (Time since last call) |
| `draw` | Called every frame | drawlib (used to draw to screen) |
| `destroy` | - Not automaticly called - | -

Register events like this:

```js
entity.set({
    update: function(delta) { ... },
});

// or
entity.on('update', function(delta) { ... });

// or (recomended for games with multiple entities)
class MyEntity extends Entity {
    update(delta) { ... }
}
var entity = new MyEntity();

// or simply
entity.update = function() { ... }
```

**NOTE:**

Normaly the functions get bound. Use `this.` to access all associated properties. When setting it directly you may bind `this` youself.

New events with own names like `physicUpdate` can also be created. Make sure `allowOwnEvents` is set to `true` in when the constructor is called.

When an entity is executed by apate throught a scene, access `this.apate` to get the current running instance.

```js
var entity = new Entity({ allowOwnEvents: true });
```

### How to use Scenes and Entities

```js
import { Apate, Entity, Scene } from "./apate.js";

var apate = new Apate();
apate.run();

function drawHelloWorld(drawlib) {
    // drawlib is the same as apate.drawlib
    drawlib.text(1, 1, "Hello World!", apate.colors.white);
}

var hwEntity = new Entity();

hwEntity.set({ draw: drawHelloWorld });

// add to the active scene
apate.activeScene.init(hwEntity);

// or create own scenes
let scene = new Scene();
scene.init(hwEntity);

apate.activeScene = scene;
```

As mentioned before, the Enity class can be extended to make it more comfortable to write entities:

```js
class HelloWorld extends Entity {
    draw(drawlib) {
        // drawlib can also be found in this.apate
        drawlib.text(1, 1, "Hello World!", apate.colors.white);
    }
}

var hwEntity = new HelloWorld();

apate.activeScene.init(hwEntity);
```

## Screen Draw Functions

```js
// all draw functions can be found here -> apate.drawlib....

// draw pixel
apate.drawlib.pixel(x, y, color);

// draw rectangle
apate.drawlib.rect(x, y, width, height, color);

// draw line
apate.drawlib.line(startX, startY, endX, endY, color);

// draw sprite
apate.drawlib.sprite(x, y, sprite);

// draw exteded sprite
apate.drawlib.spriteExt(x, y, sprite, scale, color);

// draw text
apate.drawlib.text(x, y, text, color, scale);
```

## Input

Default keymap:

| Name    | Keys           |
| ------- | -------------- |
| up      | W, ArrowUp     |
| down    | S, ArrowDown   |
| left    | A, ArrowLeft   |
| right   | D, ArrowRight  |
| action1 | Z, N, C, Space |
| action2 | X, M, V        |
| cancel  | Backspace, ESC |

```js
if (apate.input.isButtonPressed("action1")) {
    // one of the action1 keys is pressed
}

// add/modify the key binds for an existing button
Button.action1.removeKeybind("KeyN");
Button.action1.addKeybind("KeyB");

// new button (name: "jump", keybinds: "Space" and "ArrowUp", optional controller binds: 0)
var btn = new Button("jump", ["Space", "ArrowUp"], 0);

if (apate.input.isButtonPressed(btn)) {
    // one of the jump keys is pressed
}

// when button is registered use the button name to check for input
apate.input.addButton(btn);

if (apate.input.isButtonPressed("jump")) {
}

apate.input.on(btn, "down", () => {
    // button "jump" got triggerd
});

// get horizontal and vertical axis (mapped to keys ("up","down","left", "right") and controller stick axis)
let axis = apate.input.getAxis();
player.x += axis.h;
```

### Mouse and Touch

```js
apate.input.on("mouse", "down", () => {
    console.log("Mouse down or Touch start on:", apate.input.mousePos);
});

if (apate.input.isMousePressed) {
    apate.draw.pixel(apate.input.mousePos.x, apate.input.mousePos.y, Color.agua);
}
```

### Controller support (experimental)

```
The primary joystick is mapped to the up, down, left and right buttons
action1 is mapped to the controllers primary button (PS: X, XBox: A)
action2 is mapped to the controllers second button (PS: Rect, XBox: X)
cancel is mapped to the controllers second button (PS: O, XBox: B)
```

## Particle System

The ParticleSystem is an Enitiy object which handles multiple entity simulations.

Control particles by overwriting the `generateParticle` function.

```js
import { Apate, ParticleSystem, Color } from "./apate.js";

var apate = new Apate();
apate.run();

let waterfall = new ParticleSystem(true, 100, true);

waterfall.generateParticle = function () {
    return new Particle({
        x: apate.random.betweenInt(10, 20),
        y: 10,
        gravityY: 4,
        color: new Color(0, 128, 255),
    });
};
// or
waterfall.on('generateParticle', ... );

apate.activeScene.add(waterfall);
```

Don't overwrite `update` since it's used by the particle system.
Append own code after `update` with `lateUpdate`.
