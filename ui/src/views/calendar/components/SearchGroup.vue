<template>
    <bk-form
        class="search-form"
        :model="model"
        :label-width="80">
        <bk-form-item label="选择日历" v-if="$route.name === 'Almanac'">
            <bk-select
                v-model="model.menology_id"
                auto-scroll
                :clearable="false"
                searchable>
                <bk-option
                    v-for="item in calendarList"
                    :key="item.id"
                    :id="item.id"
                    :name="item.title">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item label="选择年份">
            <bk-select
                v-model="model.year"
                auto-scroll
                :clearable="false"
                searchable>
                <bk-option
                    v-for="y in years"
                    :key="y"
                    :id="y"
                    :name="y">
                </bk-option>
            </bk-select>
        </bk-form-item>
        <bk-form-item label="选择月份">
            <bk-select
                v-model="model.month"
                searchable
                auto-scroll
                :clearable="false"
                @clear="clearMonth">
                <bk-option
                    v-for="(m, key) in month"
                    :key="m"
                    :id="key"
                    :name="m">
                </bk-option>
            </bk-select>
        </bk-form-item>
    </bk-form>
</template>

<script>
    export default {
        name: 'search-group',
        props: {
            model: {
                type: Object,
                default: () => {
                    return {
                        year: new Date().getFullYear(),
                        month: '0',
                        menology_id: ''
                    }
                }
            },
            calendarList: {
                type: Array,
                default: () => ([])
            }
        },
        data() {
            return {
                curYear: new Date().getFullYear(),
                list: [],
                years: [],
                month: {
                    0: '全部',
                    1: '1月',
                    2: '2月',
                    3: '3月',
                    4: '4月',
                    5: '5月',
                    6: '6月',
                    7: '7月',
                    8: '8月',
                    9: '9月',
                    10: '10月',
                    11: '11月',
                    12: '12月'
                },
                form: {
                    menology_id: ''
                },
                pagination: {
                    limit: 10,
                    current: 1,
                    count: 1
                }
            }
        },
        watch: {
            '$route': {
                handler(val) {
                    // if (this.$route.name !== 'Almanac') return
                    // this.getData()
                },
                immediate: true,
                deep: true
            }
        },
        created() {
            this.initYears()
            // this.getcalendarName()
        },
        methods: {
            initYears() {
                const arr = this.years
                arr.push(this.curYear)
                for (let i = 1; i <= 40; i++) {
                    arr.unshift(this.curYear - i)
                    arr.push(this.curYear + i)
                }
                this.years = arr
            },
            clearMonth() {
                this.model.month = '0'
            },
            // getcalendarName() {
            //     this.$api.menology.find({menology_id: this.form.menology_id}).then(res => {
            //         // console.log(res)
            //     })
            // },
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
            async getData(selectd) {
                // console.log(123)
                // const res = await this.$api.menology.find(this.pagination).finally(() => {
                // })
                // const { result, data, count, num } = res
                // if (result) {
                //     this.list = data
                //     console.log(data)
                //     // if (selectd) {
                //     //     this.list.push(...[...data, ...selectd])
                //     // } else {
                //     //     this.list.push(...data)
                //     // }
                //     // this.list = this.unique(this.list)
                //     // this.model.menology_id = this.list[0].id
                //     this.pagination.count = num || count
                // }
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
    .search-form {
        display: flex;
        align-items: center;
        width: 100%;
        /deep/ {
            .bk-form-item {
                display: inline-block;
                & + .bk-form-item {
                    margin-top: 0;
                    margin-left: 10px;
                }
                .bk-select {
                    width: 150px;
                }
            }
        }
    }
</style>
