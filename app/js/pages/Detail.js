'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');
var FormatData = require('../mixins/FormatData');
var dateUtil = require('../utils/DateUtil');
// var _ = require('lodash');
var _ = require('../utils/Lodash');

var TopBar = require('../modules/TopBar');
var ListDetail = require('../modules/ListDetail');
var Chart = require('../modules/Chart');

var Loading = require('../modules/Loading');
var $ = require('../utils/Ajax');

var pageInfo = {
  title: '详情',
  days: 7,
  opts: 5
};

var dataTopBar = {
  list: [
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
    date: 1443492376,
    value: 123,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 164,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 454,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 334,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 530,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 1254,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 1534,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 164,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 454,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 334,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 530,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 1254,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 1534,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 164,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 454,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 334,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 530,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 1254,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 1534,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 164,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 454,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 334,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 530,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 1254,
    stock: 1000
  },
  {
    date: 1443492376,
    value: 1534,
    stock: 1000
  }
];

var detailOpt = [
  {},
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
  {},
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
  mixins: [FormatData],

  getInitialState: function() {
    var pageInfo = AppStore.getPageInfo();
    var params = this.props.params;
    return {
      loading: true,
      brand_id: params.brand_id || '',
      branch_id: params.branch_id || '',
      item_id: params.item_id || '',
      detail_id: params.detail_id,
      detailName: detailOpt[params.detail_id],
      // pageInfo: pageInfo,
      days: pageInfo.days,
      pageType: 'brand',
      pageTypeName: '品牌',
      valueSum: 0,
      list: []
    };
  },
  componentDidMount: function() {
    AppStore.addChangeListener(this._onChange);

    console.log("当前页面类型："+this.state.pageType);
    //AppActions.updateHeader(headerData);
    this.ajaxLoadDetail();
  },
  isChange: function(opt) {
    var pageInfo = AppStore.getPageInfo();
    if (pageInfo[opt]) {
      return (this.state[opt] !== pageInfo[opt]);
    }
    return false;
  },
  _onChange: function() {
    if ( this.isChange('days') ) {
      this.setState({
        days: AppStore.getPageInfo().days
      });
      this.ajaxLoadDetail();
    }
  },
  componentWillUnmount: function() {
    AppStore.removeChangeListener(this._onChange);
  },
  componentWillMount: function() {
    var title = this.props.query && this.props.query.title || '推广效果';
    if (title != AppStore.getPageInfo().title ) {
      AppActions.updateHeader({
        title: title
      });
    }
    // var headerData = {
    //   title: detailOpt[this.state.detail_id]
    // };
    // var title = detailOpt[this.state.detail_id].valueTitle;
    // if (title) {
    //   AppActions.updateHeader({
    //     title: title
    //   });
    // }
  },
  ajaxLoadDetail: function() {
    console.warn('ajax');
    this.setState({
      loading: true
    });
    $._ajax({
      type: "GET",
      url: $.Api.TJ_DETAIL,
      data: {
        type: this.props.params.detail_id,
        days: AppStore.getPageInfo().days,
        cb_id: this.state.item_id,
        branch_id: this.state.branch_id,
        brand_id: this.state.brand_id
      },
      dataType: 'json',
      success: function(response, status, xhr) {
        if(this.isMounted()){
          console.log(response)
          // var title = response.data.type_name;
          // //更新头部
          // if(title && (title != headerData.title) ){
          //   headerData.title = title;
          //   //headerData.time = response.status.server_time;
          //   AppActions.updateHeader(headerData);
          // }
          var stockSum = 0,
              valueSum = 0,
              isPercent = false;
          var list = response.data.list || dataListDetail || [];
          if ( list[0] && list[0].stock !== 'undefined' ) {
            isPercent = true;
          }

          list.forEach(function(item, i) {
            var percent = '0%';

            if (isPercent) {
              list[i].stock = item.stock* 10000;
              if (item.stock) {
                percent = this.formatNumber(item.value/item.stock, '');
              } else {
                percents.push( '0%' );
              }
              list[i].percent = percent;
              stockSum += parseInt(item.stock);
            }

            valueSum += parseInt(item.value);
          }.bind(this) );

          // list.valueSum = valueSum;
          // if (isPercent) {
          //   list.stockSum =  this.formatNumber(valueSum/stockSum, '');
          // }

          this.setState({
            valueSum: valueSum,
            list: list,
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
  formatListData: function(days) {
    var days = days || 7;
  },
  //按自然周准备数据
  getDataByWeek: function(length, data) {
    var labels = [],
        percents = [],
        datasets = [];
    var temp, startDate, endDate, sumValue = 0, sumStock = 0, tempDate;
    var j = 0;
    var nowDate = new Date(),
        year = nowDate.getFullYear() + '年';
    var month = '';

    for (var i = 0; i < length; i++) {
      temp = data.shift();
      sumValue += temp.value;
      if (temp.stock !== 'undefined') {
        sumStock += temp.stock || 0;
      }
      if (j === 0) {
        startDate = dateUtil.format(temp.date*1000, 'Y年M月D日').replace(year,'');
        month = dateUtil.format(temp.date*1000, 'M月');
      }
      j++;
      if (j === 6 || i === length-1) {
        endDate = dateUtil.format(temp.date*1000, 'Y年M月D日').replace(year,'').replace(month,'');
        //处理一下只有一天的起止日期
        if (startDate == endDate || (length%7 == 1 && i == length - 1 ) ) {
          tempDate = startDate;
        } else {
          tempDate = startDate + '-' + endDate;
        }
        labels.push(tempDate);
        datasets.push(sumValue);
        console.log(sumStock)
        if (sumStock) {
          percents.push( this.formatNumber(sumValue/sumStock, '') );
        }

        sumValue = 0;
        j = 0;
      }
    }

    return {
      labels: labels,
      percents: percents,
      datasets: datasets
    };
  },
  formatChartData: function(days, opts) {
    var data = _.sortBy(_.clone(this.state.list),'date') || [],
        days = this.state.days,
        labels = [],
        percents = [],
        datasets = [];
    //处理日历数据
    if (data.length) {
      //今年的日期，不显示年，替换掉
      var nowDate = new Date(),
          year = nowDate.getFullYear() + '年';
      if (days === 90) {
        //按自然周划分，每周始于周一
        var yestoday = new Date(data[0].date*1000);
        var diff = 7 - yestoday.getDay() + 1;

        var temp = this.getDataByWeek(diff, data);
        var length = data.length;
        var temp2 = this.getDataByWeek(length, data);

        labels = temp.labels.concat(temp2.labels);
        datasets = temp.datasets.concat(temp2.datasets);
      } else {
        var month = '';
        data.forEach(function(item, i) {
          var tempMonth = dateUtil.format(item.date*1000, 'M月');
          labels.push(dateUtil.format(item.date*1000, 'Y年M月D日')
                      .replace(year,'')
                      .replace(month,'')
                    );
          if(month || month !== tempMonth){
            month = tempMonth;
          }
          if(item.percent){
            percents.push(item.percent);
          }
          datasets.push(item.value);
        }.bind(this) );
      }
    }

    var result = {
      title: pageInfo.title,
      valueSum: data.valueSum,
      stockSum: data.stockSum,
      labels: labels,
      percents: percents,
      datasets: datasets
    };
    console.log(result);
    return result;
  },
  render: function() {
    var typeId = 5;//this.state.detail_id;
    var detailHtml = this.state.loading ? (<Loading loading={this.state.loading}></Loading>) : (
      <div>
        <Chart data={this.formatChartData()}
               valueSum={this.state.valueSum}
               opts={detailOpt[typeId]} />
        <ListDetail data={this.state.list} opts={detailOpt[typeId]} />
      </div>);
    return (
      <div className="iqg-page">
        <TopBar data={dataTopBar} pageTypeName='' />
        {detailHtml}
      </div>
    );
  }
});

module.exports = View;
