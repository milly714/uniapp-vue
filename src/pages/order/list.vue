<template>
  <div class="orderList">
    <div class="tabs">
      <tabs :dataList = "list"/>
    </div>
    <div class="list">
      <order-list :dataList="list" />
    </div>
  </div>
</template>
<script>
  import tabs from "../../components/tabs.vue"
  import orderList from "./components/orderList.vue"
  export default {
    data() {
      return {
        list: [{
          name:'全部'
        },{
          name:'待付款'
        },{
          name:'待发货'
        },{
          name:'待收货'
        }, {
          name:'已收货'
        }]
      }
    },
    computed: {
    },
    components: {
      tabs,
      orderList
    },
    methods: {},
    onShow() {

    },
  };
</script>
<style lang='less'>
.orderList{
  min-height: 100vh;
  background: rgba(245,245,245,1);
}
.tabs{
  position: fixed;
  top:0;
  background: #fff;
  width: 100%;
  z-index: 2;
}
.list{
  padding-top: 14.67vw;
}
</style>