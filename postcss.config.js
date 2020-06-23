const pkg = require('./package.json')
var pxtoviewport = require('postcss-px-to-viewport');
module.exports = {
  parser: require('postcss-comment'),
  plugins: [
  require('postcss-import'),
  require('autoprefixer')({
    remove: process.env.UNI_PLATFORM !== 'h5'
  }),
  require('@dcloudio/vue-cli-plugin-uni/packages/postcss'),
  pxtoviewport({
    unitToConvert: 'rem',
      viewportWidth: 20, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
      unitPrecision: 5, // 指定`px`转换为视窗单位值的小数位数
      viewportUnit: "vw", //指定需要转换成的视窗单位，建议使用vw
      fontViewportUnit: 'vw',
      propList: ['*'],
      minPixelValue: 0, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
      mediaQuery: false // 允许在媒体查询中转换`px`
    })
  ]
}