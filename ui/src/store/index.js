import Vuex from 'vuex'
import Vue from 'vue'

// 自动导入文件
const files = require.context('./modules', false, /\.js$/)
const modules = {}

files.keys().forEach(key => {
    if (key === './index.js') return
    modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})

Vue.use(Vuex)

export default new Vuex.Store({
    modules
})
