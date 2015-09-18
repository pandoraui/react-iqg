'use strict';

var React = require('react');

var AppStore = require('../stores/AppStore');

var customIcon = (<img src="data:image/svg+xml;charset=utf-8,&lt;svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 12 20&quot;&gt;&lt;path d=&quot;M10,0l2,2l-8,8l8,8l-2,2L0,10L10,0z&quot; fill=&quot;%23fff&quot;/&gt;&lt;/svg&gt;" />);

var View = React.createClass({
  getInitialState: function() {
    return AppStore.updateHeader();
  },
  componentWillMount: function() {
    AppStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    //此处要更新一下 TDK，目前只提供 title 的
    //console.log(React.findDOMNode())
    var headerData = AppStore.updateHeader();
    document.title = headerData.title + '-爱抢购';
    this.setState(headerData);
  },
  historyBack: function(e) {
    e.preventDefault();
    history.back();
  },
  onSelect: function(e) {
    e.preventDefault();
    console.log(e);
  },
  render: function() {
    return (
      <div className="header-bar">
        <header className="iqg-header iqg-header-default iqg-header-fixed">
          <div className="iqg-header-nav iqg-header-left">
            <a href="#left-link" onClick={this.historyBack}>
              {customIcon}
            </a>
          </div>
          <h1 className="iqg-header-title">{this.state.title}</h1>
          <div className="iqg-header-nav iqg-header-right">
            <a href="#right-link" onClick={this.onSelect}>
              <span className="iqg-icon-bars iqg-header-icon" icon="bars"></span>
            </a>
          </div>
        </header>
      </div>
    );
  }
});

module.exports = View;
