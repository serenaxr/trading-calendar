<template>
    <bk-sideslider
        :is-show.sync="config.isShow"
        title="日历导入"
        :width="800"
        :quick-close="true">
        <div slot="content" class="cmdb-custom-import-sideslider">
            <div v-show="importStatus === 'doing'">
                <!-- 上传文件控件 -->
                <bk-upload
                    class="upload-box"
                    accept=".xlsx"
                    url="/"
                    :multiple="false"
                    :size="20"
                    :files="files"
                    :custom-request="customRequest">
                </bk-upload>
                <div class="size-tips mt10">
                    <span>{{ '仅支持 20M 以内的 xlsx 文件' }}</span>
                    <span class="ml10 tips" @click="downloadTemplate">
                        <bk-icon class="mr5" type="download" />{{ '下载模版' }}
                    </span>
                </div>
            </div>
            <!-- 导入结果提示 -->
            <div v-show="importStatus !== 'doing'" class="import-state">
                <i class="bk-icon mt20" :class="importStatusMap.icon"></i>
                <p class="text mt20 mb20">{{ importStatusMap.text }}</p>
                <div class="flex">
                    <bk-button class="mr8" @click="reImport">重新导入</bk-button>
                    <bk-button @click="handleClose">关闭</bk-button>
                </div>
            </div>
            <ul class="mt20 error-list" v-if="errorMsg.asstError.length">
                <li v-for="(item, index) in errorMsg.asstError" :key="index">
                    <span>第{{ item.row }}行：{{ item.message }}</span>
                </li>
            </ul>
            <ul class="mt20 error-list" v-if="errorMsg.errors.length">
                <li v-for="(item, index) in errorMsg.errors" :key="index">
                    <span>{{ item }}</span>
                </li>
            </ul>
            <ul class="mt20 error-list" v-if="errorMsg.updateError.length">
                <li v-for="(item, index) in errorMsg.updateError" :key="index">
                    <span>{{ item }}</span>
                </li>
            </ul>
        </div>
        <!-- 底部按钮区 -->
    </bk-sideslider>
</template>

<script>
    export default {
        // 公共实例的自定义导入侧边栏
        name: 'import-sideslider',
        props: {
            config: {
                type: Object,
                // flag用于区分主机(导入新增false)和(导入编辑true)
                default: () => ({ isShow: false, objId: '', flag: false })
            },
            id: [String, Number]
        },
        data() {
            return {
                isNextStepLoading: false,
                // 步骤条配置
                stepsContent: [
                    { title: '上传文件', icon: 1 },
                    { title: '选择关联模型', icon: 2 }
                ],
                // 已上传文件列表
                files: [],
                // 是否导入中
                isImport: false,
                isImportInstance: false,
                // 导入状态
                importStatus: 'doing',
                // 错误提示信息
                errorMsg: {
                    asstError: [],
                    errors: [],
                    updateError: []
                }
            }
        },
        computed: {
            objId() {
                return this.config.objId
            },
            importStatusMap() {
                if (this.importStatus === 'failed') {
                    return {
                        icon: 'icon-close-circle-shape status-failed',
                        text: '导入失败'
                    }
                } else {
                    return {
                        icon: 'icon-check-circle-shape status-success',
                        text: '导入成功'
                    }
                }
            }
        },
        watch: {
            files(val) {
                if (val.length) {
                    document.querySelector('.file-wrapper').style.display = 'none'
                } else {
                    document.querySelector('.file-wrapper').style.display = 'flex'
                }
            }
        },
        methods: {
            // 点击‘下载模版’时触发
            async downloadTemplate() {
                const res = await this.$api.menology.downloadTemp({}, { 'responseType': 'blob' })
                this.download(res, '日历导入模版')
            },
            // 提炼函数：(文件数据,下载后的文件名) => 模拟点击下载文件
            download(data, fileName) {
                if (!data) return false
                let fileUrl = window.URL.createObjectURL(new Blob([data]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                const a = document.createElement('a')
                a.style.display = 'none'
                a.href = fileUrl
                const myDate = new Date()
                const nowDate = myDate.toLocaleDateString().replace(/\//g, '-')
                a.setAttribute('download', fileName + '_' + nowDate + '.xlsx')
                document.body.appendChild(a)
                a.click()
                fileUrl = window.URL.revokeObjectURL(fileUrl)
                document.body.removeChild(a)
            },
            // 自定义上传事件，用于阻止默认上传行为
            async customRequest(files) {
                this.importStatus = 'doing'
                const formData = new FormData()
                formData.append('menology_id', this.id)
                formData.append('file', files.fileObj.origin)
                try {
                    const { result } = await this.$api.menology.uploadExcel(formData, { headers: {
                        'Content-Type': 'multipart/form-data'
                    } })
                    if (result) {
                        this.importStatus = 'success'
                        return true
                    } else {
                        this.importStatus = 'failed'
                    }
                } catch (error) {
                    this.importStatus = 'failed'
                    this.$bkMessage.error(error)
                }
                return false
            },
            // 重新导入
            reImport() {
                this.importStatus = 'doing'
                this.isImportInstance = false
                document.querySelector('.upload-box .file-item').style.display = 'flex'
                this.files = []
                this.errorMsg = { asstError: [], errors: [], updateError: [] }
            },
            handleClose() {
                this.importStatus = 'doing'
                this.files = []
                this.config.isShow = false
            }
        }
    }
</script>

<style scoped lang="scss">
.cmdb-custom-import-sideslider {
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 33px;
}
.cmdb-custom-import-sideslider {
    padding: 20px 24px;
}

/* 步骤条 */
.upload-steps {
    width: 350px;
    margin: 0 auto;
}

/* 文件上传控件 */
/deep/.upload-box {
    .file-wrapper {
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .all-file .file-item {
        border-style: solid;
        .file-info {
            display: flex;
            align-items: center;
            .file-name {
                line-height: 34px;
                font-size: 12px;
                font-weight: 700;
            }
            .progress-bar-wrapper {
                display: none;
            }
        }
        .close-upload {
            position: static;
            display: none;
            order: 1;
            height: 34px;
            margin-left: 20px;
            line-height: 34px;
        }
        &:hover .close-upload {
            display: block;
        }
    }
}

/* 文件大小限制提示条 */
.size-tips {
    display: flex;
    .tips {
        display: flex;
        align-items: center;
        color: #3a84ff;
        > :first-child {
            font-weight: 700;
        }
    }
    .tips:hover {
        opacity: 0.7;
        cursor: pointer;
    }
}

.import-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    .status-success,
    .status-failed {
        font-size: 60px;
    }
    .status-success {
        color: #2dcb56;
    }
    .status-failed {
        color: #ea3636;
    }
    .text {
        color: #313238;
        font-size: 22px;
        line-height: 30px;
    }
}
.error-list {
    background: #ffeded;
    border: 1px solid #ffd2d2;
    border-radius: 3px;
    font-size: 12px;
    line-height: 18px;
    margin: 18px 0 0;
    padding: 18px;
    width: 100%;
}
</style>
