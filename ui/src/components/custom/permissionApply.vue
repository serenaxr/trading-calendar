<template>
    <div class="permisson-apply">
        <div class="apply-content">
            <div class="lock-img">
                <img :src="lock" alt="permission-lock" />
            </div>
            <h3>无权限访问</h3>
            <p>你没有相应资源的访问权限，请申请权限或联系管理员授权</p>
            <div class="operation-btns">
                <!-- <bk-button
                    theme="primary"
                    :loading="loading"
                    @click="applyBtnClick">
                    {{ hasClicked ? '已申请' : '去申请' }}
                </bk-button> -->
            </div>
        </div>
    </div>
</template>
<script>
    import { mapActions } from 'vuex'
    import { catchErrorHandler, openOtherApp } from '@/utils/utils.js'

    export default {
        name: 'permission-apply',
        props: {
            permissionData: {
                type: Object,
                default() {
                    return {
                        type: 'project', // 无权限类型: project、other
                        permission: null
                    }
                }
            }
        },
        data() {
            return {
                url: '',
                loading: false,
                hasClicked: false,
                authActions: [],
                lock: require('../../assets/svg/lock-radius.svg')
            }
        },
        watch: {
            'permissionData': {
                deep: true,
                handler(val) {
                    if (val.permission) {
                        // this.loadPermissionUrl()
                    }
                }
            }
        },
        created() {
            // this.hasPermission()
            // if (this.permissionData.permission) {
            //     this.loadPermissionUrl()
            // }
        },
        methods: {
            ...mapActions([
                'getIamUrl'
            ]),
            // 去申请按钮触发，跳转到权限中心申请对应权限
            applyBtnClick() {
                if (this.loading) {
                    return
                }
                if (this.hasClicked) {
                    window.location.reload()
                } else {
                    this.hasClicked = true
                    openOtherApp(window.BK_IAM_APP_CODE, this.url)
                }
            },
            // 初始化权限中心跳转链接
            async loadPermissionUrl() {
                try {
                    this.loading = true
                    const res = await this.getIamUrl(this.permissionData.permission)
                    if (res.result) {
                        this.url = res.data.url
                    } else {
                        catchErrorHandler(res, this)
                    }
                } catch (err) {
                    catchErrorHandler(err, this)
                } finally {
                    this.loading = false
                }
            }
        }
    }
</script>
<style lang="css" scoped>
    .apply-content {
        position: absolute;
        top: 35%;
        left: 0;
        width: 100%;
        text-align: center;
    }
    .apply-content .lock-img {
        margin: 0 auto 20px;
        width: 56px;
        height: 58px;
    }
    .apply-content > h3 {
        margin: 0 0 30px;
        color: #313238;
        font-size: 20px;
    }
    .apply-content > p {
        margin: 0 0 30px;
        color: #979ba5;
        font-size: 14px;
    }
    .apply-content .bk-button {
        height: 32px;
        line-height: 30px;
    }
</style>
