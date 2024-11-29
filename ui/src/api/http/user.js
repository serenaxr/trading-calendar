import { get } from '../config'

// Mock
export default {
    userInfo: (params, config) => get('/api/strategy/userinfo/', params, config)
}
