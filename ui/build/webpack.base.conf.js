'use strict'
const path = require('path')//引入模块
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
var webpack = require('webpack')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const vueLoaderPlugin = require('vue-loader/lib/plugin')

function resolve(dir) {
    return path.join(_dirname, '..', dir)
}
