<template>
    <div>
        <div class="empty-main">
            <img src="../assets/default_cart.png" alt="" />
            <p>{{title}}</p>
            <div class="show-btn" @click="onShowPage">浏览商品</div>
        </div>
    </div>
</template>
    
<script>
    export default {
        name: 'empty-cart',
        data(){
            return {
                item: {}
            }
        },
        props: {
            title: {
                type: String,
                default: '购物车还没有商品哦~'
            }
        },
        methods:{
            onShowPage(){
                this.$emit('on-click')
            }
        }
    }
</script>
<style lang="less" scoped>
    .empty-main{
        position: relative;
        padding-top: 20%;
        text-align: center;
        img{
            width: 8.466667rem;
            height: 7.666667rem;
            text-align: center;
        }
        p{
            margin-top: 4.267vw;
            color: #666;
            font-size: 3.2vw;
        }
        .show-btn{
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