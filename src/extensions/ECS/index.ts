type Component = any;
type Action = (entities: Entity[], delta: number) => {};

class Entity {
    private _world: World;
    private _types: string[] = [];
    private _components: Component[] = [];
    private _filter: number = 0;

    constructor(world: World) {
        this._world = world;
    }

    public add(type: string, component: Component): Entity {
        this._types.push(type);
        this._components.push(component ?? 0);

        this.calcFilter();

        return this;
    }

    public get(type: string): Component {
        let i = this._types.indexOf(type);
        if (i >= 0) return this._components[i];
        return null;
    }

    private calcFilter() {
        this._filter = 0;
        this._types.forEach((t) => (this._filter += this._world.typeID(t)));
    }

    public get filter() {
        return this._filter;
    }
}

export class World {
    private _entities: Entity[] = [];
    private _systems: System[] = [];

    private _typeMap: Map<string, number> = new Map<string, number>();

    public typeID(type: string): number {
        if (this._typeMap.has(type)) {
            return this._typeMap.get(type);
        }

        let id = 2 ** this._typeMap.size;
        this._typeMap.set(type, id);
        return id;
    }

    public spawn(): Entity {
        let e = new Entity(this);
        this._entities.push(e);
        return e;
    }

    public query(...types: string[]): Entity[] {
        let sum = 0;
        let entities = [];
        for (let i = 0; i < types.length; i++) sum += this.typeID(types[i]);
        for (let i = 0; i < this._entities.length; i++) if ((this._entities[i].filter & sum) == sum) entities.push(this._entities[i]);
        return entities;
    }

    public system() {
        let s = new System(this);
        this._systems.push(s);
        return s;
    }

    public tick(delta: number) {
        for (let i = 0; i < this._systems.length; i++) {
            this._systems[i].action(this.query(...this._systems[i].types), delta);
            //optimize and cache...
        }
    }
}

export class System {
    private _world: World;
    private _filter: number = 0;
    private _types: string[] = [];

    public action: Action;

    constructor(world: World) {
        this._world = world;
    }

    public for(...types: string[]) {
        for (let i = 0; i < types.length; i++) {
            this._types.push(types[i]);

            this._filter += this._world.typeID(types[i]);
        }

        return this;
    }

    public do(action: Action) {
        this.action = action;

        return this;
    }

    public get types() {
        return this._types;
    }
}
