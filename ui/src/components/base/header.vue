<template>
    <div class="monitor-navigation-header">
        <ol class="header-nav" v-if="curNavType === 'top-bottom'">
            <bk-popover v-for="item in header.list" :key="item.id" theme="light navigation-message" :arrow="false" offset="0, -5" placement="bottom" :tippy-options="{ 'hideOnClick': false, flipBehavior: ['bottom'] }">
                <li class="header-nav-item" :class="{ 'item-active': item.id === activeID }" @click="clickTopMenu(item)">
                    {{item.name}}
                </li>
                <!-- <template slot="content">
                    <ul class="monitor-navigation-nav">
                        <li class="nav-item" v-for="headerNavItem in item.children" :key="headerNavItem.id">
                            {{headerNavItem.name}}
                        </li>
                    </ul>
                </template> -->
            </bk-popover>
        </ol>
        <div v-else class="header-title">
            <bk-icon v-if="showBack" class="arrows-left" @click="$router.go(-1)" type="arrows-left" />
            {{$route.meta.title}}
        </div>
        <bk-select class="header-select is-left"
            v-if="header.selectList.length"
            v-model="header.bizId" :clearable="false" searchable>
            <bk-option v-for="option in header.selectList"
                :key="option.id"
                :id="option.id"
                :name="option.name">
            </bk-option>
        </bk-select>
        <div class="header-user is-left">
            <bk-dropdown-menu ref="dropdown">
                <div class="dropdown-trigger-text" slot="dropdown-trigger">
                    <span>{{userInfo.username}}</span>
                    <i :class="['bk-icon icon-angle-down']"></i>
                </div>
                <ul class="bk-dropdown-list" slot="dropdown-content">
                    <li><a href="javascript:;" @click="logout">退出登录</a></li>
                </ul>
            </bk-dropdown-menu>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    export default {
        name: 'nav-header',
        props: {
            curNavType: {
                type: String,
                default: 'left-right'
            },
            nav: {
                type: Object,
                default: () => ({})
            },
            header: {
                type: Object,
                default: () => ({})
            },
            user: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                activeID: ''
            }
        },
        computed: {
            ...mapGetters(['userInfo']),
            showBack() {
                return !this.navList.find(item => item.id === this.$route.name)
            },
            navList() {
                return this.flatArr(JSON.parse(JSON.stringify(this.nav.list)))
            }
        },
        watch: {
            'header.list': {
                handler(val) {
                    this.activeID = this.header.list[0] && this.header.list[0].id
                    if (this.curNavType === 'top-bottom') {
                        this.$emit('clickTopMenu', this.activeID)
                    }
                },
                immediate: true,
                deep: true
            }
        },
        methods: {
            ...mapActions(['logout']),
            clickTopMenu(item) {
                this.activeID = item.id
                this.$emit('clickTopMenu', this.activeID)
            },
            flatArr(arr, pid) {
                return arr.reduce((prev, next) => {
                    if (pid) {
                        next.pid = pid
                    }
                    const children = next.children || []
                    delete next.children
                    return [...prev, ...children.length ? [next, ...this.flatArr(children, next.id || next.name)] : [next]]
                }, [])
            },
            OutLogin() {
            }
        }
    }
</script>

<style lang="scss">
    .monitor-navigation-header {
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
        height: 100%;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        font-size: 14px;

        .header-nav {
            display: flex;
            padding: 0;
            margin: 0;
        }

        .header-nav-item {
            list-style: none;
            height: 50px;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            margin-right: 40px;
            color: #96A2B9;
            min-width: 56px;
        }

        .header-nav-item.item-active {
            color: #FFFFFF !important;
        }

        .header-nav-item:hover {
            cursor: pointer;
            color: #D3D9E4;
        }

        .header-title {
            color: #63656E;
            font-size: 16px;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            margin-left: -6px;
            flex: 1;
            .arrows-left {
                cursor: pointer;
                font-size: 28px !important;
                &:hover {
                    color: var(--jjext-color-hover);
                }
            }
        }

        .header-select {
            width: 240px;
            margin-left: auto;
            margin-right: 34px;
            border: none;
            background: #252F43;
            color: #D3D9E4;
            -webkit-box-shadow: none;
            box-shadow: none;
        }

        .header-select.is-left {
            background: #F0F1F5;
            color: #63656E;
        }

        .header-mind {
            color: #768197;
            font-size: 16px;
            position: relative;
            height: 32px;
            width: 32px;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            margin-right: 8px;
        }

        .header-mind.is-left {
            color: #63656E;
        }

        .header-mind.is-left:hover {
            color: #3A84FF;
            background: #F0F1F5;
        }

        .header-mind:hover {
            background: linear-gradient(270deg, rgba(37, 48, 71, 1) 0%, rgba(38, 50, 71, 1) 100%);
            border-radius: 100%;
            cursor: pointer;
            color: #D3D9E4;
        }

        .header-help {
            color: #768197;
            font-size: 16px;
            position: relative;
            height: 32px;
            width: 32px;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            margin-right: 8px;
        }

        .header-help.is-left {
            color: #63656E;
        }

        .header-help.is-left:hover {
            color: #3A84FF;
            background: #F0F1F5;
        }

        .header-help:hover {
            background: linear-gradient(270deg, rgba(37, 48, 71, 1) 0%, rgba(38, 50, 71, 1) 100%);
            border-radius: 100%;
            cursor: pointer;
            color: #D3D9E4;
        }

        .header-user {
            height: 100%;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            color: #96A2B9;
            margin-left: 8px;
        }

        .header-user .iconfont {
            margin-left: 5px;
            font-size: 12px;
        }

        .header-user.is-left {
            color: #63656E;
        }

        .header-user.is-left:hover {
            color: #3A84FF;
        }

        .header-user:hover {
            cursor: pointer;
            color: #D3D9E4;
        }
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
    }
    .monitor-navigation-nav .nav-item {
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
    .monitor-navigation-nav .nav-item:hover {
        color: #3A84FF;
        cursor: pointer;
        background-color: #F0F1F5;
    }
    .monitor-navigation-nav .nav-item {
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
    .monitor-navigation-nav .nav-item:hover {
        color: #3A84FF;
        cursor: pointer;
        background-color: #F0F1F5;
    }
    .monitor-navigation-admin .nav-item {
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
    .monitor-navigation-admin .nav-item:hover {
        color: #3A84FF;
        cursor: pointer;
        background-color: #F0F1F5;
    }
    .tippy-popper .tippy-tooltip.navigation-message-theme {
        padding: 0;
        border-radius: 0;
        -webkit-box-shadow: none;
        box-shadow: none;
    }
</style>
