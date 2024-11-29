<template>
    <div id="app">
        <left-navigation v-if="auth || loading"></left-navigation>
        <layout v-else></layout>
        <permission-modal ref="modal"></permission-modal>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import leftNavigation from '@/components/base/left_navigation'
    import PermissionModal from './components/custom/PermissionModal.vue'
    import Layout from './components/base/layout.vue'

    export default {
        name: 'app',
        components: {
            leftNavigation,
            PermissionModal,
            Layout
        },
        data() {
            return {}
        },
        computed: {
            ...mapGetters(['hasPermission', 'auth', 'userInfo', 'loading'])
        },
        watch: {
            hasPermission: function(val) {
                if (val) return
                this.$refs.modal.show()
            }
        },
        mounted() {
        },
        created() {
            // this.getUserInfo()
        },
        methods: {
            ...mapActions(['getUserInfo'])
        }
    }
</script>
<style lang="scss">
    html, body {
        height: 100%;
        min-width: 1280px;
        font-size: 14px;
    }

    ::-webkit-scrollbar-thumb:window-inactive {
        background: rgba(255, 0, 0, .4);
    }

    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: rgba(255, 255, 255, .07);
    }

    ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 10px;
        border-radius: 10px;
        background: rgba(11, 54, 106, .52);
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .5);
    }

    ::-webkit-scrollbar-thumb:window-inactive {
        background-color: rgba(255, 255, 255, .07);
    }
</style>
