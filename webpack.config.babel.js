import path from 'path';

export default {
  output: {
    path: path.join(__dirname, `built-${process.env.BUILD_TYPE}`),
    filename: `${process.env.BUILD_TYPE}.bundle.js`,
    publicPath: '/'
  },
  mode: 'production',
  entry: process.env.BUILD_TYPE === 'client' ? './src/client/client.js' : './src/server/main.js',
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
