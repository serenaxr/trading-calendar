<script>
    import AddDialog from './AddDialog.vue'
    export default {
        name: 'add-center-dialog',
        extends: AddDialog,
        methods: {
            async lazyMethod(node) {
                const chain = node.data.chain.split('-')
                const cur = this.mapData(this.treeData, chain)
                const id = node.data.id
                this.form.task_type = id
                const data = await this.getTask(id)
                cur.isFeatch = true
                if (!data || !data.length) return
                cur.children = this.formatChild(data, cur)
                return { leaf: [], data: cur.children }
            },
            // 获取
            async getCmdb(params = {}) {
                this.treeLoading = true
                let tree = []
                tree = await this.getTask()
                this.cmdbs = this.$Copy(tree)
                this.initOptions()
                return tree
            },
            async getTask(type = 'all') {
                console.log(type)
                const res = await this.$api.strategy.getTask({ alarm_type: type }).finally(() => {
                    this.treeLoading = false
                })
                const { result, data } = res
                if (result) {
                    const { id, name } = this.curModel
                    return this.mapTaskData({ data, id, name })
                }
                return []
            },
            // 编辑设置默认选中
            async initDefault() {
                const { task_type: type, task_id: taskId, task_name: taskName } = this.form
                if (!type) return
                const parent = this.treeData.find(item => item.id === type)
                if (!parent) return
                this.treeLoading = true
                parent.isFeatch = true
                const data = await this.getTask(type).finally(() => {
                    this.treeLoading = false
                })
                data.unshift({ task_id: taskId, task_name: taskName })
                parent.children = this.formatChild(data, parent)
                this.$nextTick(() => {
                    this.$refs.tree && this.$refs.tree.setData(this.treeData)
                    this.initOptions()
                    const id = type + '-' + taskId
                    // 设置默认选中
                    this.$refs.tree && this.$refs.tree.setChecked(id, { emitEvent: false, checked: true })
                })
            }
        }
    }
</script>
