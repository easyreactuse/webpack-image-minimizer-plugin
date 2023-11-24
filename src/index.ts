
import PngQuant from 'pngquant';
import webpack, { Compilation } from "webpack";
import fs from 'fs';
import { Readable, Stream } from 'stream';
import path from 'path';
import colors from 'colors';
import type { Plugin } from "imagemin";
import type { Options as PngQuantOptions } from "imagemin-pngquant";
import type { Options as MozjpegOptions } from "imagemin-mozjpeg";
colors.enable();
function listFilesInFolder(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const stats = fs.statSync(folderPath);

  if (stats.isDirectory()) {
    const files = fs.readdirSync(folderPath);
    return files;
  } else {
    throw new Error(`${folderPath} is not a folder`)
  }
}
class WebpackImageMinimizerPlugin {
  enableCache?: boolean = true;
  pngQuantOptions?: PngQuantOptions = {}
  mozjpegOptions?: MozjpegOptions = { quality: 80 }
  showDetailLog?: boolean = true;
  constructor(options: {
    enableCache?: boolean,
    pngQuantOptions?: PngQuantOptions,
    mozjpegOptions?: MozjpegOptions,
    showDetailLog?: boolean
  }) {
    const { enableCache, pngQuantOptions, showDetailLog, mozjpegOptions } = options || {};
    this.enableCache = enableCache === undefined ? this.enableCache : !!enableCache;
    this.showDetailLog = showDetailLog === undefined ? this.showDetailLog : !!showDetailLog;
    this.pngQuantOptions = { ...this.pngQuantOptions, ...pngQuantOptions };
    this.mozjpegOptions = { ...this.mozjpegOptions, ...mozjpegOptions };
  }
  apply(compiler: webpack.Compiler) {
    const { RawSource } = webpack.sources;
    compiler.hooks.thisCompilation.tap(
      'MyExampleWebpackPlugin',
      async (compilation: webpack.Compilation) => {
        compilation.hooks.processAssets.tapPromise('MyExampleWebpackPlugin', async (assets) => {
          const assetsInfo = compilation.assetsInfo
          let cacheFiles: string[] = [];
          const cache_folder = path.resolve(process.cwd(), './node_modules/.cache/webpack-image-compress-plugin');
          if (this.enableCache) {
            cacheFiles = listFilesInFolder(cache_folder)
          }
          for (let key in assets) {
            console.log(key);
            const info = assetsInfo.get(key);
            const fileName = info?.contenthash as string;
            if (!fileName) {
              continue;
            }
            if (assets.hasOwnProperty(key) && /\.(png|jp?g)$/.test(key)) {
              const source = assets[key].source();

              if (this.enableCache) {
                if (cacheFiles.includes(fileName)) {
                  const cacheBuffer = fs.readFileSync(path.resolve(cache_folder, fileName));
                  assets[key] = new RawSource(cacheBuffer);
                  this.showDetailLog && console.log(
                    '[webpack-image-minimizer-plugin]:'.blue,
                    `"${key}" use cached compressed file:`.yellow,
                    `${(source as Buffer).byteLength}(Bytes) -> ${(cacheBuffer as Buffer).byteLength}(Bytes)`.green);
                  continue;
                }
              }
              const imagemin = (await import('imagemin')).default;
              const imageminMozjpeg = (await import("imagemin-mozjpeg")).default;
              const imageminPngquant = (await import("imagemin-pngquant")).default;
              const plugins: Plugin[] = [];
              if (/\.jp?g$/i.test(key)) {
                plugins.push(imageminMozjpeg(this.mozjpegOptions))
              }
              if (/.png/i.test(key)) {
                plugins.push(imageminPngquant(this.pngQuantOptions))
              }
              const resultPngBuffer = await imagemin.buffer(assets[key].buffer(), { plugins });
              assets[key] = new RawSource(resultPngBuffer);
              if (this.enableCache) {
                fs.writeFileSync(path.resolve(cache_folder, fileName), resultPngBuffer);
              }
              this.showDetailLog && console.log(
                '[webpack-image-minimizer-plugin]:'.blue,
                `"${key}" compressed:`.yellow,
                `${(source as Buffer).byteLength}(Bytes) -> ${resultPngBuffer.byteLength}(Bytes)`.green);
            }
          }
        });
      }
    );
  }
}
export default WebpackImageMinimizerPlugin;