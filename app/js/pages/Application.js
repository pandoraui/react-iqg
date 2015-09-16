'use strict';

var React = require('react');
// import Reflux from 'reflux';
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

// var AppActions = require('../actions/AppActions');
// var AppStore = require('../stores/AppStore');
var HeaderBar = require('../modules/HeaderBar');
var AppStore = require('../stores/AppStore');

var Application = React.createClass({
  getInitialState: function() {
    return {
      days: AppStore.updateTime()
    };
  },
  componentDidMount: function() {
    AppStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState({
      days: AppStore.updateTime()
    });
  },
  render: function() {
    return (
      <div className="iqg">
        <HeaderBar />
        <main className="iqg-main">
          <RouteHandler days={this.state.days} />
        </main>
      </div>
    );
  }
});

module.exports = Application;
