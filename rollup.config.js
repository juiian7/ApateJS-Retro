// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
    // apate main engine
    {
        input: "src/apate.ts",
        output: {
            dir: "dist",
            format: "es",
        },
        plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    },
    {
        input: "dist/dts/apate.d.ts",
        output: {
            file: "dist/index.d.ts",
            format: "es",
        },
        plugins: [dts()],
    },
    // apate legacy-wrapper
    {
        input: "src/legacy-wrapper.ts",
        output: {
            dir: "dist",
            format: "es",
        },
        plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    },
    {
        input: "dist/dts/legacy-wrapper.d.ts",
        output: {
            file: "dist/legacy-wrapper.d.ts",
            format: "es",
        },
        plugins: [dts()],
    },
];
