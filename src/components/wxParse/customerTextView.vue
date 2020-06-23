<<template>
    <div>
        <span class="wxparse-txt">{{item}}</span>
    </div>
</template>

<script>
    export default {
        name: 'customer-parse',
        data(){
            return {}
        },
        props: {
            item: {
                type: Object,
                default: {}
            }
        }
    }
</script>

<style lang="less" scoped>

</style>