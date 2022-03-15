const path = require('path');

module.exports =  {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          "presets": ["@babel/preset-env", "@babel/preset-react"],
          "comments": false 
        }
      }
    },
    {
      test: /\.css$/i,
      use: ['style-loader', 'css-loader']
    }]
  },
  devServer: {
    static : {
      directory: path.join(__dirname, "public")
    },
    // contentBase: path.join(__dirname, 'public')
  },
  mode: 'production',
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
}