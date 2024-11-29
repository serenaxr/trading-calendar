/**
 * 异常处理
 *
 * @param {Object} err 错误对象
 * @param {Object} ctx 上下文对象，这里主要指当前的 Vue 组件
 */
export function catchErrorHandler(err, ctx) {
    const data = err.data
    if (data) {
        if (!data.code || data.code === 404) {
            ctx.exceptionCode = {
                code: '404',
                msg: '当前访问的页面不存在'
            }
        } else if (data.code === 403) {
            ctx.exceptionCode = {
                code: '403',
                msg: 'Sorry，您的权限不足!'
            }
        } else {
            ctx.bkMessageInstance = ctx.$bkMessage({
                theme: 'error',
                message: err.message || err.data.msg || err.statusText
            })
        }
    } else {
        console.error(err)
        ctx.bkMessageInstance = ctx.$bkMessage({
            theme: 'error',
            message: err.message || err.data.msg || err.statusText
        })
    }
}

export function isCrossOriginIFrame() {
    try {
        return !window.top.location.hostname
    } catch (e) {
        return true
    }
}

/**
 * 打开其他应用，分为页面打开和 PaaS 平台 iframe打开，iframe 可能会出现跨域的情况
 * @param {String} code app 的 code
 * @param {String} url app 跳转链接
 */
export function openOtherApp(code, url) {
    if (self !== top) { // iframe 打开
        if (isCrossOriginIFrame()) {
            window.open(url, '__blank')
        } else {
            window.PAAS_API.open_other_app(code, url)
        }
    } else {
        window.open(url, '__blank')
    }
}

/**
 * 校验是否具有权限
 * @param {String} key 权限标识
 * @param { Object } roles 权限集
 */
export function checkPermission(data) {
    return {
        hasPermission: function(key, type = 'text') {
            return data[key] && data[key].enabled
        }
    }
}

// 防抖
export function _debounce(fn, delay) {
    delay = delay || 200
    let timer
    return function() {
        const th = this
        const args = arguments
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(function() {
            timer = null
            fn.apply(th, args)
        }, delay)
    }
}
// 节流
export function _throttle(fn, interval) {
    let last
    let timer
    interval = interval || 200
    return function() {
        const th = this
        const args = arguments
        const now = +new Date()
        if (last && now - last < interval) {
            clearTimeout(timer)
            timer = setTimeout(function() {
                last = now
                fn.apply(th, args)
            }, interval)
        } else {
            last = now
            fn.apply(th, args)
        }
    }
}
