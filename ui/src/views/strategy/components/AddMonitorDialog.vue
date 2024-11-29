<script>
    import AddDialog from './AddDialog.vue'
    export default {
        name: 'add-monitor-dialog',
        extends: AddDialog,
        data() {
            return {
                form: {
                    ids: '',
                    name: '',
                    status: 1,
                    menology_id: '',
                    bk_biz_id: '',
                    task_name: [],
                    task_id: [],
                    extras: []
                }
            }
        },
        watch: {
            visible: function(val) {
                if (!val) return
                this.init()
                this.userList = []
                this.list = []
                this.treeData = []
                Promise.all([this.getCmdb(), this.getSelectedTask()])
                    .then(res => {
                        const [treeData, selections] = res
                        this.treeData = treeData
                        this.$nextTick(() => {
                            this.initDefault(selections)
                        })
                    }).finally(() => {
                        this.treeLoading = false
                    })
                this.setSelectCalender().then(res => {
                    this.getData(true, res)
                })
                this.setSelectedUser()
            }
        },
        methods: {
            async initDefault(data) {
                if (!this.form.bk_biz_id) return
                try {
                    this.form.task_id = this.data.task_id.split(',').map(item => Number(item))
                    this.form.task_name = this.data.task_name.split(',')
                } catch (error) {
                    console.error(error)
                }
                this.form.task_id.forEach(item => {
                    this.defaultCheckedNodes.push(`${this.form.bk_biz_id}-${item}`)
                })
                const parent = this.treeData.find(item => item.id === +this.form.bk_biz_id)
                if (!parent) return []
                parent.isFeatch = true
                parent.children = this.formatChild(data, parent)
                this.$nextTick(() => {
                    this.$refs.tree && this.$refs.tree.setData(this.treeData)
                    this.initOptions()
                })
            },
            async getSelectedTask() {
                if (!this.form.bk_biz_id) return
                this.treeLoading = true
                const data = await this.getTimeTask({biz_id: this.form.bk_biz_id})
                return data || []
            },
            beforeCheck(node) {
                if (!node.parent || Number(node.id.split('-')[0]) !== this.form.bk_biz_id) {
                    this.form.task_id = []
                    this.form.task_name = []
                    this.$refs.tree.removeChecked({ emitEvent: false })
                    return true
                }
                return true
            },
            handleCheckChange(id, node) {
                if (!this.form.task_id) {
                    this.form.task_id = []
                    this.form.task_name = []
                }
                if (node.checked) {
                    if (node.parent) {
                        this.form.name = node.parent.data.name
                        this.form.bk_biz_id = node.parent.data.id
                        this.form.task_id.push(node.data[this.curModel.cid])
                        this.form.task_name.push(node.data[this.curModel.cname])
                    } else {
                        this.form.name = node.data.name
                        this.form.bk_biz_id = node.data.id
                        node.children.forEach(item => {
                            this.form.task_id.push(item.data[this.curModel.cid])
                            this.form.task_name.push({name: item.data[this.curModel.cname], strategy_item_id: item.data[this.curModel.cid]})
                        })
                    }
                    this.initOptions()
                } else {
                    const index = this.form.task_id.findIndex(item => item === node.data[this.curModel.cid])
                    this.form.task_id.splice(index, 1)
                    this.form.task_name.splice(index, 1)
                    if (this.form.task_id.length) return
                    this.form.name = ''
                    this.form.bk_biz_id = ''
                    this.$refs.select.selectedOptions = undefined
                }
            }
        }
    }
</script>
