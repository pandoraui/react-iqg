'use strict';

var React = require('react');
// var Router = require('react-router');
// var Route = Router.Route;
// var State = Router.State;
// var Link = Router.Link;


var NavLink = React.createClass({
  render: function() {
    return (
      <div className="am-padding-vertical-lg ask-nav">
          <h2>测试链接</h2>
          <a className="am-btn am-btn-link" href="#/">首页</a>
          <a className="am-btn am-btn-link" href="#/chart">图表</a>
          <br/>
          <a className="am-btn am-btn-link" href="#/brand/23">品牌23</a>
          <a className="am-btn am-btn-link" href="#/brand/24">品牌24</a>
          <a className="am-btn am-btn-link" href="#/brand/23/branch/34">分店34</a>
          <a className="am-btn am-btn-link" href="#/brand/23/branch/35">分店35</a>
          <br/>
          <a className="am-btn am-btn-link" href="#/detail/25">详情展示</a>
      </div>
    );
  }
});

module.exports = NavLink;
