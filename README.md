# webpack-image-minimizer-plugin
> The Webpack plugin for almost quality-lossless compression of images.

[![NPM](https://img.shields.io/npm/v/webpack-image-minimizer-plugin.svg)](https://www.npmjs.com/package/webpack-image-minimizer-plugin) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Description
A few simple lines of code can help you reduce the size of your image file by 70% without changing the quality of the image.


## Install

```bash
npm install --save-dev webpack-image-minimizer-plugin
```

## Usage

add following codes into your "webpack.config.js" file
```js
const webpackImageMinimizerPlugin = require('webpack-image-minimizer-plugin');

module.exports = {
...
 plugins: [
  ...
  new webpackImageMinimizerPlugin()
  ]
}

```

## Customizition

WebpackImageMinimizerPlugin Constructor accept following options:
```json
{
  // Set if cache file in node_modules/.cache/webpack-image-compress-plugin
  // so if the asset is not modified, it will use the cached compressed image file.
  enableCache: true, 
  // an array of command line options for the pngquant binary 
  pngQuantOptions: ['128']
  // build log.
  showDetailLog?: boolean = true;
}
```
This plugin based on  [node-pngquant](https://github.com/papandreou/node-pngquant), view that for more 
"pngQuantOptions" rules.