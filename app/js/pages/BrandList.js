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

var headerData = {
  title: '品牌'
};

var dataTopBar = {
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
    var pageInfo = AppStore.getPageInfo();
    return {
      brand_id: this.props.params.brand_id || '',
      branch_id: this.props.params.branch_id || '',
      item_id: this.props.params.item_id || '',
      // pageInfo: pageInfo,
      days: pageInfo.days,
      type: pageInfo.type,
      typeName: pageInfo.typeName,
      order_by: pageInfo.order_by,
      dataOverview: [],
      dataList: {},
      pageType: 'brand',
      pageTypeName: '品牌'
    };
  },
  // getInitialState: function() {
  //   return {
  //     pageInfo: AppStore.getPageInfo()
  //   };
  // },
  // componentDidMount: function() {
  //   AppStore.addChangeListener(this._onChange);
  // },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  isChange: function(opt) {
    var pageInfo = AppStore.getPageInfo();
    var params = this.props.params;
    if (pageInfo[opt]) {
      return (this.state[opt] !== pageInfo[opt]);
    }
    if (params[opt]) {
      return (this.state[opt] !== params[opt]);
    }
    return false;
  },
  _onChange: function() {
    console.log('触发更新');
    var pageInfo = AppStore.getPageInfo();
    if ( this.isChange('days') ) {
      this.ajaxLoadOverview();
    }
    if ( this.isChange('brand_id') || this.isChange('type') || this.isChange('order') ) {
      this.ajaxLoadList();
    }
    this.setState({
      days: pageInfo.days,
      type: pageInfo.type,
      typeName: pageInfo.typeName,
      order_by: pageInfo.order_by
    });

  },
  //此处每次更新组件时，可以用来做数据变更检查，赋予初始值
  componentWillMount: function() {
    var params = this.props.params;
    var pageType = '',
        pageTypeName = '';
    if (params.item_id) {
      pageType = 'item';
      pageTypeName = '商品';
      //TODO:这个名称可能要从 ajax 获取？
      headerData.title = '标题是商品名';
    } else if (params.branch_id) {
      pageType = 'branch';
      pageTypeName = '门店';
      headerData.title = '标题是分店名称';
    } else {
      pageType = 'brand';
      pageTypeName = '品牌';
      headerData.title = '标题是品牌名称';
    }
    if (this.state.pageType !== pageType) {
      this.setState({
        pageType: pageType,
        pageTypeName: pageTypeName
      });
    }
    AppActions.updateHeader(headerData);
  },
  componentDidMount: function() {
    AppStore.addChangeListener(this._onChange);

    console.log("当前页面类型："+this.state.pageType);
    //AppActions.updateHeader(headerData);
    this.setState({
      loading: true,
      loading2: true,
    });
    this.ajaxLoadOverview();
    this.ajaxLoadList();
  },
  ajaxLoadOverview: function() {
    console.log('overview 请求的天数：' + AppStore.getPageInfo().days);
    this.setState({
      loading: true
    });
    $._ajax({
      type: "GET",
      url: $.Api.TJ_ALL,
      data: {
        days: AppStore.getPageInfo().days
      },
      dataType: 'json',
      success: function(response, status, xhr) {
        if(this.isMounted()){
          var title = response.data.title;
          //更新头部
          if(title && (title != headerData.title) ){
            headerData.title = title;
            //headerData.time = response.status.server_time;
            AppActions.updateHeader(headerData);
          }
          this.setState({
            dataOverview: response.data.list,
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
    var pageInfo = AppStore.getPageInfo();
    console.log('list 请求的天数：' + pageInfo.days);

    this.setState({
      loading2: true
    });
    $._ajax({
      type: "GET",
      url: $.Api.TJ_LIST,
      data: {
        brand_id: this.state.brand_id,
        branch_id: this.state.branch_id,
        days: pageInfo.days,
        type: pageInfo.type,
        order_by: pageInfo.order_by,
        last_id: ''
      },
      dataType: 'json',
      success: function(response, status, xhr) {
        if(this.isMounted()){
          var types = response.data.types;
          var curListInfo = {};
          types.forEach(function(item){
            if (item.selected) {
              curListInfo.type = item.type;
              curListInfo.typeName = item.name;
            }
          });
          //还需要更新最新默认的 type
          curListInfo.dataList = response.data;

          this.setState(curListInfo);
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
        this.setState({
          loading2: false
        });
      }.bind(this)
    });
  },
  componentDidUpdate: function() {
    // var pageInfo = AppStore.getPageInfo();
    // if ( this.isChange('days') ) {
    //   console.log('更新天数：' + pageInfo.days);
    //   // this.setState({
    //   //   days: pageInfo.days
    //   // });
    //   this.ajaxLoadOverview();
    //   this.ajaxLoadList();
    // }
    // if ( this.isChange('branch_id') || this.isChange('type') || this.isChange('order_by') ) {
    //   this.setState({
    //     branch_id: this.isChange('branch_id'),
    //     type: pageInfo.type,
    //     order_by: pageInfo.order_by
    //   });
    //   this.ajaxLoadList();
    // }

    /*
    */
    // if ( this.isChange('brand_id') || this.isChange('type') || this.isChange('order') ) {
    //   this.setState({
    //     brand_id: this.props.params.brand_id
    //   });
    // }
  },
  render: function() {
    console.log('render');
    console.log(this.state.typeName)
    return (
      <div className="iqg-page">
        <TopBar data={dataTopBar} pageTypeName={this.state.pageTypeName} />
        <div className="iqg-list">
          <Loading loading={this.state.loading}>
            <ListOverview data={this.state.dataOverview} params={this.props.params} />
          </Loading>
        </div>
        <div className="sub-list-box">
          <SubTitle data={this.state.dataList}
                    typeName={this.state.typeName}
                    pageTypeName={this.state.pageTypeName} />
          <div className="iqg-list sub-list">
            <Loading loading={this.state.loading2}>
                <ListData data={this.state.dataList} params={this.props.params} />
            </Loading>
          </div>
        </div>
      </div>
    );
  }
});

/*


 */

module.exports = View;
