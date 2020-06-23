import request from '@/config/request'
console.log($shopId)
const getOrderlist = (params) => request.get(`/shopping/order/api/v1/mobile/order/shops/${$shopId}/users/$userId/orders`, params)
const getOrderStatusCount = (params) => request.get(`/shopping/order/api/v1/mobile/order/shops/${$shopId}/users/$userId/orderStatus/count`, params)
const getOrderInfo = (orderId) => request.get(`/shopping/order/api/v1/mobile/order/shops/${$shopId}/users/${$shopId}/orders/${orderId}`)
const addOrder = (params) => request.post(`/shopping/order/api/v1/mobile/order/shops/${$shopId}/users/$userId/orders`, params)
const cancelOrder = (orderId) => new Promise((resolve, reject) => {
  uni.showModal({
    content: '确定取消当前订单吗?',
    cancelText: '再看看',
    confirmText: '确定取消',
    confirmColor: '#D24319',
    success: (res) => {
      resolve(res)
    },
    fail(err) {
      reject(err)
    }
  })
}).then((res) => {
  if (res.confirm) {
    return request.post(`/shopping/order/api/v1/mobile/order/shops/${$shopId}/users/$userId/orders/${orderId}/cancel`)
  } else {
    throw new Error('取消-取消订单');
  }
})
const receivedOrder = (orderId) => new Promise((resolve, reject) => {
  uni.showModal({
    content: '确定收到你购买的商品了吗?',
    cancelText: '暂未收到',
    confirmText: '确认收货',
    confirmColor: '#D24319',
    success: (res) => {
      return resolve(res)
    },
    fail(err) {
      reject(err)
    }
  })
}).then((res) => {
  if (res.confirm) {
    request.post(`/shopping/order/api/v1/mobile/order/shops/${$shopId}/users/$userId/orders/${orderId}/received`)
  } else {
    throw new Error('取消-取消订单');
  }
})
const payOrder = (params, orderId) => request.post(`/shopping/order/api/v1/mobile/order/shops/${$shopId}/users/$userId/orders/${orderId}/pay`, params)
export {
  getOrderInfo,
  getOrderStatusCount,
  getOrderlist,
  addOrder,
  payOrder,
  cancelOrder,
  receivedOrder
}