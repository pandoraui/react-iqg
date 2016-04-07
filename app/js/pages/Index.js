'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var NavLink = require('../components/NavLink');

var headerData = {
  title: '统计平台'
};

var Debug = false;
var host = window.location.host;
if(host.match(/^localhost/i) ){
  Debug = true;
}

var Index = React.createClass({
  getInitialState: function() {
    return {};
  },
  componentWillMount: function() {
    AppActions.updateHeader(headerData);
  },
  render: function() {
    return (
      <div className="iqg-page">
        {Debug ? (<NavLink/>) : (<p></p>) }
        <div className="iqg-banner">
          <div>
            <h2>请在爱抢购商户 App 中使用</h2>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Index;
