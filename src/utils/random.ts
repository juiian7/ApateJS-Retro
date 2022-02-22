/**
 * A pseudorandom number generator using the Wichman-Hill algorithm
 */
export class Random {
    private _seed: number;

    private a: number;
    private b: number;
    private c: number;

    public set seed(value: number) {
        this._seed = value;
        this.a = value;
        this.b = value;
        this.c = value;
    }
    public get seed(): number {
        return this._seed;
    }

    constructor(seed?: number) {
        this.seed = seed ?? new Date().getTime();
    }

    next(): number {
        this.a = (171 * this.a) % 30269;
        this.b = (172 * this.b) % 30307;
        this.c = (170 * this.c) % 30323;
        return (this.a / 30269 + this.b / 30307 + this.c / 30323) % 1;
    }

    /**
     * Generates a random number
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    between(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    /**
     * Generates a random integer
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    betweenInt(min: number, max: number): number {
        return Math.round(this.next() * (max - min) + min);
    }

    /**
     * Generates a random number using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetween(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generates a random integer using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetweenInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
