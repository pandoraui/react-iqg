'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');

var timeLength = 1;

var View = React.createClass({
  getInitialState: function() {
    return {
      timeLength: timeLength
    }
  },
  // componentDidMount: function() {
  //   AppStore.addChangeListener(this._onChange);
  // },
  // componentWillUnmount: function() {
  //   AppStore.removeChangeListener(this._onChange);
  // },
  // _onChange: function() {
  //   //此处要更新一下 TDK，目前只提供 title 的
  //   //console.log(React.findDOMNode())
  //   var timeLength = AppStore.updateTime();
  //   this.setState(timeLength);
  // },
  renderMap: function() {
    var days = this.props.dataTopBar.days;
    //如果当前选中昨天，但最小值不是昨天，则自动变更为7天
    if (timeLength === 1 && days[0].value !== 1) {
      timeLength = 7;
    }
    return days.map(function(day,i) {
      var style = "iqg-tab";
      if (day.value == timeLength) {
        style = "iqg-tab iqg-tab-active";
      }
      return (
        <a className={style} data-value={day.value}>{day.name}</a>
      );
    });
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
