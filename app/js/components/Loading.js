'use strict';

var React = require('react');
var cloneElement = React.cloneElement;
// var OverlayMixin = require('../mixins/OverlayMixin');
// var DimmerMixin = require('../mixins/DimmerMixin');
var createChainedFunction = require('../utils/createChainedFunction');

/*
TODO:Ajax 模块规划
每个 ajax 都应该创建一个独立实例，
要求传入需要监听的参数数据（在 store 中），传入 url 以及 ajax 配置参数
当监听的参数数据发生变化，只需更新此模块即可，而无需更新父模块
*/

var View = React.createClass({

  propTypes: {
    loading: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      loadingJSX: (<div className="ajax-loading"><i className="iqg-icon-spinner iqg-icon-spin"></i></div>);
    };
  },

  getInitialState: function() {
    return {
      loading: false
    };
  },

  showLoading: function() {
    this.setState({
      loading: true
    });
  },

  hideLoading: function() {
    this.setState({
      loading: true
    });
  },

  renderLoading: function() {
    if (this.state.loading) {
      return cloneElement(
        this.props.loadingJSX,
        {
          showLoading: this.showLoading,
          hideLoading: this.hideLoading
        }
      );
    }
  },

  render: function() {

    var child = React.Children.only(this.props.children);
    var props = {};

    props.showLoading = createChainedFunction(child.props.showLoading, this.showLoading);
    props.hideLoading = createChainedFunction(child.props.hideLoading, this.hideLoading);

    return this.state.loading ? (this.renderLoading()) : cloneElement(child, props);
  }
});

module.exports = View;
