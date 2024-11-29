import http from '@/api'

// initial state
const state = {
    userInfo: {},
    roles: {},
    auth: false
}

// getters
const getters = {
    userInfo: state => state.userInfo,
    roles: state => state.roles,
    auth: state => state.auth
}

// mutations
const mutations = {
    /**
     * 更新当前用户 user
     *
     * @param {Object} state store state
     * @param {Object} user user 对象
     */
    updateUser(state, user) {
        state.userInfo = Object.assign({}, user)
    },
    updateRole(state, roles) {
        state.roles = Object.assign({}, roles)
    },
    updateAuth(state, auth) {
        state.auth = auth
    }
}

// actions
const actions = {
    /**
     * 获取用户信息
     *
     * @param {Object} context store 上下文对象 { commit, state, dispatch }
     *
     * @return {Promise} promise 对象
     */
    async getUserInfo(context, config = {}) {
        const { result, data } = await http.user.userInfo({keyword: 'myself'})
        if (result) {
            context.commit('updateUser', data)
            return data
        }
    },
    /**
     * 获取用户权限信息
     *
     * @param {Object} context store 上下文对象 { commit, state, dispatch }
     *
     * @return {Promise} promise 对象
     */
    getPermission(context, config = {}) {
        return new Promise((resolve, reject) => {
            if (state.auth) {
                resolve(state.roles)
                return
            }
            context.dispatch('getUserInfo')
            http.user.userInfo({apply: 1}).then(res => {
                const { result, data } = res
                if (result) {
                    context.commit('updateRole', data)
                    context.commit('updateAuth', true)
                    resolve(data)
                } else {
                    context.commit('updateRole', [])
                    context.commit('updateAuth', false)
                    reject(res)
                }
            }).catch(err => {
                context.commit('updateRole', [])
                context.commit('updateAuth', false)
                reject(err)
            })
        })
    },
    logout({ commit }) {
        const href = state.userInfo.logout_url ? state.userInfo.logout_url : window.location.origin + '/login/?is_from_logout=1'
        commit('updateUser', {})
        // commit('updateAuth', false)
        commit('updateRole', {})
        window.location.href = href
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
