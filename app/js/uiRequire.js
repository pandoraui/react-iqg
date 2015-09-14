'use strict';

//创造一个全局变量，挂载点
(function(reactUI) {
  global.reactUI = reactUI;
})(global.reactUI || {});



var uiRequire = function (src) {
  var tempUI = global.reactUI;
  if (tempUI && tempUI[src]) {
    return tempUI[src];
  } else if (src) {
    tempUI[src] = require('../../../src/' + src);
    return tempUI[src];
  } else {
    console.error('必须输入 src');
    return require('../../../src/AMUIReact');
  }
};

module.exports = uiRequire;
