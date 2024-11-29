import httpConfig from './request'

const methodsWithoutData = ['get', 'head', 'options']
// 定义了一组不带请求体数据的 HTTP 方法
const defaultConfig = { needRes: false }
// 默认不需要返回整个响应

// json2Query 函数通过递归的方式处理对象和数组，将它们转换为适合在 URL 查询字符串中使用的格式。
// 这在进行 AJAX 请求或者构建 URL 时非常有用，可以实现简单的参数编码。
const json2Query = (param, key) => {
    const mappingOperator = '='
    const separator = '&'
    let paramStr = ''

    if (param instanceof String || typeof param === 'string' || param instanceof Number ||
        typeof param === 'number' || param instanceof Boolean || typeof param === 'boolean'
    ) paramStr += separator + key + mappingOperator + encodeURIComponent(param)
    else if (typeof param === 'object') {
        Object.keys(param).forEach(p => {
            const value = param[p]
            const k = (key === null || key === '' || key === undefined)
                ? p
                : key + (param instanceof Array ? '[' + p + ']' : '.' + p)
            paramStr += separator + json2Query(value, k)
        })
    }
    return paramStr.substr(1)
}

export const request = (method, url) => (params = {}, config = {}) => {
    const reqMethod = method.toLowerCase()
    const reqConfig = Object.assign({}, defaultConfig, config)//合并默认配置与传入的配置

    // 全局URL变量替换
    const variableData = {}

    Object.keys(params).forEach(key => {
        // 自定义url变量
        if (key.indexOf('$') === 0) {
            variableData[key] = params[key]
        }
    })

    let newUrl = `${window.siteUrl}${url}`
    Object.keys(variableData).forEach(key => {
        if (!variableData[key]) {
            // 去除后面的路径符号
            newUrl = newUrl.replace(new RegExp(`\\${key}/`, 'g'), '')
        } else {
            newUrl = newUrl.replace(new RegExp(`\\${key}`, 'g'), variableData[key])
        }
        delete params[key]
    })

    let req = null
    if (methodsWithoutData.includes(reqMethod)) {
        // 拼接参数
        const query = json2Query(params, '')
        if (query) {
            newUrl += `?${query}`
        }
        req = httpConfig[reqMethod](newUrl, null, reqConfig)
    } else {
        req = httpConfig[reqMethod](newUrl, params, reqConfig)
    }
    return req.then((res) => {
        if (reqConfig.needRes) return Promise.resolve(res)

        return Promise.resolve(res.data)
    }).catch((err) => {
        return Promise.reject(err)
    })
}

const getPromise = (method, url, params, config = {}) => {
    return new Promise(async(resolve, reject) => {
        await request(method, url)(params, config)
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
}

// get
export const get = (url, params, opts = {}) =>
    getPromise('get', url, params, opts)

// post
export const post = (url, params, opts = {}) =>
    getPromise('post', url, params, opts)

// put
export const put = (url, params, opts = {}) =>
    getPromise('put', url, params, opts)

// delete
export const remove = (url, params, opts = {}) =>
    getPromise('delete', url, params, opts)
