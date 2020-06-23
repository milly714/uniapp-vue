<template>
  <div class="goodsDetail">
    <div class="detail-top">
      <div class="back" v-if="isShowBackLive" @click="onBack">
        <span class="icon-back"><img src="../../static/icon/icon_back.png" alt="" /></span>
        <div class="text"><span>返回</span><span>直播</span></div>
      </div>
      <swiper class="swiper" 
        interval="5000" 
        duration="1500"	>
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <img :src="onShowImg(item)" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </div>
    <div class="detail-content" :class="{'iphoneX-bottom': isIphoneX}">
      <div class="title">
        <h3>{{good.title || ''}}</h3>
        <p class="price"><span class="icon-money">¥</span>{{good.price || 0}}</p>
      </div>
      <div class="info">
        <h4>商品描述</h4>
        <div v-for="(item,index) in wxParseData" :key="index">
          <wxParseHtml :item="item"/>
        </div>
      </div>
    </div>
    <div class="detail-bottom" :class="{'iphoneX-bottom':isIphoneX}">
      <div class="btn-service" @click="onServiceModal">
        <span class="icon-service"></span>
        <span>联系客服</span>
      </div>
      <div class="btn-options">
        <button class="btn-add-cart" @click="onCart(good)">加入购物车</button>
        <button class="btn-buy" @click="onBuy(good)">立即购买</button>
      </div>
    </div>
    <service-modal v-if="showMask"></service-modal>
    <mask v-if="showMask" @on-click="onCloseMark"></mask>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import http from '@/config/api'
import { getImgUrl } from '@/utils'
import HtmlToJson from '@/components/wxParse/html2json.js';
import wxParseHtml from '@/components/wxParse/index';
import mask from '@/components/mask'
import serviceModal from '@/components/serviceModal'
import cartHttp from '@/config/cartApi'
import storage from '@/utils/storage'

export default {
  data(){
    return {
      bannerList: [],
      goodId: '',
      good: {},
      wxParseData: {},
      wxparseImg: [],
      showMask: false,
      buyGoods: [],
      hasPrePage: 0,
      isShowBackLive: false
    }
  },
  components: {
    wxParseHtml,
    serviceModal,
    mask
  },
  computed: {
    ...mapState(['isIphoneX']),
  },
  methods: {
    async getDetail(that, id){
      let res = await http.getGoodDetail(id)
      this.$store.commit('showLoading', false);
      if(res && res.spu){
        this.good = res.spu;
        this.good.price = Number(this.good.price/100).toFixed(2);
        this.bannerList = this.good.bannerImgs;
        this.good.detailText = res.spu.detailText;
        this.wxParse('article', 'html', res.spu.detailText, that, 5);
        //this.good.detailText = html2json(res.spu.detailText).nodes;
        console.log('detail', this.good.detailText);
        //this.good.detailText = '<video controls="true" autoplay="false" objectFit="cover" show-center-play-btn="false" class="ql-video" src="https://v.qq.com/x/cover/rj8uc45tm8a17wm.html"></video>'

      }
    },

    wxParse(bindName = 'wxParseData', type='html', data='<div class="color:red;">暂无数据</div>', target,imagePadding) {
      var that = target;
      var transData = {};//存放转化后的数据
      if (type == 'html') {
        transData = HtmlToJson.html2json(data, bindName);
        console.log(JSON.stringify(transData, ' ', ' '));
      } else if (type == 'md' || type == 'markdown') {
        var converter = new showdown.Converter();
        var html = converter.makeHtml(data);
        transData = HtmlToJson.html2json(html, bindName);
        console.log(JSON.stringify(transData, ' ', ' '));
      }
      this.wxParseData = transData.nodes;
      this.wxparseImg = transData.imageUrls;
      console.log('this.wxParseData',this.wxParseData);
    },
  
    onShowImg(img){
      return getImgUrl(img)
    },
    onCloseMark(){
      this.showMask = !this.showMask
    },
    onServiceModal(){
      this.showMask = true;
    },
    onBack(){
      wx.navigateBack()
    },
    async onCart(obj){
      let data = {
        skuId: obj.skus[0].id,
        num: 1
      }
      if(!this.checkStock(obj)) return;
      let res = await cartHttp.onAddCart(data);
      if(res.num && res.num>0){
        this.$store.commit('setWin', {
            content: `加入购物车成功`
        });
        this.$openPage({
          name: 'cart',
          query: {
              tabIndex: 2
          }
        })
      }else{
        this.$store.commit('setWin', {
            content: `加入购物车失败`
        });
      }
    },
    onBuy(obj){
      if(!this.checkStock(obj)) return;
      let id = obj.skus[0].id;
      let option = {
        img: this.onShowImg(obj.bannerImgs[0]),
        number: obj.num,
        price: obj.price,
        stock: obj.stock,
        name: obj.title,
        isSelect: false,
        id: id,
        goodId: obj.id,
        isStock: false
      }
      storage.delete('buyGoods')
      this.setCartNumsData(option);
    },
    //设置立即购买商品
    setCartNumsData: function(option) {
      let _this = this, _buyGoods = [],selectGoodNums = 0, totalPrice = 0;
      _this.buyGoods = storage.get('buyGoods'); //缓存已选中的购物车商品列表
      if(_this.buyGoods && _this.buyGoods.length>0){
        let _list = _this.buyGoods;
        for (let key in _list) {
          let obj = _list[key];
          if (obj.id == option.id) {
            obj.number+=1;
          }else{
            option.number = 1;
            _this.buyGoods.push(option);
          }
        }
        _buyGoods = _this.buyGoods;
      }else{
        option.number = 1;
        _buyGoods.push(option);
      }
      storage.set('buyGoods', _buyGoods)
      storage.set('buyType', 0)
      this.$openPage({
        name: 'placeOrder'
      })
    },
    checkStock(obj){
      if(obj.stock<1){
        this.$store.commit('setWin', {
          content: `商品库存不足了啦！请选择其他商品`,
          type:"alert",
          confirmText: '我知道了',
          confirmColor:'#D24319',
          callBack:(val) => { this.$closeWindow();}
        });
        return false;
      }
      return true;
    },
  },
  onShareAppMessage(res) {
    console.log('thisgoodsID',this.goodId);
    let _this = this;
    return {
      title: '商品详情',
      path: '/pages/goods/detail?goodsId='+_this.goodId+'&prePage=1'
    }
  },
  onLoad(option) {
    wx.showShareMenu({
      withShareTicket: true
    })
    console.log('option',option);
    this.$store.commit('showLoading', true);
    this.goodId = this.$parseURL().goodsId || option.goodsId
    this.hasPrePage = this.$parseURL().prePage || option.prePage
    this.isShowBackLive = this.hasPrePage==1?false:true
    this.getDetail(this,this.goodId);
  },
  onShow(){
      if(this.showMask) {
          this.showMask = false;
          return true;
      }
  },
  onHide(){
    this.showMask = false;
  }
};
</script>
<style lang="less" scoped>
  page{
    background: rgba(238,238,238,1);
  }
  .goodsDetail{
    background: rgba(238,238,238,1);
    min-height: 100vh;
    .detail-top{
      position: relative;
      z-index: 11;
      .back{
        position: absolute;
        z-index: 999;
        top: 4.267vw;
        width: 18.133vw;
        height: 13.333vw;
        background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
        border-radius:0px 13.333vw 13.333vw 0px;
        display: flex;
        align-items: center;
        span{
          display: inline-block;
          color: #fff;
          font-size: 3.467vw;
        }
        span.icon-back{
          width: 4.267vw;
          height: 4.267vw;
          img{
            width: 100%;
            height: 100%;
          }
        }
        .text{
            padding: 1.867vw 1.733vw;
            span{
              display: block;
            }
        }
      }
      .swiper{
        width: 100%;
        height: 100vw;
        position: relative;
        z-index: 22;
        max-height: 100vw;
        img{
          display: block;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          outline: none;
        }
      }
    }
    .detail-content{
      padding-bottom: 20vw;
      &.iphoneX-bottom{
        padding-bottom: 25.333vw;
      }
      .title{
        padding: 4.267vw 4vw;
        background: #fff;
        h3{
          color: #333;
          font-size: 4.533vw;
          max-height: 12.667vw;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        p{
          font-size: 4.8vw;
          padding-top: 2.133vw;
          color: #E03813;
          font-weight: bold;
          span.icon-money{
            font-size: 4vw;
            font-weight: normal;
          }
        }
      }
      .info{
        background: #fff;
        margin-top: 2.133vw;
        padding: 4.267vw 4vw;
        h4{
          color: #333;
          font-size: 4vw;
          margin-bottom: 3.2vw;
        }
        p{
          color: #666;
          font-size: 3.467vw;
        }
      }
    }
    .detail-bottom{
      background: #fff;
      position: fixed;
      bottom: 0;
      padding: 2.133vw 4vw 2.133vw 0;
      width: 100%;
      display: flex;
      justify-content:space-between;
      align-items: center;
      box-shadow:0px -0.267vw 0.8vw 0px rgba(0,0,0,0.16);
      &.iphoneX-bottom{
        padding-bottom: 7.466vw;
      }
      .btn-service{
        color: #333;
        font-size: 2.4vw;
        flex:1; 
        span{
          display: block;
          margin: 0 auto;
          text-align: center;
          &.icon-service{
            padding-top: 0.8vw;
            width: 5.333vw;
            height: 4.666vw;
            background: url('../../static/icon/icon_service.png') no-repeat 0;
            background-size: 5.333vw 5.333vw;
          }
        }
      }
      .btn-options{
        button{
          display: inline-table;
          font-size: 3.733vw;
          width: 29.867vw;
          height: auto;
          line-height: 10.133vw;
          border-radius:1.067vw;
          text-align: center;
          &:after{
            border: none;
          }
        }
        .btn-add-cart{
          color: #E03813;
          border: 1px solid rgba(224,56,19,1);
          margin-right: 3.2vw;
          background: #fff;
          font-size: 3.733vw;
        }
        .btn-buy{
          color: #fff;
          background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
          &.button-hover{
            background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
          }
        }
      } 
      
    }
  }
</style>

