const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  watch: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'src')],
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'eval-source-map',
  output: {
    publicPath: 'public',
    library: 'filestackDnD',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': 'production',
    }),
    new webpack.NormalModuleReplacementPlugin(/^(.*\/node\/.*\.js|.*\.node\.js)$/,  (result) => {
      if (result.resource) {
        result.resource = result.resource.replace(/node/g, 'browser');
      }
    }),
  ],
  optimization: {
    minimizer: [new TerserPlugin()],
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      },
      chunks: 'async',
      minChunks: 1,
      minSize: 30000,
      name: false
    }
  }
};
