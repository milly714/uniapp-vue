<template>
        <div>
            <div class="empty-main">
                <img v-if="type=='live'" src="../assets/default_live.png" alt="" class="live" />
                <img  v-else src="../assets/default_empty.png" alt="" />
                <p :class="{live:type=='live'}">{{title}}</p>
                <div v-show="isShowRefreshBtn" class="refresh-btn" @click="onRefresh">刷新</div>
            </div>
        </div>
    </template>
        
    <script>
        export default {
            name: 'empty-page',
            data(){
                return {
                    item: {}
                }
            },
            props: {
                title: {
                    type: String,
                    default: '暂无数据'
                },
                isShowRefreshBtn: {
                    type: Boolean,
                    default: false
                },
                type: {
                    type: String,
                    default: ''
                },
            },
            methods:{
                onRefresh(){
                    this.$emit('on-refresh')
                }
            }
        }
    </script>
    <style lang="less" scoped>
        page{
            background: #fff;
        }
        .empty-main{
            position: relative;
            padding-top: 20%;
            text-align: center;
            img{
                width: 8.466667rem;
                height: 7.666667rem;
                text-align: center;
                &.live{
                    width:46.133vw;
                    height: 33.333vw;
                }
            }
            p{
                margin-top: 4.267vw;
                color: #666;
                font-size: 3.2vw;
                &.live{
                    margin-top: 6.4vw;
                }
            }
            .refresh-btn{
                width: 8.266667rem;
                color: #EC614F;
                border-radius: .213333rem;
                border: 0.267vw solid rgba(236,97,79,1);
                padding: 2.667vw 0;
                margin: 6.4vw auto;
                font-size: 4.267vw;
            }
        }
    </style>