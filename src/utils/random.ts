export class Random {
    public seed: number;

    private a: number;
    private b: number;
    private c: number;

    constructor(seed?: number) {
        if (!seed) seed = new Date().getTime();

        this.seed = seed;
        this.a = seed;
        this.b = seed;
        this.c = seed;
    }

    next() {
        this.a = (171 * this.a) % 30269;
        this.b = (172 * this.b) % 30307;
        this.c = (170 * this.c) % 30323;
        return (this.a / 30269 + this.b / 30307 + this.c / 30323) % 1;
    }

    between(min: number, max: number) {
        return this.next() * (max - min) + min;
    }

    betweenInt(min: number, max: number) {
        return Math.round(this.next() * (max - min) + min);
    }
}
