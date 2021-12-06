/**
 * A pseudorandom number generator using the Wichman-Hill algorithm
 */
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

    next(): number {
        this.a = (171 * this.a) % 30269;
        this.b = (172 * this.b) % 30307;
        this.c = (170 * this.c) % 30323;
        return (this.a / 30269 + this.b / 30307 + this.c / 30323) % 1;
    }

    /**
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    between(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    /**
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
