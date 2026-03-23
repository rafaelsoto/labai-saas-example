const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'embed.js',
    iife: true,
  },
  target: ['web', 'es5'],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
          compress: { drop_console: false },
          output: { comments: false },
        },
      }),
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
