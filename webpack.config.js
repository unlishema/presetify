const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * @type {import("webpack").Configuration}
 */
module.exports = {
    //tell webpack where to look for source files
    context: path.resolve(__dirname, "src"),
    entry: {
        //each entrypoint results in an output file
        //so this results in an output file called 'main.js' which is built from src/index.ts
        "main": "./index.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        // library means that the exports from the entry file can be accessed from outside, in this case from the global scope as window.TestApp
        library: { type: "umd", name: "TestApp" }
    },
    devtool: false,
    mode: "development",
    // prevent webpack from bundling these imports (alt1 libs can use them when running in nodejs)
    externals: [
        "sharp",
        "canvas",
        "electron/common"
    ],
    resolve: {
        extensions: [".wasm", ".tsx", ".ts", ".mjs", ".jsx", ".js"]
    },
    module: {
        // The rules section tells webpack what to do with different file types when you import them from js/ts
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { test: /\.css$/, use: ["style-loader", "css-loader"] },
            { test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] },
            // type:"asset" means that webpack copies the file and gives you an url to them when you import them from js
            { test: /\.(png|jpg|jpeg|gif|webp)$/, type: "asset/resource", generator: { filename: "[base]" } },
            { test: /\.(html|json)$/, type: "asset/resource", generator: { filename: "[base]" } },
            // file types useful for writing alt1 apps, make sure these two loader come after any other json or png loaders, otherwise they will be ignored
            { test: /\.data\.png$/, loader: "alt1/imagedata-loader", type: "javascript/auto" },
            { test: /\.fontmeta.json/, loader: "alt1/font-loader" }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                // .htaccess file
                //{ from: path.resolve(__dirname, 'src/.htaccess'), to: path.resolve(__dirname, 'dist/.htaccess'), toType: 'file' },
                // Main app files
                { from: path.resolve(__dirname, 'CNAME'), to: path.resolve(__dirname, 'dist/CNAME'), toType: 'file' },
                { from: 'index.html', to: 'index.html' },
                { from: 'settings.html', to: 'settings.html' },
                { from: 'appconfig.json', to: 'appconfig.json' },
                { from: 'version.json', to: 'version.json' },
                // Folders we need
                { from: 'images', to: 'images', globOptions: { ignore: ['**/data/**'] } },
                { from: 'styles', to: 'styles' }
            ]
        })
    ]
}
