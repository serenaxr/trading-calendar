<template>
    <div>
        <div class="monitor-navigation-header">
            <div class="header-left" @click="$router.push({ path: '/' })">
                <div class="monitor-logo">
                    <img :src="'data:image/png;base64,' + logo" height="32" width="32" :alt="'logo图片'">
                </div>
                <div class="title">交易日历</div>
            </div>
            <div class="header-right">
                <div class="header-user is-left">
                    {{user.name || 'admin'}}
                    <!-- <i class="iconfont icon-arrLeft-fill-copy-copy"></i> -->
                </div>
                <bk-icon class="logout" type="end" @click="logout" />
            </div>
        </div>
        <router-view />
    </div>
</template>

<script>
    import { mapActions } from 'vuex'
    import { logo } from './logo'
    export default {
        name: 'layout',
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
                activeID: '',
                logo: logo
            }
        },
        computed: {
            showBack() {
                return !this.navList.find(item => item.id === this.$route.name)
            },
            navList() {
                return this.flatArr(JSON.parse(JSON.stringify(this.nav.list)))
            }
        },
        mounted() {
            // this.activeID = this.header.list[0].id
            // if (this.curNavType === 'top-bottom') {
            //     this.$emit('clickTopMenu', this.activeID)
            // }
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
            }
        }
    }
</script>

<style lang="scss" scoped>
    .monitor-navigation-header {
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
        height: 100%;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding: 10px 24px;
        background: #000;
        color: #FFF;
        .header-left {
            display: flex;
            align-items: center;
            .monitor-logo {
                height: 32px;
            }
            .title {
                color: #96a2b9;
                font-size: 18px;
                margin-left: 16px;
                font-weight: bold;
            }
        }
        .header-right {
            display: flex;
            align-items: center;
        }
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
        .logout {
            cursor: pointer;
            &:hover {
                color: #3A84FF;
            }
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
            margin-right: 8px;
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
