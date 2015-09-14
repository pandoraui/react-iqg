'use strict';

var React = require('react');
// import Reflux from 'reflux';
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

// import analyticsStore from 'stores/analytics';

var HeaderBar = require('../components/HeaderBar');

var Application = React.createClass({
  render: function() {
    return (
      <div className="ask-pages">
        <HeaderBar />
        <main className="ask-main">
          <RouteHandler />
        </main>
      </div>
    );
  }
});

module.exports = Application;
