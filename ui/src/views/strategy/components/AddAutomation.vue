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
            ref="form">
            <bk-form-item
                label="策略名称"
                property="task_id"
                required
                error-display-type="normal">
                <bk-select
                    ref="select"
                    v-model="form.task_id"
                    searchable
                    :loading="treeLoading"
                    :show-empty="false">
                    <bk-option v-for="option in treeData"
                        :key="option.id"
                        :id="option.id"
                        :name="option.task_name">
                    </bk-option>
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
                    :loading="timerLoading"
                    auto-scroll>
                    <bk-option
                        v-for="item in timeList"
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
                    enable-scroll-load>
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

    export default {
        name: 'add-automation',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            data: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                loading: false,
                params: {
                    limit: 1,
                    current: 20,
                    alluser: 1
                },
                form: {
                    name: '',
                    status: 1,
                    menology_id: '',
                    task_id: '',
                    extras: [],
                    strategy_saas: 'auto-ops_saas'
                },
                rules: {
                    task_id: [{ required: true, message: '请选择策略', trigger: 'blur' }],
                    status: [{ required: true, message: '请选择状态', trigger: 'blur' }],
                    menology_id: [{ required: true, message: '请选择关联日历', trigger: 'blur' }],
                    extras: [{ required: true, validator: val => !!val.length, message: '请选择邮件接收人', trigger: 'blur' }]
                },
                treeLoading: false,
                timerLoading: false,
                userLoading: false,
                treeData: [],
                userList: [],
                timeList: []
            }
        },
        computed: {
            title() {
                return this.data.id ? '编辑' : '新增'
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    if (this.data.id) {
                        this.form = Object.assign({}, this.data)
                        if (this.data.status) {
                            this.form.status = 1
                        } else {
                            this.form.status = 0
                        }
                        this.form.task_id = parseInt(this.data.task_id)
                        this.form.strategy_id = this.data.id
                    }
                    this.getData()
                }
            }
        },
        methods: {
            // 统一获取资源
            getData() {
                this.getTimeTask()
                this.getUserInfo()
                this.getTimerData()
            },
            // 获取策略名称
            async getTimeTask() {
                const params = {
                    strategy_model: 'auto-ops_saas'
                }
                try {
                    this.treeLoading = true
                    const {result, data, message} = await this.$api.strategy.getTimeTask(params)
                    if (result) {
                        this.treeData = data
                    } else {
                        this.$bkMessage({
                            theme: 'error',
                            message: message
                        })
                    }
                } finally {
                    this.treeLoading = false
                }
            },
            // 获取收件人
            async getUserInfo() {
                try {
                    this.userLoading = true
                    const {result, data, message} = await this.$api.user.userInfo(this.params)
                    if (result) {
                        this.userList = data
                    } else {
                        this.$bkMessage({
                            theme: 'error',
                            message: message
                        })
                    }
                } finally {
                    this.userLoading = false
                }
            },
            // 获取日历
            async getTimerData() {
                try {
                    this.timerLoading = true
                    const {result, data, message} = await this.$api.menology.find(this.paramss)
                    if (result) {
                        this.timeList = data
                    } else {
                        this.$bkMessage({
                            theme: 'error',
                            message: message
                        })
                    }
                } finally {
                    this.timerLoading = false
                }
            },
            // 置空
            setNull() {
                this.visible = false
                this.form = {
                    name: '',
                    status: 1,
                    menology_id: '',
                    task_id: '',
                    extras: [],
                    strategy_saas: 'auto-ops_saas'
                }
            },
            // 取消
            cancel() {
                this.setNull()
                this.$emit('close')
            },
            // 提交
            async confirm() {
                this.$refs.form.validate().then(validator => {
                    this.submit()
                })
            },
            async submit() {
                this.treeData.forEach(item => {
                    if (item.id === this.form.task_id) {
                        this.form.name = item.task_name
                    }
                })
                const type = this.form.id ? 'update' : 'add'
                const { result } = await this.$api.strategy[type](this.form)
                if (result) {
                    this.$emit('confirm', {type, title: this.title, data: this.form})
                }
                this.setNull()
            }
        }

    }
</script>
