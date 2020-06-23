<template>
  <div class="skeleton">
    <div class="list clearfix" :class="{bottom:iphoneX}">
        <div class="item" v-for="(item,index) in list" :key="index">
            <div class="pic"></div>
            <div class="info">
                <h4 class="name"></h4>
                <div class="text">
                    <p></p>
                    <div class="icon-buy-btn"></div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  mounted() {},
  data() {
    return {
        list: [1,2,3,4,5,6,7,8]
    }
  },
  props: {
    iphoneX: {
        type: Boolean,
        default: false
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.clearfix:before, .clearfix:after {
    display: table;
    line-height: 0;
    content: "";
}
.clearfix:after {
    clear: both;
}
.list{
    padding: 3.2vw 4vw;
    display: block;
    margin-bottom: 13vw;
    &.bottom{
        margin-bottom: 19vw;
    }
    .item{
        width: 44.8vw;
        height: 59.333vw;
        float: left;
        background: #cfcfcf;
        margin-bottom: 2.133vw;
        padding: 3.2vw;
        border-radius: 1.067vw;
        margin-right: 2.4vw;
        &:nth-child(2n){
            margin-right: 0;
        }
        .pic{
            width: 38.4vw;
            height: 38.4vw;
            background: #ddd;
        }
        .name{
            margin-top: 2.133vw;
            width: 38.4vw;
            height: 5.2vw;
            background: #ddd;
        }
        .text{
            margin-top: 2.133vw;
            display: flex;
            justify-content: space-between;
            align-items: center;
            p{  
                flex: 0.7;
                width: 8.8vw;
                height: 4vw;
                background: #ddd;
            }
            .icon-buy-btn{
                width: 6.4vw;
                height: 6.4vw;
                background: #ddd;
                border-radius: 50%;
            }
        }
        
    }
}
</style>
