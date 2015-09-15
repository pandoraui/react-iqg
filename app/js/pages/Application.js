'use strict';

var React = require('react');
// import Reflux from 'reflux';
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

// var AppActions = require('../actions/AppActions');
// var AppStore = require('../stores/AppStore');
var HeaderBar = require('../modules/HeaderBar');

var Application = React.createClass({
  render: function() {
    return (
      <div className="iqg">
        <HeaderBar />
        <main className="iqg-main">
          <RouteHandler />
        </main>
      </div>
    );
  }
});

module.exports = Application;
