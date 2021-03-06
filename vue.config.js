const path = require('path')
const webpack = require('webpack')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
const isProduction = process.env.NODE_ENV === 'production'

function resolve (dir) {
    return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@i': path.resolve(__dirname, './src/assets'),
      }
    },
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  
      // 配置compression-webpack-plugin压缩
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8
      }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 5,
        minChunkSize: 100
      })
    ]
  },
    /*
    Vue-cli3:
    Crashed when using Webpack `import()` #2463
    https://github.com/vuejs/vue-cli/issues/2463
   */
    // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
    productionSourceMap: false,

    // 打包app时放开该配置
    // publicPath:'./',
    // configureWebpack: config => {
    // // 生产环境取消 console.log
    //     if (process.env.NODE_ENV === 'production') {
    //         config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    //     }
    // },
    chainWebpack: (config) => {
        config.resolve.alias
            .set('@$', resolve('src'))
            .set('@api', resolve('src/api'))
            .set('@assets', resolve('src/assets'))
            .set('@comp', resolve('src/components'))
            .set('@views', resolve('src/views'))
            .set('@layout', resolve('src/layout'))

        // 配置 webpack 识别 markdown 为普通的文件
        config.module
            .rule('markdown')
            .test(/\.md$/)
            .use()
            .loader('file-loader')
            .end()
    },

    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    /* less 变量覆盖，用于自定义 ant design 主题 */
                    'primary-color': '#1890FF',
                    'link-color': '#1890FF',
                    'border-radius-base': '4px'
                },
                javascriptEnabled: true
            }
        }
    },

    devServer: {
        port: 3000,
        proxy: {
          '/jeecg-boot': {
              target: 'http://49.232.106.88:80', // 请求本地 需要jeecg-boot后台项目
              //target: 'http://10.21.0.57:8082',
              ws: false,
              changeOrigin: true
          }
        }
    },

    lintOnSave: undefined
}
