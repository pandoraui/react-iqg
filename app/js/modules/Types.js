'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var typeId, newType;

var View = React.createClass({
  getInitialState: function() {
    if(!typeId){
      var list = this.props.data;
      list.forEach(function(item) {
        if(item.selected){
          typeId = parseInt(item.type);
        }
      });
    }
    return {
      typeId: typeId
    };
  },
  handleClick: function(e) {
    newType = e.target.getAttribute('type');
    newType = parseInt(newType);
    // if (this.state.typeId === newType) {
    //   return;
    // }
    this.setState({
      typeId: newType
    });

    //TODO：临时解决方案
    window.xxx_close_modal && window.xxx_close_modal()
  },
  componentDidUpdate: function() {
    //组件渲染完成后立马调用
    if (this.props.callback) {
      this.props.callback(this.state.typeId);
    }
  },
  shouldComponentUpdate: function() {
    //组件是否进行 render 更新
    console.log('是否更新');
    return this.state.typeId !== newType
  },
  renderMap: function() {
    var list = this.props.data;
    return list.map(function(item) {
      var className = 'iqg-btn';
      if ( this.state.typeId === parseInt(item.type)) {
        className += ' iqg-btn-active';
      }
      
      return (<a className={className} type={item.type} onClick={this.handleClick}>{item.name}</a>);
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
