const fs = require('fs');
const path = require('path');
const merge = require('webpack-merge');
const glob = require('glob');
const parts = require('./webpack.parts');

const commonConfig = merge([
  {
    entry: {
      background: './src/background.js',
      content: './src/content.js',
      popup: './src/popup.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js',
    },
  },
  parts.loadJavaScript({
    include: path.resolve(__dirname, 'src'),
  }),
]);

const productionConfig = merge([
  {
    // performance
  },
  parts.clean(),
  parts.extractCSS({
    use: ['css-loader', 'sass-loader', parts.autoprefix()],
  }),
  parts.loadHtml({
    chunks: ['popup'],
    filename: 'popup.html',
    template: './src/popup.html',
  }),
  parts.copy({
    patterns: [
      { from: './src/manifest.json' },
      //{ context: './src/assets', from: 'icon-**', to: 'assets' },
    ],
  }),
]);

const developmentConfig = merge([
  {

  },
]);

module.exports = (mode) => {
  const config = mode === 'production' ? productionConfig : developmentConfig;

  return merge([commonConfig, config, { mode }]);
};
