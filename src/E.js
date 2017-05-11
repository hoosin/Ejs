'use strict'

function E() {
  /**
   * @des 错误对象
   * @class
   */
}

(function (window, E) {

  if (!E) return false

  //内置参数列表
  var options = {
    url: '',
    name: '',
    VipUID: '',
    address: ''
  }

  //处理用户所在位置
  window.navigator.geolocation.getCurrentPosition(function (position) {
    if (options.address === '') options.address = position.coords.latitude + ',' + position.coords.longitude
  })


  /**
   * @des 对象转为字符串键值对格式
   * @param {Object} obj 对象 {grade:"P0"}
   * @return 返回拼接之后的参数字符串 "grade=P0"
   * @private
   */
  function param(obj) {
    if (Object.prototype.toString.call(obj) !== '[object Object]') return false

    var array = []
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) return false
      if (obj[k] != '')  array.push(k + '=' + encodeURIComponent(obj[k]))
    }
    return array.join('&')
  }

  /**
   * @des 当前时间
   * @return YYYY-MM-DD hh:mm:ss
   * @private
   */
  function dateFun() {
    var date = new Date()
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
  }

  /**
   * @des 创建一个 IMG 元素 HTTP GET Request
   * @param {Object} obj 参数列表对象 {url:'',data:{},callback:function(){}}
   * @private
   */
  function send(obj) {

    if (!obj.callback) obj.callback = function () {
    }

    var d = param(obj.data)
    var url = obj.url + (obj.url.indexOf('?') < 0 ? '?' : '&') + d


    /**
     * 如果 url 超长，不运行，避免资源异常。
     * 各浏览器 HTTP Get 请求 URL 最大长度并不相同，几类常用浏览器最大长度及超过最大长度后提交情况如下：
     *  - IE6.0 :url 最大长度2083个字符，超过最大长度后无法提交。
     *  - IE7.0 :url 最大长度2083个字符，超过最大长度后仍然能提交，但是只能传过去2083个字符。
     *  - firefox 3.0.3 :url 最大长度7764个字符，超过最大长度后无法提交。
     *  - Opera 9.52 :url 最大长度7648个字符，超过最大长度后无法提交。
     *  - Google Chrome 2.0.168 :url 最大长度 7713 个字符，超过最大长度后无法提交。
     * 考虑这个专职服务移动端,在 firefox、Opera、Chrome 取最短的 7713
     */

    if (url.length > 7713) return

    if (window.navigator.onLine) {
      var img = new Image(1, 1)
      img.onload = img.onerror = img.onabort = function () {
        obj.callback()
        img.onload = img.onerror = img.onabort = null
        img = null
      }
      img.src = url
    }
  }

  /**
   * @des 获取报错前端源代码
   * @private
   * @return 错误代码字符串
   */
  function getCodeFun() {
    return ''
  }

  /**
   * @des 私有方法
   * @param {Object} arg, 错误信息对象
   * @private
   */
  function error(arg) {
    if (typeof arg === 'string')  return false

    var errorMsg = {
      module: '',//模块
      viewUrl: encodeURIComponent(location.href),//URL
      date: dateFun(),//发生故障的时间
      VipUID: options.VipUID,//用户的ID
      name: options.name,//预留了一个 name 看看后期可以怎么样扩展
      address: options.address,//用户所在地理位置信息
      grade: '',//错误等级P0最高,以此类推
      platform: window.navigator.platform,//手机型号/平台
      ua: window.navigator.userAgent.toString(),//UserAgent
      file: document.currentScript.src,//出错的文件
      line: 0,//异常代码所在行
      col: (window.event && window.event.errorCharacter) || 0,//异常代码所在列
      lang: navigator.language || navigator.browserLanguage || '',//客户端语言
      screen: window.screen.width + ' * ' + window.screen.height,//设备分辨率
      carset: (document.characterSet ? document.characterSet : document.charset),//客户端编码
      code: getCodeFun(),//错误代码
      info: '无错误描述!',//错误信息
      http: '',//接口名称
      msg: '',//接口解释信息
      result: ''//返回的信息
    }


    for (var i in arg) {
      if (arg[i] != '') errorMsg[i] = arg[i]
    }


    //上报错误信息
    setTimeout(function () {
      send({
        url: options.url,
        data: errorMsg
      })
    }, 0)
  }

  /**
   * @des 公有方法,处理客户端初始参数
   * @param {} obj, 配置初始化用户信息,包括但不限于 VipUID , 这里也可以去自定义
   * @public
   */
  E.init = function (obj) {
    if (obj['url'] === undefined) return false
    for (var i in obj) options[i] = obj[i]
  }

  /**
   * @des 公有处理方法,用于监控 'try/catch' 中被捕获的异常。
   * @param {Error} obj, 传递过来的异常对象信息。
   * @return {Object} 主要用于 unit testing。
   * @public
   */
  E.error = function (obj, p) {
    var paramsObj = {}

    if (obj instanceof Error) {
      paramsObj.info = (obj.message || obj.description) + ' ' + (obj.stack || obj.stacktrace)
      paramsObj.grade = p
      paramsObj.module = 'try_catch'
    } else {
      paramsObj = obj
    }

    error(paramsObj)
    return true
  }

  /**
   * @des 全局对象
   * @params {String}
   * @public
   */
  window.onerror = function (message, file, line, column) {
    error({
      info: message,
      file: file,
      line: line,
      col: column,
      grade: 'P0', // 这种全局的报错,我觉得应该给P0
      module: 'global'
    })
    return true
  }


})(window, this.E)
