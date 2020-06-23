<template>
    <div class="item">
        <div class="itemDate">
            <div>
                {{itemData.createTime}}
            </div>
            <span>
                {{orderInfo.statusString}}
            </span>
        </div>
        <div @click="goToDetail" v-for="(goods,index) in orderInfo.goodsList" :key="index" class="itemGoodsInfo">
            <img :src="goods.img">
            <div class="goodsName">
                {{goods.title}}
            </div>
            <div class="goodsNum">
                <div class="goodsPrice">
                    <span>¥</span>{{goods.a}}.<span>{{goods.b}}</span>
                </div>
                共{{goods.count}}件商品
            </div>
        </div>
        <div class="operation">
            <span @click="cancelOrder" v-if='orderInfo.status == 1'>
                取消订单
            </span>
            <!-- <span @click="goToDetail" v-if='orderInfo.status > 1'>
                查看订单
            </span> -->
            <formId @callback="goToDetail" :formData="orderInfo" v-if='orderInfo.status == 2' :templSort="templSort">
                <template slot="btn">
                    <button form-type="submit" class="show-detail">
                        查看订单
                    </button>
                </template>
            </formId>
            <span @click="goToDetail" v-if='orderInfo.status > 1 && orderInfo.status != 2'>
                查看订单
            </span>
            <span @click="receivedOrder" v-if='orderInfo.status == 3'>
                去收货
            </span>
            <span @click="onPayOrder" v-if='orderInfo.status == 1' class="onPay" :class="{'active':activeBtn}">去支付</span>
        </div>
    </div>
</template>
<script>
import { getOrderInfo, cancelOrder, receivedOrder, payOrder } from '@/config/orderApi.js'
const statusList = [undefined, '未支付', '已支付', '已发货', '已收货', '订单关闭', '订单完成', '订单取消']
import shopPay from '@/utils/shop_pay'
import {mapMutations} from 'vuex'
import formId from '@/components/formId'

export default {
    props: ['itemData'],
    components: {
        formId
    },
    data() {
        return {
            orderInfo: {},
            activeBtn: true,
            templSort: '1001'
        }
    },
    watch: {
        itemData: {
            handler(newV) {
                this.orderInfo = JSON.parse(JSON.stringify(newV))
            },
            immediate: true
        }
    },
    methods: {
        ...mapMutations({
            addUpdata:'upOrder'
        }),
        goToDetail() {
            uni.navigateTo({
                url: '/pages/order/detail?oid=' + this.orderInfo.orderId
            })
        },
        uporder(status) {
            this.orderInfo.status = status
            this.orderInfo.statusString = statusList[status]
            this.addUpdata()
        },
        cancelOrder() {
            cancelOrder(this.itemData.orderId).then((res) => {
                this.uporder(5)
            })
        },
        receivedOrder() {
            receivedOrder(this.itemData.orderId).then(res => {
                this.uporder(4)
            })
        },
        async onPayOrder() { //支付下单
            console.log('sctiveBtn');
            let _this = this;
            if(!this.activeBtn) return;
            this.activeBtn = false;
            const orderId = this.orderInfo.orderId
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
                        this.uporder(2)
                    }, (error) => {
                        // this.$store.commit('setWin', {
                        //     content: '支付失败'
                        // });
                        this.$store.commit('showLoading', true);
                        this.paySuccess(error, orderId, false);
                    });
                }
            } catch (e) {
                this.$store.commit('showLoading', false);
                this.activeBtn = true;
            }
        },

        paySuccess(res, id, isSuccess) {
            this.activeBtn = true;
            this.$openPage({
                name: 'payResult',
                query: {
                    orderId: id,
                    isSuccess: isSuccess
                }
            })
        },
    }
};
</script>
<style scoped lang='less'>
.item {
    padding: 0 0 0 4vw;
    background: #fff;
    clear: both;

    >div {
        padding-right: 4vw;
    }
}

.itemDate {
    color: #666666;
    line-height: 10.4vw;
    display: flex;
    box-shadow: 0rem 1px 0rem 0rem rgba(234, 234, 234, 1);
    font-size: 3.47vw;

    >div {
        flex: 1;
    }

    >span {
        color: #D24319
    }
}

.operation {
    text-align: right;
    padding: 4.27vw 0;
    font-size: 3.467vw;

    >span {
        display: inline-block;
        padding: 0 3.07vw;
        line-height: 8vw;
        border: 1px solid #999;
        color: #434343;
        border-radius: 0.8vw;
        margin-left: 3.2vw;
    }
    .show-detail{
        display: inline-block;
        padding: 0 3.07vw;
        line-height: 8vw;
        margin-top: -1vw;
        border: 1px solid #999;
        color: #434343;
        border-radius: 0.8vw;
        margin-left: 3.2vw;
        font-size: 3.47vw;
        vertical-align: middle;
        background: none;
        &:after{
            border:none;
        }
    }

    >.onPay {
        color: #fff;
        background:rgba(204,204,204,1);
        border: 0.267vw solid rgba(204,204,204,1);
        border-radius: 0.8vw;
        &.active{
            color: #D24319;
            background: none;
            border: 0.267vw solid #D24319;
        }
    }
}

.itemGoodsInfo {
    padding-top: 4.27vw;
    display: flex;
    align-items: center;

    >img {
        width: 17.067vw;
        height: 17.067vw;
    }

    .goodsName {
        flex: 1;
        color: #333333;
        line-height: 5.2vw;
        padding: 0 7.47vw 0 3.2vw;
        font-size: 3.47vw;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        height: 10.4vw;
        overflow: hidden;
        word-wrap: break-word;
    }

    .goodsNum {
        color: #999999;
        text-align: right;
        font-size: 2.67vw;

        .goodsPrice {
            font-size: 4.7vw;
            color: #333333;

            >span {
                font-size: 3.2vw;
            }
        }
    }
}
</style>