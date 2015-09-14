'use strict';

var React = require('react');
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '登录'
};

var Login = React.createClass({
  componentDidMount: function() {
    AppActions.updateHeader(pageInfo);
  },
  render: function() {
    return (
      <div className="ask-page">
        <NavLink/>
        <RUI.Container className="am-padding-vertical-lg">
          <h2>登录</h2>
          <p>登录页面</p>
        </RUI.Container>
      </div>
    );
  }
});

module.exports = Login;
