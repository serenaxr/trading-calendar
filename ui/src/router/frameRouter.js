const Calendar = () => import('@/views/calendar/index')
const Almanac = () => import('@/views/calendar/almanac/index')
const Strategy = () => import('@/views/strategy/index')
const Monitor = () => import('@/views/strategy/monitor/index')
const Operations = () => import('@/views/strategy/operations/index')
const Automation = () => import('@/views/strategy/automation/index')
const Platform = () => import('@/views/strategy/platform/index')
const AlarmCenter = () => import('@/views/strategy/alarmCenter/index')
const Logs = () => import('@/views/strategy/logs')
const NoAuth = () => import('@/views/error/403')

export const frameRouter = [
    {
        path: '/',
        name: 'Almanac',
        component: Almanac,
        meta: {
            title: '交易日历'
        }
    },
    {
        path: '/almanac/:id',
        name: 'Almanac',
        component: Almanac,
        prop: true,
        meta: {
            title: '交易日历'
        }
    },
    {
        path: '/calendar',
        name: 'calendar',
        component: Calendar,
        meta: {
            title: '日历配置',
            role: 'men_list'
        }
    },
    {
        path: '/details/:id',
        name: 'details',
        component: Almanac,
        meta: {
            title: '工作日配置'
        }
    },
    {
        path: '/strategy',
        name: 'Strategy',
        component: Strategy,
        meta: {
            role: 'str_list',
            title: '策略管理'
        }
    },
    {
        path: '/strategy/monitor',
        name: 'monitor',
        component: Monitor,
        meta: {
            role: 'str_list',
            permission: 'kmc_saas',
            title: '监控中心'
        }
    },
    {
        path: '/strategy/operations',
        name: 'operations',
        component: Operations,
        meta: {
            role: 'str_list',
            permission: 'bk_sops',
            title: '标准运维'
        }
    },
    {
        path: '/strategy/automation',
        name: 'automation',
        component: Automation,
        meta: {
            role: 'str_list',
            permission: 'auto-ops_saas',
            title: '自动化运维中心'
        }
    },
    {
        path: '/strategy/platform',
        name: 'platform',
        component: Platform,
        roleId: 'bk_job',
        meta: {
            role: 'str_list',
            permission: 'bk_job',
            title: '作业平台'
        }
    },
    {
        path: '/strategy/alarmCenter',
        name: 'alarmCenter',
        component: AlarmCenter,
        meta: {
            role: 'str_list',
            permission: 'kac_saas',
            title: '告警中心'
        }
    },
    {
        path: '/strategy/logs',
        name: 'logs',
        component: Logs,
        meta: {
            role: 'str_list',
            title: '执行日志'
        }
    },
    {
        path: '/403',
        name: '403',
        component: NoAuth,
        meta: {
            title: '无权限'
        }
    }
]

// 导航栏
export const adminRouteConfig = [
    {
        name: '日历管理',
        icon: 'iconfont icon-mianxingtubiao-shezhi',
        id: 'calendar',
        children: [
            {
                name: '交易日历',
                icon: 'iconfont icon-mianxingtubiao-shezhi',
                id: 'Almanac',
                url: '/almanac'
            },
            {
                name: '日历配置',
                icon: 'iconfont icon-mianxingtubiao-shezhi',
                id: 'calendar',
                url: '/calendar'
            }
        ]
    }
]

export const strategyMenus = {
    name: '策略管理',
    icon: 'iconfont icon-mianxingtubiao-yingyongpeizhizhongxin',
    id: 'strategy',
    children: [
        {
            name: '告警中心',
            icon: 'iconfont icon-mianxingtubiao-shezhi',
            id: 'alarmCenter',
            url: '/strategy/alarmCenter',
            roleId: 'kac_saas'
        },
        {
            name: '监控中心',
            icon: 'iconfont icon-mianxingtubiao-shezhi',
            id: 'monitor',
            url: '/strategy/monitor',
            roleId: 'kmc_saas'
        },
        {
            name: '作业平台',
            icon: 'iconfont icon-mianxingtubiao-shezhi',
            id: 'platform',
            url: '/strategy/platform',
            roleId: 'bk_job'
        },
        {
            name: '标准运维',
            icon: 'iconfont icon-mianxingtubiao-shezhi',
            id: 'operations',
            url: '/strategy/operations',
            roleId: 'bk_sops'
        },
        {
            name: '自动化运维中心',
            icon: 'iconfont icon-mianxingtubiao-shezhi',
            id: 'automation',
            url: '/strategy/automation',
            roleId: 'auto-ops_saas'
        }
    ]
}

export const createAdminRouteConfig = () => adminRouteConfig
