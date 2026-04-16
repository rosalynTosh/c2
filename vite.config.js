import { defineConfig } from "vite";

export default defineConfig({
    base: "",
    build: {
        sourcemap: true,
        lib: {
            entry: ["index.html"],
            name: "c2",
            formats: ["iife"],
            cssFileName: "index"
        }
    }
});