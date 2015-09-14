'use strict';

var React = require('react');
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');

var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '列表页'
};

var List = React.createClass({
  getInitialState: function() {
    return {
      id: this.props.params.id
    };
  },
  componentDidMount: function() {
    AppActions.updateHeader(pageInfo);
  },
  render: function() {
    return (
      <div className="ask-page">
        <NavLink/>
        <RUI.Container className="am-padding-vertical-lg">
          <h2>列表页面</h2>
          <p>列表ID：{this.state.id}</p>
        </RUI.Container>
      </div>
    );
  }
});

module.exports = List;
