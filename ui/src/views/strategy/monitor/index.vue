<script>
    import Strategy from '../index.vue'
    import AddDialog from '../components/AddMonitorDialog.vue'
    export default {
        name: 'montor',
        components: { AddDialog },
        extends: Strategy,
        data() {
            return {
                strategySaas: 'kmc_saas'
            }
        }
    }
</script>
