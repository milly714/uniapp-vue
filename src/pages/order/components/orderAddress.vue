<template>
        <div>
          <mask @on-click="cancelAddress"></mask>
          <div class="address">
            <div class='addressTitle'>
              <span @click = "cancelAddress">
                取消
              </span>
              选择收货地址
              <span @click="toPagePays">
                确定
              </span>
            </div>
            <radio-group @change="radioChange" class="addressList">
              <label class="addresss" v-for="(item,index) in addressList" :key="index">
                <div class="checkbox">
                  <div>
                    <radio :value="index+''" color="#D14218" :checked="index == current" />
                  </div>
                </div>
                <div class="content">
                  <div class="provinces">
                    {{item.district}}{{item.address}}
                  </div>
                  <div class="people">
                    <span class="name">
                      {{item.salutation}}{{item.sex == "1" ? '先生':'女士'}}
                    </span>
                    <span class="phone">
                      {{item.mobile}}
                    </span>
                  </div>
                </div>

                <div @click="writeAddress(item,index)" class="edit">
                  <img src="../../../static/icon/bianji.png">
                </div>
              </label>
            </radio-group>
            <div @click="toPageAddress" class="bottom" :class="{iphoneBottom: isIphoneX}">
              <img src="../../../static/icon/addres_delete.png" >新增收货地址
            </div>
          </div>
        </div>
      </template>

      <script>
        import storage from '@/utils/storage'
        import { setTitle } from '@/utils'
        import mask from '@/components/mask'
        import http from '@/config/api'
        import {
          mapState,
          mapMutations
      } from 'vuex';

      export default {
        name: 'order-address',
        props: ['change'],
        components: {
            mask
        },
        data() {
          return {
            current: 0,
            addressList: [],
            lists: [],
            status: false,
            district: "",
            getCityName: '' //当前省名字
          }
        },
         computed: {
          ...mapState(['isIphoneX'])
        },
        methods: {
          cancelAddress() {
            this.$emit('cancel')
          },

          writeAddress(item, index) {
            console.log(item, 'item');
            storage.set('editAddress', item);
            this.district = item.area;
            let re = /(?:.*省)?(.*?市)/g;
            if (re.test(this.district)) {
              this.district = RegExp.$1
            }

            this.$openPage({
                name: 'editAddress',
                query: {addressId: item.id, currentIndex: index}
            })
          },

          toPageAddress() {
            storage.delete("editAddress");
            this.$openPage({
                name: 'editAddress',
                query: {currentIndex: -1}
            })
          },

          async getAddress() {
            this.addressList = storage.get('addressList');
            const addressDetail = storage.get('addressItem');
            if (this.addressList) {
              this.addressList.some((address, index) => {
                if (addressDetail) {
                  if (address.id == addressDetail.id) {
                    this.current = index
                    return true
                  }
                } else {
                  if (address.status == '2') {
                    this.current = index
                    return true
                  }
                }
                return false
              })
            } else {
                let res = await http.getAddress();
                let list = res.addresses
                storage.set('addressList', list);
                if (res) {
                    this.getAddress()
                }
            }
          },
          toPagePays() {
            const item = this.addressList[parseInt(this.current)]
            storage.set('addressItem', item);
            let id = item.id;
            this.$emit('change')
          },
          radioChange(e) {
            this.current = e.target.value
          }
        },
        mounted() {
            this.getAddress();
            setTitle("选择地址");
        }
      };
      </script>

      <style lang='less' scoped>
      .address{
        position: fixed;
        bottom:0;
        left:0;
        width:100vw;
        z-index:1000;
        background:rgba(255,255,255,1);

        .addressTitle{
          text-align: center;
          height: 2.4rem;
          background:rgba(255,255,255,1);
          box-shadow:0rem 0.01rem 0rem 0rem rgba(238,238,238,1);
          font-size: .8rem;
          color: rgba(67,67,67,1);
          line-height: 2.4rem;
          position: relative;
          >span{
            top:0;
            position: absolute;
            font-size: .746667rem;
            color:rgba(102,102,102,1);
            line-height: 2.4rem;
          }
          >span:first-child{
            left:.8rem;
          }
          >span:last-child{
            right:.8rem;
          }
        }
        .bottom{
          background:rgba(255,255,255,1);
          box-shadow:0rem -0.01rem 0rem 0rem rgba(238,238,238,1);
          text-align: center;
          font-size: .8rem;
          font-weight:500;
          color:rgba(67,67,67,1);
          line-height: 1.6rem;
          margin: .4rem 0;
          padding: 1.333vw 0 0.3rem 0;
          &.iphoneBottom{
            padding-bottom: 1rem;
          }
          >span{
            display: inline-block;
            width: 1.066667rem;
            height: 1.066667rem;
            border-radius: 0.3rem;
            border: 0.03rem solid;
            border-image: linear-gradient(180deg, rgba(250,119,98,1), rgba(244,66,51,1)) 0.03 0.03;
          }
          img{
            width: 1.066667rem;
            height: 1.066667rem;
            margin-right: .426667rem;
            position: relative;
            top: 0.2rem;
          }
        }
        .addressList{
          max-height: 45vh;
          overflow-y: auto;
          .addresss{
            position: relative;
            display: flex;
            align-items:center;
            padding: 0.43rem 0;
            &:before{
              height:1px;
              content: '';
              position: absolute;
              background:rgba(255,255,255,1);
              box-shadow:1.15rem 0.01rem 0rem 0rem rgba(238,238,238,1);
              bottom:0;
              left:0;
              right:0;
            }
            .checkbox{
              width:0.43rem;
              margin: 0 0.32rem 0 0.4rem;
            }
            .edit{
              width: 1.333333rem;
              margin: 0 0.75rem 0 1.17rem;
              height: 1.333333rem;
              >img{
                width: 1.333333rem;
                height: 1.333333rem;
              }
            }
            .content{
              flex:1;
              min-width: 0;
              margin-left: 1.4rem;
              padding: .64rem;
              .provinces{
                text-overflow:ellipsis; white-space:nowrap; overflow:hidden;
                font-size: .85rem;
                font-weight: 400;
                color: rgba(67,67,67,1);
              }
              .people{
                font-size: .74rem;
                color: rgba(67,67,67,1);
                margin-top: .426667rem;
                span{
                    margin-right: .426667rem;
                }
              }
            }
          }
        }
      }
      </style>