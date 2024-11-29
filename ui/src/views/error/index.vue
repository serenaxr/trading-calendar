<template>
    <div class="exception-wrap">
        <bk-exception class="exception-wrap-item" type="404">
            <span>页面不存在</span>
            <div class="text-wrap">
                <span class="text-btn">刷新页面</span>
                <span class="text-btn">返回首页</span>
            </div>
        </bk-exception>
    </div>
</template>

<script>
    export default {
        name: 'exception-index'
    }
</script>
<style lang="scss" scoped>
.exception-wrap {
    padding: 20px 24px 20px 24px;
    height: 100%;
}
.exception-wrap .exception-wrap-item {
    // border: 1px solid #DCDEE5;
    padding-top: 10%;
    height: 100%;
    background: #FFF;
}
.exception-wrap .exception-wrap-item .text-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3A84FF;
    font-size: 14px;
    margin-top: 12px;
}
.exception-wrap .exception-wrap-item .text-subtitle {
    color: #979BA5;
    font-size: 14px;
    text-align: center;
    margin-top: 14px;
}
.text-wrap .text-btn {
    margin: 0 5px;
}
.text-wrap .text-btn:hover {
    cursor: pointer;
}
</style>
