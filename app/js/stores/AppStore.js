'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var assign = require('object-assign');
var dateUtil = require('../utils/DateUtil');

var CHANGE_EVENT = 'change';

// headerBar 数据，包括 title
var _headerData = {
  title: '统计平台',
  hideHeaderBar: true
};
var hostname = location.hostname;
if ( hostname.match(/^localhost$/) ) {
  _headerData.hideHeaderBar = false;
}

var headerData = assign({}, _headerData);
function updateHeader(data) {
  if(data){
    headerData = assign({}, headerData, data);
  }
}

//var server_time = +new Date();
var clientTime = +new Date() - 86400000;

var _pageInfo = {
  time: clientTime,
  timeInfo: dateUtil.format(clientTime, 'Y年M月D日'),
  days: 1,
  type: 0,
  typeName: '展示',
  order_by: 'desc'
};
var pageInfo = assign({},_pageInfo);

function updatePage(data) {
  var nowTime = +new Date(),
      days = parseInt(data.days);

  if (days) {
    //默认昨天
    var timeInfo =  dateUtil.format( nowTime - 86400000, 'Y年M月D日');

    //如果是时间段，则拼接一下
    if (days !== 1) {
      timeInfo = dateUtil.format( nowTime - 86400000 * days, 'Y年M月D日') + '-' + timeInfo;
    }
    pageInfo = assign({}, pageInfo, {
      time: nowTime,
      timeInfo: timeInfo,
    });
  }

  if(data){
    pageInfo = assign({}, pageInfo, data);
  }
}

var timeLength = 1;

//全局对象
var AppStore = assign({}, EventEmitter.prototype, {
  updateHeader: function() {
    return headerData;
  },
  getPageInfo: function() {
    return pageInfo;
  },
  updateTime: function() {
    return timeLength;
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// 注册回调事件
// Register callback to handle all updates
AppDispatcher.register( function(action) {
  switch (action.actionType) {
    //view 级别公共状态数据监控，如 title 等
    case AppConstants.APP_HEADER:
      if (action.data) {
        updateHeader(action.data);
      }
      AppStore.emitChange();
      break;

    case AppConstants.APP_PAGE:
      if (action.data) {
        updatePage(action.data);
      }
      AppStore.emitChange();
      break;

    case AppConstants.APP_AJAX:
      if (action.obj) {
        //update(action.content);
      }
      AppStore.emitChange();
      break;
    case AppConstants.APP_TIME_LENGTH:
      if (timeLength !== action.data) {
        timeLength = action.data;
        AppStore.emitChange();
      }
      break;
    default:
      // no op
  }
});

module.exports = AppStore;
