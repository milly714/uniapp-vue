<template>
    <div>
        <div class="userPage">
            <div class="user">
                <div class="userAvatar">
                    <open-data type="userAvatarUrl" />
                </div>
                <div class="userInfo" @click="openSetting" v-if="userSetting==0 || !userSetting">
                    <div class="avatar">
                        <open-data type="userAvatarUrl" />
                    </div>
                    <div class="nickName">
                        <open-data type="userNickName" />
                    </div>
                </div>
                <div class="userInfo" v-else>
                    <div class="avatar">
                        <open-data type="userAvatarUrl" />
                        <!-- <img :src="user.avatarImg" alt="" /> -->
                    </div>
                    <div class="nickName">
                        <open-data type="userNickName" />
                        <!-- <button class="nickName" open-type="getUserInfo" @getuserinfo="getUserObj" withCredentials="true">{{user.nickName}}</button> -->
                    </div>
                </div>
            </div>
            <div class="goodsList">
                <icon-list :iconList="orderTypeList" />
            </div>
            <div class="serve">
                <div class="title">
                    我的服务
                </div>
                <div>
                    <icon-list @icon-click="contact" :iconList="serveList" />
                </div>
            </div>
        </div>
        <mask v-if="showMask" @on-click="onCloseMark"></mask>
        <service-modal v-if="showMask"></service-modal>
        <tab-bar :iphoneX="isIphoneX" :current="currentTabIndex" :cartNumber="cartNums" @click="tabClick"></tab-bar>
    </div>
</template>
<script>
import iconList from '../../components/iconList.vue'
import { getOrderStatusCount } from '@/config/orderApi'
import { getSetting, getProvider, login, getUserInfo } from '@/config/auth'
import avatarImg from '@/assets/default_header.png'
import storage from '@/utils/storage'
import mask from '@/components/mask'
import serviceModal from '@/components/serviceModal'
import { mapState } from 'vuex';

export default {
    data() {
        return {
            user: {
                avatarImg: avatarImg,
                nickName: '未登录'
            },
            orderTypeList: [{
                img: '../static/icon/qubudingdan.png',
                name: '全部订单',
                url: '/pages/order/index?status=0'
            }, {
                img: '../static/icon/daifukuan.png',
                name: '待付款',
                url: '/pages/order/index?status=1',
                status: '1'
            }, {
                img: '../static/icon/daifahuo.png',
                name: '待发货',
                url: '/pages/order/index?status=2',
                status: '2'
            }, {
                img: '../static/icon/daishouhuo.png',
                name: '待收货',
                url: '/pages/order/index?status=3',
                status: '3'
            }],
            serveList: [{
                img: '../static/icon/lianxikefu.png',
                name: '联系客服',
                type: 1,
            }],
            // {
            //     img: '../static/icon/icon_subscribe.png',
            //     name: '我的订阅',
            //     url: 'subscribe'
            // }],
            userSetting: 2,
            status: 0,
            currentTabIndex: 3,
            cartNums: storage.get('cartNums'),
            showMask: false,
        }
    },
    computed: {
        ...mapState(['isIphoneX'])
    },
    components: {
        iconList,
        mask,
        serviceModal
    },
    methods: {
        tabClick(index){
            this.currentTabIndex = index
        },
        contact(item) {
            console.log(item)
            if(item.type == 1){
                this.showMask = true;
            }else{
                this.$openPage({
                    name: item.url
                })
            }
            
            // uni.makePhoneCall({
            //     phoneNumber: '400-088-2300' //仅为示例
            // });
        },
        getOrderStatusCount() {
            getOrderStatusCount().then(res => {
                if(res){
                    const orderTypeNumMap = {}
                    res.forEach(status => {
                        orderTypeNumMap[status.status] = status.orderNum
                    })
                    const orderTypeList = this.orderTypeList
                    if (orderTypeList && orderTypeList.length > 0) {
                        orderTypeList.forEach(orderType => {
                            orderType.num = orderTypeNumMap[orderType.status]
                        })
                        this.orderTypeList = JSON.parse(JSON.stringify(orderTypeList))
                    }
                }

            })
        },
        getUserObj(res) {
            let _this = this;
            login(resLogin=>{
                if(resLogin){
                    console.log('reslogin22');
                    if(res){
                        if (!res.detail.iv) {
                            this.$store.commit('setWin', {
                                title: "您取消了授权,登录失败"
                            })
                            return false;
                        }else{
                            console.log(res,'resinfo1');
                            _this.user = {
                                nickName: res.detail.userInfo.nickName,
                                avatarImg: res.detail.userInfo.avatarUrl
                            }
                            storage.set('userInfo', res.detail);
                            console.log('_this.user',_this.user);
                        }
                    }
                   
                }else{
                    this.$store.commit('setWin', {
                        title: "登录失败"
                    })
                }
            });
        },
        openSetting: function() {
            let _this = this;
            this.$store.commit('setWin', {
                title: '提示',
                content: '需要在设置中获取用户信息和登录权限',
                confirmText: '去设置',
                callBack:(val) => {
                    if(val=='ok'){
                        try {
                            uni.openSetting({
                            success(res) {
                                    uni.getSetting({
                                        success(res)
                                        {
                                            let authSetting=res.authSetting
                                            if(authSetting['scope.userInfo'])
                                            {
                                                _this.status = 1;
                                                uni.showToast({
                                                    icon: 'none',
                                                    title: '设置成功',
                                                    duration: 2000
                                                });
                                            }
                                        }
                                    })
                                }
                            })
                        } catch (error) {
                           this.$store.commit('showTabLoading', false);
                        }
                        
                    }else{
                        console.log('已取消');
                    }
                }

            });
        },
        onCloseMark(){
            this.showMask = !this.showMask
        },
    },
    onLoad(){
        let _index = this.$parseURL().tabIndex;
        this.currentTabIndex = _index;
        
        this.$store.commit('showTabLoading', true);
        //获取授权状态
        // try {
        //    getSetting().then(setting=>{
        //         this.userSetting = setting;
        //         console.log('setting',this.userSetting); // 0拒绝 or 1同意 or 2未操作
        //     }) 
        // } catch (error) {
        //     this.$store.commit('showTabLoading', false);
        // }
        let userObj = storage.get('userInfo')
        this.user = userObj.userInfo;
        this.getOrderStatusCount()
    },
    onShow(){
        if(this.showMask) {
            this.showMask = false;
            return true;
        }
    },
    onHide(){
        this.showMask = false;
    },
};
</script>
<style lang='less'>
.userPage {
    background-color: #EEEEEE;
    min-height: 100vh;
    margin-bottom: 8vh;
}

.user {
    position: relative;
    border-bottom-left-radius: 50vw 5vw;
    border-bottom-right-radius: 50vw 5vw;
    overflow: hidden;
    min-height:71.2vw;

    >.userAvatar {
        width: 100%;
        height: 71.2vw;
        position: absolute;
        top: 0;
        left: 0;
    }

    .userInfo {
        height: 71.2vw;
        background: rgba(0, 0, 0, 0.6);
        position: relative;
        z-index: 1;
        padding-top: 11.73vw;

        .avatar {
            margin: auto;
            width: 21.33vw;
            height: 21.33vw;
            margin-bottom: 4.27vw;
            border-radius: 50%;
            overflow: hidden;
            img{
                width: 100%;
                height: 100%;
            }
        }

        .nickName {
            color: #fff;
            text-align: center;
            font-size: 5.33vw;
            border: none;
            background: none;
            line-height: normal;
            &:after{
                content: '';
                border: 0;
            }
        }
    }
}

.goodsList {
    width: 92vw;
    background-color: #fff;
    border-radius: 2.13vw;
    margin: -16.27vw auto 0;
    position: relative;
    z-index: 2;
    height: 23.2vw;
}

.serve {
    margin: 3.2vw auto 0;
    width: 92vw;
    background-color: #fff;
    border-radius: 2.13vw;
    padding: 5.33vw 0;

    .title {
        color: #343434;
        padding-left: 4.27vw;
        font-size: 4vw;
        margin-bottom: 6.4vw;
        font-weight: bold;
    }
}
</style>