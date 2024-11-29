import Vue from 'vue'
import Router from 'vue-router'
import {frameRouter} from './frameRouter'
import httpConfig from '@/api/config/request'
import store from '@/store'
import { checkPermission } from '@/utils/utils'
let hasPermission = null

// 遇到路由重读点击报错时，取消注释解决
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

// 路由切换时取消请求
const cancelRequest = async() => {
    const allRequest = httpConfig.queue.get()
    const requestQueue = allRequest.filter(request => request.cancelWhenRouteChange)
    await httpConfig.cancel(requestQueue.map(request => request.requestId))
}

// frameRouter ：参数；框架路由；不需要的话就直接注释
const router = new Router({
    routes: frameRouter // 替换到这里
})

const isAlive = (to) => {
    return to.name === 'details' || to.name === 'logs'
}

router.beforeEach(async(to, from, next) => {
    await cancelRequest()
    if (isAlive(to)) {
        if (from.name) store.dispatch('addInclude', from.name)
    }
    if (!['403'].includes(to.name)) {
        if (!Vue.prototype.$hasRoleCls) Vue.prototype.$hasRoleCls = () => false
        store.dispatch('setLoading', true)
        store.dispatch('getPermission').then(res => {
            store.dispatch('setLoading', false)
            if (!hasPermission) {
                // if (res['show_sass'] && (!res['show_sass'].enabled) && to.name === 'Almanac') { // 判断是否具有APP权限
                //     // store.dispatch('setAuth', false)
                //     next('/403')
                //     return
                // }
                hasPermission = checkPermission(res).hasPermission
                Vue.prototype.$hasPermission = hasPermission
                Vue.prototype.$hasRoleCls = (key, type = 'btn') => {
                    const flag = hasPermission(key)
                    return {
                        cls: flag ? '' : `${type}-permission-disable`,
                        disabled: !flag
                    }
                }
            }
            if ((!hasPermission(to.meta.role) && to.meta.role) || checkStrategyPermission(to)) { // 判断是否具有路由权限
                next('/403')
                return
            }
            if (to.matched.length === 0) {
                to.path ? next('/exceptionPage') : next('/')
            } else {
                next()
            }
        }).catch(() => {
            store.dispatch('setLoading', false)
            next('/403')
        })
    } else {
        next()
    }
})

router.afterEach((to, from, next) => {
    if (isAlive(from)) {
        setTimeout(() => store.dispatch('clearInclude'), 1000)
    }
})

function checkStrategyPermission(route) {
    if (!route.meta.permission) return false
    return !store.state.global.strategyMenu[route.meta.permission]
}

export default router
