const validateTime = (data) => {
    const getTime = (val) => {
        const d = new Date()
        return d.setHours(...val.split(':'))
    }
    return getTime(data[0]) < getTime(data[1])
}

export const validateItem = [
    {
        validator: (vals) => vals.every(val => !!val),
        message: '时间段不能为空',
        trigger: 'change'
    },
    {
        validator: (vals) => validateTime(vals),
        message: '结束时间必须大于开始时间',
        trigger: 'change'
    }
]

const flatten = (arr) => arr.toString().split(',').map((item) => item)

export const validateExtras = [
    {
        validator: (vals) => {
            const sortArr = flatten(vals.sort())
            return !sortArr.some((item, index) => {
                if (index === 0) return false
                return (+item.split(':').join('')) < (+sortArr[index - 1].split(':').join(''))
            })
        },
        message: '时间段不能交叉或重复',
        trigger: 'change'
    }
]

export default {
    props: {
        id: [String, Number],
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
            dataTemp: {
                type: '',
                key: '',
                name: '',
                value: '',
                extras: [[]]
            },
            flagEdit: false,
            loading: false,
            isLoading: false
        }
    },
    methods: {
        async getData(params) {
            this.isLoading = true
            try {
                const { result, data } = await this.$api.menology.find({menology_id: this.id, ...params}).finally(() => {
                    this.isLoading = false
                })
                if (result) {
                    this.initForm(data[0])
                }
            } catch (error) {
            }
        },
        async initForm(val = {}) {
            const cval = JSON.parse(JSON.stringify(val))
            this.form.data = []
            this.$set(this.form, 'menology_id', +this.id || '')
            if (this.date) {
                this.form.data.unshift({
                    type: 'button',
                    key: 'is_workday',
                    name: '是否工作日',
                    value: +cval.is_workday,
                    extras: []
                })
                const { data } = await this.$api.menology.find({menology_id: this.id})
                this.form.enable = Number(data[0].enable)
                this.form.title = data[0].title
                this.flagEdit = !(+cval.is_workday)
            } else {
                this.form.title = cval.title || ''
                this.form.enable = cval.enable !== undefined ? Number(cval.enable) : 1
            }
            this.form.data.push({
                type: 'input',
                key: 'work_time',
                name: '工作时间',
                value: 'extras',
                extras: (cval.work_time && cval.work_time.length) ? cval.work_time : [[]]
            })
        },
        addTime(data, index) {
            data.splice(index + 1, 0, ['', ''])
            this.clearTimesValidate()
        },
        delTime(data, index) {
            data.splice(index, 1)
            this.clearTimesValidate()
        },
        clearTimesValidate() {
            this.$nextTick(() => {
                this.form.data.forEach((item, i) => {
                    item.extras.forEach((it, j) => {
                        this.clearFieldError(`data.${i}.extras.${j}`)
                    })
                })
            })
        },
        afreshTimesValidate() {
            this.$nextTick(() => {
                this.form.times.forEach((item, i) => {
                    this.validateField(`data.${i}`)
                })
            })
        },
        validateField(field) {
            this.$refs.form.validateField(field)
        },
        clearFieldError(field) {
            this.$refs.form.clearFieldError(field)
        },
        confirm() {
            this.$refs.form.validate().then(validator => {
                this.loading = true
                this.form.menology_id ? this.edit() : this.add()
            }, validator => {
                this.loading = false
                console.log(`${validator.field}：${validator.content}`)
            })
        },
        async add() {
            try {
                this.form.menology_template_id = 1
                const { result, message } = await this.$api.menology.add(this.form)
                if (result) {
                    this.$emit('add')
                    this.$bkMessage({
                        theme: 'primary',
                        message: '新增成功'
                    })
                    this.colse()
                    return
                } else {
                    this.$bkMessage({
                        theme: 'error',
                        message
                    })
                }
                this.loading = false
            } catch (error) {
                this.loading = false
            }
        },
        async edit() {
            try {
                if (this.date) {
                    this.form.individuation_date = this.date
                }
                const res = await this.$api.menology.update(this.form)
                const { result, message } = res
                if (result) {
                    this.$emit('update')
                    this.$bkMessage({
                        theme: 'success',
                        message: '更新成功'
                    })
                    this.colse()
                } else {
                    this.$bkMessage({
                        theme: 'error',
                        message
                    })
                }
                this.loading = false
            } catch (error) {
                this.loading = false
            }
        },
        reset() {
            this.form = {
                title: '',
                enable: 1,
                data: []
            }
        },
        cancel() {
            this.colse()
        },
        colse() {
            this.loading = false
            this.reset()
            this.$emit('update:visible', false)
        }
    }
}
