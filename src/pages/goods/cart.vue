<template>
  <div class="cartMain" :class="{'cartMain empty': isNoData}">
    <div class="content" v-if="cartGoodList && cartGoodList.length > 0">
        <div class="cart-main" :class="{'iphoneBottom':isIphoneX}">
          <!-- <div class="cart-top">
            <div class="top-item">
              <div class="citem-ft">
                  <span class="edit-txt" @click="editBtn" v-if="!editStatus">编辑</span>
                  <span class="edit-txt" @click="editNoBtn" v-else>完成</span>
              </div>
            </div>
          </div> -->
          <div class="cart-item" v-for="(item,index) in cartGoodList" :key="index">

            <div class="cart-ck" @click.stop="onCheckboxItem(item)">
              <radio color="#D14218" class="icon-radiobox" :checked="item.isSelect" />
            </div>

            <!--购物车商品-->
            <div class="goods-box">
              <div class="goods">
                <div class="pic" @click.stop="toDetail(item.goodId)"><img :src="item.img" alt="" /></div>
                <div class="infos">
                  <h4 @click.stop="toDetail(item.goodId)">{{item.name}}</h4>
                  <!-- <p>蓝色</p> -->
                  <div class="price-info">
                    <span>￥{{item.price}}</span>
                    <div class="num-box">
                      <cart-num :value="item.number" :obj="item" :disabled="item.isStock" :max="item.stock" @on-change="bindChange"></cart-num>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!--end 购物车商品-->

          </div>
        </div>
        <div class="cart-bottom" :class="{'iphoneBottom':isIphoneX}">
          <div class="flex-box w100">
            <div class="cart-ckall"  @click="onCheckboxAllItem">
              <radio class="icon-radiobox" color="#D14218" :checked="checkboxAll" />全选
            </div>
            <div class="cart-bottom-right">
                <div class="total-title" v-if="!editStatus">
                    <span class="total-txt">合计：</span>
                    <div class="goods-price"><span>￥</span>{{cartData.amount}}</div>
                </div>
                <div class="btn-onOrder" v-if="!editStatus" @click="settlement" hover-class="btn-hover2">结算<span v-if="Number(selectGoodNums)>0">({{selectGoodNums}})</span></div>
            </div>
          </div>
        </div>
    </div>
    <div class="cart-none" v-else>
      <empty-cart @on-click="goHome" />
    </div>
    <tab-bar :iphoneX="isIphoneX" :current="currentTabIndex" :cartNumber="cartNums" @click="tabClick"></tab-bar>
  </div>
</template>

<script>
import cartNum from '@/components/cartNum'
import emptyCart from '@/components/emptyCart'
import storage from '@/utils/storage'
import { getImgUrl } from '@/utils'
import http from '@/config/cartApi'
import { mapState } from 'vuex';
//import { bgLess } from '@/utils/bg_less';

export default {
data() {
  return {
    cartData: {
      shopName: '野青稞',
      amount: 0
    }, //购物车数据
    cartGoodList: [],//购物车商品列表
    cartGoods: [],//缓存购物车商品列表
    cartIds: [], //选中ids
    selectGoodNums: '0',//选中商品的数量
    checkboxAll: false, //全选按钮
    total: 0.0, //总价
    goSettlement: false, //去结算按钮
    cartId: '',
    cartNum: '',
    isLoad: false,
    editStatus: false,
    goods_stocks_warn: 100,
    disabled: false,
    isOnShow: false,
    currentTabIndex: 2,
    cartNums: storage.get('cartNums')
  }
},
components: { cartNum, emptyCart},

computed: {
  ...mapState(['isIphoneX']),
  isNoData:function(){
    return this.cartGoodList && this.cartGoodList.length==0
  }
},

onLoad(){
  let _index = this.$parseURL().tabIndex;
  this.currentTabIndex = _index;
  this.$store.commit('showTabLoading', true);
  this.getCartList(true);
},

onShow(){
  if(this.isOnShow){
    let _index = this.$parseURL().tabIndex;
    this.currentTabIndex = _index;
    this.$store.commit('showTabLoading', true);
    this.getCartList(true);
  }
},

// onLaunch(){
//   this.$store.commit('showLoading', true);
//   this.getCartList(true);
// },

onHide(){
  this.isOnShow = true;
},
methods: {
  tabClick(index){
      this.currentTabIndex = index
  },
  goHome(){
    this.$openPage({
        name: 'home'
    })
  },
  toDetail(id){
    this.$openPage({
      name: 'goods_detail',
        query: {
          goodsId: id,
          prePage: 1
        }
    })
  },

  
  //去结算
  settlement: function() {
    storage.delete('buyGoods')
    if(this.cartData.amount && this.cartData.amount>0){
      storage.set('buyGoods', storage.get('cartGoods'))
      storage.set('buyType', 1)
      this.$openPage({
          name: 'placeOrder'
      })
    }else{
      this.$store.commit('setWin', {
          content: `请选择您所需要购买的商品～`,
          type:"alert",
          confirmText: '我知道了',
          confirmColor:'#D24319',
          callBack:(val) => { this.$closeWindow(); }
      });
      return;
    }
  },

  goodsDetail(id){

  },

  //获取购物车数据
  async getCartList(isSelect) {
      let res = await http.getUserCart();
      if(res){
        this.cartGoodList = res.skus;
        this.cartGoodList = this.cartGoodList.map(item => ({
          img: getImgUrl(item.bannerImgs[0]),
          number: item.num,
          price: Number(item.price/100).toFixed(2),
          stock: item.stock,
          name: item.title,
          isSelect: isSelect?true:false,
          id: item.skuId,
          goodId: item.spuId,
          isStock: false
        }))
      }
      
      this.mergeCacheCartGoods();//已缓存购物车商品更新
      console.log('cart',res);
  },

  mergeCacheCartGoods: function(){
    let _cartGoods = storage.get('cartGoods');
    let totalNum = 0;
      if(_cartGoods){
        let _list = this.cartGoodList;
        for(let i in _list){
          let _obj = _list[i];
          for(let j in _cartGoods){
            if(_obj.id == _cartGoods[j].id){
              _list[i].isSelect = _cartGoods[j].isSelect;
              _list[i].isStock = _cartGoods[j].isStock;
            }
          }
          totalNum += _obj.number
        }
        this.cartGoodList = _list;
      }else{
        for (let key in this.cartGoodList) {
          let obj = this.cartGoodList[key];
          totalNum += obj.number;
        }
      }
      console.log('cartmerge', totalNum);
      this.isAllCheckbox()
      this.setCartNumsData();
      storage.set('cartNums', totalNum)
      this.cartNums = totalNum;
      //this.$store.commit('setCartNums', totalNum);
  },


  //是否全选
  isAllCheckbox: function() {
    let _this = this
    let cartData = _this.cartGoodList
    let goSettlement = false
    let flag = true
    for (let key in cartData) {
      if (!cartData[key].isSelect) {
        flag = false
      }else{
        goSettlement = true
      }
    }
    if (cartData.length <= 0) {
      flag = false
    }
    console.log('flag',_this.cartGoodList);
    console.log('flag',flag);
    _this.checkboxAll = flag
    _this.goSettlement = goSettlement
  },
  
  //设置刷新数据
  setCartNumsData: function() {
    let _this = this
    let cartList = _this.cartGoodList
    let cartIds = [], totalPrice = 0, _cartGoods = [], selectGoodNums = 0;
    for (let key in cartList) {
      let obj = cartList[key];
      if (obj.isSelect) {
        cartIds.push(obj.id);
        _cartGoods.push(obj);
        totalPrice += Number(obj.price) * obj.number;
        selectGoodNums += obj.number;
      }
    }
    _this.cartIds = cartIds
    _this.cartGoodList = cartList; //购物车列表
    _this.cartGoods = _cartGoods; //缓存已选中的购物车商品列表
    console.log('cartLength',cartIds.length);
    if (cartIds.length == 0) {
      this.cartData.amount = '0.00'
      this.selectGoodNums = '0';
      storage.delete('cartGoods');
      this.checkboxAll = false;
    } else {
      if(cartIds.length == this.cartGoodList.length){
        this.checkboxAll = true;
      }else{
        this.checkboxAll = false;
      }
      console.log('totalPrice',totalPrice);
      this.cartData.amount = Number(totalPrice).toFixed(2)
      if(selectGoodNums>999){
        this.selectGoodNums = '999+';
      }else{
        this.selectGoodNums = selectGoodNums+'';
      }
      storage.set('cartGoods', _this.cartGoods)
    }
    console.log('list', _this.cartGoodList);
  },

  onCheckboxItem: function(obj){
    if(obj.isSelect){
      this.cartGoodList = this.cartGoodList.map(item=>{
        if(obj.id == item.id){
          item.isSelect = false;
        }
        return item;
      })
    }else{
      this.cartGoodList = this.cartGoodList.map(item=>{
        if(obj.id == item.id){
          item.isSelect = true;
        }
        return item;
      })
    }
    this.setCartNumsData();
  },

  //全选操作
  onCheckboxAllItem: function() {
    if(this.checkboxAll) {
      this.checkboxAll = false
      this.setAllCheckbox(false)
    } else {
      this.checkboxAll = true
      this.setAllCheckbox(true)
    }
  },

  //全选设置
  setAllCheckbox: function(e) {
    let _this = this
    if (e) {
      //全选
      _this.cartGoodList = _this.cartGoodList.map(item=>{
        item.isSelect = true;
        return item;
      })
      console.log('cartData',_this.cartGoodList);
    } else {
      //全不选
      _this.cartGoodList = _this.cartGoodList.map(item=>{
        item.isSelect = false;
        return item;
      })
    }
    _this.setCartNumsData()
    _this.isAllCheckbox()
  },


  //购物车数量调整
  bindChange(obj) {
    let _this = this
    console.log('item',obj)
    let id = obj.item.id;
    if(obj.type==='subtract'){
      if(obj.isMin){
        _this.delCartGood(id);
      }else{
        _this.setCartNum(id, obj.num, obj.item);
      }
    }else{
      _this.setCartNum(id, obj.num, obj.item);
    }
  },


  //设置购物车数量
  setCartNum: function(id, nums, obj) {
      let data = {
        skuId: id,
        num: nums
      }
      let res = http.onUpdateCart(data);
      if(res){
        this.resetCartGoodNumber(id,nums);
      }
  },

  //删除事件
  delCartGood(id) {
    let data = {
      skuId: id
    }
    let _this = this;
    _this.$store.commit('setWin', {
      content: `确定删除所选商品吗？`,
      type:"alert",
      confirmColor:'#D24319',
      cancel: true,
      callBack:(val) => {
        if(val=='ok'){
          _this.removeCartGood(id);
          http.onRemoveCart(data).then(res=>{
            if(res){
              console.log('removeGoods');
            }
          })
        }
      }
    });
  },

  removeCartGood: function(id){
    this.$store.commit('showLoading', true);
    let cartData = this.cartGoodList;
    for (let key in cartData) {
      if (cartData[key].id == id) {
        console.log(cartData[key].id);
        cartData.splice(key,1);
      }
      console.log(key);
    }
    console.log(cartData);
    this.cartGoodList = cartData;
    console.log('removeList', this.cartGoodList);
    this.mergeCacheCartGoods();
    this.$store.commit('showLoading', false);
  },

  resetCartGoodNumber: function(id,nums){
    this.$store.commit('showLoading', true);
    let cartData = this.cartGoodList;
    for (let key in cartData) {
      if (cartData[key].id == id) {
        cartData[key].number = nums
      }
    }
    this.cartGoodList = cartData;
    this.mergeCacheCartGoods();
    this.$store.commit('showLoading', false);
  },
 
  //点击编辑
  editBtn: function() {
    this.editStatus = true
  },
  //点击完成
  editNoBtn: function() {
    let _this = this
    this.editStatus = false
    let isSelect = false
    for (let i in _this.cartGoodList) {
      if (_this.cartGoodList[i].isSelect) {
        isSelect = true
        break
      }
    }
    if (isSelect) {
      _this.getCartList()
    }
  },
}
}
</script>
<style>
page{
  background: rgba(238,238,238,1);
  height: 100vh;
}
</style>
<style lang="less" scoped>
    .cartMain{
      background: rgba(238,238,238,1);
      min-height: 100vh;
      &.empty{
        background: #fff;
      }
    }
  .content{
    padding: 20rpx 0;
    background: rgba(238,238,238,1);
    min-height: 100%;
    .flex-box{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cart-none{
      background: #fff;
    }
    .icon-radiobox{
      transform: scale(0.8,0.8)
    }
    .cart-bottom {
      bottom: 13.6vw;
      z-index: 99;
      border-radius:1.067vw 1.067vw 0px 0px;
      width: 100%;
      margin: 0;
      padding: 0 .32rem 0 0;
      background-color: #fff;
      position: fixed;
      overflow: hidden;
      border-bottom: 1px solid rgba(238,238,238,1);
      &.iphoneBottom{
        bottom: 18.8vw;
      }
      .cart-ckall{
        margin-left: .8rem;
        color: #434343;
        font-size: .64rem;
        margin-top: -0.267vw;
      }
      
      .cart-bottom-right {
        overflow: hidden;
        flex: 1;
        text-align: right;
        margin-right: .32rem;
        padding: 2.133vw 0;
        .total-title{
          display: inline-block;
          height: 100%;
          margin-right: .533333rem;
          font-size: .64rem;
          .total-txt{
            margin-top: -0.267vw;
          }
          .goods-price{
            display: inline;
            color: #343434;
            font-size: .8rem;
            span{
              font-size: .64rem;
            }
            
          }
        }
        .btn-onOrder{
          display: inline-block;
          background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
          border-radius: .213333rem;
          font-size: .746667rem;
          color: #fff;
          width: 5.973333rem;
          height: auto;
          line-height: 10.133vw;
          text-align: center;
        }

      }
    }
    
    
    .cart-main{
      background: #fff;
      box-shadow:0px 2px 6px 0px rgba(238,238,238,1);
      border-radius: .426667rem;
      margin-bottom: 28vw;
      &.iphoneBottom{
        margin-bottom: 33.6vw;
      }
      .cart-top{
        border-bottom: 1px solid #EAEAEA;
        margin-bottom: .64rem;
        .top-item{
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 2.613333rem;
          line-height: 2.613333rem;
          
          .ckitem-hd{
            max-width: 1.173333rem;
            min-width: 1.173333rem;
          }
          .edit-txt{
            font-size: .693333rem;
          }
        }
        
      }
      .cart-item {
        display: flex;
        padding: 1.066667rem 0 0 .8rem;
        &:last-child{
          .goods-box{
            border-bottom: 0;
          }
        }
        .cart-ck{
          height: 24vw;
          line-height: 24vw;
          vertical-align: middle
        }
        .goods-box{
          flex: 1;
          margin-right: .8rem;
          padding-bottom: .8rem;
          margin-left: .3rem;
          border-bottom: 1px solid rgba(234,234,234,1);
        }
        .goods{
          display: flex;
          flex: 1;
          .pic{
            width: 24vw;
            height: 24vw;
            background: rgba(248,248,248,1);
            text-align: center;
            position: relative;
            img{
              display: block;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              max-width: 80%;
              max-height: 80%;
              box-sizing: border-box;
              outline: none;
            }
          }
          .infos{
            margin-left: .853333rem;
            flex: 1;
            h4{
              color: #999;
              font-size: .746667rem;
              overflow: hidden;
              text-overflow: ellipsis;
              -webkit-line-clamp: 2;
              line-height: 4.8vw;
              color: rgb(51, 51, 51);
              display: -webkit-box;
              -webkit-box-orient: vertical;
              position: relative;
              white-space: pre-wrap;
              word-wrap: break-word;
              height: 9vw;
            }
            p{
              margin-top: .266667rem;
              font-size: .64rem;
              margin-right: .266667rem;
              color: rgb(245, 172, 71);
            }
            .price-info{
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              height: 15vw;
              span{
                display: inline-block;
                font-size: .746667rem;
                color: #343434;
                font-weight: normal;
                height: 6.9334vw;
                vertical-align: middle;
              }
              .num-box{
                height: 1.386667rem;
                font-size: .693333rem;
                margin-right: -.4rem;
              }
            }
          }

        }

      }
    }

  }
</style>
