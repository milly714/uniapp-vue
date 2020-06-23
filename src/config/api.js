import request from '@/config/request';

const api = {

  // 首页商品列表
  getGoodList: (params) => request.get(`/shopping/product/api/v1/mobile/spus`, params),

  // 获取商品库存
  getGoodStock: (params,id) => request.get(`/shopping/product/api/v1/mobile/sku/stock/${id}`, params),

  // 用户地址
  getAddress: () => request.get(`/shopping/user/api/v1/mobile/user/user_address_list/$userId`),

  // 新增用户地址
  addAddress: (params) => request.post(`/shopping/user/api/v1/mobile/user/user_address_add`, params),

  // 编辑用户地址
  editAddress: (params, id) => request.post(`/shopping/user/api/v1/mobile/user/user_address_edit/$userId/${id}`, params),

  //删除用户地址
  delAddress: (params, id) => request.post(`/shopping/user/api/v1/mobile/user/user_address/$userId/${id}`, params, id),

  //获取用户token
  getUserToken: (params) => request.get(`/shopping/user/api/v1/mobile/weixin/access_token`, params),

  //获取用户信息
  getUserInfo: (params, userId) => request.get(`/shopping/user/api/v1/mobile/user/user_info/${userId}`, params),

  //获取用户信息
  getUserLogin: (params) => request.get(`/shopping/user/api/v1/mobile/weixin/openid`, params),

  //获取授权登录
  getAuthUser: (params) => request.get(`/shopping/user/api/v1/mobile/weixin/authorization/weixin`, params),

  //获取商品详情
  getGoodDetail: (id) => request.get(`/shopping/product/api/v1/saas/spu/${$shopId}/${id}`, id),

  //获取直播列表
  getLiveList: () => request.get(`/shopping/live/api/v1/mobile/live/get_live_list/${$shopId}`),

  //获取直播中状态
  onUpdateLiveStatus: (params, roomId) => request.post(`/shopping/live/api/v1/mobile/live/refresh/shops/${$shopId}/room/${roomId}`, params),

  //获取订阅消息的模版id
  getWxTempMsg: () => request.get(`/shopping/live/api/v1/mobile/live/shops/${$shopId}/getWXTemplateMessage`),

  //添加直播订阅消息
  editWxSubscibeMsg: (params) => request.post(`/shopping/live/api/v1/mobile/live/subscibe_add`, params),

}

export default api 