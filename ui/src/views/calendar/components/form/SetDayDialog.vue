<template>
    <bk-dialog
        class="add-dialog"
        :value="visible"
        width="500"
        title="设置日历"
        theme="primary"
        header-position="left"
        footer-position="center"
        :auto-close="false"
        :loading="loading"
        :height-adaption="true"
        :show-footer="!disabled"
        @confirm="confirm"
        @cancel="cancel">
        <bk-form
            :model="form"
            :label-width="100"
            :rules="rules"
            ref="form"
            v-bkloading="{ isLoading }">
            <bk-form-item
                label="日期"
                property="individuation_date"
                required
                error-display-type="normal">
                <bk-date-picker
                    v-model="form.individuation_date"
                    disabled
                    format="yyyy-M-d">
                </bk-date-picker>
            </bk-form-item>
            <template v-for="(item, index) in form.data">
                <bk-form-item
                    v-if="item.type === 'button'"
                    class="mt15"
                    :key="index"
                    label="类型"
                    :property="`data.${index}.value`" required>
                    <bk-radio-group v-model="form.data[0].value" @change="handleChangeType">

                        <bk-radio :disabled="disabled" :value="1">工作日</bk-radio>
                        <bk-radio :disabled="disabled" :value="0">非工作日</bk-radio>
                    </bk-radio-group>
                </bk-form-item>
                <bk-form-item
                    v-else
                    label="工作时段"
                    :key="index"
                    required
                    :class="[{ mb30: disabled }]"
                    :rules="rules.extras"
                    :property="`data.${index}.extras`"
                    error-display-type="normal">
                    <bk-form-item
                        :label-width="0"
                        class="time-item"
                        v-for="(time, indexExtras) in form.data[index].extras"
                        :key="indexExtras"
                        :rules="rules.extrasItem"
                        :property="`data.${index}.extras.${indexExtras}`"
                        error-display-type="normal">
                        <bk-time-picker
                            v-model="form.data[index].extras[indexExtras]"
                            transfer
                            :disabled="disabledCalc"
                            :type="'timerange'"
                            :placeholder="'选择时间范围'">
                        </bk-time-picker>
                        <template v-if="!disabledCalc">
                            <bk-button
                                class="ml10"
                                theme="primary"
                                text
                                @click="addTime(form.data[index].extras, indexExtras)">
                                添加
                            </bk-button>
                            <bk-button
                                v-if="indexExtras > 0"
                                class="ml10"
                                theme="danger"
                                text
                                @click="delTime(form.data[index].extras, indexExtras)">
                                删除
                            </bk-button>
                        </template>
                    </bk-form-item>
                </bk-form-item>
            </template>
        </bk-form>
    </bk-dialog>
</template>

<script>
    import formMixins, { validateExtras, validateItem } from './form-mixins'
    export default {
        mixins: [formMixins],
        props: {
            date: [String, Date],
            disabled: Boolean
        },
        data() {
            return {
                form: {
                    title: '',
                    enable: 1,
                    data: []
                },
                rules: {
                    individuation_date: [{ required: true, message: '请输入选择日期', trigger: 'blur' }],
                    'data[0].value': [{ required: true, message: '请选择状态', trigger: 'change' }],
                    extras: validateExtras,
                    extrasItem: validateItem
                }
            }
        },
        computed: {
            disabledCalc() {
                return this.disabled || this.flagEdit
            }
        },
        watch: {
            visible: function(val) {
                if (!val) return
                const parm = this.date.split('-')
                this.getData({menology_year: parm[0], menology_month: parm[1], menology_day: parm[2]})
                this.form.individuation_date = this.date
            }
        },
        methods: {
            handleChangeType(value) {
                this.flagEdit = !value
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "./index.scss";
</style>
