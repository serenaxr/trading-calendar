<template>
    <bk-dialog
        class="add-dialog"
        :value="visible"
        width="500"
        :title="title"
        theme="primary"
        header-position="left"
        footer-position="center"
        :loading="loading"
        :auto-close="false"
        :height-adaption="true"
        @confirm="confirm"
        @cancel="cancel">
        <bk-form
            :model="form"
            :label-width="100"
            :rules="rules"
            ref="form">
            <bk-form-item
                label="日历名称"
                property="title"
                required
                error-display-type="normal">
                <bk-input v-model.trim="form.title"></bk-input>
            </bk-form-item>
            <bk-form-item label="状态" property="enable" required>
                <bk-radio-group v-model="form.enable">
                    <bk-radio :value="1">启用</bk-radio>
                    <bk-radio :value="0">不启用</bk-radio>
                </bk-radio-group>
            </bk-form-item>
            <bk-form-item
                label="统一时间段"
                v-for="(item, index) in form.data"
                :key="index"
                :rules="rules.extras"
                :property="`data.${index}.extras`"
                required
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
                        transfer
                        v-model="form.data[index].extras[indexExtras]"
                        placeholder="选择时间范围"
                        type="timerange">
                    </bk-time-picker>
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
                </bk-form-item>
            </bk-form-item>
        </bk-form>
    </bk-dialog>
</template>

<script>
    import fromMixins, { validateItem, validateExtras } from './form-mixins'
    export default {
        mixins: [fromMixins],
        props: {},
        data() {
            return {
                form: {
                    title: '',
                    enable: 1,
                    data: []
                },
                rules: {
                    title: [
                        { required: true, message: '请输入日历名称', trigger: 'blur' },
                        { max: 16, message: '长度不能超过16个字符', trigger: 'blur' }
                    ],
                    enable: [{ required: true, message: '请选择状态', trigger: 'change' }],
                    extras: validateExtras,
                    extrasItem: validateItem
                }
            }
        },
        computed: {
            title() {
                return this.form.menology_id ? '编辑日历' : '新增日历'
            }
        },
        watch: {
            visible: function(val) {
                if (!val) return
                this.initForm(this.data)
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "./index.scss";
</style>
