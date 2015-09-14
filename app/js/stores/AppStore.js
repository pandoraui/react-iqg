'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _pageInfo = {
  title: '推广效果'
}

function update(data) {
  if(data){
    pageInfo = assign({}, pageInfo, data);
  }
}

var pageInfo = assign({},_pageInfo);

var AppStore = assign({}, EventEmitter.prototype, {
  updateView: function() {
    return pageInfo;
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
    case AppConstants.APP_VIEW:
      if (action.data) {
        update(action.data);
      }
      AppStore.emitChange();
      break;
    default:
      // no op
  }
});

module.exports = AppStore;
