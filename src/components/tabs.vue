<template>
    <div class="tabs">
        <div @click="switchItem(i)" v-for="(item, i) in dataList" :key="i" class="tabsItem" :class="{'select': select == i}">
            <span>
                {{item.name}}
                <span v-if="select == i"></span>
            </span>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        dataList: {
            default: [],
            type: [Array, Number]
        },
        select: String
    },
    data() {
        return {
            list: []
        }
    },
    methods: {
        switchItem(i) {
            this.$emit('update:select', i)
            this.$emit('tab-click', this.dataList[i])
        }
    },
    onShow() {

    },
};
</script>
<style scoped lang='less'>
.tabs {
    display: flex;

    .tabsItem {
        flex: 1;
        color: #666666;
        font-size: 3.47vw;
        text-align: center;
        line-height: 3.47vw;
        padding: 5.33vw 0 3.2vw;
    }

    .select {
        >span {
            color: #333333;
            font-weight: bold;
            display: inline-block;

            >span {
                background: linear-gradient(117deg, rgba(219, 50, 29, 1) 0%, rgba(235, 92, 50, 1) 100%);
                border-radius: 0.4vw;
                height: 0.8vw;
                width: 100%;
                display: inline-block;
            }
        }
    }
}
</style>