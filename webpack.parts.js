const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtensionReloader  = require('webpack-extension-reloader');
const cssnano = require('cssnano');

exports.clean = (path) => ({
  plugins: [new CleanWebpackPlugin()],
});

exports.loadJavaScript = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: [/\.jsx?$/, /\.tsx?$/],
        include,
        exclude,
        use: 'babel-loader',
      },
    ],
  },
});

exports.minifyJavaScript = () => ({
  optimization: {
    minimizer: [new UglifyWebpackPlugin({ sourceMap: true })],
  },
});

exports.extractCSS = ({ include, exclude, use = [] }) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: '[name].bundle.css',
  });

  return {
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          include,
          exclude,
          use: [MiniCssExtractPlugin.loader].concat(use),
        },
      ],
    },
    plugins: [plugin],
  };
};

exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => [require('autoprefixer')()],
  },
});

exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
});

exports.purifyCSS = ({ paths }) => ({
  plugins: [new PurgecssPlugin({ paths })],
});

exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        include,
        exclude,
        use: {
          loader: 'url-loader',
          options,
        },
      },
    ],
  },
});

exports.loadFonts = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(ico|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
        include,
        exclude,
        use: {
          loader: 'file-loader',
          options,
        },
      },
    ],
  },
});

exports.loadHtml = ({chunks, filename, template}) => ({
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      chunks,
      filename,
      template,
    }),
  ],
});

exports.copy = ({ patterns, options }) => ({
  plugins: [
    new CopyWebpackPlugin({
      patterns,
      options,
    }),
  ],
});

exports.reloadExtension = ({ port = 9090, reloadPage = true, entries }) => ({
  plugins: [
    new ExtensionReloader({
      port,
      reloadPage,
      entries,
    }),
  ],
});
