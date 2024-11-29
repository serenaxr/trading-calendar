<template>
    <div class="calendar-list">
        <div class="header">
            <div style="float: left;">
                <bk-button
                    theme="primary"
                    class="mr10"
                    :disabled="$hasRoleCls('men_create').disabled"
                    @click.stop="toAdd">
                    新增
                </bk-button>
            </div>
            <div style="float: right;">
                <bk-input
                    v-model.trim="keyWork"
                    style="width: 300px;"
                    clearable
                    placeholder="请输入日历名称搜索"
                    :right-icon="'bk-icon icon-search'"
                    @change="search">
                </bk-input>
            </div>
        </div>
        <div style="clear: both;"></div>
        <div class="content">
            <table-list ref="table"
                :columns="columns"
                :config="tableConfig"
                loading>
                <template #work_time="{ row }">
                    <div
                        class="work-time-item"
                        v-for="(item, index) in row.work_time"
                        :key="index"
                        :style="{ width: item.work_time ? '150px' : ( item.enable ? '80px' : 'auto' ) }">
                        {{ item.join('-') }}
                    </div>
                </template>
                <template #op="{ row }">
                    <bk-button
                        class="mr10"
                        theme="primary"
                        text
                        :disabled="$hasRoleCls('men_edit', 'text').disabled"
                        @click="edit(row)">
                        工作时间配置
                    </bk-button>
                    <bk-button
                        class="mr10"
                        theme="primary"
                        text
                        :disabled="$hasRoleCls('men_list', 'text').disabled"
                        @click="goDetails(row)">
                        工作日配置
                    </bk-button>
                    <bk-button
                        class="mr10"
                        theme="primary"
                        text
                        :disabled="$hasRoleCls('men_upload', 'text').disabled"
                        @click="onImport(row)">
                        日历导入
                    </bk-button>
                    <bk-button
                        class="mr10"
                        theme="primary"
                        text
                        :disabled="isSynchronizing[row.id]"
                        :icon="isSynchronizing[row.id] ? 'loading' : null"
                        @click="synchronize(row)">
                        同步
                    </bk-button>
                    <bk-popconfirm
                        v-if="$hasPermission('men_del')"
                        theme="error"
                        trigger="click"
                        content="确定要删除该日历吗？"
                        @confirm="remove(row)">
                        <bk-button
                            :disabled="isSynchronizing[row.id]"
                            theme="danger"
                            text>
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
        <import-excel :config="importConfig" :id="curRow.id"></import-excel>
        <add-dialog
            :visible.sync="visible"
            :id="curRow.id"
            :data="curRow"
            @add="add"
            @update="update">
        </add-dialog>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'
    import AddDialog from './components/form/AddDialog.vue'
    import TableList from '../strategy/components/TableList.vue'
    import ImportExcel from './components/import/index.vue'
    export default {
        name: 'calendar',
        components: {
            AddDialog,
            TableList,
            ImportExcel
        },
        data() {
            return {
                syncedRows: [],
                rows: [],
                isSynchronizing: {},
                visible: false,
                curRow: {},
                synctime: 60000,
                keyWork: '',
                lastSyncTime: null,
                remainingTime: 0,
                deleteTitles: [],
                deleteTimestamps: {},
                columns: [
                    {
                        label: '日历名称',
                        prop: 'title'
                    },
                    {
                        label: '状态',
                        prop: 'enable',
                        filter: val => val ? '启用' : '不启用'
                    },
                    {
                        label: '统一工作时间',
                        prop: 'work_time',
                        showOverflowTooltip: true,
                        isSlot: true,
                        minWidth: 150
                    },
                    {
                        label: '创建人',
                        prop: 'creator'
                    },
                    {
                        label: '更新时间',
                        prop: 'update_time',
                        minWidth: 170
                    },
                    {
                        label: '操作',
                        prop: 'op',
                        width: 380,
                        isSlot: true
                    }
                ],
                tableConfig: {
                    method: this.$api.menology.find
                    // format: async(res, pagination, params) => {
                    //     const index = res.findIndex(item => item.title === '交易日历')
                    //     if (index <= -1 && !params.keyword) {
                    //         return pagination.current !== 1 ? res : [...await this.getCalendar(), ...res]
                    //     }
                    //     res.unshift(...res.splice(index, 1))
                    //     return res
                    // }
                },
                importConfig: {
                    isShow: false
                },
                timer: null
            }
        },
        mounted() {
            this.$refs.table.getData()
            this.restoreState()
        },
        methods: {
            ...mapActions(['setPermission']),
            toAdd() {
                this.curRow = {}
                this.visible = true
            },
            edit(row) {
                this.curRow = row
                this.visible = true
            },
            add() {
                this.keyWork = ''
                this.$refs.table && this.$refs.table.reset()
            },
            update() {
                this.search()
            },
            async synchronize(row) {
                this.$set(this.isSynchronizing, row.id, true)
                if (this.deleteTitles.includes(row.title)) {
                    this.removeTitleAfterTimeout(row.title)
                    if (!this.deleteTitles.includes(row.title)) {
                        console.log(`${row.title} 不在删除数组中，进同步`)
                        await this.executeSync(row)
                    } else {
                        console.log(`${row.title} 在删除数组中`)
                        this.startTimer(row, this.synctime, this.executeSync.bind(this, row))
                    }
                } else {
                    console.log(`${row.title} 不在删除数组中，进同步`)
                    try {
                        await this.executeSync(row)
                    } catch (error) {
                        console.error(`${row.title} 同步时出现错误:`, error)
                    }
                }
            },
            async executeSync(row) {
                const now = Date.now()
                const { id, title } = row
                console.log(`${title} 判断多次同步`)
                const syncedRow = this.syncedRows.find(sr => sr.id === id)
                row.lastSyncTime = syncedRow ? syncedRow.lastSyncTime : null
                if (row.lastSyncTime && (now - row.lastSyncTime < this.synctime)) {
                    console.log(`${title} 多次同步，先等一会再同步`)
                    const remainingTime = this.synctime - (now - row.lastSyncTime)
                    await this.startTimer(row, remainingTime, () => this.handleSync(row))
                } else {
                    console.log(`${title} 不是多次同步，进入同步`)
                    await this.handleSync(row)
                    try {
                        await this.handleSync(row)
                    } catch (error) {
                        console.error(`${title} 同步时出现错误:`, error)
                    }
                }
            },
            async handleSync(row) {
                console.log(row.title + '正式进入同步方法了')
                if (this.$isDestroyed) return
                try {
                    const { result } = await this.$api.menology.sync({ menology_id: row.id })
                    const message = result ? `日历 ${row.title} 同步成功` : `日历 ${row.title} 同步失败`
                    const theme = result ? 'success' : 'error'
                    this.$bkMessage({ message, theme })
                    if (result) {
                        const now = Date.now()
                        row.lastSyncTime = now
                        const syncedRow = { id: row.id, lastSyncTime: row.lastSyncTime }
                        const existingSyncedRow = this.syncedRows.find(item => item.id === row.id)
                        existingSyncedRow ? existingSyncedRow.lastSyncTime = row.lastSyncTime
                        : this.syncedRows.push(syncedRow)
                        this.removeExpiredRows()
                        this.saveState()
                        await this.getCalendar()
                    }
                    return true
                } catch (error) {
                    this.$bkMessage({
                        message: `日历 ${row.title} 请求失败，错误信息：${error.message}`,
                        theme: 'error'
                    })
                    return false
                } finally {
                    console.log(`${row.title} 已经完成同步方法了`)
                    this.$set(this.isSynchronizing, row.id, false)
                }
            },
            search() {
                if (this.timer !== null) {
                    clearTimeout(this.timer)
                }
                this.timer = setTimeout(() => {
                    this.$refs.table && this.$refs.table.search({keyword: this.keyWork})
                }, 500)
            },
            goDetails(row) {
                this.$router.push({
                    path: `/details/${row.id}`
                })
            },
            onImport(row) {
                this.curRow = row
                this.importConfig.isShow = true
            },
            async remove(row) {
                try {
                    const { result, message } = await this.$api.menology.remove({ menology_id: row.id })
                    if (!result) {
                        this.$bkMessage({
                            message: message,
                            theme: 'error'
                        })
                        return false
                    }
                    const now = Date.now()
                    this.deleteTitles.push(row.title)
                    this.deleteTimestamps[row.title] = now
                    this.saveState()
                    console.log(this.deleteTitles)
                    this.$bkMessage({
                        message: `日历 ${row.title} 删除成功`,
                        theme: 'success'
                    })
                    this.$refs.table.remove()
                    this.startTimer(row, this.synctime, () => this.removeTitleAfterTimeout(row.title))
                    return true
                } catch (error) {
                    console.error(`删除日历 ${row.title} 时发生错误:`, error)
                    return false
                }
            },
            removeTitleAfterTimeout(title) {
                const now = Date.now()
                const deleteTime = this.deleteTimestamps[title]
                if (this.deleteTitles.includes(title) && deleteTime && (now - deleteTime > this.synctime)) {
                    const index = this.deleteTitles.indexOf(title)
                    if (index !== -1) {
                        this.deleteTitles.splice(index, 1)
                        delete this.deleteTimestamps[title]
                        this.saveState()
                        console.log(`${title} 已超时，已从删除数组中移除`)
                    }
                }
            },
            removeExpiredRows() {
                const now = Date.now()
                const expiredIds = []
                this.syncedRows = this.syncedRows.filter(item => {
                    if (item.lastSyncTime && (now - item.lastSyncTime > this.synctime)) {
                        expiredIds.push(item.id)
                        console.log(`ID ${item.id} 已超时，已从 syncedRows 中移除`)
                        return false
                    }
                return true
                })
                if (expiredIds.length > 0) {
                    this.saveState()
                }
            },
            startTimer(row, duration, callback) {
                const endTime = Date.now() + duration
                const timerId = setInterval(() => {
                    const remainingTime = Math.max(0, endTime - new Date().getTime())
                    if (remainingTime <= 0) {
                        this.removeTitleAfterTimeout(row.title)
                        clearInterval(timerId)
                        callback(row)
                    }
                }, 1000)
                console.log(row.title + ' 开始计时器，剩余时间：' + duration / 1000 + '秒')
            },
            saveState() {
                const stateToSave = {
                    deleteTitles: this.deleteTitles,
                    deleteTimestamps: this.deleteTimestamps,
                    syncedRows: this.syncedRows
                }
                console.log(stateToSave)
                localStorage.setItem('calendarState', JSON.stringify(stateToSave))
            },
            restoreState() {
                const savedState = localStorage.getItem('calendarState')
                if (savedState) {
                    console.log(savedState)
                    const { deleteTitles, deleteTimestamps, syncedRows } = JSON.parse(savedState)
                    this.deleteTitles = deleteTitles || []
                    this.deleteTimestamps = deleteTimestamps || {}
                    this.syncedRows = syncedRows || []
                }
            },
            async getCalendar() {
                try {
                    const params = {
                        keyword: '交易日历'
                    }
                    const { result, data } = await this.$api.menology.find(params)
                    if (result) {
                        return data
                    }
                    return []
                } catch (error) {
                    return []
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .calendar-list {
        padding: 20px 24px 20px 24px;
        overflow-x: hidden;
        .line {
            width: 100%;
            height: 1px;
            background-color: #DCDEE5;
            margin-bottom: 15px;
        }
        .content {
            margin-top: 20px;
        }
        .work-time-item {
            white-space: nowrap;
        }
    }
</style>
