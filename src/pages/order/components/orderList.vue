<template>
    <div :class="{empty:dataList && dataList.length==0}">
        <empty-page v-if="dataList && dataList.length==0" :title="emptyTitle"/>
        <order-list-item v-for="(item, i) in dataList" :key="i" class="item" :item-data='item' />
    </div>
</template>
<script>
import orderListItem from './orderListItem.vue'
import emptyPage from '@/components/empty'
export default {
    data(){
        return {
            emptyTitle: '您暂时没有消费记录!'
        }
    },
    props: {
        dataList: {
            default: [],
            type: Array
        }
    },
    components: {
        orderListItem,
        emptyPage
    },
};
</script>
<style scoped lang='less'>
.empty{
    background: #fff;
    min-height: 100vh;
    margin-top: -0.267vw;
}
.item {
    display: block;
    clear: both;
    margin-top: 2.13vw;
}
</style>