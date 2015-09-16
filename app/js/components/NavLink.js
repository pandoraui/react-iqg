'use strict';

var React = require('react');
// var Router = require('react-router');
// var Route = Router.Route;
// var State = Router.State;
// var Link = Router.Link;


var NavLink = React.createClass({
  render: function() {
    return (
      <div className="iqg-panel">
          <h2>测试链接</h2>
          <a className="pure-button" href="#/brand/23">品牌23</a>
          <a className="pure-button" href="#/brand/23/branch/34">分店34</a>
          <a className="pure-button" href="#/detail/25">详情展示</a>
          <a className="pure-button" href="#/notfound">404</a>
          <br />
          <a className="pure-button" href="#/ajax">Ajax</a>
          <a className="pure-button" href="#/test">TEST</a>
      </div>
    );
  }
});

module.exports = NavLink;
