'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _headerInfo = {
  title: 'React UI',
  link: '#title-link',
  fixed: true,
  data: {
    left: [
      {
        link: '#back',
        icon: 'home',
        customIcon: "data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 12 20\"><path d=\"M10,0l2,2l-8,8l8,8l-2,2L0,10L10,0z\" fill=\"%23fff\"/></svg>",
        callback: function(nav, e) {
          e.preventDefault();
          var history = window.history;
          history.back();
        }
      }
    ],
    right: [
      {
        link: '#right-link',
        icon: 'bars'
      }
    ]
  },
  onSelect: function(nav, e) {
    e.preventDefault();
    // do something
    // if (nav.link === "#back") {
    //   var history = window.history;
    //   history.back();
    // } else {
    //   console.log('你点击了', nav);
    // }
  }
};

var headerInfo = assign({}, _headerInfo);

function update(obj) {
  //console.log('更新 Header')
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  //var id = pageName;
  var tempData = {};
  var tempObj = assign({}, obj);
  //console.log(obj)
  if (tempObj.header) {
    tempData = assign({}, tempObj.header);
    tempData = assign({}, _headerInfo.data, tempData);
    delete tempObj.header;
    headerInfo = assign({}, _headerInfo, tempObj);
    headerInfo.data = tempData;
    //console.log(tempData)
  } else {
    headerInfo = assign({}, _headerInfo, tempObj);
  }
  if (obj.header === null) {
    headerInfo.data = null;
  }
  //console.log(headerInfo.data)
}
// function update(obj) {
//   _headerInfo = assign({}, _headerInfo, {info: obj});
//   // if (_datas[id]) {
//   //   _datas[id] = assign({}, _datas[id], obj);
//   // } else {
//   //   create(id, obj);
//   // }
// }

var AppStore = assign({}, EventEmitter.prototype, {
  getHeaderInfo: function() {
    return headerInfo;
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

// Register callback to handle all updates
AppDispatcher.register( function(action) {
  var text;

  switch (action.actionType) {
    case AppConstants.APP_AJAX:
      if (action.obj) {
        update(action.content);
      }
      AppStore.emitChange();
      break;
    case AppConstants.APP_HEADER:
      if (action.obj) {
        update(action.obj);
      }
      AppStore.emitChange();
      break;
    default:
      // no op
  }
});

module.exports = AppStore;
