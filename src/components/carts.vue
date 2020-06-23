<template>
    <div class="cart-content"><!--版本迭代当前组件已不再使用-->
        <div class="goods">
        <div class="pic">
            <img :src="onShowImg(detail.bannerImgs[0])" alt="" />
        </div>
        <div class="text">
            <p class="price"><span>￥</span>{{detail.price}}</p>
            <p class="select-text">已选:<span>{{detail.title}}</span></p>
        </div>
        </div>
        <div class="num-info">
        <p class="text">数量</p>
        <div class="selnum">
            <span class="cut" @click="cutNumber" :data-item-index="index">-</span>
            <input :value="item.number" class="number" disabled="true" type="number" />
            <span class="add" @click="addNumber" :data-item-index="index">+</span>
        </div>
        </div>
        <div class="btn-confirm" @click="checkoutOrder">确认</div>
    </div>
</template>
<script>
    import storage from '@/utils/storage'
    import { getImgUrl } from '@/utils'
    export default {
        data(){
            return {
                item: {
                    id: '',
                    number: 1,
                    name: '',
                    img: '',
                    price: '',
                    skus: []
                },
                cartGoods: [],
            }
        },
        props: {
            detail: {
                type: Object,
                default: {}
            },
            cartItem: {
                type: Object,
                default: {
                    id: '',
                    number: 1,
                    name: '',
                    img: '',
                    price: '',
                    skus: []
                }
            }
        },
        onShow(){
            console.log('cart',this.cartItem);
            if(this.cartItem.id){
                this.item = this.cartItem
            }
        },
        methods: {
            // 减少数量
            cutNumber (event) {
                let obj = this.item;
                let number = (obj.number - 1 > 1) ? obj.number - 1 : 1;
                obj.number = number;
                this.item = obj;
            },
            // 增加数量
            addNumber (event) {
                let obj = this.item;
                let number = obj.number + 1;
                if(number > this.detail.stock){
                    this.$store.commit('setWin', {
                        content: `商品库存不足了啦！减少数量或者选择其他商品`,
                        type:"alert",
                        confirmText: '我知道了',
                        confirmColor:'#D24319',
                        callBack:(val) => { this.$closeWindow() }
                    });
                    obj.number = this.detail.stock;
                    return;
                }
                obj.number = number;
                this.item = obj;
                
            },
            //确认下单
            checkoutOrder() {
                console.log('cart',this.cartItem);
                this.cartItem.number = this.item.number;
                this.item = this.cartItem;
                let _cartGoods = storage.get('cartGoods');
                let hasObj = []
                // console.log('_cartGoods',_cartGoods);
                if(_cartGoods && _cartGoods.length>0){
                    for(let i in _cartGoods){
                        if(_cartGoods[i].id == this.item.id){
                            _cartGoods[i].number+= this.item.number;
                            let _number = _cartGoods[i].number;
                            if(_number > this.detail.stock){
                                this.$store.commit('setWin', {
                                    content: `商品库存不足了啦！减少数量或者选择其他商品`,
                                    type:"alert",
                                    confirmText: '我知道了',
                                    confirmColor:'#D24319',
                                    callBack:(val) => { this.$closeWindow(); }
                                });
                                return;
                            }
                        }
                    }
                    this.cartGoods = _cartGoods;
                    hasObj = _cartGoods.filter(item=>{
                        return item.id == this.item.id;
                    })
                }
                console.log('item',this.item);
                if(hasObj && hasObj.length==0){
                    if(this.item.number > this.detail.stock){
                        this.$store.commit('setWin', {
                            content: `商品库存不足了啦！减少数量或者选择其他商品`,
                            type:"alert",
                            confirmText: '我知道了',
                            confirmColor:'#D24319',
                            callBack:(val) => { this.$closeWindow(); }
                        });
                        return;
                    }
                    this.cartGoods.push(this.item)
                }
                storage.set('cartGoods', this.cartGoods);
                let opts = {
                    goodsList: this.cartGoods,
                    good: this.item
                }
                this.$emit('on-checkout-order', opts)
            },
            onShowImg(img){
                return getImgUrl(img)
            },

        }
    }
</script>
<style lang="less" scoped>

    .cart-content{
        position: fixed;
        background: #fff;
        padding: .853333rem .8rem;
        left: 0;
        width: 100%;
        z-index: 9999;
        bottom: 0;
        max-height: 100%;
        overflow-y: auto;
        transition: transform 0.3s ease-out;
        -webkit-overflow-scrolling: touch;
        border-top-left-radius: .213333rem;
        border-top-right-radius: .213333rem;
        .btn-confirm{
          margin-top: 1.066667rem;
          background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
          border-radius: .426667rem;
          height: 2.4rem;
          text-align: center;
          color: #fff;
          font-size: .8rem;
          line-height: 2.4rem;
        }
        .goods{
          display: flex;
          padding: .32rem 0;
          align-items: center;
          .pic{
            width: 4.8rem;
            height: 4.8rem;
            text-align: center;
            position: relative;
            background:rgba(248,248,248,1);
            img {
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
          .text{
            margin-left: .64rem;
            .price{
              color: #D24319;
              font-size: .906667rem;
              margin-bottom: .64rem;
              span{
                font-size: .64rem;
              }
            }
            .select-text{
              font-size: .74rem;
              color: #666;
              span{
                  display: inline-block;
                  margin-left: .64rem;
              }
            }
          }

        }
        .num-info{
          padding-top: .8rem;
          display: flex;
          align-items: center;
          justify-content:space-between;
          .text{
            color: #999;
            font-size: .746667rem;
          }
          .selnum{
            width: 6.266667rem;
            height: 1.28rem;
            display: flex;
            .cut{
                width: 1.866667rem;
                height: 100%;
                text-align: center;
                line-height: 1.28rem;
            }
            .number{
              flex: 1;
              height: 100%;
              text-align: center;
              line-height: 1.833333rem;
              background: #F2F2F2;
              color: #666;
              float: left;
            }
            .add{
                width: 2.133333rem;
                height: 100%;
                text-align: center;
                line-height: 1.28rem;
            }
          }
        }
      }
</style>