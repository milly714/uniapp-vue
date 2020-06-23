import Vue from 'vue'
import Vuex from 'vuex'
import storage from '@/utils/storage'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    forcedLogin: false,
    hasLogin: false,
    isLoading: false,
    userId: storage.get('user') ? storage.get('user').userid : 0,
    shopId: "13331",
    isIphoneX: wx.getSystemInfoSync().model.indexOf("iPhone X")>-1 || wx.getSystemInfoSync().model.indexOf("iPhone 11")>-1,
    win: {
      show: false,
      title: '提示信息',
      content: '',
      type: 'alert',
      callback: '',
    },
    upOrderData:0,
    templMsg: []
  },
  mutations: {
    upOrder(state){
      state.upOrderData ++
    },
    login(state, userId) {
      state.userId = userId;
      state.hasLogin = true;
    },
    logout(state) {
      state.userName = "";
      state.hasLogin = false;

    },
    setShopId(state, shopId) {
      state.shopId = shopId;
    },
    showLoading(state, isLoading) {
      state.isLoading = isLoading;
      if (isLoading) {
        uni.showLoading({
          title: ''
        });
      } else {
        setTimeout(function () {
            uni.hideLoading();
        }, 400);
      }
    },
    showTabLoading(state, isLoading) {
      state.isLoading = isLoading;
      if (isLoading) {
        wx.showNavigationBarLoading();
      } else {
        setTimeout(function () {
          wx.hideNavigationBarLoading();
        }, 400);
      }
    },
    setWin(state, obj) {
      state.win = obj;
      if (state.win.content) state.win.show = true;

      if (obj.content && !obj.callBack) {
        uni.showToast({
          icon: 'none',
          title: obj.content,
          duration: 1000
        })
      }
      if (obj.content && obj.callBack) {
        if (obj.cancel && obj.cancel.content) {
          obj.cancelText = obj.cancel.content
        }
        if (obj.ok && obj.ok.content) {
          obj.confirmText = obj.ok.content
        }
        uni.showModal({
          ...obj,
          showCancel: !!obj.cancel,
          confirmText: obj.confirmText || '确定',
          confirmColor: obj.confirmColor || '#3CC51F',
          success: function(res) {
            if (res.confirm) {
              obj.callBack('ok')
            } else if (res.cancel) {
              obj.callBack('cancel')
            }
          }
        });
      }
    },
    setTemplMsg(state, obj){
      state.templMsg = obj;
    }

  },
  getters: {},
})

export default store