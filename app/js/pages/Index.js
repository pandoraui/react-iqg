'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var NavLink = require('../components/NavLink');

var pageInfo = {
  title: '推广效果'
};

var Index = React.createClass({
  getInitialState: function() {
    return {};
  },
  
  componentDidMount: function() {
    AppActions.updateView(pageInfo);
  },
  render: function() {
    return (
      <div className="iqg-page">
        <NavLink/>
        <div className="iqg-banner">
          <div>
            <h1>Hello World!</h1>
            <h2>欢迎使用 Amaze UI React 入门套件。</h2>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Index;
