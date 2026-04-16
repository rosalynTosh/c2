import path from "node:path";

import webpack from "webpack";

const config: webpack.Configuration = {
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve("./dist"),
    },
};

export default config;