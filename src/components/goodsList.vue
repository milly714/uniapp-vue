<template>
   <div class="goods-list clearfix">
        <div class="leftList">
            <div class="item" v-for="(item,index) in leftList" :key="index">
                <div class="pic" @click.stop="onDetail(item)">
                <img :src="onShowImg(item.bannerImgs[0])" @load="onImageLoad" alt="" />
                </div>
                <div class="info" v-if="!isTapClick" @click.stop="onBuy($event,item)">
                    <h4 class="name">{{item.title}}</h4>
                    <div class="text">
                        <p><span>￥</span>{{item.price || 0}}</p>
                        <div class="icon-buy-btn">
                            <img :src="iconCartImg" alt="" />
                        </div>
                    </div>
                </div>
                <div class="info" v-if="isTapClick">
                    <h4 class="name">{{item.title}}</h4>
                    <div class="text">
                        <p><span>￥</span>{{item.price || 0}}</p>
                        <div class="icon-buy-btn">
                            <img :src="iconCartImg" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="rightList" v-if="rightList&&rightList.length>0">
            <div class="item" v-for="(item,index) in rightList" :key="index">
                <div class="pic" @click.stop="onDetail(item)">
                <img :src="onShowImg(item.bannerImgs[0])" @load="onImageLoad" alt="" />
                </div>
                <div class="info" v-if="!isTapClick" @click.stop="onBuy($event,item)">
                    <h4 class="name">{{item.title}}</h4>
                    <div class="text">
                        <p><span>￥</span>{{item.price || 0}}</p>
                        <div class="icon-buy-btn">
                            <img :src="iconCartImg" alt="" />
                        </div>
                    </div>
                </div>
                <div class="info" v-if="isTapClick">
                    <h4 class="name">{{item.title}}</h4>
                    <div class="text">
                        <p><span>￥</span>{{item.price || 0}}</p>
                        <div class="icon-buy-btn">
                            <img :src="iconCartImg" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
</template>

<script>
    import { getImgUrl } from '@/utils'
    const iconCart = require('../assets/icon_cart.png')
export default {
    name: "goods-list",
    data(){
        return {
            options: {},
            columnWidth: 336,//单位px
            imgWidth: 288,//单位px
            dropImage: '',
            iconCartImg: iconCart
        }
    },
    props: {
        list: {
            default: [],
            type: Array
        },
        leftList: {
            default: [],
            type: Array
        },
        rightList: {
            default: [],
            type: Array
        },
        isTapClick: {
            default: false,
            type: Boolean
        }
    },
    onShow(){
        this.waterfallImage();
    },
    methods:{
        onBuy($event,item){
            let isShowMove = true;
            console.log('item',item);
            this.dropImage = this.onShowImg(item.bannerImgs[0]);
            this.$emit('onBuy', $event, item, isShowMove)
        },
        onDetail(item){
            this.$emit('onDetail',item)
        },
        onShowImg(img){
            return getImgUrl(img)
        },
        onImageLoad: function(e){
            this.$emit('onLoadImg', e)
        },
        beforeEnter (el) {
            this.$emit('beforeEnter', el)
        },
        afterEnter (el) {
            this.$emit('afterEnter', el)
        }, 
        
    }
};
</script>
<style>
    .move_dot{
        width: 10.667vw;
        height: 10.667vw;
        position: fixed;
    }
    .move_dot img{
        width: 10.667vw;
        height: 10.667vw;
        border-radius: 50%;
    }

</style>
<style lang="less" scoped>
   .clearfix:before, .clearfix:after {
        display: table;
        line-height: 0;
        content: "";
      }
        .clearfix:after {
            clear: both;
        }
      .goods-list{
        .leftList{
            margin:0;
            width: 44.8vw;
            float: left;
            position: relative;
        }
        .rightList{
            margin-left: 47.2vw;
            width: 44.8vw;
            float: right;
            position: absolute;
        }
        .item{
          background: #fff;
          margin-bottom: 2.133vw;
          padding: 3.2vw;
          border-radius: 1.067vw;
          .pic{
              width: 38.4vw;
              height: 38.4vw;
              max-height: 38.4vw;
              text-align: center;
              position: relative;
              margin: 0 auto;
              img {
                  display: block;
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  max-width: 100%;
                  max-height: 100%;
                  box-sizing: border-box;
                  outline: none;
              }
          }
          .info{
              padding: .64rem 0 0 0;
              .name{
              overflow : hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              font-size: .7rem;
              color: #434343;
              max-height: 10.4vw;
              }
              .text{
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 0.8vw;
              p{
                  color: #D24319;
                  font-size: .8rem;
                  span{
                      display: inline-blck;
                      font-size: .533333rem;
                  }
              }
              .icon-buy-btn{
                  width: 1.493333rem;
                  height: 1.493333rem;
                  margin: 0 0 0 1.266667rem;
                  display: block;
                  img{
                      width: 100%;
                      height: 100%;
                  }
              }
            }
          }
        }
    }
</style>
