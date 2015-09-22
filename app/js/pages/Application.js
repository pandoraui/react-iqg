'use strict';

var React = require('react');
// import Reflux from 'reflux';
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

// var AppActions = require('../actions/AppActions');
// var AppStore = require('../stores/AppStore');
var HeaderBar = require('../modules/HeaderBar');
var AppStore = require('../stores/AppStore');


/*状态变化：
单页面应用一个 View 具有当前 view 的状态维护，比如 title
而对于一个类型的连贯性操作，为一系列共用状态，应共同维护，如上 title
划分级别，公共状态级别高低，为全局还是某项目内
目前关于统计项目，全部在公共级别状态中，包含有以下字段
不含 [brand_id,branch_id,item_id,detail_id]，在 url 中
headerData: {title: '标题'}
pageInfo: {
  days: Number,  //时间 (默认值为 1，detail 页面默认为 7)
  type: 数据类型 (根据 days是否为1，数据有变化)
  order: 排序方式 (默认倒序 desc, 可选 dsc )
}
//默认页面状态数据
var headerData = {
  title: '加载中...'
};
*/

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
  //挂载，只调用一次，在初始化渲染执行之前立刻调用。每个 view 会重新 mount

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
  //     pageInfo: AppStore.getPageInfo()
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
  //     pageInfo: AppStore.getPageInfo()
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

/*
随着应用不断变大，保证组件被正确使用变得非常有用。
React.PropTypes 提供很多验证器 (validator) 来验证传入数据的有效性。
!!! 注意为了性能考虑，只在开发环境验证 propTypes。

propTypes: {
  // 可以声明 prop 为指定的 JS 基本类型。默认
  // 情况下，这些 prop 都是可传可不传的。
  optionalArray: React.PropTypes.array,
  optionalBool: React.PropTypes.bool,
  optionalFunc: React.PropTypes.func,
  optionalNumber: React.PropTypes.number,
  optionalObject: React.PropTypes.object,
  optionalString: React.PropTypes.string,

  // 所有可以被渲染的对象：数字，
  // 字符串，DOM 元素或包含这些类型的数组。
  optionalNode: React.PropTypes.node,

  // React 元素
  optionalElement: React.PropTypes.element,

  // 用 JS 的 instanceof 操作符声明 prop 为类的实例。
  optionalMessage: React.PropTypes.instanceOf(Message),

  // 用 enum 来限制 prop 只接受指定的值。
  optionalEnum: React.PropTypes.oneOf(['News', 'Photos']),

  // 指定的多个对象类型中的一个
  optionalUnion: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
    React.PropTypes.instanceOf(Message)
  ]),

  // 指定类型组成的数组
  optionalArrayOf: React.PropTypes.arrayOf(React.PropTypes.number),

  // 指定类型的属性构成的对象
  optionalObjectOf: React.PropTypes.objectOf(React.PropTypes.number),

  // 特定形状参数的对象
  optionalObjectWithShape: React.PropTypes.shape({
    color: React.PropTypes.string,
    fontSize: React.PropTypes.number
  }),

  // 以后任意类型加上 `isRequired` 来使 prop 不可空。
  requiredFunc: React.PropTypes.func.isRequired,

  // 不可空的任意类型
  requiredAny: React.PropTypes.any.isRequired,

  // 自定义验证器。如果验证失败需要返回一个 Error 对象。不要直接
  // 使用 `console.warn` 或抛异常，因为这样 `oneOfType` 会失效。
  customProp: function(props, propName, componentName) {
    if (!/matchme/.test(props[propName])) {
      return new Error('Validation failed!');
    }
  }
*/



/*
组件的生命周期

组件的生命周期主要由三个部分组成：

Mounting：组件正在被插入DOM中
Updating：如果DOM需要更新，组件正在被重新渲染
Unmounting：组件从DOM中移除
React提供了方法，让我们在组件状态更新的时候调用，will标识状态开始之前，did表示状态完成后。例如componentWillMount就表示组件被插入DOM之前。

Mounting

getInitialState()：初始化state
componentWillMount()：组件被出入DOM前执行
componentDidMount()：组件被插入DOM后执行
Updating

componentWillReceiveProps(object nextProps):组件获取到新的属性时执行，这个方法应该将this.props同nextProps进行比较，然后通过this.setState()切换状态
shouldComponentUpdate(object nextProps, object nextState):组件发生改变时执行，应该将this.props和nextProps、this.stats和nextState进行比较，返回true或false决定组件是否更新
componentWillUpdate(object nextProps, object nextState)：组件更新前执行，不能在此处调用this.setState()。
componentDidUpdate(object prevProps, object prevState)：组件更新后执行
Unmounting

componentWillUnmount()：组件被移除前执行
Mounted Methods

findDOMNode()：获取真实的DOM
forceUpdate()：强制更新

*/
