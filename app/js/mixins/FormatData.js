'use strict';

module.exports = {
  formatNumber: function(num) {
    var newNum = (num * 100).toFixed(2);
    if (!(newNum%1)) {
      newNum = parseInt(newNum) + '%';
    }
    return newNum;
  }
};
