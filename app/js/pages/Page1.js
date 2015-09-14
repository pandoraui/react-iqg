'use strict';

var React = require('react');
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
var TabsSelect = require('./Tab');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '页面1'
};

var Page1 = React.createClass({
  componentDidMount: function() {
    AppActions.updateHeader(pageInfo);
  },
  render: function() {
    return (
      <div className="ask-page">
        <NavLink/>
        <RUI.Container className="am-padding-vertical-lg">
          <h2>页面 1</h2>
          <p>页面内容</p>
          <TabsSelect />
        </RUI.Container>
      </div>
    );
  }
});

module.exports = Page1;
