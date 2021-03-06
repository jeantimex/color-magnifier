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
  parts.extractCSS({
    use: ['css-loader', 'sass-loader', parts.autoprefix()],
  }),
  parts.loadHtml({
    chunks: ['popup'],
    filename: 'popup.html',
    template: './src/popup.html',
  }),
  parts.loadImages({
    options: {
      limit: 8192,
      name: './images/[name].[ext]',
    },
  }),
  parts.loadFonts({
    options: {
      name: './fonts/[name].[ext]',
    },
  }),
  parts.copy({
    patterns: [
      { from: './src/manifest.json' },
      { context: './src/icons', from: 'icon-**', to: 'icons' },
    ],
  }),
]);

const productionConfig = merge([
  {
    // performance
  },
  parts.clean(),
  parts.minifyJavaScript(),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
]);

const developmentConfig = merge([
  {
    devtool: 'inline-source-map',
  },
  parts.reloadExtension({
    entries: { // The entries used for the content/background scripts or extension pages
      contentScript: 'content',
      background: 'background',
      extensionPage: 'popup',
    },
  }),
]);

module.exports = (mode) => {
  const config = mode === 'production' ? productionConfig : developmentConfig;

  return merge([commonConfig, config, { mode }]);
};
