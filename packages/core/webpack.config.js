const path = require('path');
const devMode = process.argv.indexOf('--mode=production') === -1
const entry = devMode ? './example/index.ts' : './src/waterfall.ts'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Webpack = require('webpack')
module.exports = {
  mode: devMode ? 'development' : 'production',
  entry: devMode ? path.resolve(__dirname, entry) : {
    'hmWaterfall': path.resolve(__dirname, entry),
    'hmWaterfall.min': path.resolve(__dirname, entry)
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    library: 'hmWaterfall',
    libraryTarget: 'umd',
    libraryExport: 'default',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'] //配置文件引入时省略后缀名
  },
  plugins: devMode ? [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
      filename: 'index.html',
    }),
    new Webpack.HotModuleReplacementPlugin()
  ] : [],
  devServer: {
    port: 5173
  }
}