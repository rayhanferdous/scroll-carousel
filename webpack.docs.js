const path = require('path');
const os = require('os');
var glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const htmlFilesPaths = glob.sync('./docs_src/**/*.html');

module.exports = {
  mode: 'production',
  target: ['web', 'es5'],
  entry: {
    bundle: ['./docs_src/js/index.js', './docs_src/css/style.css']
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: './js/[name].min.js',
    clean: true
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './css/[name].min.css'
    }),
    ...htmlFilesPaths.map(file => {
      return new HtmlWebpackPlugin({
        template: file,
        inject: 'body',
        filename: file.split('/').slice(2).join('/')
      });
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/i,
        include: path.resolve(__dirname, 'docs_src'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        exclude: /(node_modules)/,
        use: [
          // Extract CSS
          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              url: false
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env',
                    {
                      // Options
                    }
                  ]
                ]
              }
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin({
        include: /\.min\.css/,
        parallel: os.cpus().length,
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        }
      }),
      new TerserPlugin({
        include: /\.min\.js/,
        parallel: os.cpus().length,
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'docs')
    },
    watchFiles: ['./docs_src/**/*'],
    open: true,
    hot: true
  },
  stats: {
    preset: 'minimal',
    warnings: true,
    publicPath: true
  },
  cache: true
};

