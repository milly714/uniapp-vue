let storage = {
    // isLogin: function () {
    //   return !!(this.getStorage('token') && this.getStorage('user'))
    // },
    
    // 从本地缓存中获取指定 name 对应的内容
    get (key) {
      let data
      try {
        data = uni.getStorageSync(key)
      } catch (e) {
        console.log('getStorage', e)
      }
      return data
    },

    // 将数据存储在本地缓存中指定的key中
    set (key, data) {
      try {
        uni.setStorageSync(key, data)
      } catch (e) {
        console.log('setStorage', e)
      }
    },

    // 从本地缓存中移除指定 key
    delete (key) {
      try {
        uni.removeStorageSync(key)
      } catch (e) {
        console.log('removeStorage', e)
      }
    },

    // 清理本地数据缓存
    clear () {
      try {
        uni.clearStorageSync()
      } catch (e) {
        console.log('clear',e)
      }
    },
  }
  
  export default storage