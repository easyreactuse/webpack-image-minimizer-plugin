import webpack from "webpack";
declare class WebpackImageMinimizerPlugin {
    enableCache?: boolean;
    pngQuantOptions?: string[];
    constructor(options: {
        enableCache?: boolean;
        pngQuantOptions?: string[];
    });
    apply(compiler: webpack.Compiler): void;
}
export default WebpackImageMinimizerPlugin;
