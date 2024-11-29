<template>
    <bk-dialog
        class="add-dialog"
        :value="visible"
        width="500"
        :title="title + '策略'"
        theme="primary"
        :loading="loading"
        header-position="left"
        footer-position="center"
        :auto-close="false"
        @confirm="confirm"
        @cancel="cancel">
        <bk-form
            v-if="visible"
            :model="form"
            :label-width="100"
            :rules="rules"
            ref="form"
            v-bkloading="{ isLoading: calcLoading }">
            <bk-form-item
                label="策略名称"
                property="name"
                required
                error-display-type="normal">
                <bk-select
                    ref="select"
                    v-model="form.name"
                    searchable
                    :show-empty="false"
                    :loading="treeLoading"
                    :remote-method="remote"
                    @tab-remove="handleValuesChange"
                    @clear="handleClear">
                    <bk-big-tree
                        v-if="!treeLoading"
                        class="tree-select"
                        ref="tree"
                        :multiple="isMonitorcenter"
                        :data="treeData"
                        :show-checkbox="showCheckbox"
                        :options="{ folderKey: 'folder' }"
                        :before-check="beforeCheck"
                        :default-checked-nodes="defaultCheckedNodes"
                        :default-expanded-nodes="defaultExpandeddNodes"
                        :lazy-method="lazyMethod"
                        :lazy-disabled="lazyDisabled"
                        @check-change="handleCheckChange">
                    </bk-big-tree>
                    <div
                        v-else
                        style="width: 100%; height: 100px;"
                        v-bkloading="{ isLoading: treeLoading, title: '拼命加载中...' }">
                    </div>
                </bk-select>
            </bk-form-item>
            <bk-form-item label="状态" property="status" required>
                <bk-radio-group v-model="form.status">
                    <bk-radio :value="1">生效</bk-radio>
                    <bk-radio :value="0">不生效</bk-radio>
                </bk-radio-group>
            </bk-form-item>
            <bk-form-item
                label="关联日历"
                property="menology_id"
                required
                error-display-type="normal">
                <bk-select
                    v-model="form.menology_id"
                    searchable
                    auto-scroll
                    :remote-method="remoteCalendar"
                    enable-scroll-load
                    :scroll-loading="{ isLoading: scrollLoading }"
                    @scroll-end="scrollCalendar">
                    <bk-option
                        v-for="item in list"
                        :key="item.id"
                        :id="item.id"
                        :name="item.title">
                    </bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item
                label="邮件接收人"
                property="extras"
                required
                error-display-type="normal">
                <bk-select
                    v-model="form.extras"
                    multiple
                    display-tag
                    searchable
                    :loading="userLoading"
                    :remote-method="remoteUser"
                    enable-scroll-load
                    :scroll-loading="{ isLoading: scrollLoading }"
                    @scroll-end="scrollEnd">
                    <bk-option
                        v-for="item in userList"
                        :key="item.id"
                        :id="item.username"
                        :name="item.username"></bk-option>
                </bk-select>
            </bk-form-item>
        </bk-form>
    </bk-dialog>
</template>

<script>
    const TYPE_MAP = {
        bk_job: {
            id: 'bk_biz_id',
            name: 'bk_biz_name',
            cid: 'task_id',
            cname: 'task_name',
            children: 'task_data',
            model: 'bk_cmdb'
        },
        kmc_saas: {
            id: 'template_id',
            name: 'template_name',
            cid: 'strategy_item_id',
            cname: 'name',
            children: 'strategy_item_list',
            multiple: true
        },
        bk_sops: {
            id: 'bk_biz_id',
            name: 'bk_biz_name',
            cid: 'task_id',
            cname: 'task_name',
            children: 'task_data',
            model: 'bk_cmdb'
        },
        kac_saas: {
            id: 'id',
            name: 'name',
            cid: 'task_id',
            cname: 'task_name',
            children: 'task_data'
        }
    }
    export default {
        name: 'add-form',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            model: {
                type: String,
                default: 'kmc_saas'
            },
            data: {
                type: Object,
                default: () => ({})
            }
            // isCenter: Boolean
        },
        data() {
            return {
                loading: false,
                isLoading: false,
                treeLoading: false,
                treeData: [],
                defaultCheckedNodes: [],
                defaultExpandeddNodes: [],
                form: {
                    ids: '',
                    name: '',
                    status: 1,
                    menology_id: '',
                    bk_biz_id: '',
                    task_name: '',
                    task_id: '',
                    extras: []
                },
                rules: {
                    name: [{ required: true, message: '请选择策略', trigger: 'blur' }],
                    status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
                    menology_id: [{ required: true, message: '请选择关联日历', trigger: 'blur' }],
                    extras: [{ required: true, validator: val => !!val.length, message: '请选择邮件接收人', trigger: 'blur' }]
                },
                list: [],
                pagination: {
                    limit: 10,
                    current: 1,
                    count: 1
                },
                optionList: [],
                cmdbs: [],
                userList: [],
                params: {
                    limit: 1,
                    current: 20,
                    alluser: 1
                },
                count: 0,
                timer: null,
                scrollLoading: false,
                userLoading: false,
                selectedUsers: []
            }
        },
        computed: {
            calcLoading() {
                return this.isLoading || this.userLoading
            },
            checkedNodes() {
                return (this.$refs.tree && this.$refs.tree.checkedNodes) || []
            },
            title() {
                return this.data.id ? '编辑' : '新增'
            },
            curModel() {
                return TYPE_MAP[this.model]
            },
            isMonitorcenter() {
                return this.model === 'kmc_saas'
            }
        },
        watch: {
            visible: function(val) {
                if (!val || this.isMonitorcenter) return
                this.init()
                this.userList = []
                this.list = []
                this.treeData = []
                this.getCmdb().then(res => {
                    this.treeData = res
                    this.loading = false
                    this.$nextTick(() => {
                        this.initDefault()
                    })
                })
                this.setSelectCalender().then(res => {
                    this.getData(true, res)
                })
                this.setSelectedUser()
            }
        },
        methods: {
            flatTree() {
                const flat = (data) => {
                    return data.reduce((prev, next) => {
                        const nextArr = (next.children && next.children.length) ? [next, ...flat(next.children)] : [next]
                        return [...prev, ...nextArr]
                    }, [])
                }
                this.optionList = flat(this.treeData)
            },
            init() {
                this.defaultCheckedNodes = []
                this.defaultExpandeddNodes = []
                if (this.data.name) {
                    const { id, status, extras } = this.data
                    const bkBizID = Number(this.data.bk_biz_id)
                    this.form = this.$Copy({
                        ...this.data,
                        bk_biz_id: bkBizID,
                        status: Number(status)
                    })

                    this.form.strategy_id = id
                    this.form.extras = extras || []
                    this.defaultExpandeddNodes = [bkBizID]
                    this.initOptions()
                } else {
                    this.reset()
                }
            },
            initOptions() {
                if (!this.$refs.select) return
                this.$nextTick(() => {
                    this.$refs.select.selectedOptions = this.$Copy(this.form)
                })
            },
            remoteCalendar(keyword) {
                if (this.timer !== null) clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                    keyword ? this.$set(this.pagination, 'keyword', keyword) : this.$delete(this.pagination, 'keyword')
                    this.pagination.current = 1
                    this.list = []
                    this.scrollLoading = true
                    this.getData(false)
                }, 300)
            },
            scrollCalendar() {
                const { current, limit, count } = this.pagination
                if (current * limit >= count) return
                this.pagination.current++
                this.scrollLoading = true
                this.getData(false)
            },
            async setSelectCalender() {
                try {
                    const { result, data } = await this.$api.menology.find({menology_id: this.form.menology_id})
                    if (result) {
                        return data
                    }
                    return []
                } catch (error) {
                    return []
                }
            },
            async getData(loading = true, selectd) {
                this.isLoading = loading
                const res = await this.$api.menology.find(this.pagination).finally(() => {
                    this.isLoading = false
                    this.scrollLoading = false
                })
                const { result, data, count, num } = res
                if (result) {
                    if (selectd) {
                        this.list.push(...[...data, ...selectd])
                    } else {
                        this.list.push(...data)
                    }
                    this.list = this.unique(this.list)
                    this.pagination.count = num || count
                }
            },
            async getTimeTask(params = {}) {
                try {
                    const { result, data } = await this.$api.strategy.getTimeTask({ ...params, strategy_model: this.model })
                    return (result && data) || []
                } catch (error) {
                    return []
                }
            },
            // 获取
            async getCmdb(params = {}) {
                if (this.cmdbs.length && this.model !== 'kmc_saas') return this.$Copy(this.cmdbs)
                this.treeLoading = true
                const res = await this.$api.strategy.getTimeTask({ strategy_model: this.curModel.model || this.model }).finally(() => {
                    this.treeLoading = false
                })
                const { result, data } = res
                let tree = []
                if (result) {
                    const { id, name } = this.curModel
                    tree = this.mapTaskData({ data, id, name })
                    this.cmdbs = this.$Copy(tree)
                }
                this.initOptions()
                return tree
            },
            mapTaskData({ data, id, name }) {
                const children = this.curModel.children
                return data.map((item, index) => ({
                    ...item,
                    id: item[id],
                    name: item[name],
                    level: 0,
                    index: index,
                    chain: String(index),
                    folder: true,
                    disabled: !(item[children] && item[children].length),
                    children: item[children]
                    ? this.formatChild(item[children], {
                        ...item,
                        level: 0,
                        chain: String(index),
                        id: item[id],
                        name: item[name]
                    }) : []
                }))
            },
            remoteUser(key) {
                this.userList = []
                this.params.limit = 1
                if (key) {
                    this.$set(this.params, 'keyword', key)
                    this.$delete(this.params, 'alluser')
                } else {
                    this.$set(this.params, 'alluser', 1)
                    this.$delete(this.params, 'keyword')
                }
                this.getUsers()
            },
            scrollEnd() {
                if (this.params.current * this.params.limit >= this.count) return
                this.params.limit++
                return this.getUsers()
            },
            setSelectedUser() {
                this.userLoading = true
                const list = this.form.extras.map(async(item) => {
                    try {
                        const { result, data } = await this.$api.user.userInfo({ limit: 1, current: 10, keyword: item }).finally(() => {
                            this.userLoading = false
                        })
                        if (result) {
                            return data.filter(v => v.username === item)
                        }
                        return []
                    } catch (error) {
                        return []
                    }
                })
                return Promise.all(list).then(res => {
                    this.getUsers(this.flatten(res))
                }).finally(() => {
                    this.userLoading = false
                })
            },
            // 获取人员
            async getUsers(selectd) {
                this.scrollLoading = true
                try {
                    const { result, data, num, count } = await this.$api.user.userInfo(this.params)
                    this.scrollLoading = false
                    if (result) {
                        if (selectd) {
                            this.userList.push(...[...data, ...selectd])
                        } else {
                            this.userList.push(...data)
                        }
                        this.userList = this.unique(this.userList)
                        this.count = num || count
                        return this.userList
                    } else {
                        return []
                    }
                } catch (error) {
                    this.scrollLoading = false
                    return []
                }
            },
            // 编辑设置默认选中
            async initDefault() {
                const { bk_biz_id: bkBizId, task_id: taskId, task_name: taskName } = this.form
                if (!bkBizId) return
                const parent = this.treeData.find(item => item.id === +bkBizId)
                if (!parent) return
                this.treeLoading = true
                parent.isFeatch = true
                const data = await this.getTimeTask({biz_id: bkBizId}).finally(() => {
                    this.treeLoading = false
                })
                data.unshift({ task_id: taskId, task_name: taskName })
                parent.children = this.formatChild(data, parent)
                this.$nextTick(() => {
                    this.$refs.tree && this.$refs.tree.setData(this.treeData)
                    this.initOptions()
                    const id = bkBizId + '-' + taskId
                    // 设置默认选中
                    this.$refs.tree && this.$refs.tree.setChecked(id, { emitEvent: false, checked: true })
                })
            },
            mapData(data, chain) {
                const index = chain.shift()
                return chain.length ? this.mapData(data[index], chain) : data[index]
            },
            formatChild(data, parent) {
                return data.map((item, index) => ({
                    ...item,
                    index,
                    level: parent.level + 1,
                    chain: parent.chain + '-' + index,
                    id: parent.id + '-' + item[this.curModel.cid],
                    name: item[this.curModel.cname],
                    folder: false,
                    children: []
                }))
            },
            remote(keyword) {
                this.$refs.tree && this.$refs.tree.filter(keyword)
            },
            beforeCheck(node) {
                if (node.level > 0) {
                    this.$refs.tree.removeChecked({ emitEvent: false })
                    return true
                }
                this.$refs.tree.removeChecked({ emitEvent: false })
                return false
            },
            showCheckbox(data) {
                return !!data.level || this.isMonitorcenter
            },
            handleCheckChange(id, node) {
                if (node.checked) {
                    this.form.name = this.getName(node, false)
                    this.form.bk_biz_id = node.parent ? node.parent.data.bk_biz_id : (node.data.bk_biz_id || null)
                    this.form.task_id = node.data.task_id || null
                    this.form.task_name = node.data.task_name || null
                    this.initOptions()
                } else {
                    this.form.name = ''
                    this.form.bk_biz_id = ''
                    this.form.task_id = ''
                    this.form.task_name = ''
                    this.$refs.select.selectedOptions = undefined
                }
            },
            getName(node, indeterminate = true) {
                return node.parent ? this.getName(node.parent) + '/' + node.data.name : node.data.name
            },
            handleValuesChange(options) {
                this.$refs.tree && this.$refs.tree.setChecked(options.id, { emitEvent: true, checked: false })
            },
            async lazyMethod(node) {
                const chain = node.data.chain.split('-')
                const cur = this.mapData(this.treeData, chain)
                if (this.model === 'kmc_saas' || !cur || cur.isFeatch) return { leaf: [], data: [] }
                const data = await this.getTimeTask({biz_id: node.id})
                // const data = this.isCenter ? await this.getTask(node.data.id) : await this.getTimeTask({biz_id: node.id})
                cur.isFeatch = true
                if (!data || !data.length) return
                cur.children = this.formatChild(data, cur)
                return { leaf: [], data: cur.children }
            },
            lazyDisabled(node) {
                return node.level > 0
            },
            handleClear() {
                this.$refs.tree && this.$refs.tree.removeChecked({ emitEvent: false })
            },
            validateField(field) {
                this.$refs.form.validateField(field)
            },
            clearFieldError(field) {
                this.$refs.form.clearFieldError(field)
            },
            confirm() {
                this.$refs.form.validate().then(validator => {
                    this.form.strategy_saas = this.model
                    this.submit()
                }, validator => {
                    // 显示第一个出错位置
                    // console.log(`${validator.field}：${validator.content}`)
                })
            },
            async submit() {
                const params = this.$Copy(this.form)
                const type = params.id ? 'update' : 'add'
                if (this.isMonitorcenter) { // 去除已删除监控项
                    const curSelect = this.treeData.find(item => item.id === params.bk_biz_id)
                    const children = (curSelect && curSelect.children) || []
                    // const cids = children.map(item => item[this.curModel.cid])
                    // eslint-disable-next-line eqeqeq
                    // params.task_id = params.task_id.filter(item => cids.some(value => value == item))
                    params.task_name = []
                    const ids = []
                    children.forEach(item => {
                        if (params.task_id.includes(item[this.curModel.cid])) {
                            ids.push(item[this.curModel.cid])
                            params.task_name.push(item.name)
                        }
                    })
                }
                if (Array.isArray(params.task_name)) params.task_name = params.task_name.join(',')
                this.loading = true
                const { result } = await this.$api.strategy[type](params).finally(() => {
                    params.task_name = params.task_name.split(',')
                    this.loading = false
                })
                if (result) {
                    this.$emit('confirm', {type, title: this.title, data: params})
                    this.colse()
                }
            },
            reset() {
                this.form = {
                    name: '',
                    status: 1,
                    menology_id: '',
                    bk_biz_id: '',
                    task_name: '',
                    task_id: '',
                    extras: []
                }
                this.params.limit = 1
                this.userList = []
                this.$nextTick(() => {
                    this.$refs.form && this.$refs.form.clearError()
                })
            },
            cancel() {
                this.colse()
            },
            colse() {
                this.loading = false
                this.reset()
                this.$emit('update:visible', false)
            },
            flatten(arr) {
                return arr.reduce((prev, cur) => {
                    return prev.concat(Array.isArray(cur) ? this.flatten(cur) : cur)
                }, [])
            },
            unique(arr) {
                const obj = {}
                return arr.reduce((prev, next) => {
                    // eslint-disable-next-line no-unused-expressions
                    obj[next.id] ? '' : (obj[next.id] = true && prev.push(next))
                    return prev
                }, [])
            }
        }
    }
</script>

<style lang="scss" scoped>
.add-dialog {
    /deep/ {
        .bk-form-radio {
            & + .bk-form-radio {
                margin-left: 30px;
            }
        }
        .bk-form-input, .bk-date-picker-editor {
            width: 260px;
        }
        .bk-button-text {
            line-height: 1;
        }
    }
    .time-item {
        display: flex;
        align-items: center;
        & + .time-item {
            margin-top: 10px;
        }
        /deep/ .bk-form-content {
            margin-left: 0 !important;
        }
    }
}
</style>
