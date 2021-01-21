const path = require('path');

module.exports = {
  entry: './src/index.ts',
  watch: true,
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
};
