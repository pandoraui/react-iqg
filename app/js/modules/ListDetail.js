'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var dateUtil = require('../utils/DateUtil');

var View = React.createClass({
  renderMap: function() {
    var data = this.props.data;
    var opts = this.props.opts;

    var year = (new Date()).getFullYear() + '年';
    return (opts.numTitle && this.hasPercentData() ) ? data.map(function(item) {
      var date = dateUtil.format(item.date*1000, 'Y年M月D日').replace(year, '');
      return (
        <li>
          <span className="num">{item.percent}%</span>
          <span className="value">{item.value}</span>
          <span className="time">{date}</span>
        </li>
      );
    }) : data.map(function(item) {
      var date = dateUtil.format(item.date*1000, 'Y年M月D日').replace(year, '');
      return (
        <li>
          <span className="value">{item.value}</span>
          <span className="time">{date}</span>
        </li>
      );
    });
  },
  hasPercentData: function() {
    var data = this.props.data;
    return !!(data[0] && data[0].percent);
  },
  render: function() {
    var data = this.props.data;
    var opts = this.props.opts;
    var numTitle;
    if(opts.numTitle && this.hasPercentData() ){
      numTitle = (<span className="num">{opts.numTitle}</span>);
    }
    return (
      <div className="list-detail">
          <ul>
            <li className="title">
              {numTitle}
              <span className="value">{opts.valueTitle}</span>
              <span className="time">日期</span>
            </li>
            {this.renderMap()}
          </ul>
        </div>
    );
  }
});

module.exports = View;
