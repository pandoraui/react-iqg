'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');

var tempList;
var days = 1;  //辅助状态变量

var View = React.createClass({
  getInitialState: function() {
    days = AppStore.updateView().days;
    return {
      days: days
    }
  },
  handleClick: function(newDays) {
    // e.preventDefault();
    newDays = parseInt(newDays);
    //点击变更天数了，要更新状态
    if ( newDays == this.state.days) {
      return;
    }
    days = newDays;

    AppActions.updateView({days: newDays});

    this.setState({
      days: newDays
    });
  },
  // componentWillReceiveProps: function() {
  //   var days = AppStore.updateView().days;
  //   this.setState({
  //     days: newDays
  //   });
  // },
  renderMap: function() {
    tempList = this.props.dataTopBar.days;
    //如果当前选中昨天，但最小值不是昨天，则自动变更为7天
    if (days === 1 && tempList[0].value !== 1) {
      days = 7;
      AppActions.updateView({days: days})
    }

    return tempList.map(function(item, i) {
      var style = "iqg-tab";
      if (item.value == days) {
        style = "iqg-tab iqg-tab-active";
      }
      return (
        <a className={style}
           onClick={this.handleClick.bind(this, item.value)} >
          {item.name}
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
