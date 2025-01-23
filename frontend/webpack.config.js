// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/', // Serves assets from the root
  },
  mode: 'development', // Use 'development' for better debugging
  devtool: 'source-map', // Enable source maps
  module: {
    rules: [
      // JavaScript and JSX Files
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      // CSS Modules
      {
        test: /\.module\.css$/,
        use: [
          'style-loader', // Injects styles into DOM
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]', // Naming pattern
              },
              importLoaders: 1,
            },
          },
        ],
      },
      // Regular CSS (Global Styles)
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ['style-loader', 'css-loader'], // Handles regular CSS without modules
      },
      // Add loaders for other assets if needed
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'), // Path to your HTML template
      filename: 'index.html', // Output filename in /dist
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    historyApiFallback: true, // Allows React Router paths
    port: 3000,
    open: true, // Automatically opens the browser
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve these extensions
  },
};
