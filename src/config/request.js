// import shopConfig from '@/config/shopConfig'
import store from '@/store'
import storage from '@/utils/storage'
import { resetLogin } from './login.js'
import {getCode} from './auth.js'

let Fly
// #ifdef H5
Fly = require('flyio/dist/npm/fly')
// #endif

// #ifdef MP-ALIPAY
Fly = require('flyio/dist/npm/ap')
// #endif

// #ifndef MP-WECHAT || H5
Fly = require('flyio/dist/npm/wx')
// #endif

var fly = new Fly();
var newFly = new Fly();

fly.config.timeout = 5000;
fly.config.baseURL = $hostUrl

let env = process.env.NODE_ENV

console.log('env',typeof(env));

function requestApi(type, url, data){
    //requestApi(request.method.toUpperCase(), request.url,request.params)
    if(type == 'post'){
        return fly.post(`${url}`,data)
    }else{
        return fly.get(`${url}`,data)
    }
}

// 配置响应拦截器
fly.interceptors.response.use(
    (response) => {
            store.commit('showLoading', false);
            store.commit('showTabLoading', false);
            storage.delete('isNonetwork')
            //storage.delete('tokenStatus')
            console.log('response',response);
            // 如果请求报错
            if (response.data.code === 0) {
                return Promise.resolve(response.data.data)
            }else if(response.data.code === 403004){
                if(response.data.msg){
                    store.commit('setWin', {
                        content: response.data.msg,
                        confirmText: '我知道了',
                        confirmColor:'#D24319',
                        callBack:(val) => { console.log(val) }
                    });
                    return;
                }
                //return Promise.reject(response)
            }else{
                if(response.data.code === 400002 || response.data.code === 400003){
                    storage.set('resetLogin', true)
                    resetLogin()
                }else{
                    if((response.data.code.slice(0,1) == 4 || response.data.code.slice(0,1) == 5) && response.data.msg){
                        uni.showModal({
                            title:'温馨提示',
                            showCancel:false,
                            content: response.data.msg
                        })
                    }else{
                        if(env == 'development'){
                            uni.showModal({
                                title:'服务器走失!',
                                showCancel:false,
                                content: response.data.msg
                            })
                        }else{
                            uni.showModal({
                                title:'温馨提示',
                                showCancel:false,
                                content: '服务器走失,请稍后再试!'
                            })
                        }
                    }
                }
                return Promise.reject(response)
            }
        },
        (err) => {
            store.commit('showLoading', false);
            store.commit('showTabLoading', false);
            console.log('error', err.request);
            if(err.request && err.request.url && err.request.url.indexOf('live/refresh/shops') < 0){
                storage.set('isNonetwork',1)
            }
            // uni.showModal({
            //     title:'提示',
            //     showCancel:false,
            //     content: '网络请求异常'
            // })
            //发生网络错误后会走到这里
            return Promise.reject(err)
        }
)
var newFly = new Fly();
// 配置请求拦截器
fly.interceptors.request.use((request) => {
    request.url = request.url.replace('$userId', store.userId || storage.get('user')?storage.get('user').userid:'')
    let timestamp = Date.parse(new Date());//时间戳
    request.params = {
        't': timestamp,
        'shopId': $shopId,
        'userId': store.userId || storage.get('user')?storage.get('user').userid:''
    };
    //let method = request.method;
    let header = {};
    header = {'Content-Type' : "application/json"};
    if(storage.get('userToken') && storage.get('user') && storage.get('user').userTokenExpireAt && storage.get('user').timestamp < storage.get('user').userTokenExpireAt){
        header['X-UserToken'] = storage.get('userToken')
        request.headers = header;
        return request;
    }else{
        newFly.config.baseURL = $hostUrl
        fly.lock();
        return getCode().then(resCode=>{
            let param = {
                jsCode: resCode,
                shopId: $shopId
            }
            newFly.get(`/shopping/user/api/v1/mobile/weixin/openid`,param).then((res) => {
                let resultData = res.data.data;
                let timestamp = Date.parse(new Date());
                resultData.timestamp = timestamp/1000 + 1800;
                request.headers["X-UserToken"] = resultData.userToken;
                store.commit('login', resultData.userid)
                storage.set('user', resultData);
                storage.set('userToken', resultData.userToken)
                request.headers = header;
                console.log('login',request);
                return request;
            }).catch(()=>{
                fly.unlock();
                console.log('unlock');
            }).then(()=>{
                fly.unlock();
                console.log('unlock then');
                if (getCurrentPages().length != 0){
                    //刷新当前页面的数据
                    getCurrentPages()[getCurrentPages().length - 1].onLoad()
                }
            })
        });
    }
})

export default fly
