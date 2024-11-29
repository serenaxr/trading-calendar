import { post, remove, put, get } from '../config'

// Mock
export default {
    add: (params, config) => post('/api/menology/', params, config),
    remove: (params, config) => remove('/api/menology/', {params}, config),
    update: (params, config) => put('/api/menology/', params, config),
    find: (params, config) => get('/api/menology/', params, config),
    external: (params, config) => post('/api/menology/external/', params, config),
    downloadTemp: (params, config) => get('/api/menology/file/', params, config),
    uploadExcel: (params, config) => post('/api/menology/file/', params, config),
    sync: (params, config) => post('/api/menology/sync/', params, config)
}
