import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const config = {
  mode: 'development',
  entry: ['./src/assets/style.scss', './src/components', './src/index.js'],
  devtool: 'inline-source-map',
  devServer: {
    static: false,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/assets/index.html',
    }),
    new MiniCssExtractPlugin(),
  ],
};

export default config;
