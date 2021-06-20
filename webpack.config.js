const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

/*
const compilerJsNoManifest = {
  target: 'web',
  entry: {
    clipboard: './resources/js/plugins/clipboard.ts',
  },
  output: {
    path: path.join(__dirname, './public/'),
    filename: '[name].min.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig-webpack.json',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
}
*/

// Compile and bundle all scss / ts
const compilerBundle = {
  target: 'web',
  entry: {
    //css
    'main': './resources/scss/main.scss',

    //js
    main: './resources/js/main.ts',
  },
  output: {
    path: path.join(__dirname, './public/'),
    filename: '[name].[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true, url: false },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig-webpack.json',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
    new ManifestPlugin({ fileName: 'manifest.json' }),
    new CleanWebpackPlugin({
      // Clear all previous assets but don't delete the following:
      cleanOnceBeforeBuildPatterns: ['**/*', '!*dummy*'],
      verbose: true,
    }),
    /*
    new CopyPlugin({
      patterns: [
        {
          from: 'node_modules/@dummy/dummy/dist/js/dummy.min.js',
          to: './',
        },
        {
          from: 'node_modules/@dummy/dummy/dist/css/summy.min.css',
          to: './',
        },
      ],
    }),
    */
  ],
}

module.exports = [compilerBundle] // , compilerJsNoManifest, compilerCssNoManifest]
