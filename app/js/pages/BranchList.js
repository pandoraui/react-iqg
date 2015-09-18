'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var NavLink = require('../components/NavLink');

var TopBar = require('../modules/TopBar');
var ListOverview = require('../modules/ListOverview');
var ListData = require('../modules/ListData');
var SubTitle = require('../modules/SubTitle');

var pageInfo = {
  title: '分店',
  data: null
};

var dataTopBar = {
  time: '2015年8月10日',
  text: '品牌总体数据',
  list: [
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

var dataSubTitle = {
  time: '2015年8月10日',
  title: '商品总体数据',
  filter: [{
    name: '抢购率',
    sort: 'sort',
    selected: true
  }]
};

var dataOverview = [
  {
    id: 1,
    name: "展示",
    value: 1567
  }
  , {
    id: 2,
    name: "砍价的",
    value: 189
  }
  , {
    id: 3,
    name: "传播我的",
    value: 56
  }
  , {
    id: 4,
    name: "了解我的",
    value: 130
  }
  , {
    id: 5,
    name: "购买的",
    value: 68
  }
  , {
    id: 6,
    name: "兑换的",
    value: 62
  }
];

var dataList = {
  last_id: 20,
  list: [
    {
      id: 12,
      name: '金牌迷你蛋挞（1份）',
      value: 45
    }
    , {
      id: 13,
      name: '9寸新奥尔良脆香鸡披萨（另需任意饮品）',
      value: 56
    }
    , {
      id: 14,
      name: '培根意面（一份）',
      value: 23
    }
    , {
      id: 15,
      name: '水果披萨（一份）',
      value: 88
    }
]};


var headerData = {
  title: "分店"
};
var View = React.createClass({
  getInitialState: function() {
    return {
      type: 'branch',
      brand_id: this.props.params.brand_id,
      branch_id: this.props.params.branch_id
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
    if (this.state.branch_id !== this.props.params.branch_id) {
      this.setState({
        branch_id: this.props.params.branch_id
      });
    }
  },
  render: function() {
    return (
      <div className="iqg-page">
        <TopBar data={dataTopBar} />
        <div className="iqg-list">
          <ListOverview data={dataOverview} params={this.props.params} />
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
