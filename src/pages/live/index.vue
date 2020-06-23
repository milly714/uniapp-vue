<<template>
    <div class="liveMain" :class="{'liveMain empty': isNoData}">
        <!-- <cart-control></cart-control> -->
        <empty-page v-if="list && list.length==0" :title="emptyTitle" type="live"/>
        <div class="data-list" :class="{bottom:isIphoneX}" v-else >
            <div class="box" v-for="(item,index) in list" :key="index">
                <div class="live-header">
                    <span class="icon-video"></span><span>{{getFormatTime(item.startTime,'yyyy年MM月dd日 hh:mm')}}</span>
                </div>
                <h3>{{item.roomName}}</h3>
                <div class="pic" @click="onLive(item.roomId)">
                    <img :src="item.shareImg" alt="" />
                    <!-- <img src="../../assets/live.jpg" alt="" /> -->
                    <span class="btn-status" :class="{living:item.liveStatus==101 || item.liveStatus==106 || item.liveStatus==105}"></span>
                    <span class="btn-status" :class="{lived:item.liveStatus==103}" v-if="item.liveStatus==103"></span>
                </div>
                <div class="live-bottom flex-box">
                    <div class="user-info flex-item">
                        <img src="../../assets/default_header.png" alt="" /><span>{{item.anchorName}}</span>
                    </div>
                    <span class="operate-btn" @click="onLive(item.roomId)" v-if="item.liveStatus==101 || item.liveStatus==106 || item.liveStatus==105">查看直播</span>
                    <!-- <subscribe v-if="item.liveStatus==102" :room-id="item.roomId">立即订阅</subscribe> -->
                    <formId v-if="item.liveStatus==102 && !subscribed" @callback="onSubscribe" :templSort="templSort" :subscribed="subscribed">
                        <template slot="btn">
                            <button form-type="submit" class="operate-btn active">
                                立即订阅
                            </button>
                        </template>
                    </formId>
                    <span class="operate-btn" @click="onSubscribe(1,2)" v-if="item.liveStatus==102 && subscribed">已订阅</span>
                    <span class="operate-btn" @click="onService(2)" v-if="item.liveStatus==103">查看回放</span>
                </div>
            </div>
        </div>
        <mask v-if="showMask" @on-click="onCloseMark"></mask>
        <service-modal v-if="showMask && serviceModalType==1" :preTitle="preTitle" :nextTitle="nextTitle"></service-modal>
        <service-modal v-if="showMask && serviceModalType==2" :preTitle="backPreTitle" :nextTitle="backNextTitle"></service-modal>
        <tab-bar :iphoneX="isIphoneX" :current="currentTabIndex" :cartNumber="cartNums" @click="tabClick"></tab-bar>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import storage from '@/utils/storage'
import mask from '@/components/mask'
import serviceModal from '@/components/serviceModal'
import emptyPage from '@/components/empty'
import http from '@/config/api'
import { dateFormat, getDiffentArray } from '@/utils'
import formId from '@/components/formId'
let livePlayer = requirePlugin('live-player-plugin')

    export default {
        data(){
            return {
                list: [],
                subscribed: false,
                cartNums: storage.get('cartNums'),
                showMask: false,
                preTitle: '订阅成功，去回复“1”添加客服',
                nextTitle: '更多福利优惠等你哟～',
                backPreTitle: '去回复“1”添加客服',
                backNextTitle: '获取更多福利视频资源哟～',
                serviceModalType: 1,
                currentTabIndex: 1,
                emptyTitle: '未发现直播内容，敬请期待！',
                timer: null,
                liveStatusNum: 0,
                formerList: [],
                tempObj: [],
                templSort: '1003'
            }
        },
        computed: {
            ...mapState(['isIphoneX']),
            isNoData:function(){
                return this.list && this.list.length==0
            }
        },
        components: {
            mask,
            serviceModal,
            emptyPage,
            formId
        },
        onPullDownRefresh: function() {
            if (getCurrentPages().length != 0){
                //刷新当前页面的数据
                getCurrentPages()[getCurrentPages().length - 1].onLoad()
            }
        },
        async onLoad(){
            if(!storage.get('templMsg') || storage.get('templMsg')=='' || storage.get('templMsg').length==0){
                let resTempl = await http.getWxTempMsg();
                console.log('resTempl',resTempl);
                storage.set('templMsg', resTempl);
            }
            //this.tempObj = storage.get('templMsg');
            let tempList = storage.get('templMsg');
            this.tempObj = tempList.filter(item=>{
                return item.type == this.templSort;
            })
            console.log('this.tempObj',this.tempObj);
            let _this = this;
            wx.getSetting({
                withSubscriptions: true,
                success(res) {
                    console.log('res', res)
                    let obj = res.subscriptionsSetting;
                    if(obj){
                        if(!obj.mainSwitch){
                            _this.onSubscribe(1,2)
                        }
                    }
                }
            })
            
            let pages = getCurrentPages();
            let page = pages[pages.length-1];
            console.log('onLoad', page);

            _this.$store.commit('showTabLoading', true);
            let _index = _this.$parseURL().tabIndex;
            _this.currentTabIndex = _index;
            _this.getList();
        },
        onShow(){
            if(this.showMask) {
                this.showMask = false;
                return true;
            }
        },
        onHide(){
            this.$store.commit('showTabLoading', false);
            this.showMask = false;
        },
        mounted(){
            console.log('mounted');
            let _this = this;
            if(_this.timer){
                _this.list = [];
                clearInterval(_this.timer)
            }else{
                _this.timer = setInterval(()=>{
                    let list = _this.getStatusList(_this.formerList);
                    //console.log('newList',list);
                    _this.list = list;
                    // let newList = _this.getDiffent(_this.list,list);
                    // if(newList && newList.length>0){
                    //     _this.list = list;
                    // }
                    //console.log('list1',_this.list);
                },10000)
            }
        },
        destroyed(){
            clearInterval(this.timer)
        },
        methods:{
            getNoEndList(){
                let list = this.list;
                list = list.map((item)=>{
                    if(item.liveStatus!=103){
                        return item;
                    }
                });
                list = list.filter(item=>{
                    if(item){
                        return item;
                    }
                })
                //console.log('noendList',list);
                return list;
                
            },
            getStatusList(array){
                let _this = this;
                let list = array;
                list.map((item)=>{
                    if(item.liveStatus!=103){
                         _this.getLiveStatus(item.roomId, function(status){
                            item.liveStatus = status;
                            _this.liveStatusNum++
                        });
                        return item;
                    }
                });
                if(this.liveStatusNum>=this.getNoEndList().length){
                    list = list.filter(item=>{
                        if(item){
                            return item;
                        }
                    })
                    // list.sort(function(a,b){
                    //     var value1 = a['liveStatus'];
                    //     var value2 = b['liveStatus'];
                    //     return value1 - value2;
                    // })
                    this.liveStatusNum == 0;
                    //console.log('initList',list);
                }
                // for (let key in list) {
                //     if(list[key].liveStatus == 102){
                //        delete list[key]
                //     }else if(list[key].liveStatus == 103){
                //        delete list[key]
                //     }
                // }
                // list = list.filter(item=>{
                //     if(item){
                //         return item;
                //     }
                // })
                
                //console.log('last',list);
                // console.log('sortList',sortList);
                let resultList = list;
                //console.log('resultList',resultList);
                return resultList;
            },
            getNoStartList(){
                let list = this.formerList;
                list = list.map(item=>{
                    if(item.liveStatus==102){
                        return item;
                    }
                })
                list = list.filter(item=>{
                    if(item){
                        return item;
                    }
                })
                return list;
                
            },
            getEndList(){
                let list = this.formerList;
                list = list.map(item=>{
                    if(item.liveStatus==103){
                        return item;
                    }
                })
                list = list.filter(item=>{
                    if(item){
                        return item;
                    }
                })
                return list;
                
            },
            getDiffent(array1,array2){//找出两个数组的不同
                return getDiffentArray(array1,array2,'roomId','liveStatus');
            },
            getFormatTime(time, ft){
                return dateFormat(new Date(time), ft)
            },
            tabClick(index){
                this.currentTabIndex = index
            },
            onCloseMark(){
                this.showMask = !this.showMask
            },
            onService(status){
                this.showMask = true;
                if(status == 1){
                    this.serviceModalType = 1;
                }else if(status == 2){
                    this.serviceModalType = 2;
                }
            },
            onLive(roomId){
                let customParams = { path: 'pages/home'}
                wx.navigateTo({
                    url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}`
                })
            },
            getLiveStatus(roomId, callback){
                // // 首次获取立马返回直播状态，往后间隔1分钟或更慢的频率去轮询获取直播状态
                    livePlayer.getLiveStatus({ room_id: roomId })
                    .then(res => {
                        // 101: 直播中, 102: 未开始, 103: 已结束, 104: 禁播, 105: 暂停中, 106: 异常，107：已过期 
                        let newLiveStatus = res.liveStatus
                        
                        // if(newLiveStatus != liveStatus){
                        //     status = newLiveStatus;
                        // }
                        http.onUpdateLiveStatus(JSON.stringify({status:newLiveStatus}),roomId).then(res=>{
                            console.log('update live status', res);
                        })
                        console.log('status',res.liveStatus);
                        callback && callback(newLiveStatus)
                        
                    })
                    .catch(err => {
                        console.log('get live status error', err)
                        //status = liveStatus
                    })
                
            },

            /**
             * type: 默认添加订阅消息；1取消订阅消息
             */
            async onSubscribe(type, status, isHold){
                let _this = this;
                if(type!=1){
                    wx.getSetting({
                        withSubscriptions: true,
                        success(res) {
                            let obj = res.subscriptionsSetting;
                            if(obj){
                                if(obj.mainSwitch && obj.itemSettings && obj.itemSettings[_this.tempObj[0].templateId] == 'accept'){
                                    isHold = 1;
                                }else if(obj.mainSwitch && !obj.itemSettings){
                                    isHold = 2;
                                }
                                _this.editWxSubscibeMsg(type, 1, isHold);
                            }
                        }
                    })
                }else{
                    _this.editWxSubscibeMsg(type, 2, isHold);
                }
            },
            editWxSubscibeMsg(type, status, isHold){
                let _this = this;
                let option = {
                    shopId: `${$shopId}`,
                    priTmplId: _this.tempObj[0].templateId,
                    isHold: isHold || 2,
                    status: status || 1,
                    openId: storage.get('user').openid
                }
                http.editWxSubscibeMsg(JSON.stringify(option)).then((resData)=>{
                    if(resData){
                        if(type!=1){
                            _this.onService(1);
                        }
                        _this.getList();
                    }
                    
                })
            },
            async getList(){
                let res = await http.getLiveList();
                // let arr = [];
                // arr.push(res.video[0])
                if(res){
                    this.formerList = res.video;
                    this.list = this.getStatusList(res.video);
                    this.subscribed = res.subscribed;
                    this.$store.commit('showTabLoading', false);
                    uni.stopPullDownRefresh();//停止下拉刷新
                    // this.getNoEndList();
                    //console.log('loadList',this.list);
                }
            }
        },
        
    }
</script>
<style>
.subscribe--live-player-subscribe__btn{
    width: 20vw!important;
    height: auto!important;
    font-size: 3.467vw!important;
    text-align: center;
    line-height: 8vw!important;
    box-shadow:0px 0px 2.133vw 0px rgba(0,0,0,0.08);
    border-radius: 4vw!important;
    color: #FFFFFF;
    background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%)!important;
    pointer-events: auto;
    margin: 0 auto;
}
</style>

<style lang="less" scoped>
.liveMain{
    padding: 6.4vw 0;
    margin-bottom: 18.267vw;
    min-height: 100vh;
    &.empty{
        background: #fff;
        margin-bottom: 0;
    }
    &.bottom{
        margin-bottom: 23.6vw;
    }
    .data-list{
        margin: 0 4vw;
        margin-bottom: 12.6vw;
        &.bottom{
            margin-bottom: 18vw;
        }
          .box{
            background:rgba(255,255,255,1);
            box-shadow:0px 0px 2.133vw 0px rgba(0,0,0,0.08);
            border-radius:1.067vw;
            padding: 4.267vw 4.267vw 2.133vw 4.267vw;
            margin-bottom: 4.267vw;
            &:last-child{
                margin-bottom: 0;
            }
            .live-header{
                color: #999;
                font-size: 3.733vw;
                span{
                    display: inline-block;
                    &.icon-video{
                        margin-right: 1.333vw;
                        width: 3.2vw;
                        height: 3.2vw;   
                        background: url('../../static/icon/icon_video.png') no-repeat 0;
                        background-size: cover;
                        vertical-align: middle;
                        margin-top: -0.533vw;
                    }
                }
            }
            h3{
                padding-top: 1.333vw;
                font-size: 4.533vw;
                color: #333;
                font-weight: bold;
            }
            .pic{
                margin-top: 3.2vw;
                width: 100%;
                height: 62.667vw;
                position: relative;
                z-index: 1;
                img{
                    width: 100%;
                    height: 100%;
                }
                .btn-status{
                    display: block;
                    position: absolute;
                    z-index: 2;
                    width:13.6vw;
                    height:5.067vw;
                    top: 3.2vw;
                    left: 3.2vw;
                    // background: #fff;
                    // box-shadow:0px 0px 2.133vw 0px rgba(0,0,0,0.08);
                    // border-radius:2.533vw;
                    // // opacity:0.4;
                    // color: #999;
                    // font-size: 3.2vw;
                    // .icon-round{
                    //     display: inline-block;
                    //     width: 1.867vw;
                    //     height: 1.867vw;
                    //     background: #D24319;
                    //     border-radius: 50%;
                    //     margin-left: 1.867vw;
                    //     margin-right: 1.333vw;
                    // }
                    &.living{
                        vertical-align: top;
                        background: url('../../static/icon/icon_living.png') no-repeat 0;
                        background-size: 100% auto;
                    }
                    &.lived{
                        vertical-align: top;
                        background: url('../../static/icon/icon_backvideo.png') no-repeat 0;
                        background-size: 100% auto;
                    }
                }
            }
            .live-bottom{
                margin-top: 2.133vw;
                height: 8.6vw;
                img{
                    width: 5.867vw;
                    height: 5.867vw;
                    border-radius: 50%;
                    vertical-align: middle;
                }
                span{
                    display: inline-block;
                    color: #666;
                    height: 5.867vw;
                    line-height: 5.867vw;
                    font-size: 3.2vw;
                    margin-left: 2.133vw;
                }

                .operate-btn{
                    width: 20vw;
                    font-size: 3.467vw;
                    color: #434343;
                    text-align: center;
                    height: auto;
                    line-height: 8vw;
                    box-shadow:0px 0px 2.133vw 0px rgba(0,0,0,0.08);
                    border-radius: 4vw;
                    border:1px solid rgba(153,153,153,1);
                    &.active{
                        color: #fff;
                        line-height: 8.6vw;
                        background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
                        border: none;
                    }
                }
                button{
                    &.operate-btn{
                        width: 22vw;
                        height: auto;
                        line-height: 8vw;
                        box-shadow:0px 0px 2.133vw 0px rgba(0,0,0,0.08);
                        border-radius: 4vw;
                        border:1px solid rgba(153,153,153,1);
                        &.active{
                            color: #fff;
                            background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
                            border: none;
                        }
                    }
                }
                button::after {
                    border: none;
                }

            }
        }
    }
  
}
</style>