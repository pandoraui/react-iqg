'use strict';

var React = require('react');
// import Reflux from 'reflux';
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

// var AppActions = require('../actions/AppActions');
// var AppStore = require('../stores/AppStore');
var HeaderBar = require('../modules/HeaderBar');
var AppStore = require('../stores/AppStore');

//状态变化：
//单页面应用一个 View 具有当前 view 的状态维护，比如 title
//而对于一个类型的连贯性操作，为一系列共用状态，应共同维护，如上 title
//划分级别，公共状态级别高低，为全局还是某项目内
//目前关于统计项目，全部在公共级别状态中，包含有以下字段
// 不含 [brand_id,branch_id,item_id,detail_id]，在 url 中
// title 标题
// days  时间 (默认值为 1，detail 页面默认为 7)
// type  数据类型 (根据 days是否为1，数据有变化)
// order 排序方式 (默认倒序 desc, 可选 dsc )

//默认页面状态数据
var Info = {
  title: '统计平台',
  days: 1,
  type: null,
  order: 'desc'
};

/* 组件生命周期

        
getInitialState: function() {
  //在组件挂载之前调用一次。返回值将会作为 this.state 的初始值。

  return {};
},
getDefaultProps: function() {
  //在组件类创建的时候调用一次，然后返回值被缓存下来。

  return {};
},

propTypes: {},    //验证传入到组件的 props，
mixins: [],       //使用混合来在多个组件之间共享行为
statics: {},      //静态方法
displayName: '',  //用于输出调试信息

componentWillMount: function() {
  //挂载，只调用一次，在初始化渲染执行之前立刻调用。

}, 
componentDidMount: function() {
  //在初始化渲染执行之后立刻调用一次，仅客户端有效（服务器端不会调用）。
  //如果想和其它 JavaScript 框架集成，使用 setTimeout 或者 setInterval 来设置定时器，或者发送 AJAX 请求，可以在该方法中执行这些操作。

},
componentWillReceiveProps: function() {
  //在组件接收到新的 props 的时候调用。在初始化渲染的时候，该方法不会调用。

},
shouldComponentUpdate: function() {
  //在接收到新的 props 或者 state，将要渲染之前调用，以判断是否要执行 render
  //默认返回 true

  return true;
},
componentWillUpdate: function() {
  //在 state 改变的时候执行一些操作，不能在该方法中使用 this.setState()

},
componentDidUpdate: function() {
  //在组件的更新已经同步到 DOM 中之后立刻被调用。
  //使用该方法可以在组件更新之后操作 DOM 元素。

},
componentWillUnmount: function() {
  //组件从 DOM 中移除的时候立刻被调用

},

 */


var Application = React.createClass({
  // getInitialState: function() {
  //   return {
  //     view: AppStore.updateView()
  //   };
  // },
  // componentDidMount: function() {
  //   AppStore.addChangeListener(this._onChange);
  // },
  // componentWillUnmount: function() {
  //   AppStore.removeChangeListener(this._onChange);
  // },
  // _onChange: function() {
  //   console.log('触发更新');
  //   this.setState({
  //     view: AppStore.updateView()
  //   });
  // },
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
