<template>
    <div>
        <div class="opt-mask" @click="onClose"></div>
    </div>
</template>
    
<script>
    export default {
        data(){
            return {

            }
        },
        methods:{
            onClose(){
                this.$emit('on-click')
            }
        }
    }
</script>
<style>
    .opt-mask{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 99;
    }
</style>