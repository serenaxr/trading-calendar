<template>
    <div class="almanac-page">
        <bk-almanac
            ref="almanac"
            v-show="form.month === '0'"
            v-bkloading="{ isLoading }"
            read-only
            :year.sync="form.year"
            :format="format"
            :cell-class-name="cellClass"
            :first-day-of-week="firstDayOfWeek"
            :key="'almanac' + form.menology_id"
            @change-filter="changeFilter"
            @day-click="handleClickDay"
            @month-click="handleClickMonth">
            <template slot="header">
                <search-group :model="form" :calendar-list="calendarList"></search-group>
            </template>
        </bk-almanac>
        <bk-calendar
            v-show="form.month !== '0'"
            v-model="cdate"
            v-bkloading="{ isLoading }"
            :format="format"
            :cell-class-name="cellClassMonth"
            :first-day-of-week="firstDayOfWeek"
            :key="'calendar' + form.menology_id"
            @change-filter="changeFilter"
            @cell-click="handleClickDay">
            <template slot="header">
                <search-group :model="form" :calendar-list="calendarList"></search-group>
            </template>
            <template
                slot="dateCell"
                slot-scope="{ date, data }">
                <div>
                    <div class="day">
                        {{ data.day.split('-').slice(2).join('') }}
                    </div>
                    <div class="work-times" v-if="showTimes(date)">
                        <div v-for="(item, index) in workMap[getDate(date)].work_time"
                            :key="data.day + index"
                            class="time-item">
                            {{item.join('-')}}
                        </div>
                    </div>
                </div>
            </template>
        </bk-calendar>
        <set-day-dialog
            :id="id"
            :visible.sync="visible"
            :date="selectDay"
            :disabled="disabled"
            @update="getData(false)">
        </set-day-dialog>
    </div>
</template>

<script>
    import SearchGroup from '../components/SearchGroup.vue'
    import SetDayDialog from '../components/form/SetDayDialog.vue'
    import { _debounce } from '@/utils/utils'
    export default {
        name: 'almanac',
        components: { SearchGroup, SetDayDialog },
        data() {
            return {
                isLoading: false,
                cdate: new Date(),
                curDay: new Date().getDate(),
                selectDay: new Date(),
                firstDayOfWeek: 7,
                form: {
                    year: new Date().getFullYear(),
                    month: '0',
                    menology_id: ''
                },
                id: '',
                noWrokDays: {},
                workTimes: [],
                visible: false,
                flag: true,
                format: 'yyyy-M-d',
                test: '',
                workMap: {},
                lock: false,
                calendarList: []
            }
        },
        computed: {
            disabled() {
                return new Date().getTime() - 1000 * 24 * 60 * 60 > new Date(this.selectDay).getTime()
            },
            enableShow() {
                return this.$route.name === 'details'
            },
            currentTime() {
                return new Date().getTime()
            }
        },
        watch: {
            form: {
                handler(val) {
                    // if (this.flag) {
                    this.cdate = this.formatDate()
                    // }
                    this.flag = true
                    if (this.lock) return
                    _debounce(this.getData(), 500)
                },
                deep: true
            },
            '$route': {
                handler(val) {
                    this.id = this.$route.params.id
                    this.lock = true
                    this.$nextTick(() => {
                        // this.form.month = '0'
                        this.id && (this.form.menology_id = this.id)
                        this.id ? this.getData() : this.getDefault()
                        setTimeout(() => {
                            this.lock = false
                        }, 300)
                    })
                },
                immediate: true,
                deep: true
            }
        },
        mounted() {
            this.scrollTo()
            this.form = { ...this.form, ...this.getSystemDate() }
        },
        methods: {
            scrollTo() {
                this.$nextTick(() => {
                    const calen = document.querySelectorAll('.almanac-calendar-item')
                    const curCom = calen[new Date().getMonth() + 1]
                    const main = document.querySelector('.container-content')
                    main.scrollTo({
                        left: 0,
                        top: curCom.offsetTop - 112,
                        behavior: 'smooth'
                    })
                })
            },
            async getDefault() {
                try {
                    this.form.month = '0'
                    this.isLoading = true
                    const params = {
                        // keyword: '交易日历'
                    }
                    const { result, data } = await this.$api.menology.find(params)
                    if (result) {
                        this.calendarList = data
                        this.id = data[0].id
                        this.form.menology_id = data[0].id
                        this.getData()
                    }
                } catch (error) {
                    this.isLoading = false
                }
            },
            async getData(loading = true) {
                this.isLoading = loading
                const params = {
                    menology_year: this.form.year,
                    menology_id: this.form.menology_id
                }
                if (this.form.month !== '0') {
                    params.menology_month = this.form.month
                }
                const { result, data } = await this.$api.menology.find(params).finally(() => {
                    this.isLoading = false
                })
                if (!result) return
                if (this.form.month === '0') {
                    this.noWrokDays = {}
                    data.forEach(item => {
                        this.$set(this.noWrokDays, item, true)
                    })
                } else {
                    this.workTimes = data.map(item => ({
                        ...item,
                        work_time: item.work_time.sort()
                    }))
                    this.workMap = {}
                    this.workTimes.forEach(item => {
                        this.$set(this.workMap, item.menology_day, {
                            ...item,
                            is_workday: Number(item.is_workday)
                        })
                    })
                }
                this.$forceUpdate()
            },
            cellClass({ text, type }, date) {
                if (this.form.month !== '0') return
                return this.cellClassMonth({ text, type }, date)
            },
            cellClassMonth({ text, type }, date) {
                if (type !== 'current') return ''
                const classList = []
                if (new Date(date) < Date.now() - 1000 * 24 * 60 * 60) {
                    classList.push('past-work-day')
                }
                if (this.type === 'prev' || this.noWrokDays[date] || (this.form.month !== '0' && this.workMap[date] && !this.workMap[date].is_workday)) {
                    classList.push('no-work-day')
                }
                return classList
            },
            showTimes(date) {
                const res = this.workMap[this.getDate(date)] || {}
                return +res.is_workday && Array.isArray(res.work_time)
            },
            endDate() {
                const date = new Date(this.form.year, this.form.month, 0)
                const y = date.getFullYear()
                const m = date.getMonth() + 1
                const d = date.getDate()
                return `${y}-${m}-${d}`
            },
            changeFilter(date) {
                this.form.year = date.getFullYear()
                if (this.form.month === '0') return
                if (+this.form.month === date.getMonth() + 1 || this.isLoading) return
                this.form.month = date.getMonth() + 1 + ''
            },
            handleClickDay(month, date) {
                this.$nextTick(() => {
                    this.flag = false
                    if (!date) {
                        date = month
                        month = +this.form.month
                    }
                    if (!this.enableSelect(month, date)) return
                    this.selectDay = date || month
                    if (!this.$hasPermission('men_edit')) return this.setPermission(false)
                    this.visible = true
                })
            },
            handleClickMonth(month) {
                this.form.month = month
            },
            enableSelect(m, date) {
                return (new Date(date).getMonth() + 1) === +m && this.enableShow
            },
            getDate(date) {
                const newDdate = new Date(date)
                const y = newDdate.getFullYear()
                const m = newDdate.getMonth() + 1
                const d = newDdate.getDate()
                return `${y}-${m}-${d}`
            },
            formatDate() {
                const { year, month } = this.form
                const lastDay = new Date(year, month, 0).getDate()
                const day = this.curDay > lastDay ? lastDay : this.curDay
                const m = month !== '0' ? month : new Date().getMonth() + 1
                return this.toDate(`${year}-${m >= 10 ? m : '0' + m}-${day >= 10 ? day : '0' + day}`)
            },
            toDate(val) {
                return val instanceof Date ? val : new Date(val)
            },
            getSystemDate() {
                const nowDate = new Date()
                const date = {
                    year: nowDate.getFullYear(),
                    month: nowDate.getMonth() + 1,
                    date: nowDate.getDate()
                }
                return date
            }
        }
    }
</script>
<style lang="scss" scoped>
    .almanac-page {
        --gery-color: #b2bdcc;
        padding: 20px 24px 20px 24px;
        /deep/ {
            .bk-almanac {
                &-header {
                    align-items: center;
                    flex: 1;
                    border: none;
                }
                &-body {
                    min-width: 1127px;
                    background: #FFF;
                }
            }
            .almanac-calendar-item {
                padding: 0 5px;
            }
            .almanac-calendar-title {
                font-weight: 600;
                color: #F46171;
            }
            .bk-calendar {
                background: transparent;
                &-header {
                    margin-bottom: 10px;
                    border: none !important;
                }
                &-body {
                    background: #FFF;
                }
                .past-work-day {
                    .time-item {
                        background: var(--gery-color) !important;
                    }
                }
                .no-work-day {
                    color: var(--gery-color) !important;
                    background: #EEE;
                    .time-item {
                        background: var(--gery-color) !important;
                    }
                }
                .current {
                    color: #333;
                }
                &:not(.is-card) {
                    .bk-calendar-day {
                        min-height: 85px;
                        height: auto !important;
                    }
                }
                &.is-card {
                    .bk-calendar-table:not(.is-range) td.prev {
                        color: var(--gery-color) !important;
                        // background: #F0F1F5;
                    }
                }
            }
        }
        .work-times {
            display: flex;
            flex-direction: column;
            .time-item {
                text-align: center;
                max-width: 140px;
                margin-top: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                background: #3A84FF;
                color: #FFF;
            }
        }
    }
</style>
