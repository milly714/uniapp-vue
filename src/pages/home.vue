<template>
  <div class="home" :class="{'home empty': isNoData}">
    <!-- <skeleton :iphoneX="isIphoneX" v-if="isShowLoading"></skeleton> -->
      <empty-page v-if="!isNonetwork && list && list.length==0" :title="emptyTitle"/>
      <empty-page v-if="isNonetwork" @on-refresh="onRefreshPage" :isShowRefreshBtn="isNonetwork" :title="nonetworkTitle"/>
      <div class="content" v-if="!isNonetwork && list && list.length>0">
        <div class="goodsList" :class="{iphonex: isIphoneX}">
          <goods-list ref="childGoods" :isTapClick="disableOnBuy" :list="list" :leftList="leftList" :rightList="rightList"
          @onLoadImg="onImageLoad" 
          @onBuy="onBuy" 
          @onDetail="onDetail"/>
        </div>
        <button open-type="share"></button>
      </div>
      <mask v-if="showMask" @on-click="onCloseMark"></mask>
      <div class="btn-service" @click="onService">
        <img src="../assets/service.png" alt="" />
      </div>
      <!-- <div class="btn-service" @touchmove="buttonMove" @touchstart="buttonStart" @touchend="buttonEnd" :style="{top:buttonTop+'px',left:buttonLeft+'px'}" @click="onService">
        <img src="../assets/service.png" alt="" />
      </div> -->
      <service-modal v-if="showMask"></service-modal>
      <!-- <button class="move-btn" @touchmove="buttonMove" @touchstart="buttonStart" @touchend="buttonEnd" :style="{top:buttonTop+'px',left:buttonLeft+'px'}">+</button> -->
      <!-- <div class="good_box" v-if="!showBall"  :style="'left:' + elLeft + 'px;top:' +elTop+'px;'"></div> -->
    <div v-if="showBall" :animation="animationData" class="transform-btn"><span class="icon-tip-add">+</span>1</div>
    <tab-bar class="tabBar" :iphoneX="isIphoneX" :current="currentTabIndex" :cartNumber="cartNums" @click="tabClick"></tab-bar>
  </div>
</template>

<script>
import http from '@/config/api'
import cartHttp from '@/config/cartApi'
import storage from '@/utils/storage'
import {getArrayIndex} from '@/utils';
import {addOrder} from '@/config/orderApi'
import goodsList from '@/components/goodsList'
import carts from '@/components/carts'
import emptyPage from '@/components/empty'
import mask from '@/components/mask'
import serviceModal from '@/components/serviceModal'
import { getImgUrl, deteleObject } from '@/utils'
import skeleton from '@/components/home/skeleton'

import {
        mapState,
        mapMutations
    } from 'vuex';

let startPoint = {};

export default {
  name: "home",
  components: {
    goodsList,
    mask,
    carts,
    emptyPage,
    serviceModal,
    skeleton
  },
  data(){
    return {
      list: [],
      listCount: 0,
      // 左侧商品列表
      leftList:[],
      leftListHeight : 0,
      // 右侧商品列表
      rightList:[],
      rightListHeight : 0,
      columnWidth: 336,//单位px
      imgWidth: 288,//单位px

      cartGoodList: [],//用户已有的购物车商品列表
      emptyTitle: '暂未上商品，敬请期待！',
      nonetworkTitle: '网络异常，请刷新重试',
      loadingType: 0,
      isShowLoading: true, // 是否加载动画
      showMask: false,
      good: {
        id: '',
        number: 1,
        name: '索尼',
        img: '',
        price: '',
        skus: []
      },
      options: {
        // categoryId: $categoryId,
        fromPos: '',
        limit: 10
      },
      detail: {},
      isNonetwork: false,
      isShowService: false,
      currentTabIndex: 0,
      cartNums: storage.get('cartNums'),
      isOnShow: false,
      showMoveDot: [],//控制下落的小圆点显示隐藏
      elLeft: 0,
      elTop: 0,
      cartAnimation: false, // 购物车动画
      showBall: false, // 小球是否显示
      animationY: '', // 动画Y
      animationX: '', // 动画X
      bottomY: '', // 动画Y
      bottomX: '', // 动画X
      linePos: {},
      scrollTop: 0,
      animationData: {},
      buttonTop: 380,
      buttonLeft: 310,
      windowHeight: '',
      windowWidth: '',
      disableScroll: false,
      disableOnBuy: false
    }
  },

  onShareAppMessage(res) {
    return {
      title: '微信分享',
      path: '/pages/home'
    }
  },
  onLoad(){
    wx.showShareMenu({
      withShareTicket: true
    })
    let _index = this.$parseURL().tabIndex;
    this.currentTabIndex = _index;

    this.$store.commit('showTabLoading', true);
    this.isNonetwork = storage.get('isNonetwork')?true:false
    
    let _this = this;

    this.$nextTick(function(){
      _this.getGoodList();
      wx.getSystemInfo({
        success: async (res) => {
          _this.bottomX = parseInt(res.windowWidth/4 * 2 + (res.windowWidth/4)/2); // 结束位置X
          _this.bottomY = res.windowHeight; // 结束位置Y
          _this.windowHeight = res.windowHeight
          _this.windowWidth = res.windowWidth
          
        }
      })
      _this.busPos = {};
      _this.busPos['x'] = _this.bottomX;
      _this.busPos['y'] = _this.bottomY - 30;
    })
  },
  onPageScroll:function(e) {
    this.scrollTop = e.scrollTop;
    //console.log('scrollTop',e.scrollTop)
  },
  onShow(){
    if(this.showMask) {
        this.showMask = false;
        return true;
    }
    if(this.isOnShow){
      this.cartNums = storage.get('cartNums');
    }
    var animation = uni.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
    })
    this.animation = animation
  },
  onHide(){
    this.isOnShow = true;
    this.showMask = false;
  },
  computed: {
    ...mapState(['shopId','userId','isIphoneX']),
    isNoData:function(){
      return this.list && this.list.length==0 || this.isNonetwork
    }
  },
  onPullDownRefresh: function() {
    if(this.disableScroll){
      return;
    }
    storage.delete('isNonetwork')
    this.isNonetwork = storage.get('isNonetwork')?true:false
    this.clearCartNums();
    this.getGoodList();
  },
  onReachBottom(){
    if(this.disableScroll){
      return;
    }
    this.$store.commit('showTabLoading', true);
    this.getMoreGoodList();
  },    
  methods:{
    initList(){
      this.list= []
      this.listCount = 0
      this.leftList= []
      this.rightList= []
      this.leftListHeight = 0
      this.rightListHeight = 0
    },
    onBuy(e,obj,isShowMove){
      this.disableOnBuy = true
      this.detail = obj;
      this.good = {
        id: obj.id,
        number: 1,
        name: obj.title,
        img: obj.bannerImgs[0],
        price: obj.price,
        skus: obj.skus,
        stock: obj.stock,
        isSelect: false
      }
      this.showMoveDot = [...this.showMoveDot, isShowMove];
      console.log('e',e);
      this.elLeft = e.detail.x;
      this.elTop = e.detail.y;
      console.log('bus',this.bottomX);
      console.log('bus',this.bottomY);
      this.getCartList(obj);
      //this.onSetAnimation(this.getCartList,obj)
    },
    onSetAnimation(obj) {
      if(obj.stock<1){
        this.getCartList(obj);
      }else{
        let _this = this;
        this.showBall = true
        this.rotateAndScale();
        setTimeout(() => {
          //_this.showBall = true
          _this.norotateAndScale();
          setTimeout(() => {
            _this.rotateAndScale();
          }, 700);
        }, 300);
      } 
    },
    // 定义动画内容
    rotateAndScale() {
        // 定义动画内容
        this.animation.translate(0,-10).scale(0, 0).opacity(0).step()
        // 导出动画数据传递给data层
        this.animationData = this.animation.export()
    },
    norotateAndScale() {
        this.animation.translate(0,-80).scale(1.2, 1.2).opacity(1).step()
        this.animationData = this.animation.export()
    },
    buttonStart: function (e) {
      this.disableScroll = true;
      console.log('e',getCurrentPages());
      startPoint = e.changedTouches[0]
    },
    buttonMove: function (e) {
      var endPoint = e.changedTouches[e.changedTouches.length - 1]
      var translateX = endPoint.clientX - startPoint.clientX
      var translateY = endPoint.clientY - startPoint.clientY
      startPoint = endPoint
      var buttonTop = this.buttonTop + translateY
      var buttonLeft = this.buttonLeft + translateX
      //判断是否移动超出屏幕
      if (buttonLeft+68 >= this.windowWidth){
        buttonLeft = this.windowWidth-68;
      }
      if (buttonLeft<=0){
        buttonLeft=0;
      }
      if (buttonTop<=0){
        buttonTop=0
      }
      if (buttonTop + 76 >= this.windowHeight){
        buttonTop = this.windowHeight-76;
      }
      this.buttonTop = buttonTop;
      this.buttonLeft = buttonLeft;
    },
    buttonEnd: function (e) {
      this.disableScroll = false;
    },

    onDetail(obj){
      this.$openPage({
        name: 'goods_detail',
        query: {
          goodsId: obj.id,
          prePage: 1
        }
      })
    },

    async addCartGoods(obj){
      let _cartGoods = this.cartGoodList;
      let hasObj = []
     console.log('num1',_cartGoods);
     console.log('currentobj',obj);
      if(_cartGoods && _cartGoods.length>0){
          hasObj = _cartGoods.filter(item=>{
            return item.id == obj.skus[0].id;
          })
          if(hasObj && hasObj.length>0){
            for(let i in _cartGoods){
                if(_cartGoods[i].id == obj.skus[0].id){
                  _cartGoods[i].number+= 1;
                  this.checkAddCart(_cartGoods[i].number, obj);
                }
            }
            this.cartGoodList = _cartGoods;
          }else{
            this.checkAddCart(obj.number, obj);
          }
      }else{
        this.checkAddCart(obj.number, obj);
      }
    },

    checkAddCart(num = 1, obj){
      if(num > obj.stock){
          this.$store.commit('setWin', {
              content: `商品库存不足了啦！减少数量或者选择其他商品`,
              type:"alert",
              confirmText: '我知道了',
              confirmColor:'#D24319',
              callBack:(val) => { this.$closeWindow(); }
          });
          this.disableOnBuy = false
          return;
      }
      
      this.addCartRequest(obj);
    },

    async addCartRequest(obj){
      let data = {
        skuId: obj.skus[0].id,
        num: 1
      }
      this.disableOnBuy = false
      let res = await cartHttp.onAddCart(data);
      if(res.num && res.num>0){
        console.log('addCart1',res.num);
        this.getAddressList();
        this.getCartList();
        this.onSetAnimation(obj);
      }else{
        this.$store.commit('setWin', {
            content: `加入购物车失败`
        });
      }
    },

    clearCartNums(){ //清楚缓存的购物车角标数量
      // if(this.isNonetwork){
      //   storage.delete('cartNums');
      // }
    },

    //获取购物车数据
    async getCartList(obj) {
        let res = await cartHttp.getUserCart();
        if(res.skus){
          this.cartGoodList = res.skus;
          this.cartGoodList = this.cartGoodList.map(item => ({
            img: getImgUrl(item.bannerImgs[0]),
            number: item.num,
            price: Number(item.price/100).toFixed(2),
            stock: item.stock,
            name: item.title,
            isSelect: false,
            id: item.skuId,
            goodId: item.spuId,
            isStock: false
          }))
          let total = 0;
          for(let i in this.cartGoodList){
            total += this.cartGoodList[i].number
          }
          console.log('total',total);
          storage.set('cartNums', total)
          this.cartNums = total;
        }
        if(obj){
          this.addCartGoods(obj);
        }
        
        console.log('cart',res);
    },

    onRefreshPage(){
      storage.delete('isNonetwork')
      this.isNonetwork = storage.get('isNonetwork')?true:false
      this.clearCartNums();
      this.getGoodList();
    },
    onCloseMark(){
      this.showMask = !this.showMask
    },

    async getGoodList(){
      this.initList();
      this.options.shopId = $shopId;
      this.options.fromPos = '';
      this.loadingType = 0;
      let resultData;
      try {
        resultData = await http.getGoodList(this.options);
        console.log('resultData',resultData);
        if(resultData){
          this.list = this.getFormatGoods(resultData.spus);
          this.options.fromPos = resultData.lastPos
          this.waterfallImage(this.list[0]);
        }
        this.isShowLoading= false;
        this.$store.commit('showTabLoading', false);
        uni.stopPullDownRefresh();//停止下拉刷新
        
      } catch (error) {
        this.isNonetwork = storage.get('isNonetwork')?true:false
        console.log('isnone', this.isNonetwork);
        this.isShowLoading= false;
      }
      //let resultData = await http.getGoodList(this.options);

    },
    async getMoreGoodList() {
      if (this.loadingType!==0) {
        this.$store.commit('showTabLoading', false);
        return false;
      }
      //下拉需重置高度
      this.leftListHeight = 0
      this.rightListHeight = 0

      this.loadingType = 1;
      let resultData = await http.getGoodList(this.options);
      if(resultData){
        console.log('resultData', resultData)
        if (!resultData.spus || resultData.spus.length==0) {//没有数据
          this.loadingType = 0;
          this.$store.commit('showTabLoading', false);
          return;
        }
        this.options.fromPos = resultData.lastPos
        this.list = this.list.concat(this.getFormatGoods(resultData.spus));
        if (resultData.spus && resultData.spus.length<this.options.limit) {//没有数据
          this.loadingType = 2;
        }else{
          this.loadingType = 0;
        }
        this.waterfallImage(this.getFormatGoods(resultData.spus)[0]);
      }
      this.$store.commit('showTabLoading', false);
      
    },

    getFormatGoods(arr){
      let _list = arr.map(item=>{
          return {
            title: item.title,
            bannerImgs: item.bannerImgs,
            categoryId: item.categoryId,
            cateName: item.cateName,
            id: item.id,
            price: Number(item.price/100).toFixed(2),
            stock: item.stock,
            support7Return: item.support7Return,
            unit: item.unit,
            skus: item.skus
          }
      })
      return _list;
    },

    async getAddressList() {
        let res = await http.getAddress();
        let list = res.addresses
        storage.set('addressList', list);
        // 选择地址
        if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].status=='2') {
                    storage.set('addressItem', list[i]);
                }
            }
        }
    },

    onService(){
      this.showMask = true
    },

    tabClick(index){
        this.currentTabIndex = index
    },

    //确认下单
    async checkoutOrder(obj) {
      this.getAddressList();
      uni.navigateTo({
          url: '/pages/order/placeOrder'
      });
    },

    // 向商品列表添加第一张图片
    waterfallImage(obj) {
      if(this.leftListHeight > this.rightListHeight){				//把第一个新数据加到目前更低的栏上，以触发@load="onImageLoad"
        this.rightList.push(obj);
        this.rightList = deteleObject(this.rightList);	
      }else{
        this.leftList.push(obj);
        this.leftList = deteleObject(this.leftList);
      }
    },
    // 图片绑定事件，通过比较左右列表高度，实现瀑布流展示
    onImageLoad: function(e){
        let divWidth = this.columnWidth;			//显示的单栏宽度
        let oImgW = e.detail.width; //图片原始宽度
        let oImgH = e.detail.height; //图片原始高度
        //console.log('e',e.currentTarget);
        //console.log('refs',this.$refs.childGoods)
        let rImgH = divWidth*oImgH/oImgW + 170;	//根据宽高比计算当前载入的图片的高度
        if(rImgH > this.imgWidth){
            rImgH = this.imgWidth;
        }
        //console.log('this.list',this.list.length);
        if(this.listCount==0){
            this.leftListHeight += rImgH;	//第一张图片高度加到LeftListHeight 
            this.listCount++;			//图片索引加1
            if(this.list.length == 1){
              return;
            }
            this.rightList.push(this.list[this.listCount]);
            //console.log('this.listCount',this.listCount);
        }else{
            this.listCount++;
            if(this.listCount>=this.list.length) return;
            //console.log('listCount++',this.listCount);
            this.setListData(rImgH);
        }
    },
    setListData(rImgH){
      if(this.leftListHeight > this.rightListHeight){		//把图片的高度加到目前高度更低的栏中
          this.rightListHeight += rImgH;		//第二张图片高度加到RightListHeight 
      }else{
          this.leftListHeight += rImgH;
      }
      if(this.leftListHeight > this.rightListHeight){
        this.rightList.push(this.list[this.listCount]);
        this.rightList = deteleObject(this.rightList);
      }else{
        this.leftList.push(this.list[this.listCount]);
        this.leftList = deteleObject(this.leftList);
      }
    },
  }
};
</script>
<style>
    page{
      background: rgba(238,238,238,1);
    }
</style>
<style lang="less" scoped>
    .home{
      background: rgba(238,238,238,1);
      min-height: 100vh;
      &.empty{
        background: #fff;
      }
      .content{
        padding: .64rem .8rem;
      }
      .goodsList{
        margin-bottom: 21vw;
        &.iphonex{
          margin-bottom: 27vw;
        }
      }
      .picker-mask{
        position: fixed;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        left: 50%;
        bottom: 0;
        transform: translate(-50%, 0);
        z-index: 3;
      }
      .transform-btn{
        position: fixed;
        bottom: 6vw;
        padding: 0 2.667vw;
        height: 5.8vw;
        left: 60%;
        z-index: 999;
        color: #D24319;
        font-size: 4.267vw;
        text-align: center;
        line-height: 5.8vw;
        .icon-tip-add{
          font-size: 4.267vw;
        }
      }
      .move-btn{
        width: 50px;
        height:50px;
        border-radius:100%;
        position:fixed;
        background:#ff6700;
        line-height:50px;
        font-size:25pt;
        color:#fff
      }
      .good_box{
        position: absolute;
        width: 60rpx;
        height: 60rpx;
        background: red;
        border-radius: 60rpx;
      }
      .btn-service{
        position: fixed;
        right: .266667rem;
        bottom: 43.5vw;
        width: 3.306667rem;
        height: 3.68rem;
        img{
          display: block;
          width: 100%;
          height: 100%;
        }
      }
    }
</style>
