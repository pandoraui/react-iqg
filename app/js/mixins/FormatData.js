'use strict';

module.exports = {
  formatNumber: function(num, format) {
    var format = format || '';
    var newNum = (num * 100).toFixed(2);
    if (!(newNum%1)) {
      newNum = parseInt(newNum) + format;
    }
    return newNum;
  }
};
