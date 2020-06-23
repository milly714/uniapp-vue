<template>
    <div class="iconList">
        <div @click="goToPage(i)" v-for="(item, i) in iconList" :key="i">
            <img :src="item.img">
            <div v-if="item.name">
                {{item.name}}
                <span v-if="item.num">{{item.num}}</span>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        iconList: {
            default: [],
            type: Array
        }
    },
    methods: {
        goToPage(i) {
            const iconItem  = this.iconList[i]
            this.$emit('icon-click', iconItem)
            if (iconItem.url) {
                uni.navigateTo({
                    url: iconItem.url
                })
            }
        }
    }
};
</script>
<style scoped lang='less'>
.iconList {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    justify-items: center;
    justify-content: center;
    align-items: center;
    height: 100%;

    >div {
        position: relative;
        text-align: center;
        font-size: 3.47vw;
        color: #434343;

        >img {
            width: 7.47vw;
            height: 7.47vw;
        }

        >div>span {
            color: #C82D27;
            font-size: 2.67vw;
            display: inline-block;
            height: 3.47vw;
            text-align: center;
            min-width: 3.47vw;
            line-height: 3.47vw;
            border-radius: 2vw;
            border: 1px solid #C72B24;
            position: absolute;
            top: -1.8vw;
            left: 7vw;
            background: #fff;
        }
    }

    .corner {
        position: absolute;
        display: inline-block;
        width: 3.47vw;
        font-size: 2.67vw;
        line-height: 3.47vw;
        height: 3.47vw;
        overflow: hidden;
        border-radius: 2vw;
        border: 1px solid transparent;
        border-image: linear-gradient(180deg, rgba(230, 97, 103, 1), rgba(199, 43, 36, 1)) 1 1;
    }
}
</style>