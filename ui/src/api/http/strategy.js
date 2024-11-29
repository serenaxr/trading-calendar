import { post, remove, put, get } from '../config'

// Mock
export default {
    add: (params, config) => post('/api/customization/strategy/', params, config),
    remove: (params, config) => remove('/api/customization/strategy/', { params }, config),
    update: (params, config) => put('/api/customization/strategy/', params, config),
    find: (params, config) => get('/api/customization/strategy/', params, config),
    getTimeTask: (params, config) => get('/api/strategy/get_timing_task/', params, config),
    getLog: (params, config) => get('/api/strategy/get_strategy_log/', params, config),
    getTask: (params, config) => get('/api/strategy/get_alarm_task/', params, config),
    getStrategyMenu: (params) => get('/api/strategy/show_strategy_saas/', params)
}
