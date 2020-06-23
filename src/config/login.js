import {login} from './auth.js'
import storage from '@/utils/storage'


const resetLogin = async function() {
    // uni.showModal({
    //     title: '提示',
    //     content: '用户登录已失效',
    //     showCancel: false,
    //     confirmColor:'#D24319',
    //     success: function (res) {
    //         if (res.confirm) {
                
    //         }
    //     }
    // });
    let isResetLogin = storage.get('resetLogin')
    if(isResetLogin){
        login(function(){
            storage.delete('resetLogin');
            if (getCurrentPages().length != 0) {
                //刷新当前页面的数据
                getCurrentPages()[getCurrentPages().length - 1].onLoad()
            }
        });
    }
}


export {
    resetLogin
}