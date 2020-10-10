const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const config = {
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js']
  },
  mode: 'production',
  entry: path.resolve('src/main.js'),
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /spi_binding/,
        loader: 'node-loader'
      },
      {
        test: /\.js$/,
        include: [path.resolve('src')],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: '.babelcache'
          }
        },
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  }
};

if (process.env.NODE_ENV == 'production') {
  config.mode = 'production';
  config.optimization = {
    minimize: true,
    minimizer: [new UglifyJsPlugin({
      include: /\.min\.js$/
    })]
  }
} else {
  config.optimization = {
    minimize: false
  }
}

module.exports = config;
