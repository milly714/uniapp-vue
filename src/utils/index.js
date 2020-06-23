import store from '@/store'

const getImgUrl = (url) => {
  return $uploadPic.replace('{picName}', url)
}
const dateFormat = ($time, fmt) => { //author: meizz

  if (!($time instanceof Date)) {
    //毫数
    if (($time + '').length == 10) {
      $time = new Date(Number($time) * 1000)
    } else {
      $time = new Date(Number($time));
    }

  }
  var o = {
    "M+": $time.getMonth() + 1, //月份
    "d+": $time.getDate(), //日
    "h+": $time.getHours(), //小时
    "m+": $time.getMinutes(), //分
    "s+": $time.getSeconds(), //秒
    "q+": Math.floor(($time.getMonth() + 3) / 3), //季度
    "S": $time.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, ($time.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

function paramType(obj) {
    return obj == null ?
        String(obj) :
        classToType[Object.prototype.toString.call(obj)] || "object";
}
let classToType = {};

const checkParams = function(obj, context) {

    for (let key in obj) {

        let value = context[key] != undefined ? context[key] : obj[key].value;
        value = value ? value : '';
        let pro = obj[key].pro || '信息不符合要求';
        let cond = obj[key].cond;
        let reg = obj[key].reg;
        let fn = obj[key].fn;
        let type = paramType(value);
        if (type === 'string') {
            value = value.trim();
        }

        if (cond && reg) throw new Error('reg与cond条件不能同时存在!');

        if (fn) {
            if (!fn.call(context, value)) {
                store.commit('setWin', {
                    title: '提示信息:',
                    content: pro
                });
                return false;
            }
        } else if (reg && !reg.test(value)) {
            //没有cond条件,有正则条件,并且校验结果为空时
            store.commit('setWin', {
                title: '提示信息:',
                content: pro
            });
            return false;
        } else {
            //没有判断条件,正则时执行
            if ((type === 'string' && value === '') || (type === 'boolean' && value === false) || (type === 'number' && value === 0)) {
                store.commit('setWin', {
                    title: '提示信息:',
                    content: obj[key] || '信息不符合要求'
                });
                return false;
            }
        }
    }

    return true;
}

const getArrayIndex = function(_arr,_obj){
    var len = _arr.length;
    for(var i = 0; i < len; i++){
        if(_arr[i] == _obj){
            return parseInt(i);
        }
    }
    return -1;
}

const setTitle = function(name) {
    uni.setNavigationBarTitle({
        title: name
    });
}

/**
 * 获取url参数
 *
 * @param {*} name
 * @param {*} [url=window.location.serach]
 * @returns
 */
const getQueryString = function(name, url) {
	var url = url || window.location.href
	var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
	var r = url.substr(1).match(reg)
	if (r != null) {
		return r[2]
	}
	return null
}

/**
 * 把obj对象里的值覆盖到newobj里面
 *
 * @param {*} newobj
 * @param {*} obj
 * @returns
 */
const deepCopy = function(newobj, obj) {
	if (typeof obj != 'object') {
		return obj
	}
	for (var attr in obj) {
		var a = {}
		if (newobj[attr]) {
			a = newobj[attr]
		}
		newobj[attr] = deepCopy(a, obj[attr])
	}
	return newobj
}

/**
 * 获取两个对象数组的差异
 *
 * @param {*} array1
 * @param {*} array2
 * @param {筛选字段1} filedName1
 * @param {筛选字段2} filedName2
 * @returns
 */
const getDiffentArray = function(array1,array2,filedName1,filedName2){
    var result = [];
    for(var i = 0; i < array2.length; i++){
        var obj = array2[i];
        var roomId2 = obj[filedName1];
        var flag = false;
        for(var j = 0; j < array1.length; j++){
            var aj = array1[j];
            var roomId1 = aj[filedName1];
            if(roomId1 == roomId2 && array1[j][filedName2] != array2[i][filedName2]){
                flag = true;
                break;
            }
        }
        if(flag){
            result.push(obj);
        }
    }
    //console.log('result',result);
    return result;
}

/**
 * 删除数组中相同的对象元素
 * 
 * @param {*} obj 数组对象
 * @returns
 */
const deteleObject = function(obj) {
    let uniques = [];
    let stringify = {};
    for (var i = 0; i < obj.length; i++) {
        var keys = Object.keys(obj[i]);
        keys.sort(function(a, b) {
            return (Number(a) - Number(b));
        });
        let str = '';
        for (var j = 0; j < keys.length; j++) {
            str += JSON.stringify(keys[j]);
            str += JSON.stringify(obj[i][keys[j]]);
        }
        if (!stringify.hasOwnProperty(str)) {
            uniques.push(obj[i]);
            stringify[str] = true;
        }
    }
    uniques = uniques;
    return uniques;
}


export {
  getImgUrl,
  dateFormat,
  checkParams,
  getArrayIndex,
  setTitle,
  getQueryString,
  deepCopy,
  getDiffentArray,
  deteleObject
}
