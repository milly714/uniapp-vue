<template>
    <div class="place-order">
        <div class="border-box">
            <div class="address">
                <div class="user-address"  @click="openAddress(addressItem)" v-if="isShowAddress && addressItem.mobile">
                    <div class="info">
                        <p>{{addressItem.district}}{{addressItem.address}}</p>
                        <span>{{addressItem.salutation}}</span>
                        <span>{{addressItem.mobile}}</span>
                    </div>
                    <div class="arrow-right"></div>
                </div>
                <div class="no-address" @click="openAddress" v-if="!isShowAddress">
                    <p class="txt"><span class="icon-add"></span>添加收货地址</p>
                </div>
            </div>
        </div>
        <div class="border-box">
            <div class="goods" v-for="(goodItem,index) in buyGoods" :key="index">
                <div class="pic">
                    <img :src="goodItem.img" alt="" />
                </div>
                <div class="info">
                    <div class="item">
                        <p class="name">{{goodItem.name}}</p>
                        <p class="price"><span>￥</span>{{goodItem.price || 0}}</p>
                    </div>
                    <div class="model">
                        <p class="tag">暂无</p>
                        <p class="num">x{{goodItem.number}}</p>
                    </div>
                </div>
            </div>
            <p class="good-remark">{{buyGoods.length}}个包裹，我们会尽快安排发货</p>
        </div>
        <div class="border-box">
            <div class="order-price flex-box-center">
                <p>订单金额</p>
                <p>￥{{totalPrice || 0}}</p>
            </div>
        </div>
        <div class="textarea mar-bottom" :class="{'iphoneBottom':isIphoneX}">
            <textarea v-model="remark" maxlength="512" placeholder="有什么需要，请给卖家留言" />
        </div>
        <div class="pay-btn flex-box-center" :class="{'iphoneBottom':isIphoneX}">
            <div class="price"><span>￥</span>{{totalPrice || 0}}</div>
            <!-- <formId @callback="goCheckoutOrder">
                <template slot="btn" class="go-pay-btn">
                    <button form-type="submit" :class="{active:activeBtn}">
                        去支付
                    </button>
                </template>
            </formId> -->
            <div class="go-pay-btn" :class="{active:activeBtn}" @click="goCheckoutOrder">去支付</div>
        </div>

        <!-- 地址列表 -->
        <order-address v-if="addressModel" @change="getAddress" @cancel="cancelSelect" />
        <!-- 选择地址end! -->
    </div>
</template>
<script>
import storage from '@/utils/storage'
import http from '@/config/api'
import {
    addOrder,
    payOrder
} from '@/config/orderApi'
import shopPay from '@/utils/shop_pay'
import {
    getImgUrl
} from '@/utils'
import orderAddress from './components/orderAddress'
import {
    setTitle
} from '@/utils'
import { resetLogin } from '@/config/auth' 
import {
    mapState,
    mapMutations,
    Store
} from 'vuex';

export default {
    components: {
        orderAddress
    },
    data() {
        return {
            list: [],
            isPay: false,
            addressItem: null,
            totalPrice: 0,
            isShowAddress: false,
            addressModel: false,
            activeBtn: true,
            backAddress: 0,
            remark: ''
        }
    },
    computed: {
        ...mapState(['shopId', 'userId', 'isIphoneX']),
        buyGoods: function(){
            return storage.get('buyGoods') || []
        }
    },
    methods: {
        openAddress(item) {
            let _list = storage.get('addressList');
            if (!_list || _list.length == 0) {
                this.$openPage({
                    name: 'editAddress',
                    query: {
                        currentIndex: -1
                    }
                })
            } else {
                storage.set('addressItem', item);
                this.addressModel = true
            }
        },
        async goCheckoutOrder() {
            if(!this.activeBtn) return;
            let res;
            let goods = this.buyGoods;
            goods = goods.map(item => ({
                'skuId': item.id,
                'count': item.number
            }))
            let options = {
                address: {
                    province: this.addressItem.province,
                    city: this.addressItem.city,
                    district: this.addressItem.district,
                    street: this.addressItem.address,
                    address: this.addressItem.address,
                    receiverName: this.addressItem.salutation,
                    tel: this.addressItem.mobile
                },
                goodsList: goods,
                buyType: storage.get('buyType') || 0,
                remark: this.remark
            }
            if(!this.isShowAddress || (!this.addressItem || JSON.stringify(this.addressItem) == "{}")){
                this.$store.commit('setWin', {
                    title: '错误提示',
                    content: '请选择收货地址'
                });
                return;
            };
            if(!goods || goods.length==0){
                this.$store.commit('setWin', {
                    title: '错误提示',
                    content: '没有商品,请去购买商品'
                });
                return;
            };
            this.activeBtn = false;
            this.$store.commit('showLoading', true);
            let selectGoodNums = 0, _selectGoods = this.buyGoods;
            for (let key in _selectGoods) {
                let obj = _selectGoods[key];
                console.log('item',obj);
                selectGoodNums += obj.number;
            }
            
            try {
                res = await addOrder(JSON.stringify(options))
                console.log('res', res);
                if (res.order) {
                    if(storage.get('buyType')==1){
                        storage.delete('cartGoods')
                    }
                    storage.delete('buyGoods')
                    let hasCartNum = storage.get('cartNums')
                    if(hasCartNum && Number(hasCartNum)>0){
                        if(storage.get('buyType')==1){
                            storage.set('cartNums', Number(hasCartNum)-selectGoodNums)
                        }
                    }
                    this.totalPrice = Number(res.order.goodsTotalAmount/100).toFixed(2);
                    this.onPayOrder(res.order.orderId);
                } else {
                    this.$store.commit('setWin', {
                        title: '错误提示',
                        content: '下单失败'
                    });
                    this.activeBtn = true;
                }
            } catch (e) {
                this.$store.commit('showLoading', false);
                // 此处不用处理错误
                // console.log('error', e);
                // this.$store.commit('setWin', {
                //     title: '错误提示',
                //     content: '下单失败'
                // });
                this.activeBtn = true;
            }
        },

        async onPayOrder(orderId) { //支付下单
            let _this = this;
            let options = {
                orderId: orderId
            }
            let res;
            try {
                res = await payOrder(options, orderId);
                if (res) {
                    let _options = res.paymentGatewayParameters;
                    let jsonObj = JSON.parse(_options);
                    await shopPay(jsonObj, (success) => {
                        _this.paySuccess(success, orderId);
                        _this.isPay = true;
                    }, (error) => {
                        // this.$store.commit('setWin', {
                        //     content: '支付失败'
                        // });
                        _this.paySuccess(error, orderId, false);
                        _this.isPay = true;
                    });
                }else{
                    _this.paySuccess(res, orderId, false);
                }
            } catch (e) {
                _this.$store.commit('showLoading', false);
                _this.activeBtn = true;
            }
        },

        paySuccess(res, id, isSuccess) {
            this.activeBtn = true;
            this.$store.commit('showLoading', true);
            this.$openPage({
                name: 'payResult',
                query: {
                    orderId: id,
                    isSuccess: isSuccess
                }
            })
        },

        cancelSelect() {
            this.addressModel = false
            setTitle("确认下单");
        },

        async getAddressList() {
            let res = await http.getAddress();
            let list = res.addresses
            if(list){
                storage.set('addressList', list);
                // 选择地址
                if (list && list.length > 0) {
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].status=='2') {
                            this.addressItem = list[i];
                            storage.set('addressItem', this.addressItem);
                        }
                    }
                }
            }
            
        },

        async getAddress() { //获取地址
            this.addressModel = false
            let addressList = storage.get('addressList');
            if (!addressList || addressList.length==0) {
                this.getAddressList();
            } else {
                this.$store.commit('showLoading', false);
            }

            this.addressItem = storage.get('addressItem');
            if(this.addressItem && JSON.stringify(this.addressItem) != "{}"){
                this.isShowAddress = true
            }
            console.log('thisitem', this.addressItem);
        },

        onShowImg(img) {
            return getImgUrl(img)
        },

        formatGoodTotalPrice(arr) {
            console.log('arr', arr);
            let total = 0;　　
            for (var i = 0; i < arr.length; i++) {　　　　
                let obj = arr[i];
                total += obj.price * obj.number;　　
            };
            return total.toFixed(2);
        },
    },
    onLoad(){
        // 记录下单页返回首页
        // storage.set('homeBack', 1);
        this.totalPrice = this.formatGoodTotalPrice(this.buyGoods);
        console.log('backsss', storage.get('addressItem'));
        let addressObj = storage.get('addressItem');
        if (!addressObj || JSON.stringify(addressObj) == "{}") {
            this.isShowAddress = false;
            this.$store.commit('showLoading', true);
            this.getAddress();
        } else {
            this.isShowAddress = true
            this.addressItem = addressObj
        }
        this.backAddress = this.$parseURL().backAddress;
        if(this.backAddress !='1'){
            this.getAddressList();
        }
    },
    onShow() {
        //打开页面不显示底部弹窗
        if (this.addressModel) {
            this.addressModel = false;
            return true;
        }
    }
}
    </script>
    <style lang="less" scoped>
    .place-order{
       padding: .64rem .8rem;
       .flex-box-center{
        display: flex;
        align-items: center;
        justify-content:space-between;
    }
    .textarea{
        border-radius: 2.13334vw;
        background: #fff;
        padding: 0 2.3vw;
        &.mar-bottom{
            margin-bottom: 2.88rem;
            &.iphoneBottom{
                margin-bottom: 3.6rem;
            }
        }
        textarea{
            color: #666;
            font-size: 3.7vw;
            width: 100%;
            height: 20vw;
            padding: 2.3vw 0;
            word-wrap:break-word;
            background: #fff;
            border: none;
            ::-webkit-input-placeholder { /* WebKit browsers */
                color: #999;
            }

            ::-moz-placeholder { /* Mozilla Firefox 19+ */
                color: #999;
            }

            :-ms-input-placeholder { /* Internet Explorer 10+ */
                color: #999;
            }   
        }
    }
    .border-box{
        background:rgba(255,255,255,1);
        box-shadow: 0px 2px 6px 0px rgba(238,238,238,1);
        border-radius: .426667rem;
        margin-bottom: .586667rem;
        background: #fff;
        
        .address{
            padding: 1.066667rem .853333rem;
            .no-address{
                .txt{
                    color: #434343;
                    font-size: .8rem;
                    font-weight:500;
                    span{
                        display: inline-block;
                        width: .746667rem;
                        height: .746667rem;
                        background: url('../../assets/add.png') no-repeat center;
                        background-size: .746667rem .746667rem;
                        box-sizing: border-box;
                    }
                }
            }
            .user-address{
                display: flex;
                align-items: center;
                justify-content:space-between;
                .info{
                    flex: 1;
                    p{
                        color: #333;
                        font-size: .906667rem;
                        margin-bottom: .533333rem;
                        font-weight:500;
                    }
                    span{
                        display: inline;
                        color: #333;
                        font-size: .74rem;
                        margin-right: 1.066667rem;
                    }
                }
                .arrow-right{
                    width: .853333rem;
                    height: .853333rem;
                    background: url('../../assets/arrow_right.png') no-repeat center;
                    background-size: .853333rem .853333rem;
                    margin-right: -0.266667rem;
                }
            }
        }
        .goods{
            display: flex;
            padding: .853333rem;
            .pic{
                min-width: 4rem;
                height: 4rem;
                background: rgba(248,248,248,1);
                text-align: center;
                position: relative;
                img {
                    display: block;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    max-width: 75%;
                    max-height: 75%;
                    box-sizing: border-box;
                    outline: none;
                }
            }
            .info{
                flex: 1;
                .item{
                    display: flex;
                    align-items: flex-start;
                    justify-content:space-between;
                    margin-left: .64rem;
                    .name{
                        flex: 1;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        font-size: .8rem;
                        color: #333;
                        height: 1.4rem;
                        max-width: 8.6rem;
                    }
                    .price{
                        min-width: 2.666667rem;
                        text-align: right;
                        color: #666;
                        font-size: .8rem;
                        span{
                            display: inline-block;
                            font-size: .69rem;
                        }
                    }
                }
                .model{
                    display: flex;
                    align-items: flex-start;
                    justify-content:space-between;
                    margin-left: .64rem;
                    margin-top: .32rem;
                    .tag{
                        color: #999;
                        font-size: .746667rem;
                    }
                    .num{
                        color: #999;
                        font-size: .746667rem;
                    }
                }
            }
        }
        .good-remark{
            padding: .266667rem .853333rem;
            height: 1.28rem;
            line-height: .82rem;
            color: #999;
            font-size: .74rem;
            background:rgba(250,250,252,1);
            border-radius:0px 0px .626667rem .626667rem;
        }
        .order-price{
            padding: .853333rem;
            p{
                color: #666;
                font-size: .8rem;
            }
        }
    }
    .pay-btn{
        width: 100%;
        padding: .4rem 0;
        text-align: center;
        font-size: 0.42667rem;
        color: #ffffff;
        position: fixed;
        left: 0;
        bottom: 0;
        background-color: #fff;
        &.iphoneBottom{
            padding-bottom: 5.333vw;
        }
        .price{
            padding-left: .8rem;
            font-size: 1.066667rem;
            color: #D24319;
            font-weight: 600;
            span{
                display: inline;
                font-size: .74rem;
                font-weight: normal;
            }
        }
        /** 
        .go-pay-btn{
            margin-right: .8rem;
            button{
                border-radius: .213333rem;
                width: 5.973333rem;
                font-size: .853333rem;
                background:rgba(204,204,204,1);
                color: #fff;
                &:after{
                    border: none;
                }
                &.active{
                    background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
                }
            }
        }**/
        .go-pay-btn{
            margin-right: .8rem;
            color: #fff;
            border-radius: .213333rem;
            width: 5.973333rem;
            padding: .493333rem 0;
            font-size: .853333rem;
            background:rgba(204,204,204,1);
            &.active{
                background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
            }
        }

    }
}
</style>