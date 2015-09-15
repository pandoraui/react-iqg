'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var NavLink = require('../components/NavLink');

var TopBar = require('../modules/TopBar');
var ListOverview = require('../modules/ListOverview');
var ListData = require('../modules/ListData');
var SubTitle = require('../modules/SubTitle');

var pageInfo = {
  title: '推广效果'
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

var dataSubTitle = {
  time: '2015年8月10日',
  title: '门店总体数据',
  filter: [{
    name: '抢购率',
    sort: 'sort',
    selected: true
  }]
};

var dataList = {
  last_id: 20,
  list: [
    {
      id: 2,
      name: '达乐美（澳门路店）',
      value: 45,
      star: 3.5
    }
    , {
      id: 3,
      name: '达乐美（亚运村店）',
      value: 56,
      star: 4.2
    }
    , {
      id: 4,
      name: '达乐美（澳门路店）',
      value: 23,
      star: 2.6
    }
    , {
      id: 5,
      name: '达乐美（亚运村店）',
      value: 88,
      star: 4.5
    }
]};

var View = React.createClass({
  getInitialState: function() {
    return {
      type: 'brand',
      brand_id: this.props.params.brand_id
    };
  },
  componentDidMount: function() {
    AppActions.updateView(pageInfo);
  },
  componentDidUpdate: function() {
    console.log(333);
    console.log(this.props.params);
    // if (this.state.brand !== this.props.params.brand) {
    //   this.setState({
    //     brand: this.props.params.brand
    //   });
    // }
    if (this.state.brand_id !== this.props.params.brand_id) {
      this.setState({
        brand_id: this.props.params.brand_id
      });
    }
  },
  render: function() {
    return (
      <div className="iqg-page">
        <TopBar dataTopBar={dataTopBar} index="0" />
        <div className="iqg-list">
          <ListOverview dataOverview={dataOverview} params={this.props.params} />
        </div>
        <div className="sub-list-box">
          <SubTitle dataSubTitle={dataSubTitle} />
          <div className="iqg-list sub-list">
            <ListData data={dataList} params={this.props.params} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = View;
