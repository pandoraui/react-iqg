'use strict';

var React = require('react');
// import Reflux from 'reflux';
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

var AppStore = require('../stores/AppStore');

var Application = React.createClass({
  getInitialState: function() {
    return AppStore.updateView();
  },
  componentDidMount: function() {
    AppStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    //此处要更新一下 TDK，目前只提供 title 的
    //console.log(React.findDOMNode())
    var pageInfo = AppStore.updateView();
    document.title = pageInfo.title + '-爱抢购';
    this.setState(pageInfo);
  },
  render: function() {
    return (
      <div className="iqg">
        <main className="iqg-main">
          <RouteHandler />
        </main>
      </div>
    );
  }
});

module.exports = Application;
