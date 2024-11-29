<template>
    <div class="monitor-navigation">
        <bk-navigation ref="nav" :navigation-type="curNavType" theme="dark" :header-title="nav.id" :side-title="nav.title" :default-open="true" :need-menu="true" ext-cls="main-navigation"
            @toggle-click="handleToggle">
            <!--导航头部图标-->
            <template slot="side-icon">
                <div class="monitor-logo" @click="goHome">
                    <img :src="'data:image/png;base64,' + nav.logo" height="32" width="32" :alt="'logo图片'">
                </div>
            </template>
            <!--头部-->
            <template slot="header">
                <Header :cur-nav-type="curNavType" :nav="nav" :header="header" :user="user" @clickTopMenu="clickTopMenu"></Header>
            </template>
            <!--左侧导航栏-->
            <template slot="menu">
                <bk-navigation-menu ref="menu" @select="handleSelect" :default-active="$route.meta.hasOwnProperty('fatherName') ? $route.meta.fatherName : $route.name"
                    :before-nav-change="beforeNavChange" :toggle-active="true">
                    <bk-navigation-menu-item v-for="item in nav.list" :key="item.name" :has-child="item.children && !!item.children.length"
                        :icon="item.icon" :id="item.id">
                        <span>{{item.name}}</span>
                        <div slot="child">
                            <template v-for="child in item.children">
                                <bk-navigation-menu-item v-if="!child.hidden" :key="child.name" :id="child.id"
                                    :url="child.url" :default-active="child.active" @click="handleNavItemClick(child)">
                                    <span>{{child.name}}</span>
                                </bk-navigation-menu-item>
                            </template>
                        </div>
                    </bk-navigation-menu-item>
                </bk-navigation-menu>
            </template>
            <!--            容器-->
            <Container :nav-toggle="nav.toggle"></Container>
        </bk-navigation>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'
    import Header from '@/components/base/header'
    import Container from '@/components/base/container'
    import { logo } from './logo'
    import { createAdminRouteConfig, strategyMenus } from '../../router/frameRouter'

    export default {
        name: 'left-navigation',
        components: {
            Header,
            Container
        },
        data() {
            return {
                nav: {
                    list: [],
                    name: '交易日历',
                    id: 'Almanac',
                    toggle: false,
                    submenuActive: false,
                    title: '交易日历',
                    // 图片base64格式
                    logo: logo
                },
                header: {
                    list: [],
                    selectList: [],
                    bizId: 1
                },
                user: {
                    name: 'Troytu'
                },
                // 不同布局模式，修改此处，可选值：top-bottom、left-right
                curNavType: 'left-right'
            }
        },
        created() {
            this.confirmUserIdentity()
        },
        methods: {
            ...mapActions(['getStrategyMenu']),
            clickTopMenu(activeID) {
                this.nav.list = this.header.list.find(item => item.id === activeID).children
                this.$router.push(this.nav.list[0].url)
            },
            confirmUserIdentity() {
                const list = createAdminRouteConfig()
                this.nav.list = list
                this.header.list = list
                this.setStrategyMenu()
            },
            async setStrategyMenu() {
                const res = await this.getStrategyMenu()
                let { children } = strategyMenus
                children = children.filter(item => res[item.roleId])
                if (children.length && !this.header.list.some(item => item.id === 'strategy')) {
                    strategyMenus.children = children
                    const list = createAdminRouteConfig().push(strategyMenus)
                    // this.nav.list = list
                    this.header.list = list
                }
            },
            handleSelect(id, item) {
                this.nav.id = id
                this.handleNavItemClick(item)
            },
            handleToggle(v) {
                this.nav.toggle = v
            },
            beforeNavChange(newId, oldId) {
                return true
            },
            handleNavItemClick(item) {
                if (this.$route.name !== item.id) {
                    this.$router.push({
                        name: item.id
                    })
                }
            },
            goHome() {
                this.$router.push('/home')
            }
        }
    }
</script>

<style lang="scss" scoped>
    .bk-navigation {
        width: 100% !important;
    }
    .monitor-navigation {
        overflow: hidden;
    }
    /deep/ .bk-navigation-wrapper {
        height: 100vh !important;
        width: 100%;

        .navigation-container {
            max-width: calc(100% - 60px) !important;

            .container-content {
                padding: 0;
            }
        }

        .bk-navigation-title {
            padding: 13px 14px !important;
            flex-basis: 58px !important;

            .title-desc {
                font-size: 18px;
                font-weight: bold;
                // color: #FFFFFF;
            }
        }
        .navigation-menu-item {
            &.is-actived::before {
                background: var(--jjext-color-navbar-icon) !important;
            }
        }
    }

    .monitor-logo img {
        display: flex;
        align-items: center;
    }

    .monitor-navigation-nav {
        width: 150px;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        background: #FFFFFF;
        border: 1px solid #E2E2E2;
        -webkit-box-shadow: 0 3px 4px 0 rgba(64, 112, 203, 0.06);
        box-shadow: 0 3px 4px 0 rgba(64, 112, 203, 0.06);
        padding: 6px 0;
        margin: 0;
        color: #63656E;

        .nav-item {
            -webkit-box-flex: 0;
            -ms-flex: 0 0 32px;
            flex: 0 0 32px;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            padding: 0 20px;
            list-style: none;
        }

        .nav-item:hover {
            color: #3A84FF;
            cursor: pointer;
            background-color: #F0F1F5;
        }
        // .item-hover-bg-color: {
        //     background-color: #fff;
        // }
    }
</style>
