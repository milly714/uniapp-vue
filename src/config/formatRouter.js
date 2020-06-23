const toString = Object.prototype.toString

function isObject(value) {
  return toString.call(value) === '[object Object]'
}

function isString(value) {
  return toString.call(value) === '[object String]'
}

function isDefault(value) {
  return value === void 0
}

function openPage(args) {
  let name, query = {},
    queryStr = null,
    path, type, isName = false
  switch (true) {
    case isObject(args):
      ({
        name,
        query = {}
      } = args)
      break
    case isString(args):
      name = args
      break
    default:
      throw new Error('参数必须是对象或者字符串')
  }

  if (isObject(query)) {
    queryStr = encodeURIComponent(JSON.stringify(query))
  } else {
    throw new Error('query数据必须是Object')
  }

  this.$ftRouter.forEach(item => {
    if (item.name === name) {
      path = item.path
      type = item.type || 'navigateTo'
      isName = true
    }
  })
  if (!isName) {
    throw new Error(`没有${name}页面`)
  }
  if (!['navigateTo', 'switchTab', 'reLaunch', 'redirectTo'].includes(type)) {
    throw new Error(`name:${name}里面的type必须是以下的值['navigateTo', 'switchTab', 'reLaunch', 'redirectTo']`)
  }
  return new Promise((resolve, reject) => {
    uni[type]({
      url: `/${path}?query=${queryStr}`,
      success: resolve,
      fail: reject
    })
  })
}

function parseURL() {
  if(this.$root.$mp.query){
    const query = this.$root.$mp.query.query
    if (query) {
      return JSON.parse(decodeURIComponent(query))
    } else {
      return {}
    }
  }else{
    return {}
  }
  
}

function goBackPage(num) {
  uni.navigateBack({
    delta: num || 1
  });
}

function install(Vue) {
  Vue.mixin({
    beforeCreate: function() {
      if (!isDefault(this.$options.ftRouter)) {
        Vue._ftRouter = this.$options.ftRouter
      }
    }
  })

  Object.defineProperty(Vue.prototype, '$ftRouter', {
    get: function() {
      return Vue._ftRouter._router
    }
  })

  Object.defineProperty(Vue.prototype, '$parseURL', {
    get: function() {
      return Vue._ftRouter.parseURL
    }
  })

  Object.defineProperty(Vue.prototype, '$openPage', {
    get: function() {
      return Vue._ftRouter.openPage
    }
  })
}

function FormatRouter(options) {
  if (!(this instanceof FormatRouter)) {
    throw Error("FormatRouter用`new`关键字调用")
  }
  isDefault(options) && (options = {})
  this.options = options
  this._router = options.routes || []
}

FormatRouter.install = install

FormatRouter.prototype.openPage = openPage

FormatRouter.prototype.parseURL = parseURL

FormatRouter.prototype.goBackPage = goBackPage

export default FormatRouter