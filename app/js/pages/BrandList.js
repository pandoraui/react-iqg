'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');
var NavLink = require('../components/NavLink');

var TopBar = require('../modules/TopBar');
var ListOverview = require('../modules/ListOverview');
var ListData = require('../modules/ListData');
var SubTitle = require('../modules/SubTitle');

var Loading = require('../modules/Loading');
var $ = require('../utils/Ajax');

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
      rating: 3.5
    }
    , {
      id: 3,
      name: '达乐美（亚运村店）',
      value: 56,
      rating: 4.2
    }
    , {
      id: 4,
      name: '达乐美（澳门路店）',
      value: 23,
      rating: 2.6
    }
    , {
      id: 5,
      name: '达乐美（亚运村店）',
      value: 88,
      rating: 4.5
    }
]};

var View = React.createClass({
  getInitialState: function() {
    return {
      days: AppStore.updateTime(),
      type: 'brand',
      brand_id: this.props.params.brand_id
    };
  },
  componentDidMount: function() {
    AppActions.updateView(pageInfo);
    console.log('第一次请求');
    this.ajaxLoadOverview();
    this.ajaxLoadList();
  },
  ajaxLoadOverview: function() {
    console.log('overview 请求的天数：' + this.props.days);
    this.setState({
      loading: true
    });
    $.ajax({
      type: "GET",
      url: $.Api.TJ_ALL,
      data: {
        days: this.props.days
      },
      dataType: 'json',
      success: function(response, status, xhr) {
        if(this.isMounted()){
          dataOverview = response.data.list;
          this.setState({ 
            loading: false
          });
        }
      }.bind(this),
      error: function(xhr, errorType, error) {
        console.log(error)
        // this.setState({
        //   err: err,
        //   data: [],
        //   loading: false
        // });
        //console.error(this.props.url, status, err.toString());
      }.bind(this),
      complete: function(xhr, status) {

      }.bind(this)
    });
  },
  ajaxLoadList: function() {
    console.log('list 请求的天数：' + this.props.days);
    this.setState({
      loading2: true
    });
    $.ajax({
      type: "GET",
      url: $.Api.TJ_LIST,
      data: {
        days: this.props.days
      },
      dataType: 'json',
      success: function(response, status, xhr) {
        if(this.isMounted()){
          dataSubTitle.filter = response.data.types;
          dataList = response.data;
          this.setState({ 
            loading2: false
          });
        }
      }.bind(this),
      error: function(xhr, errorType, error) {
        console.log(error)
        // this.setState({
        //   err: err,
        //   data: [],
        //   loading: false
        // });
        //console.error(this.props.url, status, err.toString());
      }.bind(this),
      complete: function(xhr, status) {

      }.bind(this)
    });
  },
  componentDidUpdate: function() {
    if (this.state.days !== this.props.days) {
      console.log('更新天数：' + this.props.days);
      this.setState({
        days: this.props.days
      });
      this.ajaxLoadOverview();
      this.ajaxLoadList();
    }
    if (this.state.brand_id !== this.props.params.brand_id) {
      this.setState({
        brand_id: this.props.params.brand_id
      });
    }
  },
  render: function() {
    return (
      <div className="iqg-page">
        <TopBar dataTopBar={dataTopBar} />
        <div className="iqg-list">
          <Loading loading={this.state.loading}>
            <ListOverview data={dataOverview} params={this.props.params} />
          </Loading>
        </div>
          <div className="sub-list-box">
            <SubTitle dataSubTitle={dataSubTitle} />
            <Loading loading={this.state.loading2}>
              <div className="iqg-list sub-list">
                <ListData data={dataList} params={this.props.params} />
              </div>
            </Loading>
          </div>
      </div>
    );
  }
});

module.exports = View;
