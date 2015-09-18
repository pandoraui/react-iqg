'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');
var assign = require('object-assign');

// ajax状态更新示例
// function showArticle(articleId) {
//     dispatch({type: "SHOW_ARTICLE", id: articleId, state: "loading"});
//     $.ajax({
//         url: "/article/#{articleId}"
//         success: function (data, textStatus, jqXHR) {
//             dispatch({type: "ARTICLE_LOADED", id: articleId, state: "ready", content: data});
//         }
//     });
// }

//行为创建器
//本来数据可以针对 header 以及其他数据区分对待，
//但现在就是单例的 store，细分可以如下：
//Header(包含 title)  ajax及页面参数 
var AppActions = {
  updateHeader: function(data) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_HEADER,
      data: data
    });
  },
  updateView: function(data) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_VIEW,
      data: data
    });
  },
  updateTime: function(data) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_TIME_LENGTH,
      data: data
    });
  },
  ajax: function(options) {
    var _options = assign({}, options);
    // AppDispatcher.dispatch({
    //     actionType: options.react_actionType,
    //     id: options._react_id,
    //     loaded: false
    //   });
    // var tempSuc = options.success;
    // function _suc(data, textStatus, jqXHR) {
    //   tempSuc.apply(null, arguments);
    //   // AppDispatcher.dispatch({
    //   //   actionType: options.react_actionType,
    //   //   id: options._react_id,
    //   //   loaded: true,
    //   //   content: data
    //   // });
    // }
    // _options.success = _suc;
    // delete _options.react_id;
    // delete _options.react_actionType;
    $._ajax(_options);
  },
  create: function(text) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_CREATE,
      text: text
    });
  }
};

module.exports = AppActions;
