'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');

var View = React.createClass({
  getInitialState: function() {
    return {
      days: AppStore.getPageInfo().days
    }
  },
  componentWillMount: function() {
    var list = this.props.data.list;
    var days = AppStore.getPageInfo().days;
    //如果当前选中昨天，但最小值不是昨天，则自动变更为7天
    if (days === 1 && list[0].value !== 1) {
      days = 7;
      this.setState({
        days: days
      });
      AppActions.updatePage({days: days});
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    //如果天数不变，不要更新(减少渲染次数)
    //此组件是否渲染只跟天数相关，nextProps 发生变动不用 render
    return nextState.days !== this.state.days;
  },
  componentDidUpdate: function() {
    //这里要更新滚动悬浮的盒子高度，针对不同的设备，切换的不同天数，导致换行，高度要动态变化；
    var height = React.findDOMNode(this.refs.fixbox).offsetHeight;
    React.findDOMNode(this.refs.fixOutbox).setAttribute("style", 'height:' + height + 'px');
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
  getFixHeight: function() {
    var height = React.findDOMNode(this.refs.fixbox).height();
    return height;
  },
  render: function() {
    console.log('当前天数: ' + this.state.days);
    var timeInfo = AppStore.getPageInfo().timeInfo;
    var titleText;
    var text = this.props.pageTypeName + '总体数据';
    if (this.props.pageTypeName) {
      text = timeInfo + ' ' + text;
      titleText = (<p className="gray">{text}</p>);
    }
    // var style = {
    //   height: this.getFixHeight()
    // };
    return (
      <div className="iqg-topbar" ref="fixOutbox">
        <div className="iqg-tabs box-title iqg-header-fixed" ref="fixbox" >
          {this.renderMap()}
          {titleText}
        </div>
      </div>
    );
  }
});

module.exports = View;
