<<template>
    <div class="subscribe-main">
        <div class="list">
            <h3>未开播</h3>
            <div class="sub-list">
                <scroll-view :scroll-x="true" style="white-space: nowrap;">
                    <div class="item">
                        <div class="pic">
                            <!-- <img src="../../assets/live.jpg" alt="" /> -->
                            <p class="no-live">开播时间：<br/>2020.02.20 28:38</p>
                            <div class="header-img"><img src="../../assets/default_header.png" alt="" /></div>
                        </div>
                        <div class="info">
                            <h4 class="name">黄老师</h4>
                            <p class="text">星巴克和华住超用户体系</p>
                        </div>
                    </div>
                    <div class="item">
                        <div class="pic">
                            <!-- <img src="../../assets/live.jpg" alt="" /> -->
                            <p class="no-live">开播时间：<br/>2020.02.20 28:38</p>
                            <div class="header-img"><img src="../../assets/default_header.png" alt="" /></div>
                        </div>
                        <div class="info">
                            <h4 class="name">黄老师</h4>
                            <p class="text">星巴克和华住超用户体系</p>
                        </div>
                    </div>
                    <div class="item">
                        <div class="pic">
                            <!-- <img src="../../assets/live.jpg" alt="" /> -->
                            <p class="no-live">开播时间：<br/>2020.02.20 28:38</p>
                            <div class="header-img"><img src="../../assets/default_header.png" alt="" /></div>
                        </div>
                        <div class="info">
                            <h4 class="name">黄老师</h4>
                            <p class="text">星巴克和华住超用户体系</p>
                        </div>
                    </div>
                </scroll-view>
            </div>
        </div>

        <div class="list">
            <h3>直播中</h3>
            <div class="sub-list">
                <div class="item">
                    <div class="pic">
                        <!-- <img src="../../assets/live.jpg" alt="" /> -->
                        <p class="living"></p>
                        <div class="header-img"><img src="../../assets/default_header.png" alt="" /></div>
                    </div>
                    <div class="info">
                        <h4 class="name">黄老师</h4>
                        <p class="text">星巴克和华住超用户体系</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="list">
            <h3>已结束</h3>
            <div class="sub-list">
                <div class="item">
                    <div class="pic">
                        <!-- <img src="../../assets/live.jpg" alt="" /> -->
                        <p class="lived"></p>
                        <div class="header-img"><img src="../../assets/default_header.png" alt="" /></div>
                    </div>
                    <div class="info">
                        <h4 class="name">黄老师</h4>
                        <p class="text">星巴克和华住超用户体系</p>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    export default {
        data(){
            return {}
        },
        onLoad(){},
        methods: {

        },
    }
</script>

<style lang="less" scoped>
    .subscribe-main{
        padding: 3.2vw 4vw;
        h3{
            color: #333;
            font-size: 4.267vw;
        }
        .sub-list{
            margin-top: 3.2vw;
            margin-bottom: 6.667vw;
            .item{
                width:35.733vw;
                display: inline-block;
                margin-right: 2.133vw;
                .pic{
                    height:26.933vw;
                    background:rgba(255,255,255,1);
                    border-radius:1.067vw 1.067vw 0px 0px;
                    position: relative;
                    img{
                        width: 100%;
                        height: 100%;
                    }
                    p{
                        position: absolute;
                        &.no-live{
                            width:35.733vw;
                            height:9.6vw;
                            background:rgba(0,0,0,1);
                            opacity:0.59;
                            font-size: 2.133vw;
                            color: #fff;
                            top: 8.667vw;
                            text-align: center;
                            padding-top: 1.6vw;
                        }
                        &.living{
                            top: 2.133vw;
                            left: 2.133vw;
                            width: 13.067vw;
                            height: 4.267vw;
                            vertical-align: top;
                            background: url('../../static/icon/icon_living.png') no-repeat 0;
                            background-size: 100% auto;
                        }
                        &.lived{
                            top: 2.133vw;
                            left: 2.133vw;
                            width: 13.067vw;
                            height: 4.267vw;
                            vertical-align: top;
                            background: url('../../static/icon/icon_backvideo.png') no-repeat 0;
                            background-size: 100% auto;
                        }
                    }
                    .header-img{
                        position: absolute;
                        width: 10.667vw;
                        height: 10.667vw;
                        bottom: -4.267vw;
                        left: 50%;
                        margin-left: -5.3335vw;
                        background:rgba(247,247,247,1);
                        border:0.267vw solid rgba(210,67,25,1);
                        border-radius: 50%;
                        img{
                            width: 100%;
                            height: 100%;
                        }
                    }
                }
                
                .info{
                    background:rgba(255,255,255,1);
                    border-radius:0px 0px 1.067vw 1.067vw;
                    padding-top: 6.4vw;
                    padding-bottom: 2.133vw;
                    text-align: center;
                    .name{
                        color: #434343;
                        font-size: 2.933vw;
                    }
                    p{
                        padding-top: 0.8vw;
                        color: #666;
                        font-size: 2.133vw;
                    }
                }
            }
        }
    }
</style>