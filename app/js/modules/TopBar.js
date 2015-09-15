'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var View = React.createClass({
  renderMap: function() {
    var days = this.props.dataTopBar.days;
    var index = this.props.index;
    return days.map(function(day,i) {
      var style = "iqg-tab";
      if (i==index) {
        style = "iqg-tab iqg-tab-active";
      }
      return (
        <a className={style} 
          data-index={i} 
          data-value={day.value}>{day.name}</a>
      );
    });
  },
  render: function() {
    var time = this.props.dataTopBar.time;
    var text = time + ' ' +this.props.dataTopBar.text;
    return (
      <div className="iqg-topbar">
        <div className="iqg-tabs box-title">
          {this.renderMap()}
          {time ? (<p className="gray">{text}</p>) : ''}
        </div>
      </div>
    );
  }
});

module.exports = View;
