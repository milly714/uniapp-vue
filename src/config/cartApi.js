import request from '@/config/request';

const api = {

  // 加入购物车
  onAddCart: (params) => request.post(`/shopping/cart/api/v1/mobile/cart/${$shopId}/$userId/add_sku`, params),

  //修改购物车
  onUpdateCart: (params) => request.post(`/shopping/cart/api/v1/mobile/cart/${$shopId}/$userId/set_sku`, params),
  
  //删除购物车
  onRemoveCart: (params) => request.post(`/shopping/cart/api/v1/mobile/cart/${$shopId}/$userId/remove_sku`, params),
  
  // 获取用户购物车
  getUserCart: () => request.get(`/shopping/cart/api/v1/mobile/cart/${$shopId}/$userId`),
}

export default api 