'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var TopBar = require('../modules/TopBar');
var ListDetail = require('../modules/ListDetail');
var Chart = require('../modules/Chart');

var pageInfo = {
  title: '详情',
  days: 7,
  opts: 5
};

var dataTopBar = {
  days: [
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

var dataListDetail = [
  {
    time: '8月1日',
    value: 123,
    num: 0.45
  },
  {
    time: '8月5日~12日',
    value: 164,
    num: 0.12
  },
  {
    time: '9月26日~9月3日',
    value: 454,
    num: 0.22
  },
  {
    time: '10月1日',
    value: 334,
    num: 0.54
  },
  {
    time: '10月5日~12日',
    value: 530,
    num: 0.42
  },
  {
    time: '10月26日~9月3日',
    value: 1254,
    num: 0.12
  },
  {
    time: '11月1日',
    value: 1534,
    num: 0.54
  }
];

var detailOpt = [
  {
    valueTitle: '展示数'
  },
  {
    valueTitle: '砍价人数'
  },
  {
    valueTitle: '传播人数'
  },
  {
    valueTitle: '了解数'
  },
  {
    numTitle: '购买率',
    valueTitle: '购买的'
  },
  {
    numTitle: '兑换率',
    valueTitle: '兑换数'
  }
];

var dataChart = {
  labels: [],
  datasets: []
};

var View = React.createClass({
  componentDidMount: function() {
    AppActions.updateView(pageInfo);
  },
  formatListData: function(days) {
    var days = days || 7;

  },
  formatChartData: function(days, opts) {
    var data = dataListDetail;
    var labels = [];
    var datasets = [];
    data.forEach(function(item, i) {
      labels.push(item.time);
      datasets.push(item.value);
    });
    return {
      title: pageInfo.title,
      labels: labels,
      datasets: datasets
    };
  },
  render: function() {
    return (
      <div className="iqg-page">
        <TopBar dataTopBar={dataTopBar} />
        <Chart data={this.formatChartData()} />
        <ListDetail dataListDetail={dataListDetail} opts={detailOpt[pageInfo.opts]} />
      </div>
    );
  }
});

module.exports = View;
