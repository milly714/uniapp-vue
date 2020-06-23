<template>
    <div class="formid">
        <form v-if="disabled" report-submit>
            <slot name="btn"></slot>
        </form>
        <form v-else @click="getSettingMsg" report-submit>
            <slot name="btn"></slot>
        </form>
    </div>
</template>
<script>
import storage from '@/utils/storage'
import {getArrayIndex} from '@/utils'
    export default {
        data(){
            return {
                orderIds: storage.get('subMsgIds') || [],
                disabled: false
            }
        },
        props: {
            formData: {
                type: Object,
                default: {}
            },
            tempObj: {
                type: Object,
                default: {}
            },
            subscribed: {
                type: Boolean,
                default: false
            },
            templSort: {
                type: Number,
                default: 0
            }
        },
        watch:{
            disabled: function(newVal){
                this.disabled = newVal
            }
        },
        methods:{
            getSettingMsg: function(){
                let _this = this;
                _this.$store.commit('showLoading', true);
                _this.disabled = true;
                let sameOrderIds = _this.orderIds;
                if(sameOrderIds && sameOrderIds.length>0){
                    let hasSame = sameOrderIds.some(item=>{
                        return item == _this.formData.orderId
                    })
                    if(hasSame){
                        _this.$emit("callback", _this.formData);
                    }else{
                        _this.resetMsg();
                    }
                }else{
                   _this.resetMsg();
                }
            },
            openMsgSetting: function(){
                uni.showModal({
                    title: '提示',
                    content: '请在设置中授权用户订阅消息',
                    showCancel: false,
                    confirmText: '确定',
                    confirmColor: '#D24319',
                    success: function(res) {
                        wx.openSetting({ // 打开设置页
                            withSubscriptions: true,
                            success(res) {
                                console.log(res.authSetting)
                            },fail(error){
                                console.log('error',error)
                            },
                        });
                    }
                });
            },
            resetMsg(){
                let _this = this;
                
                let tempList = storage.get('templMsg');
                let currentObj = tempList.filter(item=>{
                    return item.type == _this.templSort;
                })
                console.log('templSort',_this.templSort);
                let tempObj = currentObj[0];
                console.log('tempObj',tempObj);
                let _tempId = tempObj.templateId || $deliverGoodsTempId;
                

                wx.getSetting({
                    withSubscriptions:true,
                    success(authRes){
                        console.log(authRes,'subscribeMessage');
                        if(authRes.authSetting){
                            try {
                                if(wx.requestSubscribeMessage){
                                    wx.requestSubscribeMessage({
                                        tmplIds: [_tempId],
                                        // success (res) {
                                        //     console.log("成功",res);
                                        // },
                                        // fail(error){
                                        //     if (error.errCode == 20004) {
                                        //         console.log('reserrorCode', error.errCode == 20004);
                                        //         _this.openMsgSetting();
                                        //     }
                                        // },
                                        complete(res) {
                                            console.log('resCallBack',res);
                                            _this.disabled = false;
                                            _this.$store.commit('showLoading', false);
                                            if(tempObj.type!='1003' && res[_tempId] && (res[_tempId]=='accept' || res[_tempId]=='reject')){
                                                if(_this.formData && _this.formData.orderId){
                                                    console.log('resfromdata',_this.formData.orderId);
                                                    _this.orderIds.push(_this.formData.orderId);
                                                    storage.set('subMsgIds', _this.orderIds)
                                                }
                                                _this.$emit("callback", _this.formData);
                                            }else if(tempObj.type=='1003' && res[_tempId]=='accept'){
                                                _this.$emit("callback");
                                            }else if(tempObj.type=='1003' && res[_tempId]=='reject'){
                                                console.log('reject');
                                                //_this.openMsgSetting();
                                            }else{
                                                if(tempObj.type!='1003'){
                                                    storage.delete('subMsgIds')
                                                    _this.$emit("callback", _this.formData);
                                                }else{
                                                    if (res.errCode == 20004) {
                                                        console.log('reserrorCode', res.errCode == 20004);
                                                        _this.openMsgSetting();
                                                    }
                                                }
                                            }
                                            
                                        }
                                    })
                                }else{
                                    _this.disabled = false;
                                    _this.$store.commit('showLoading', false);
                                    _this.$emit("callback", _this.formData);
                                }
                                
                            } catch (error) {
                                _this.disabled = false;
                                _this.$store.commit('showLoading', false);
                                console.log("异常",error)
                            }
                        }else{
                            _this.openMsgSetting();
                        }
                    }
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .formid{
        display: inline-block;
    }
</style>