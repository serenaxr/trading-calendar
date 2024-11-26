'use strict'
const utils = require('./utils')
const config = require('../config')
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = config.build.isProduction? config.build.processSourceMap : config.env.cssSourceMap

module.exports = {
    load
}