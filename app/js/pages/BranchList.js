'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var NavLink = require('../components/NavLink');

var pageInfo = {
  title: '首页'
};

var View = React.createClass({
  getInitialState: function() {
    return {
      type: 'branch',
      branch_id: this.props.params.branch_id
    };
  },
  
  componentDidUpdate: function() {
    console.log(333);
    console.log(this.props.params);
    // if (this.state.brand !== this.props.params.brand) {
    //   this.setState({
    //     brand: this.props.params.brand
    //   });
    // }
    if (this.state.branch_id !== this.props.params.branch_id) {
      this.setState({
        branch_id: this.props.params.branch_id
      });
    }
  },
  render: function() {
    return (
      <div className="iqg-page">
        <NavLink/>
        <div className="iqg-banner">
          <p>数据类型：{this.state.type}</p>
          <p>数据类型：分店</p>
          <p>数据ID：{this.state.branch_id}</p>
        </div>
      </div>
    );
  }
});

module.exports = View;