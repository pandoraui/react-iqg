'use strict';

var $ = require('npm-zepto');
var ApiPath = require('./ApiPath');

var filterParams = function(params) {
  var params = params || {};
  //过滤无效值
  var ajaxParams = {};
  for (var key in params) {
    if (typeof params[key] !== "undefined") {
      ajaxParams[key] = params[key];
    }
  }
  return ajaxParams;
};

//这里统一添加一些公共参数
var dealParams = function(params) {
  params = params || {};
  var header = {
    //tech: "reactUI"
  };
  //获取地理位置 geo,当前城市等信息
  if (params.data && params.data.apiVersion) {
    header.version = params.data.apiVersion;
    delete params.data.apiVersion;
  }

  params.data = filterParams(params.data);

  params = $.extend({
    //tech: "reactUI"
    //dataType: 'json',
    //capture401AutoRedirect: false,
    //timeout: 20 * 1000,
  }, params);

  //get请求修改 headers不能跨域了
  // if (!params.type === "GET") {
  //   params.headers = {version:11};
  // } else {
  //   delete params.headers;
  // }
  //$.extend(header, params.headers)
  return params;
};

//统一处理成功及报错 code
function _ajax(options) {
  var params = dealParams(options);

  return $.ajax(params);
}

function parseArguments(url, data, success, dataType) {
  if ($.isFunction(data)) {
    dataType = success;
    success = data;
    data = undefined;
  }
  if (!$.isFunction(success)) {
    dataType = success;
    success = undefined;
  }
  return {
    url: url
  , data: data
  , success: success
  , dataType: dataType
  };
}

var _get = function (/* url, data, success, dataType */) {
  return _ajax(parseArguments.apply(null, arguments));
};

var _post = function (/* url, data, success, dataType */) {
  var options = parseArguments.apply(null, arguments);
  options.type = 'POST';
  return _ajax(options);
};

var _getJSON = function (/* url, data, success */) {
  var options = parseArguments.apply(null, arguments);
  options.dataType = 'json';
  return _ajax(options);
};

$._ajax = _ajax;
$._get = _get;
$._post = _post;
$._getJSON = _getJSON;

$.Api = ApiPath;

module.exports = $;
