<template>
    <div class="log-container">
        <table-list
            ref="table"
            :columns="columns"
            :config="tableConfig"
            loading>
        </table-list>
    </div>
</template>

<script>
    import TableList from './components/TableList.vue'
    export default {
        name: 'logs',
        components: { TableList },
        data() {
            return {
                columns: [
                    {
                        label: '策略名称',
                        prop: 'strategy_name'
                    },
                    {
                        label: '状态',
                        prop: 'operation_value'
                    },
                    {
                        label: '启停时间',
                        prop: 'create_time'
                    }
                ],
                tableConfig: {
                    method: this.$api.strategy.getLog,
                    params: { strategy_name: '' }
                }
            }
        },
        mounted() {
            const model = sessionStorage.getItem('model') || ''
            if (model === 'kmc_saas') {
                this.columns.splice(0, 1, ...[
                    {
                        label: '监控模板',
                        prop: 'strategy_name'
                    }, {
                        label: '监控项',
                        prop: 'monitoring'
                    }
                ])
            }
            this.tableConfig.params.strategy_name = this.$route.query.name
            this.$refs.table.getData()
        }
    }
</script>

<style lang="scss" scoped>
    .log-container {
        padding: 20px 24px;
    }
</style>
