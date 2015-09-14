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

var AppActions = {
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
    delete _options.react_id;
    delete _options.react_actionType;
    $._ajax(_options);
  },
  updateHeader: function(obj) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_HEADER,
      obj: obj
    });
  },
  create: function(text) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_CREATE,
      text: text
    });
  }
};

module.exports = AppActions;
