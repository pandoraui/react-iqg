'use strict';

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '404'
};

var NotFound = React.createClass({
  componentDidMount: function() {
    AppActions.updateHeader(pageInfo);
  },
  render: function() {
    return (
      <div className="ask-page">
        <div className="ask-banner">
          <RUI.Container>
            <h1>404 页面未找到！！！</h1>
            <h2>点此返回<a className="am-btn am-btn-link" href="#/">首页</a></h2>
          </RUI.Container>
        </div>
      </div>
    );
  }
});

module.exports = NotFound;
