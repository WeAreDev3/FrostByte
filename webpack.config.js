const config = {
  entry: './client/js/homepage.js',
  output: {
    path: './client',
    filename: 'bundle.js',
    pathinfo: true
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel?cacheDirectory'
    }]
  },
  externals: {
    'socket.io': 'io'
  }
}

module.exports = config
