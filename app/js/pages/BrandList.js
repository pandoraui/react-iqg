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
// var _ = require('lodash');
var _ = require('../utils/Lodash');

var headerData = {
  title: '广告效果'
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
/*
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
*/

var View = React.createClass({
  getInitialState: function() {
    var pageInfo = AppStore.getPageInfo();
    var params = this.props.params;
    return {
      // pageInfo: pageInfo,
      days: pageInfo.days,
      type: pageInfo.type || 1,
      typeName: pageInfo.typeName,
      order_by: pageInfo.order_by,
      dataOverview: [],
      dataList: [],
      last_id: '',
      hasMore: false,
      pageType: 'brand',
      pageTypeName: '品牌'
    };
  },
  //此处每次更新组件时，可以用来做数据变更检查，赋予初始值
  componentWillMount: function() {
    this.updateHeader(this.props);
  },
  updateHeader: function(nextProps) {
    var params = nextProps.params,
        pageType = '',
        pageTypeName = '';
    if (params.item_id) {
      pageType = 'item';
      pageTypeName = '商品';
      //TODO:这个名称可能要从 ajax 获取？
      //headerData.title = '商品';
    } else if (params.branch_id) {
      pageType = 'branch';
      pageTypeName = '门店';
      //headerData.title = '分店';
    } else {
      pageType = 'brand';
      pageTypeName = '品牌';
      //headerData.title = '品牌';
    }
    //这里要检查更新 pageType 以及页面参数
    console.log('页面参数变化');
    var title = nextProps.query && nextProps.query.title || '广告效果';
    if (title != AppStore.getPageInfo().title ) {
      AppActions.updateHeader({
        title: title
      });
    }
    this.pageType = pageType;
    if (this.state.pageType !== pageType) {
      this.setState({
        last_id: 0,
        pageType: pageType,
        pageTypeName: pageTypeName
      });
    }
    //AppActions.updateHeader(headerData);
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
    !this.isItemPage() && this.ajaxLoadList();
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  isChange: function(opt) {
    var pageInfo = AppStore.getPageInfo();
    var params = this.props.params;
    if (pageInfo[opt]) {
      return (this.state[opt] !== pageInfo[opt]);
    }
    return false;
  },
  _onChange: function() {
    console.log('触发更新');
    var pageInfo = AppStore.getPageInfo();
    if ( this.isChange('days') ) {
      this.ajaxLoadOverview();
      if (!this.isItemPage()) {
        this.ajaxLoadList();
      }
    } else if ( !this.isItemPage() && ( this.isChange('type') || this.isChange('order_by') ) ) {
      this.ajaxLoadList();
    }
    this.setState({
      days: pageInfo.days,
      type: pageInfo.type,
      //last_id: 0,
      typeName: pageInfo.typeName,
      order_by: pageInfo.order_by
    });
  },
  componentWillReceiveProps: function(nextProps) {
    //判断 params 参数是否发生变化
    console.log('params变化了')
    if ( !_.isEqual(this.props.params, nextProps.params) ) {
      this.updateHeader(nextProps);
      if (!nextProps.params.branch_id) {
        nextProps.params.branch_id = undefined;
      }
      if (!nextProps.params.item_id) {
        nextProps.params.item_id = undefined;
      }
      this.ajaxLoadOverview(nextProps.params);
      !this.isItemPage() && this.ajaxLoadList(nextProps.params);
    }
  },
  isItemPage: function() {
    return this.pageType === 'item' || this.pageType === 'branch';
  },
  ajaxLoadOverview: function(params) {
    console.log('overview 请求的天数：' + AppStore.getPageInfo().days);
    var params = params || this.props.params;
    this.setState({
      loading: true
    });
    var brand_id;
    $._ajax({
      type: "GET",
      url: $.Api.TJ_ALL,
      data: {
        days: AppStore.getPageInfo().days,
        cb_id: params.item_id,
        branch_id: params.branch_id,
        brand_id: (params.brand_id == '-1') ? brand_id : params.brand_id
      },
      dataType: 'json',
      success: function(response, status, xhr) {
        if(this.isMounted()){
          var title = response.data.title;
          //拉取数据不更新头部，第一次直接 native 设置
          // if(title && (title != headerData.title) ){
          //   headerData.title = title;
          //   //headerData.time = response.status.server_time;
          //   AppActions.updateHeader(headerData);
          // }
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
  ajaxLoadList: function(params) {
    var pageInfo = AppStore.getPageInfo();
    var params = params || {};
    console.log('list 请求的参数：');
    console.log(pageInfo);
    var resetData;
    if(!params.last_id){
      this.setState({
        loading2: true,
        last_id: '',
        dataList: []
      });
    }
    var params = _.extend({}, this.props.params, params, resetData);
    var brand_id;
    var ajaxParams = {
      days: pageInfo.days,
      type: pageInfo.type,
      order_by: pageInfo.order_by,
      last_id: params.last_id || 0,
      cb_id: params.item_id,
      branch_id: params.branch_id,
      brand_id: (params.brand_id == '-1') ? brand_id : params.brand_id
    };
    $._ajax({
      type: "GET",
      url: $.Api.TJ_LIST,
      data: ajaxParams,
      dataType: 'json',
      success: function(response, status, xhr) {
        if(this.isMounted()){
          var curListInfo = {},
              types = response.data.types || [];

          var tempList = response.data.list || [];
          //如果是翻页操作，不更新其他 state，只更新数据
          if (this.state.last_id) {
            tempList = this.state.dataList.concat(tempList);
            this.setState({
              dataList: tempList,
              hasMore: response.pagination.has_more,
              last_id: response.pagination.last_id || ''
            });
            return;
          }

          //还需要更新最新默认的 type
          types.forEach(function(item){
            if (item.selected) {
              curListInfo.type = item.type;
              curListInfo.typeName = item.name;
            }
          });
          this.setState(_.extend({
            loading2: false,
            dataList: tempList,
            types: response.data.types,
            hasMore: response.pagination.has_more,
            last_id: response.pagination.last_id || ''
          }, curListInfo));
          if (curListInfo.type && (AppStore.getPageInfo().type != curListInfo.type) ) {
            AppActions.updatePage({
              type: curListInfo.type,
              typeName: curListInfo.typeName
            });
          }
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
        // if (!this.state.last_id) {
        //   this.setState({
        //     loading2: false
        //   });
        // }
      }.bind(this)
    });
  },
  renderList: function() {
    var listHtml;
    if ( !this.isItemPage() ) {
      var isPercentValue = (this.state.type ==6 || this.state.type == 8);
      listHtml = (<div className="sub-list-box">
        <SubTitle data={this.state.types}
                  type={this.state.type}
                  typeName={this.state.typeName}
                  pageTypeName={this.state.pageTypeName} />
        <div className="iqg-list sub-list">
          <Loading loading={this.state.loading2}>
            <ListData data={this.state.dataList}
                params={this.props.params}
                last_id={this.state.last_id}
                isPercentValue={isPercentValue}
                loadMore={this.loadMore}
                hasMore={this.state.hasMore} />
          </Loading>
        </div>
      </div>);
    }
    return listHtml;
  },
  loadMore: function(e) {
    //console.log('加载更多');
    //var target = e.target;
    this.ajaxLoadList({
      last_id: this.state.last_id
    })
  },
  render: function() {
    // console.log('render 最新参数及页面类型');
    // console.log(this.props.params)
    // console.log(this.state)
    return (
      <div className="iqg-page">
        <TopBar data={dataTopBar} pageTypeName={this.state.pageTypeName} />
        <div className="iqg-list">
          <Loading loading={this.state.loading}>
            <ListOverview data={this.state.dataOverview} params={this.props.params} />
          </Loading>
        </div>
        {this.renderList()}
      </div>
    );
  }
});

module.exports = View;
