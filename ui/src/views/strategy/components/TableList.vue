<template>
    <div class="table-list" v-bkloading="{ isLoading: loadingCalc }">
        <bk-table
            :data="tableData"
            :pagination="pagination"
            :max-height="tableHeight"
            @page-change="pageChange"
            @page-limit-change="sizeChange"
            v-bind="$attrs"
            v-on="$listeners">
            <template v-for="item in columns">
                <bk-table-column
                    v-bind="item"
                    :key="item.label"
                    v-if="item.isSlot || item.type === 'expand'">
                    <template slot-scope="scope">
                        <slot :name="item.prop || item.type" :row="scope.row"></slot>
                    </template>
                </bk-table-column>
                <bk-table-column v-else-if="item.filter" :key="item.prop" v-bind="[item]">
                    <template slot-scope="{ row }">
                        {{ item.filter(row[item.prop]) }}
                    </template>
                </bk-table-column>
                <bk-table-column
                    v-else
                    v-bind="item"
                    :key="item.prop">
                </bk-table-column>
            </template>
        </bk-table>
    </div>
</template>

<script>
    export default {
        props: {
            columns: {
                type: Array,
                default: () => []
            },
            loading: Boolean,
            config: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                tableData: [],
                isLoading: false,
                pagination: {
                    current: 1,
                    count: 1,
                    limit: 10
                },
                params: {}
            }
        },
        computed: {
            loadingCalc() {
                return this.loading && this.isLoading
            },
            tableHeight() {
                const HEADET = 52
                const PADDING = 2 * 20
                const TABLE_HEADER = 52
                const sum = HEADET + PADDING + TABLE_HEADER
                return `calc(100vh - ${sum}px)`
            }
        },
        methods: {
            async getData(parm) {
                this.isLoading = true
                try {
                    this.params = parm || {}
                    const { method, format, params = {} } = this.config
                    const params2 = { ...this.pagination, ...params, ...this.params }
                    Object.keys(params2).forEach(key => { // 删除空值
                        if (['', null, undefined].includes(params2[key])) delete params2[key]
                    })
                    const res = await method(params2)
                    const { result, data, count, num } = res
                    if (result) {
                        this.pagination.count = num || count
                        this.pagination.count = num || count
                        this.tableData = (format && await format(data, this.pagination, { ...params, ...this.params })) || data
                    }
                    this.isLoading = false
                } catch (error) {
                    this.isLoading = false
                }
            },
            remove() {
                if (this.tableData.lenhgth === 1 && this.pagination.current > 1) {
                    this.pagination.current = this.pagination.current - 1
                }
                this.getData(this.params)
            },
            pageChange(page) {
                this.pagination.current = page
                this.getData(this.params)
            },
            sizeChange(limit) {
                this.pagination.current = 1
                this.pagination.limit = limit
                this.getData(this.params)
            },
            search(params) {
                this.pagination.current = 1
                this.getData(params)
            },
            reset() {
                this.params = {}
                this.pagination.current = 1
                this.pagination.limit = 10
                this.getData()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .table-list {
        background-color: #fff;
    }
</style>
