
import PngQuant from 'pngquant';
import webpack, { Compilation } from "webpack";
import fs from 'fs';
import { Readable, Stream } from 'stream';
import path from 'path';
import colors from 'colors';

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
  pngQuantOptions?: string[] = ['128']
  showDetailLog?: boolean = true;
  constructor(options: { enableCache?: boolean, pngQuantOptions?: string[], showDetailLog?: boolean }) {
    const { enableCache, pngQuantOptions, showDetailLog } = options || {};
    this.enableCache = enableCache === undefined ? this.enableCache : !!enableCache;
    this.showDetailLog = showDetailLog === undefined ? this.showDetailLog : !!showDetailLog;
    this.pngQuantOptions = pngQuantOptions || this.pngQuantOptions;
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
              const pngQuant = new PngQuant(this.pngQuantOptions);
              const readableStream = Readable.from(source);
              // @ts-ignore
              readableStream.pipe(pngQuant);
              const chunks: any[] = [];
              await new Promise((resolve) => {
                pngQuant
                  .on('data', (chunk) => {
                    chunks.push(chunk);
                  })
                  .on('end', () => {
                    const resultPngBuffer = Buffer.concat(chunks);
                    assets[key] = new RawSource(resultPngBuffer);
                    if (this.enableCache) {
                      fs.writeFileSync(path.resolve(cache_folder, fileName), resultPngBuffer);
                    }
                    this.showDetailLog && console.log(
                      '[webpack-image-minimizer-plugin]:'.blue,
                      `"${key}" compressed:`.yellow,
                       `${(source as Buffer).byteLength}(Bytes) -> ${resultPngBuffer.byteLength}(Bytes)`.green);
                    resolve(null);
                  });
              })
            }
          }
        });
      }
    );
  }
}
export default WebpackImageMinimizerPlugin;