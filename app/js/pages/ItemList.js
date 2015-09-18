'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var NavLink = require('../components/NavLink');

var TopBar = require('../modules/TopBar');
var ListOverview = require('../modules/ListOverview');
var ListData = require('../modules/ListData');
var SubTitle = require('../modules/SubTitle');

var headerData = {
  title: '商品详情'
};

var dataTopBar = {
  time: '2015年8月10日',
  text: '品牌总体数据',
  days: [
  {
    name: '昨天',
    value: 1
  },
  {
    name: '7天',
    value: 7
  },
  {
    name: '30天',
    value: 30
  },
  {
    name: '90天',
    value: 90
  }
]};

var dataOverview = [
  {
    id: 1,
    name: "展示",
    value: 4567
  }
  , {
    id: 2,
    name: "砍价的",
    value: 542
  }
  , {
    id: 3,
    name: "传播我的",
    value: 134
  }
  , {
    id: 4,
    name: "了解我的",
    value: 345
  }
  , {
    id: 5,
    name: "购买的",
    value: 115
  }
  , {
    id: 6,
    name: "兑换的",
    value: 98
  }
];

var View = React.createClass({
  getInitialState: function() {
    return {
      type: 'brand',
      item_id: this.props.params.item_id
    };
  },
  componentDidMount: function() {
    AppActions.updateHeader(headerData);
  },
  componentDidUpdate: function() {
    console.log(333);
    console.log(this.props.params);
    // if (this.state.brand !== this.props.params.brand) {
    //   this.setState({
    //     brand: this.props.params.brand
    //   });
    // }
    if (this.state.item_id !== this.props.params.item_id) {
      this.setState({
        item_id: this.props.params.item_id
      });
    }
  },
  render: function() {
    return (
      <div className="iqg-page">
        <TopBar dataTopBar={dataTopBar} index="0" />
        <div className="iqg-list">
          <ListOverview data={dataOverview} params={this.props.params} />
        </div>
      </div>
    );
  }
});

module.exports = View;
