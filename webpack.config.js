const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  // 配置多个入口
  entry: {
    Main: './src/main.ts'
  },
  // 配置source-map，方便调试
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        // 正则：查出所有ts、tsx结尾的文件
        test: /\.tsx?$/,
        // 配置ts-loader
        use: 'ts-loader',
        // 正则：过滤node_modules
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    // clean-webpack-plugin插件，用于每次打包都清理旧的数据
    new CleanWebpackPlugin(),
    // copy-webpack-plugin，把指定的文件夹内容复制到指定目录
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'html'),
          to: path.resolve(__dirname, 'build')
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  // 指定出口
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  }
};