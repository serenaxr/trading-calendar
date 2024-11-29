import Api from '../../api'
const state = {
    includes: [],
    excludes: [],
    permission: true,
    // auth: true,
    loading: false,
    strategyMenu: {}
}

const getters = {
    includes: () => state.includes,
    hasPermission: () => state.permission,
    // auth: () => state.auth,
    loading: state => state.loading,
    strategyMenu: () => state.strategyMenu
}

const actions = {
    getIamUrl({commit}, data) {
        // const res = await post('/iam/permission/query_apply_permission_url/', data)
        // return res.data
        return new Promise((resolve, reject) => {
            resolve({
                code: 'OK',
                data: {
                    url: 'https://paas.cwbk.com/o/bk_iam/apply-custom-perm?from_wecom=1'
                },
                result: true
            })
        })
    },
    addInclude({ commit }, data) {
        commit('setIncludes', data)
    },
    removeInclude({ commit }, data) {
        commit('removeIncludes', data)
    },
    clearInclude({ commit }) {
        commit('clearInclude')
    },
    setPermission({ commit }, data) {
        commit('setPermission', data)
    },
    // setAuth({ commit }, data) {
    //     commit('setAuth', data)
    // },
    setLoading({ commit }, data) {
        commit('updateLoading', data)
    },
    async getStrategyMenu({ commit }) {
        try {
            const { data = [] } = await Api.strategy.getStrategyMenu()
            const menu = data || []
            commit('setStrategyMenu', menu)
            return menu
        } catch (error) {
            return []
        }
    }
}

const mutations = {
    async setIncludes(state, data) {
        await mutations.removeIncludes(state, data)
        state.includes.push(data)
    },
    removeIncludes(state, data) {
        return new Promise((resolve) => {
            const index = state.includes.findIndex(item => item === data)
            if (index > -1) state.includes.splice(index, 1)
            resolve(state.includes)
        })
    },
    clearInclude(state) {
        state.includes = []
    },
    setPermission(state, data) {
        state.permission = data
    },
    // setAuth(state, data) {
    //     state.auth = data
    // },
    updateLoading(state, data) {
        state.loading = data
    },
    setStrategyMenu({ commit }, menus) {
        state.strategyMenu = menus
    }
}

export default {
    namespace: true,
    state,
    actions,
    mutations,
    getters
}
