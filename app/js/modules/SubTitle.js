'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var View = React.createClass({
  render: function() {
    var data = this.props.dataSubTitle;
    var title = data.time + ' ' + data.title;
    return (
      <div className="sub-list-title box-title iqg-cf">
        <h3 className="gray">{title}</h3>
        <div className="iqg-select-btn">
          <span className="iqg-arr-btn">抢购率</span>
          <span className="iqg-sort">
            <i className="iqg-icon-arr"></i>
          </span>
        </div>
      </div>
    );
  }
});

module.exports = View;
