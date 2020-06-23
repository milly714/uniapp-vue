<template>
    <div class="order-detail" :class="{iphoneBottom:isIphoneX}">
        <div v-if="orderInfo.status == 1" class="pay-status-box">
            <div class="status-content">
                <div class="info">
                    <span class="icon-pay-status"></span>
                    <span>待付款</span>
                    <p>还需支付 ￥{{orderInfo.payable || 0}}</p>
                </div>
                <div class="icon-txt"><img src="../../assets/order_detail.png" alt="" /></div>
            </div>
            <p class="remark-msg">请在 {{orderInfo.autoCancelTime}}前完成付款，逾期订单将关闭。</p>
        </div>
        <div class="detail-content" :class="{'new-content':orderInfo.status != 1 && orderInfo.status!= 3}">
            <div class="border-box">
                <div class="info">
                    <h3 class="title">订单信息</h3>
                    <div class="text">
                        <p>下单日期：{{orderInfo.createTime || ''}}</p>
                        <p>订单编号：{{orderInfo.orderId || ''}}</p>
                    </div>
                </div>
                <div class="info">
                    <h3 class="title">收货地址</h3>
                    <div class="text">
                        <p>{{orderInfo.address.district || ''}} - {{orderInfo.address.address || ''}}</p>
                        <p><span>{{orderInfo.address.receiverName || ''}}</span><span>{{orderInfo.address.tel || ''}}</span></p>
                    </div>
                </div>
                <div class="info">
                    <h3 class="title">备注留言</h3>
                    <div class="text">
                        <p class="txt-remark">{{orderInfo.remark || '暂无'}}</p>
                    </div>
                </div>
                <div v-if="orderInfo.status > 1" class="info">
                    <h3 class="title">物流信息</h3>
                    <div class="text">
                        <p>物流进度：{{orderInfo.statusString || ''}}</p>
                        <p>物流公司：{{orderInfo.logistics ? orderInfo.logistics[0].logisticsCompany : '暂无'}}</p>
                        <p>快递单号：{{orderInfo.logistics ? orderInfo.logistics[0].expressNumber : '暂无'}} <span v-if="orderInfo.logistics" @click="copyExpressNumber" class="copy">复制</span></p>
                    </div>
                </div>
            </div>
            <div class="border-box">
                <div class="info">
                    <h3 class="title">购物清单</h3>
                    <div class="text border-bottom">
                        <div v-for="(item,index) in orderInfo.goodsList" class="goods-item" :key="index">
                            <div class="pic">
                                <img :src="item.img" alt="" />
                            </div>
                            <div class="goods-info">
                                <div class="item">
                                    <p class="name">{{item.title || ''}}</p>
                                    <p class="price">￥{{item.price || 0}}</p>
                                </div>
                                <div class="model">
                                    <!-- <p class="tag">黑色;均码</p> -->
                                    <p class="num">x{{item.count || 0}}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="good-options">
                        <div class="good-price flex-box-center">
                            <p>商品总金额</p>
                            <p>￥{{orderInfo.payable || 0}}</p>
                        </div>
                        <div class="order-price flex-box-center">
                            <p>订单金额</p>
                            <p>￥{{orderInfo.payable || 0}}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="btn-options" :class="{iphoneBottom:isIphoneX}" v-if="orderInfo.status == 1 || orderInfo.status == 3">
            <span v-if="orderInfo.status == 1" @click="cancelOrder" class="cancel">取消订单</span>
            <span v-if="orderInfo.status == 1" @click="onPayOrder" class="go-pay" :class="{active:activeBtn}">去支付</span>
            <span v-if="orderInfo.status == 3" class="cancel" @click="receivedOrder">确认收货</span>
        </div>
    </div>
</template>
<script>
import {
    getOrderInfo,
    cancelOrder,
    receivedOrder,
    payOrder
} from '@/config/orderApi.js'
import {
    getImgUrl,
    dateFormat
} from '@/utils'
const statusList = [undefined, '待支付', '待发货', '待收货', '已收货', '订单关闭', '订单完成', '订单取消']
import shopPay from '@/utils/shop_pay'
import { mapState } from 'vuex';

export default {
    components: {},
    data() {
        return {
            oid: '',
            orderInfo: {},
            activeBtn: true,
        }
    },
    computed: {
        ...mapState(['isIphoneX']),
    },
    methods: {
        getOrderDetail() {
            this.$store.commit('showLoading', true);
            getOrderInfo(this.oid).then((res) => {
                const order = res.order
                order.goodsList = order.goodsList.map(goods => {
                    goods.img = getImgUrl(goods.bannerImgs.split(',')[0])
                    goods.price = Number(goods.price / 100).toFixed(2)
                    goods.a = goods.price.split('.')[0]
                    goods.b = goods.price.split('.')[1]
                    return goods
                })
                order.createTime
                order.createTime = dateFormat(new Date(order.createTime), 'yyyy-MM-dd hh:mm:ss')
                order.statusString = statusList[order.status]
                order.id = order.orderId
                order.payable = Number(order.payable / 100).toFixed(2)
                order.autoCancelTime = dateFormat(new Date(order.autoCancelTime), 'yyyy-MM-dd hh:mm:ss')
                this.orderInfo = order
                console.log('this.orderInfo', this.orderInfo)
            })
        },
        receivedOrder() {
            receivedOrder(this.oid).then(res => this.getOrderDetail())
        },
        cancelOrder() {
            cancelOrder(this.oid).then(res => this.getOrderDetail())
        },
        copyExpressNumber() {
            uni.setClipboardData({
                data: this.orderInfo.logistics[0].expressNumber,
                success: function() {
                    uni.showToast({
                        title: '复制成功',
                        duration: 2000,
                        icon: 'none'
                    });
                }
            })
        },
        async onPayOrder() { //支付下单
            let _this = this;
            if(!this.activeBtn) return;
            this.activeBtn = false;
            const orderId = this.oid
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
                        this.getOrderDetail()
                    }, (error) => {
                        // this.$store.commit('setWin', {
                        //     content: '支付失败'
                        // });
                        this.$store.commit('showLoading', true);
                        this.paySuccess(error, orderId, false);
                    });
                }
            } catch (e) {
                console.log('e', e)
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
  },
  onLoad(){
    this.oid = this.$mp.query.oid
    this.getOrderDetail()
  },
};
</script>
<style lang='less' scoped>
.order-detail {
    &.iphoneBottom{
        padding-bottom: 25.333vw;
    }
    .pay-status-box {
        padding-top: 5.333vw;
        background: linear-gradient(180deg, rgba(255, 244, 225, 1) 0%, rgba(245, 245, 245, 1) 100%);

        .status-content {
            padding: 0 7.467vw;
            display: flex;
            justify-content: space-between;

            .info {
                span {
                    display: inline-block;
                    font-size: 1.066667rem;
                    color: #FA9F22;
                }

                .icon-pay-status {
                    width: 1.066667rem;
                    height: 1.066667rem;
                    margin-right: .266667rem;
                    background: url('../../assets/order_status.png') no-repeat center;
                    background-size: 1.066667rem 1.066667rem;
                    vertical-align: middle;
                    margin-top: -1.067vw;
                }

                p {
                    margin-top: .266667rem;
                    width: 5.333333rem;
                    color: #333;
                    font-size: .693333rem;
                }

            }

            .icon-txt {
                width: 30.133vw;
                height: 17.733vw;
                position: relative;

                img {
                    width: 90%;
                    height: 100%;
                    display: block;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    max-width: 90%;
                    max-height: 100%;
                    box-sizing: border-box;
                    outline: none;
                }
            }
        }

        .remark-msg {
            margin: 2.133vw .8rem 0 .8rem;
            line-height: 1rem;
            background: rgba(255, 237, 209, 1);
            border-radius: .213333rem;
            font-size: .64rem;
            color: #D47F0A;
            padding: 0.46rem .693333rem
        }
    }

    .flex-box-center {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .new-content {
        padding-bottom: .64rem !important;
    }

    .detail-content {
        padding: .64rem .8rem;
        padding-bottom: 4rem;

        .border-box {
            background: rgba(255, 255, 255, 1);
            box-shadow: 0px 2px 6px 0px rgba(238, 238, 238, 1);
            border-radius: .426667rem;
            padding: 0 .8rem;
            margin-bottom: .426667rem;

            .info {
                border-bottom: 1px solid rgba(234, 234, 234, 1);

                .title {
                    color: #343434;
                    font-size: 4vw;
                    padding-top: .8rem;
                    font-weight: 900;
                    margin-bottom: .853333rem;
                }

                .text {
                    padding-bottom: 1.066667rem;

                    p {
                        color: #999;
                        font-size: .693333rem;
                        padding-bottom: .64rem;
                        line-height: 4vw;
                        vertical-align: middle;
                        &.txt-remark{
                            word-wrap:break-word;
                        }

                        &:last-child {
                            padding-bottom: 0;
                        }

                        span {
                            display: inline;
                            padding-right: .64rem;
                        }

                        .copy {
                            display: inline-block;
                            font-size: 2.67vw;
                            position: relative;
                            top: -0.4vw;
                            padding:0;
                            color: #666666;
                            margin-left: 2.13vw;
                            width:9.6vw;
                            height:4.27vw;
                            line-height: 4.27vw;
                            text-align: center;
                            background:rgba(245,245,245,1);
                            border-radius:2.2vw;

                        }
                    }

                    &.border-bottom {
                        border-bottom: 1px solid rgba(234, 234, 234, 1);
                    }

                    .goods-item {
                        display: flex;

                        .pic {
                            width: 3.413333rem;
                            height: 3.413333rem;
                            background: rgba(248, 248, 248, 1);
                            padding: .426667rem;
                            text-align: center;

                            img {
                                width: 90%;
                                max-height: 100%;
                            }
                        }

                        .goods-info {
                            flex: 1;

                            .item {
                                display: flex;
                                align-items: flex-start;
                                justify-content: space-between;
                                margin-left: .64rem;

                                .name {
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    display: -webkit-box;
                                    -webkit-line-clamp: 2;
                                    -webkit-box-orient: vertical;
                                    font-size: .693333rem;
                                    color: #666;
                                    height: 1.6rem;
                                }

                                .price {
                                    color: #666;
                                    font-size: .746667rem;
                                }
                            }

                            .model {
                                display: flex;
                                align-items: flex-start;
                                justify-content: space-between;
                                margin-left: .64rem;
                                margin-top: .32rem;

                                .tag {
                                    color: #999;
                                    font-size: .586667rem;
                                }

                                .num {
                                    color: #999;
                                    font-size: .64rem;
                                }
                            }
                        }
                    }
                }

                .good-options {
                    margin-top: .853333rem;

                    .good-price {
                        p {
                            color: #666;
                            font-size: .693333rem;
                        }
                    }

                    .order-price {
                        margin-top: .48rem;
                        padding-bottom: 1.066667rem;

                        p {
                            color: #333;
                            font-size: .746667rem;
                        }
                    }

                }

                &:last-child {
                    border-bottom: 0;
                }
            }
        }
    }

    .btn-options {
        width: 100%;
        position: fixed;
        bottom: 0;
        background: #fff;
        text-align: right;
        margin-right: .64rem;
        left: 0;
        padding: .266667rem .64rem;
        &.iphoneBottom{
            padding-bottom: 5.333vw;
        }

        span {
            display: inline-table;
            font-size: .746667rem;
            width: 5.973333rem;
            border-radius: .16rem;
            line-height: 2.026667rem;
            vertical-align: middle;
            text-align: center;

            &.cancel {
                margin-right: .64rem;
                color: #666;
                border: 1px solid rgba(102, 102, 102, 1);
            }

            &.confirm {
                background: linear-gradient(138deg, rgba(219, 50, 29, 1) 0%, rgba(235, 92, 50, 1) 100%);
                color: #fff;
            }
            &.go-pay{
                background:rgba(204,204,204,1);
                color: #fff;
                &.active{
                    background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
                }
            }

        }
    }
}
</style>