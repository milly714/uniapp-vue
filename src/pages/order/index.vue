<template>
    <div class="orderList" :class="{'orderList empty':list&&list.length==0}">
        <div class="tabs">
            <tabs :dataList="list" :select.sync="status" @tab-click = 'switchStatus'/>
        </div>
        <div class="list">
            <order-list :dataList="orderList" />
        </div>
    </div>
</template>
<script>
import tabs from "@/components/tabs.vue"
import orderList from "./components/orderList.vue"
import { getOrderlist } from '@/config/orderApi'
import { getImgUrl, dateFormat } from '@/utils'
const statusList = [undefined, '未支付', '已支付', '已发货', '已收货', '订单关闭', '订单完成', '订单取消']
import {mapState} from 'vuex'
export default {
  data() {
    return {
      list: [{
        name: '全部',
        status: 0
      }, {
        name: '待付款',
        status: 1
      }, {
        name: '待发货',
        status: 2
      }, {
        name: '待收货',
        status: 3
      }, {
        name: '已收货',
        status: 4
      }],
      orderList: [],
      status: '0',
      fromPos:0,
      isOnShow: false
    }
  },
  computed: {
    ...mapState(['upOrderData'])
  },
  watch:{
    upOrderData(newV){
      //uni.startPullDownRefresh()
      this.onInitList();
    }
  },
  components: {
    tabs,
    orderList
  },
  methods: {
    getOrderlist() {
      if(this.isloading) return
      this.isloading = true
      getOrderlist({
        status: this.status,
        fromPos: this.fromPos,
        limit: 5,
      }).then(res => {
        this.fromPos = res.lastPos
        if(res.orders && res.orders.length>0){
          this.orderList = [...this.orderList,...res.orders.map((order) => {
            order.goodsList = order.goodsList.map(goods => {
              goods.img = getImgUrl(goods.bannerImgs.split(',')[0])
              goods.price = (Number(goods.price / 100)*Number(goods.count)).toFixed(2)
              goods.a = goods.price.split('.')[0]
              goods.b = goods.price.split('.')[1]
              return goods
            })
            order.createTime = dateFormat(new Date(order.createTime), 'yyyy-MM-dd hh:mm:ss')
            order.statusString = statusList[order.status]
            order.id = order.orderId
            return order
          })]
        }
        this.$store.commit('showLoading', false);
        uni.stopPullDownRefresh()
        this.isloading = false
      })
    },
    onInitList(){
      this.fromPos = 0
      this.orderList = []
      this.getOrderlist()
    },
    onPullDownRefresh(){
      this.fromPos = 0
      this.orderList = []
      this.getOrderlist()
    },
    onReachBottom(){
      this.getOrderlist()
    },
    switchStatus(item) {
      //uni.startPullDownRefresh()
      this.$store.commit('showLoading', true);
      this.onInitList();
    }
  },
  onLoad() {
    console.log('onload');
    this.status = this.$mp.query.status || 0
    this.getOrderlist()
  },
  onShow(){
    if(this.isOnShow){
      this.status = this.$mp.query.status || 0
      this.fromPos = ''
      this.orderList = [];
      this.getOrderlist()
    }
    console.log('onshow');
  },
  onHide(){
    this.isOnShow = true;
  },
};
</script>
<style lang='less'>
.orderList {
    min-height: 100vh;
    background: rgba(245, 245, 245, 1);
    &.empty{
      background: #fff;
    }
}

.tabs {
    position: fixed;
    top: 0;
    background: #fff;
    width: 100%;
    z-index: 2;
}

.list {
    padding-top: 15.67vw;
}
</style>