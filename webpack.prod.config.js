import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const config = {
  mode: 'production',
  entry: ['./src/assets/style.scss', './src/Components.js', './src/index.js'],
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
