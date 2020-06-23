<template>
        <div class="pay-result">
          <div class="pic">
            <img v-show="isSuccess" src="../../assets/pay_success.png" alt="" />
            <img v-show="!isSuccess" src="../../assets/pay_fail.png" alt="" />
            <img v-show="isPayLoading" src="../../assets/paying.png" alt="" />
          </div>
          <div class="info fail" v-if="!isSuccess">
            <h3>支付失败</h3>
            <p>最后一步出了问题，请尝试重新支付</p>
          </div>
          <div class="info" v-if="isSuccess">
            <h3>支付成功</h3>
            <p>感谢您的购买,我们会尽快发货的</p>
          </div>
          <div class="info loading" v-if="isPayLoading">
            <h3>支付中</h3>
            <p>你前面还有很多小伙伴在排队哦!</p>
          </div>
          <div class="btn-options" v-if="isSuccess">
            <formId @callback="onOrderDetail" :formData="obj" :templSort="templSort">
                <template slot="btn">
                    <button form-type="submit" class="show-order">
                        查看订单
                    </button>
                </template>
            </formId>
            <formId @callback="goHome" :formData="obj" :templSort="templSort">
                <template slot="btn">
                    <button form-type="submit" class="go-home">
                        返回首页
                    </button>
                </template>
            </formId>
            <!-- <a class="show-order" @click="onOrderDetail">查看订单</a> -->
            <!-- <a class="go-home" @click="goHome">返回首页</a> -->
          </div>
          <div class="btn-options" v-if="!isSuccess">
            <a class="show-order" @click="onOrderDetail">查看订单</a>
            <a class="go-home" @click="goHome">返回首页</a>
          </div>
        </div>
      </template>
      <script>
      import formId from '@/components/formId'
      export default {
        components: {
          formId
        },
        data () {
          return {
            list: [],
            isSuccess: true,
            isPayLoading: false,
            templSort: '1001',
            orderId: '',
            obj: {
              orderId: ''
            }
          }
        },
        computed: {

        },
        methods: {
          onOrderDetail(){
            uni.redirectTo({
                url: '/pages/order/detail?oid=' + this.orderId
            });
          },
          goHome(){
            this.$openPage({
                name: 'home'
            })
          }
        },
        onShow () {
          let _this = this;
          setTimeout(() => {
            _this.$store.commit('showLoading', false);
          }, 500);
          _this.orderId = this.$parseURL().orderId;
          _this.obj.orderId = this.$parseURL().orderId;
          _this.isSuccess = this.$parseURL().isSuccess;
          // this.isSuccess
        },
      }
      </script>
      <style lang="less" scoped>
        .pay-result{
          padding: 2.4rem 0 1.493333rem 0;
          background: #fff;
          height: 100vh;

          .pic{
            width: 4rem;
            height: 2.88rem;
            margin: 0 auto;
            margin-bottom: 1.28rem;
            img{
              width:100%;
              height: 100%;
            }
          }
          .info{
            text-align: center;
            margin-bottom: 2.346667rem;
            h3{
              font-size: .96rem;
              color: #333;
              margin-bottom: .64rem;
            }
            p{
              color: #999;
              font-size: .693333rem;
            }
          }
          .btn-options{
            width: 80%;
            margin: 0 auto;
            text-align: center;
            a{
              display: inline-block;
              width: 7.2rem;
              height: auto;
              line-height: 2.133333rem;
              border-radius: .32rem;
              font-size: .746667rem;
              &.show-order{
                border: 1px solid rgba(210,67,25,1);
                color: #D24319;
                margin-right: 1.28rem;
                background: #fff;
              }
              &.go-home{
                background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
                color: #fff;
              }
            }

            button{
              display: inline-block;
              width: 7.2rem;
              height: auto;
              line-height: 2.133333rem;
              border-radius: .32rem;
              font-size: .746667rem;
              &:after{
                border: none;
              }
              &.button-hover{
                background: none;
              }
              &.show-order{
                border: 1px solid rgba(210,67,25,1);
                color: #D24319;
                margin-right: 1.28rem;
                background: #fff;
              }
              &.go-home{
                background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
                color: #fff;
              }
            }
          }
        }
      </style>