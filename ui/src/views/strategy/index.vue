<template>
    <div class="monitor-container">
        <div class="header">
            <div style="float: left;">
                <bk-button
                    theme="primary"
                    class="mr10"
                    :disabled="$hasRoleCls('str_add').disabled"
                    @click="toAdd(true)">
                    新增
                </bk-button>
            </div>
            <div style="float: right;">
                <bk-input
                    v-model.trim="keyword"
                    style="width: 300px;"
                    clearable
                    placeholder="请输入策略名称搜索"
                    right-icon="bk-icon icon-search"
                    @change="search">
                </bk-input>
            </div>
        </div>
        <div style="clear: both;"></div>
        <div class="content">
            <table-list
                ref="table"
                :columns="columns"
                loading
                :config="tableConfig">
                <template #op="{ row }">
                    <bk-button
                        class="mr10"
                        text
                        @click="goLog(row)">
                        执行日志</bk-button>
                    <bk-button
                        class="mr10"
                        text
                        :disabled="$hasRoleCls('str_edit', 'text').disabled"
                        @click="edit(row)">
                        编辑</bk-button>
                    <bk-popconfirm
                        v-if="$hasPermission('str_del')"
                        theme="error"
                        trigger="click"
                        content="确定要删除该条策略吗？"
                        @confirm="remove(row)">
                        <bk-button
                            theme="danger"
                            text
                            :loading="row._loading">
                            删除
                        </bk-button>
                    </bk-popconfirm>
                    <bk-button
                        v-else
                        disabled
                        theme="danger"
                        text
                        @click="remove(row)">
                        删除
                    </bk-button>
                </template>
            </table-list>
        </div>
        <add-dialog
            :visible.sync="visible"
            :data="curItem"
            :model="strategySaas"
            @confirm="confirm">
        </add-dialog>
        <add-automation
            :visible.sync="visibleAutomation"
            :data="curItem"
            @close="close"
            @confirm="confirm">
        </add-automation>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'
    import AddDialog from './components/AddDialog.vue'
    import AddAutomation from './components/AddAutomation.vue'
    import TableList from './components/TableList.vue'
    export default {
        name: 'strategy',
        components: {
            AddDialog,
            TableList,
            AddAutomation
        },
        data() {
            return {
                strategySaas: 'bk_job',
                keyword: '',
                isLoading: false,
                visible: false,
                visibleAutomation: false,
                curItem: {},
                columns: [
                    {
                        label: '策略名称',
                        prop: 'name'
                    },
                    {
                        label: '状态',
                        prop: 'status',
                        filter: status => status ? '生效' : '不生效'
                    },
                    {
                        label: '关联日历',
                        prop: 'menology_name'
                    },
                    {
                        label: '操作',
                        prop: 'op',
                        isSlot: true
                    }
                ],
                tableConfig: {
                    method: this.$api.strategy.find,
                    params: { strategy_saas: this.strategySaas }
                },
                timer: null
            }
        },
        mounted() {
            this.tableConfig.params.strategy_saas = this.strategySaas
            this.$refs.table.getData()
        },
        methods: {
            ...mapActions(['setPermission']),
            toAdd() {
                this.curItem = {}
                if (this.strategySaas === 'auto-ops_saas') {
                    this.visibleAutomation = true
                } else {
                    this.visible = true
                }
            },
            close() {
                this.visibleAutomation = false
            },
            edit(item) {
                this.curItem = item
                if (this.strategySaas === 'auto-ops_saas') {
                    this.visibleAutomation = true
                } else {
                    this.visible = true
                }
            },
            async remove(item) {
                try {
                    const { result, message } = await this.$api.strategy.remove({strategy_id: item.id})
                    if (result) {
                        this.$bkMessage({
                            message: '删除成功',
                            theme: 'success'
                        })
                        this.$refs.table.remove()
                    } else {
                        item._loading = false
                        this.$bkMessage({
                            message: message,
                            theme: 'error'
                        })
                    }
                    return true
                } catch (error) {
                    return false
                }
            },
            confirm({type, title}) {
                if (type === 'add') {
                    this.$refs.table.reset()
                } else {
                    this.$refs.table.getData()
                }
                this.$bkMessage({
                    theme: 'success',
                    message: title + '成功'
                })
            },
            search() {
                if (this.timer !== null) {
                    clearTimeout(this.timer)
                }
                this.timer = setTimeout(() => {
                    this.$refs.table.search({keyword: this.keyword})
                }, 500)
            },
            goLog(item) {
                sessionStorage.setItem('model', this.strategySaas)
                this.$router.push({
                    name: 'logs',
                    query: {
                        name: item.name
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .monitor-container {
        padding: 20px 24px 20px 24px;
        .line {
            width: 100%;
            height: 1px;
            background-color: #DCDEE5;
            margin-bottom: 15px;
        }

        .header {
            font-size: 0;
        }

        .content {
            margin-top: 20px;
        }
    }
</style>
