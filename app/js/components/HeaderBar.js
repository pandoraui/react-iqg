'use strict';

var React = require('react');
var Router = require('react-router');

var RUI = require('../reactUI');
var Header = RUI.Header;

var AppStore = require('../stores/AppStore');

//console.log(Router.HistoryLocation.getCurrentPath());

var HeaderBar = React.createClass({
  getInitialState: function() {
    return AppStore.getHeaderInfo();
  },
  componentDidMount: function() {
    AppStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  render: function() {
    if (!this.state.data) {
      return <div></div>;
    }
    return (
      <Header {...this.state} />
    );
  },
  _onChange: function() {
    //此处要更新一下 TDK，目前只提供 title 的
    //console.log(React.findDOMNode())
    var headerInfo = AppStore.getHeaderInfo();
    document.title = headerInfo.title + '-爱抢购';
    this.setState(headerInfo);
  }
});

module.exports = HeaderBar;
