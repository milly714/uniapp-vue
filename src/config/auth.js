import api from './api.js'
import storage from '@/utils/storage'
import store from '@/store'
import request from './request.js';


//暂时适用微信小程序

//验证授权状态 2未操作 1已经授权  0拒绝授权
const getSetting = function() {
    const promise= new Promise((resolve,reject) => {
        uni.getSetting({
            success(res) {
                let authSetting=res.authSetting
                //授权成功
                if(authSetting['scope.userInfo']){
                    resolve(1)
                    return
                }
                //拒绝授权
                if(authSetting['scope.userInfo']===false){
                    resolve(0)
                    return
                }

                resolve(2)
            },
            fail(res) {
                reject(res)
            }
        })
    }).catch(res=>{
        uni.showToast({
            icon:'none',
            title: res.errMsg || '获取授权状态失败',
            duration: 2000
        });
    })

    return promise
}

//设置授权
function openSetting(scope, opts = {}) {
    return new Promise((resolve, reject) => {
      uni.openSetting({
        success({authSetting }) {
          if (scope) {
            resolve(authSetting[`scope.${scope}`])
            opts.success && opts.success(authSetting[`scope.${scope}`])
          } else {
            resolve(authSetting)
            opts.success && opts.successopts.success(authSetting)
          }
        },
        fail(err) {
          reject(err)
          opts.fail && opts.fail(err)
        }
      })
    })
}

const getProvider = () => {
    return new Promise((resolve, reject) => {
        uni.getProvider({
            service: 'oauth', //服务类型  登录授权
            success: function(res) {resolve(res.provider[0])},
            fail:function() { reject("获取服务商失败") }
        });
    })
}

//获取code
const getCode = () => {
    const promise = new Promise((resolve, reject) => {
        uni.login({
            provider: 'weixin',
            success: function(loginRes) {
                console.log('loginRes',loginRes);
                if (loginRes && loginRes.code) {
                    resolve(loginRes.code)
                } else {
                    reject(loginRes)
                }
            }
        });
    }).catch(res => {
        uni.showToast({
            icon: 'none',
            title: res.errMsg || '获取code失败',
            duration: 2000
        });
    })

    return promise
}

//用户登录
const login = async function(func) {
    let code = await getCode();
    //小程序授权微信
    // let param = {
    //     js_code: code,
    //     grant_type: 'authorization_code'
    // }
    let param = {
        jsCode: code,
        shopId: $shopId
    }
    let res = await api.getUserLogin(param);
    console.log('res', res);
    let data = res || {}
    let timestamp = Date.parse(new Date());
    data.timestamp = timestamp/1000;
    //储存用户信息到本地
    store.commit('login', data.userid)
    storage.set('user', data);
    storage.set('userToken', data.userToken)
    
    if(data){
        func&&func(data)
    }
}

const check=()=>{
    const promise= new Promise((resolve,reject) => {
        uni.checkSession({
            success() {
                console.log('状态未过期')
                //未过期
                resolve(0)
            },
            fail() {
                console.log('状态已过期')
                //已过期
                resolve(1)
            }
        })
    }).catch(res=>{
        uni.showToast({
            icon:'none',
          title: res.errMsg || '验证session失效',
          duration: 2000
        });
    })

    return promise
}

let user = storage.get('user');
console.log(user);
//判断登录状态
const checkLoginStatus = async function() {
    if (user && user.userid!='') {
        // 检查 session_key 是否过期
        let status = await check()
        if (status == 1) {
            login()
        } else {
            console.log('执行下一步操作')
        }
    } else {
        login();
    }
}


function requestApi(type, url, data, callback){
    if(type == 'post'){
        request.post(`${url}`,data).then(res=>{
            callback&&callback(res)
        })
    }else{
        request.get(`${url}`,data).then(res=>{
            callback&&callback(res)
        })
    }
}

const resetLogin = async function(callback) {
    console.log('relogin');
    uni.showModal({
        title: '提示',
        content: '用户登录已失效',
        showCancel: false,
        confirmColor:'#D24319',
        success: function (res) {
            if (res.confirm) {
                login(callback)
            }
        }
    });
    
}




// 获取用户信息
const getUserInfo = ()=>{
    const promise= new Promise((resolve,reject) => {
        uni.getUserInfo({
            provider: 'weixin',
            success: function(detail) {
                if(detail){
					resolve(detail);
				}else{
					reject(0); //用户点击拒绝授权
				}
            },
            fail: function() {
                console.log('如果用户拒绝过授权 直接走fail');
                reject(0); //如果用户拒绝过授权 直接走fail
            }
        })
    }).catch(res=>{
        uni.showToast({
            icon:'none',
            title: res.errMsg || '获取用户信息失败',
            duration: 2000
        });
    })

    return promise
}

export {
    getSetting,
    getProvider,
    login,
    getCode,
    checkLoginStatus,
    getUserInfo,
    resetLogin
}