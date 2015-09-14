'use strict';

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var AppActions = require('../actions/AppActions');

var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');

var pageInfo = {
  title: '活动页面',
  header: null
};

var Action = React.createClass({
  getInitialState: function() {
    return {};
  },
  componentDidMount: function() {
    AppActions.updateHeader(pageInfo);
  },
  render: function() {
    console.log('全屏页面');
    return (
      <div className="ask-page">
        <NavLink/>
        <div className="ask-banner">
          <RUI.Container>
            <h1>活动或主题页面</h1>
            <h2>这是一个全屏单页面，无头部。</h2>
          </RUI.Container>
        </div>
      </div>
    );
  }
});

module.exports = Action;
