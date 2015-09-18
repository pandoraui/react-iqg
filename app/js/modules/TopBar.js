'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');

var View = React.createClass({
  getInitialState: function() {
    return {
      days: AppStore.updatePage().days
    }
  },
  componentWillMount: function() {
    var list = this.props.data.list;
    var days = AppStore.updatePage().days;
    //如果当前选中昨天，但最小值不是昨天，则自动变更为7天
    if (days === 1 && list[0].value !== 1) {
      days = 7;
      AppActions.updatePage({days: days});
      this.setState({
        days: days
      });
    }
  },
  handleClick: function(newDays) {
    // e.preventDefault();
    newDays = parseInt(newDays);
    //点击变更天数了，要更新状态
    if ( newDays == this.state.days) {
      return;
    }
    AppActions.updatePage({days: newDays});
    this.setState({
      days: newDays
    });
  },
  renderMap: function() {
    var list = this.props.data.list;
    return list.map(function(item, i) {
      var style = "iqg-tab";
      if (item.value === this.state.days) {
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
    console.log('当前天数: ' + this.state.days);
    var time = this.props.data.time;
    var text = time + ' ' +this.props.data.text;
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
