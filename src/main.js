// #ifdef  H5
import './assets/css/reset.css';
// #endif
import Vue from 'vue'
import App from './App'
import store from './store'
import storage from '@/utils/storage'
import http from '@/config/api'

// FormatRouter
import FormatRouter from '@/config/formatRouter'

import ftRouter from '@/config/router'

import tabBar from '@/components/tabBar'

Vue.config.productionTip = false
Vue.prototype.$store = store

Vue.component('tab-bar', tabBar)

// 注册插件
Vue.use(FormatRouter)

App.mpType = 'app'

const app = new Vue({
  store,
  ftRouter,
  ...App,
  
})
app.$mount()

Vue.mixin({
  onLoad: function () {
    if(!storage.get('templMsg') || storage.get('templMsg')=='' || storage.get('templMsg').length==0){
      http.getWxTempMsg().then((resTempl)=>{
          console.log('resTempl',resTempl);
          storage.set('templMsg', resTempl);
      });
    }
    wx.hideShareMenu();
  }
})

// 全局数据
Vue.prototype.globalData = {
  store:{}
}

Vue.prototype.$closeWindow = function(){
  if(!window) return false;

  if (typeof window.WeixinJSBridge === "object") {

      WeixinJSBridge.call('closeWindow')
      WeixinJSBridge.invoke('closeWindow', {}, function (res) { });
  } else if(typeof window.AlipayJSBridge === "object"){
      AlipayJSBridge.call('popWindow');
  } else {
      window.close();
      window.location.href = "";
  }
}

// 返回上一级
Vue.prototype.navigateBack = function (delta = 1) {
  const arr = getCurrentPages() // eslint-disable-line
  if (arr.length >= 2) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/home' })
  }
}
