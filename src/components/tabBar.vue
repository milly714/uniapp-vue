<<template>
    <div class="tabBarMain" :class="{'iphonex': iphoneX}">
        <div v-for="(item,index) in tabList" :key="index" class="navigator" :class="current == index ? 'on' : ''">
            <div @tap="switchTab(index,item.url)">
                <div class="nav-icon">
                    <span :class="[item.icon,{active: current == index}]"></span>
                    <span class="icon-cart-num" v-if="item.url=='cart' && cartNums && cartNums!='' && cartNums!=0" :class="{'last': cartNums==maxNum}">{{cartNums}}</span>
                </div>
                <div class="text" :style="[current == index ? {'color': tintColor} : {'color': color}]">{{item.text}}</div>
            </div>
        </div>
    </div>
</template>

<script>
import storage from '@/utils/storage'
    export default {
        name: 'tab-bar',
        data(){
            return {
                tabList: [{
                    icon: 'icon-home',
                    text: '首页',
                    url: 'home'
                },
                {
                    icon: 'icon-live',
                    text: '直播',
                    url: 'live'
                },
                {
                    icon: 'icon-cart',
                    text: '购物车',
                    url: 'cart'
                },
                {
                    icon: 'icon-user',
                    text: '我的',
                    url: 'member'
                }],
                backgroundColor: '#fff',
                color: '#343434',
                tintColor: '#D24319',
                maxNum: '99+'
            }
        },
        computed: {
            cartNums: function(){
                console.log('snum',storage.get('cartNums'));
                console.log(this.cartNumber>99);
                if(this.cartNumber>99){
                    return this.maxNum
                }else{
                    return this.cartNumber+''
                }
            },
        },
        props: {
            current: { type: [Number, String], default: 0 },
            cartNumber: { type: Number, default: 0 },
            iphoneX: {type: Boolean, default: false}
        },
        methods: {
            switchTab(index,url){
                let _this = this;
                //console.log(url);
                let pages = getCurrentPages();
                let curPage = pages[pages.length - 1];
                //console.log(curPage);

                //console.log(_this.tabList[index].url)
                if(curPage.route.indexOf(url)>0 || (url=='member' && curPage.route.indexOf('user'))>0){
                    return;
                }
                 _this.$openPage({
                    name: url,
                    query: {
                        tabIndex: index
                    }
                })
                _this.$emit('click', index)
            }
        }
    }
</script>

<style lang="less" scoped>
.tabBarMain{
    position: fixed;
    z-index: 333;
    bottom: 0;
    width: 100%;
    height: 14vw;
    display: flex;
    align-items: flex-end;
    background: #fff;
    box-shadow:0px 4px 8px 0px rgba(0,0,0,0.38);
    justify-content: space-around;
    &.iphonex{
        padding-bottom: 5.333vw;
        height: 19.333vw;
    }
    .navigator{
        width: 25%;
        text-align: center;
        font-size: .6rem;
        color: #343434;
        margin-bottom: 1.467vw;
        &.on{
            color: #D24319;
        }
        .nav-icon{
            display: block;
            width: 1.173333rem;
            height: 1.173333rem;
            margin: 0 auto;
            margin-bottom: .18rem;
            position: relative;
            .icon-cart-num{
                position: absolute;
                top: -.206667rem;
                width: 3.2vw;
                height: 3.6vw;
                border-radius: 100%;
                border: 1px solid #C82D27;
                background: #fff;
                color: #C82D27;
                line-height: 3.6vw;
                margin-left: .133333rem;
                padding: 0 .053333rem;
                &.last{
                    width: 6vw;
                    height: 3.8vw;
                    line-height: 3.8vw;
                }
            }
        }
        .icon-home{
            display: block;
            width: 1.273333rem;
            height: 1.273333rem;
            background: url('../static/tabs/icon_home.png') no-repeat center;
            background-size: 100% 100%;
            &.active{
                background: url('../static/tabs/icon_home_active.png') no-repeat center;
                background-size: 100% 100%;
            }
        }
        .icon-live{
            display: block;
            width: 1.273333rem;
            height: 1.273333rem;
            background: url('../static/tabs/icon_live.png') no-repeat center;
            background-size: 100% 100%;
            &.active{
                background: url('../static/tabs/icon_live_active.png') no-repeat center;
                background-size: 100% 100%;
            }
        }
        .icon-cart{
            display: block;
            width: 1.273333rem;
            height: 1.273333rem;
            background: url('../static/tabs/icon_cart.png') no-repeat center;
            background-size: 100% 100%;
            &.active{
                background: url('../static/tabs/icon_cart_active.png') no-repeat center;
                background-size: 100% 100%;
            }
        }
        .icon-user{
            display: block;
            width: 1.273333rem;
            height: 1.273333rem;
            background: url('../static/tabs/icon_user.png') no-repeat center;
            background-size: 100% 100%;
            &.active{
                background: url('../static/tabs/icon_user_active.png') no-repeat center;
                background-size: 100% 100%;
            }
        }
        .text{
            width: 100%;
            vertical-align: bottom;
            font-size: .5rem;
            text-align: center;
            padding-left: 3rpx;
        }
    }
}
</style>