import path from 'path';

export default {
  output: {
    path: path.join(__dirname, `built`),
    filename: `bundle.js`,
    publicPath: '/'
  },
  mode: 'production',
  entry: './src/server/main.js',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  }
};
