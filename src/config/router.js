
import FormatRouter from '@/config/formatRouter'
// 配置路由
const router = new FormatRouter({
  routes: [{
      // 页面路径
      path: "pages/home",
      // type必须是以下的值['navigateTo', 'switchTab', 'reLaunch', 'redirectTo']
      // 跳转方式(默认跳转方式)navigateTo
      type: 'redirectTo',
      name: 'home'
    },
    {
      path: 'pages/live/index',
      type: 'redirectTo',
      name: 'live'
    },
    {
      path: "pages/goods/cart",
      type: 'redirectTo',
      name: 'cart'
    },
    {
      path: "pages/goods/detail",
      name: 'goods_detail'
    },
    {
      path: "pages/user/index",
      type: 'redirectTo',
      name: 'member'
    },
    {
      path: "pages/user/subscribe",
      name: 'subscribe'
    },
    {
      path: 'pages/address/index',
      name: 'address'
    },
    {
        path: 'pages/address/editAddress',
        type: 'redirectTo',
        name: 'editAddress'
    },
    {
        path: 'pages/order/placeOrder',
        name: 'placeOrder'
    },
    {
        path: 'pages/order/payResult',
        type: 'redirectTo',
        name: 'payResult'
    },
  ]})

export default router