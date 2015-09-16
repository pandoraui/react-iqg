'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');

var timeLength;
var days;

var View = React.createClass({
  getInitialState: function() {
    timeLength = AppStore.updateTime();
    return {
      timeLength: timeLength
    }
  },
  handleClick: function(index) {
    // e.preventDefault();
    timeLength = days[index].value;
    this.setState({
      timeLength: AppActions.updateTime(timeLength)
    });
  },
  renderMap: function() {
    days = this.props.dataTopBar.days;
    //如果当前选中昨天，但最小值不是昨天，则自动变更为7天
    if (timeLength === 1 && days[0].value !== 1) {
      timeLength = 7;
    }

    return days.map(function(day, i) {
      var style = "iqg-tab";
      if (day.value == timeLength) {
        style = "iqg-tab iqg-tab-active";
      }
      return (
        <a className={style}
           onClick={this.handleClick.bind(this, i)}
           key={i}>
          {day.name}
        </a>
      );
    }.bind(this) );
  },
  render: function() {
    var time = this.props.dataTopBar.time;
    var text = time + ' ' +this.props.dataTopBar.text;
    var titleText;
    if (time) {
      titleText = (<p className="gray">{text}</p>);
    }
    return (
      <div className="iqg-topbar">
        <div className="iqg-tabs box-title">
          {this.renderMap()}
          {titleText}
        </div>
      </div>
    );
  }
});

module.exports = View;
