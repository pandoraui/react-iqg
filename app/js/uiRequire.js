'use strict';

//创造一个全局变量，挂载点
(function(reactUI) {
  global.reactUI = reactUI;
})(global.reactUI || {});



var uiRequire = function (src) {
  if (src) {
    return require('../module/' + src);
  } else {
    return require('../../../src/AMUIReact');
  }
};

module.exports = uiRequire;
