const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
