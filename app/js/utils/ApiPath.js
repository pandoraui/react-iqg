'use strict';

var apiHost = {
  // 预发环境
  dev: 'http://dev.iqianggou.lab:8181',
  staging: 'http://staging.iqianggou.com',
  prod: 'http://m.iqianggou.com',
  local: 'http://10.0.0.119:8000'
};

var apiPrefix;
var testApiHost;
var debugApi = false;
var originApiHost = apiHost.prod;
var defaultApiHost = apiHost.prod;
var hostname = location.hostname;

if (hostname.match(/^localhost$/) || hostname.match(/^10\.0\.0\.[\d]+$/) || hostname.match(/yanzhanjun|lab/)) {
  debugApi = true;
  testApiHost = apiHost.staging;
} else {
  debugApi = false;
}

apiPrefix = testApiHost || originApiHost || defaultApiHost;

var generateApi = function(pathname, prefix) {
  if (typeof prefix !== 'string') {
    //如果非全地址，添加对应的域
    prefix = apiPrefix;
  }
  return prefix + pathname;
};

/*

/api/brandadmin/stats/all //展示
/api/brandadmin/stats/detail //图表
/api/brandadmin/stats/list // 列表

*/

var stats = '/api/brandadmin/stats';

var ApiPath = {
  TJ_ALL:    generateApi(stats + '/general'),
  TJ_LIST:   generateApi(stats + '/list'),
  TJ_DETAIL: generateApi(stats + '/detail'),
  TEST: generateApi('/users/octocat/gists', 'https://api.github.com')
};

module.exports = ApiPath;
