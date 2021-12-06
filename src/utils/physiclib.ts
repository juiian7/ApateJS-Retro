interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface CollisionCheckModel {
    a: Rect;
    b: Rect;
    action: Function;
}

export class PhysicLib {
    private monitoredCollisions: CollisionCheckModel[] = [];

    constructor() {}
    
    public isCollisionRect(rect1: Rect, rect2: Rect) {
        return !(rect1.x + rect1.w <= rect2.x || rect2.x + rect2.w <= rect1.x || rect1.y + rect1.h <= rect2.y || rect2.y + rect2.h <= rect1.y);
    }
    public isCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }

    public watch(rect1: Rect, rect2: Rect, action: Function): CollisionCheckModel {
        this.monitoredCollisions.push({ a: rect1, b: rect2, action });
        return this.monitoredCollisions[this.monitoredCollisions.length - 1];
    }

    public drop(ccm: CollisionCheckModel) {
        let i = this.monitoredCollisions.indexOf(ccm);
        if (i > -1) this.monitoredCollisions.splice(i, 1);
    }

    public checkAllCollisions() {
        for (let i = 0; i < this.monitoredCollisions.length; i++) {
            if (this.isCollisionRect(this.monitoredCollisions[i].a, this.monitoredCollisions[i].b)) this.monitoredCollisions[i].action();
        }
    }
}
