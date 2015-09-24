'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');

//typeId 要存到 store 中
var typeId, newType, close;

var View = React.createClass({
  getInitialState: function() {
    console.log('初始化')
    // if(!typeId){
    //   var list = this.props.data;
    //   list.forEach(function(item) {
    //     if(item.selected){
    //       typeId = parseInt(item.type);
    //     }
    //   });
    //   AppActions.updatePage({
    //     type: typeId
    //   });
    // }
    console.log(AppStore.getPageInfo().type)
    return {
      close: false,
      typeId: AppStore.getPageInfo().type || 1
    };
  },
  handleClick: function(type, name) {
    //newType = e.target.getAttribute('type');
    var typeId = parseInt(type);
    // if (this.state.typeId === newType) {
    //   return;
    // }
    this.setState({
      close: true,
      typeId: typeId
    });

    AppActions.updatePage({
      type: typeId,
      typeName: name
    });
  },

  //组件渲染完成后立马调用
  componentDidUpdate: function() {
    if(this.state.close){
      this.props.onRequestClose();
    }
  },
  //组件是否进行 render 更新，此处无论选中哪个选项，都应该关闭弹窗
  // shouldComponentUpdate: function() {
  //   console.log('是否更新');
  //   var isUpdate = (this.state.typeId !== typeId);
  //   if(isUpdate) {
  //     this.props.onRequestClose();
  //   }

  //   return this.state.typeId !== typeId
  // },
  renderMap: function() {
    var list = this.props.data;
    return list.map(function(item) {
      var className = 'iqg-btn';
      if ( this.state.typeId === parseInt(item.type)) {
        className += ' iqg-btn-active';
      }

      return (<a className={className} type={item.type} onClick={this.handleClick.bind(this, item.type, item.name )}>{item.name}</a>);
    }.bind(this) );
  },
  render: function() {
    console.log('render');
    return (<div className="iqg-types">
        <h3 className="tc lay-title">选择数据类型</h3>
        {this.renderMap()}
      </div>
    );
  }
});

module.exports = View;
