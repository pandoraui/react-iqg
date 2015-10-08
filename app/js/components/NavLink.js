'use strict';

var React = require('react');
// var Router = require('react-router');
// var Route = Router.Route;
// var State = Router.State;
// var Link = Router.Link;
/*
<br />
<a className="pure-button" href="#/ajax">Ajax</a>
<a className="pure-button" href="#/test">TEST</a>
*/

var NavLink = React.createClass({
  render: function() {
    return (
      <div className="iqg-panel">
          <h2>测试链接</h2>
          <a className="pure-button" href="#/brand/2175?title=品牌大标题">品牌23</a>
          <a className="pure-button" href="#/brand/2175/branch/11331?title=分店标题">分店34</a>
          <a className="pure-button" href="#/brand/2175/branch/11331/item/45?title=商品名">商品</a>
          <br />
          <a className="pure-button" href="#/brand/2175/detail/2">详情展示</a>
          <a className="pure-button" href="#/notfound">404</a>
      </div>
    );
  }
});

module.exports = NavLink;
