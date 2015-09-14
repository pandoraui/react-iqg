'use strict';

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;
//var LocalStorageMixin = require('react-localstorage');

var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');
var Tabs = RUI.Tabs;

var AppActions = require('../actions/AppActions');

var $ = require('../utils/Ajax');
// var $ = require('npm-zepto');

var pageInfo = {
  title: '复杂 ajax 页面'
};

var tabkey = "1";
var cData = [{
      data: '这里是复杂的数据 1'
    }, {
      data: '这里是复杂的数据 2'
    }, {
      data: '这里是复杂的数据 3'
    }];

var TabContent = function(index, state) {
  var key = state.key;
  var curData = state.cData[index - 1];
  if (curData.loaded) {
    return (<div> {curData.data} </div>);
  } else if (key === index) {
    console.log(111);
    return (<div className="am-text-center"><i className="am-icon-spinner am-icon-spin"></i></div>);
  } else {
    return (<div>这是位置 {index} 这里数据要去请求。。。</div>);
  }
};

var Complex = React.createClass({
  displayName: 'APP_Complex',
  //mixins: [LocalStorageMixin],
  getInitialState: function() {
    //这里每次被调用都被初始化了，不爽，
    //应该对应一个组件，这个组件的状态一直被记住（基于组件位置唯一）
    //需要设置一个当前状态记忆变量，同步更新
    //console.log("这里每次都被初始化了，不爽");
    return {
      key: tabkey || "1",
      cData: cData
    };
  },
  handleSelect: function(key) {
    console.log('你点击了：', key);
    //this.props.handleSelect(key);
    tabkey = key;
    cData = this.state.cData;

    this.setState({
      key: key
    });

    var self = this;
    setTimeout(function() {
      cData[key - 1].loaded = true;
      self.setState({
        cData: cData
      });
    }, 1000);
  },
  render: function() {
    return (
      <div className="ask-page">
          <Tabs justify defaultActiveKey={this.state.key} onSelect={this.handleSelect}>
            <Tabs.Item eventKey="1" title="恣意">
              {TabContent(1, this.state)}
            </Tabs.Item>
            <Tabs.Item eventKey="2" title="等候">
              {TabContent(2, this.state)}
            </Tabs.Item>
            <Tabs.Item eventKey="3" title="流浪">
              {TabContent(3, this.state)}
            </Tabs.Item>
          </Tabs>
      </div>
    );
  }
});

module.exports = Complex;
