'use strict';

var React = require('react');
// var Router = require('react-router');
// var Route = Router.Route;
// var Link = Router.Link;

var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '404'
};

var NotFound = React.createClass({
  componentDidMount: function() {
    AppActions.updateView(pageInfo);
  },
  render: function() {
    return (
      <div className="iqg-page">
        <div className="iqg-banner">
          <h1>404 页面未找到！！！</h1>
          <p>点此返回 <a className="pure-button" href="#/">首页</a></p>
        </div>
      </div>
    );
  }
});

module.exports = NotFound;
