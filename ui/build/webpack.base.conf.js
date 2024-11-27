'use strict'
const path = require('path')//引入模块
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
var webpack = require('webpack')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const vueLoaderPlugin = require('vue-loader/lib/plugin')

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

const createLintingRule = () => ({
    test: /\.(js|vue)$/,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: [resolve('src'), resolve('test')],
    options: {
        formatter: require('eslint-friendly-formatter'),
        emitWarning: !config.dev.showEslintErrorsInOverlay
    }
})

module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: {
        app: './src/main.js'
    },
    output: {
        path: config.build.assetsRoot,
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production'
           ? config.build.assetsPublicPath
            : config.dev.assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': resolve('src')
        }
    },
    plugins: [
        new StyleLintPlugin({
            files: ['src/**/*.(vue,html,htm,css,sss,less,scss,sass)'],
            exclude: [path.resolve(__dirname, '../node_modules/**')]
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            jquery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new vueLoaderPlugin()
    ],
    module: {
        rules: [
            ...(config.dev.useEslint ? [createLintingRule()] : []),
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueLoaderConfig
            },
            {
                test: /\.js$/,
                include: [resolve('src'), resolve('test'),, resolve('node_modules/webpack-dev-server/client')],
                use: [
                    'thread-loader',// 使用 thread-loader 将 JavaScript 代码的处理分配到多个线程，以提高构建速度
                    'babel-loader' // 使用 babel-loader 来转译 JavaScript 代码为ES5，以支持 ES6+ 的语法
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,//(\?.*)? 的部分用于匹配可能出现的查询字符串。
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('media/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    },
    node: {
        setImmediate: false,
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    }
}