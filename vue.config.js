const webpack = require('webpack');
const shopConfig = require('./config')
console.log('process.env.ENV', process.env.ENV)
const NODE_ENV = process.env.ENV ||  process.env.NODE_ENV
module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        $shopId:JSON.stringify(shopConfig.shopId[NODE_ENV]),
        $categoryId:JSON.stringify(shopConfig.categoryId[NODE_ENV]),
        $deliverGoodsTempId:JSON.stringify(shopConfig.deliverGoodsTempId[NODE_ENV]),
        $uploadPic:JSON.stringify(shopConfig.uploadPic[NODE_ENV]),
        $hostUrl:JSON.stringify(shopConfig.hostUrl[NODE_ENV])
      })
    ]
  }
}