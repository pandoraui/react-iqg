'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var NavLink = require('../components/NavLink');

var pageInfo = {
  title: '推广'
};

var View = React.createClass({
  getInitialState: function() {
    return {
      type: 'brand',
      brand_id: this.props.params.brand_id
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
    if (this.state.brand_id !== this.props.params.brand_id) {
      this.setState({
        brand_id: this.props.params.brand_id
      });
    }
  },
  render: function() {
    return (
      <div className="iqg-page">
        <div className="iqg-topbar">
          <div className="iqg-tabs box-title">
            <a className="iqg-tab iqg-tab-active" data-value="1">昨天</a>
            <a className="iqg-tab" data-value="7">7天</a>
            <a className="iqg-tab" data-value="30">30天</a>
            <a className="iqg-tab" data-value="90">90天</a>
            <p className="gray">2015年8月10日 品牌总体数据</p>
          </div>
        </div>
        <div className="iqg-list">
          <div className="list-box">
            <a className="link-block" href="">
              <div className="item">
                <span className="title">展示</span>
                <span className="num">12233</span>
              </div>
            </a>
            <a className="link-block" href="">
              <div className="item">
                <span className="title">砍价的</span>
                <span className="num">12233</span>
              </div>
            </a>
            <a className="link-block" href="">
              <div className="item">
                <span className="title">传播我的</span>
                <span className="num">12233</span>
              </div>
            </a>
            <a className="link-block" href="">
              <div className="item">
                <span className="title">了解我的</span>
                <span className="num">12233</span>
              </div>
            </a>
            <a className="link-block" href="">
              <div className="item">
                <span className="title">购买的</span>
                <span className="num">12233</span>
              </div>
            </a>
            <a className="link-block" href="">
              <div className="item">
                <span className="title">兑换的</span>
                <span className="num">12233</span>
              </div>
            </a>
          </div>
        </div>

        <div className="sub-list-box">
          <div className="sub-list-title box-title iqg-cf">
            <h3 className="gray">2015年8月10日 门店<br/>总体数据</h3>
            <div className="iqg-select-btn">
              <span className="iqg-arr-btn">抢购率</span>
              <span className="iqg-sort">
                <i className="iqg-icon-arr"></i>
              </span>
            </div>
          </div>
          <div className="iqg-list sub-list">
            <div className="list-box">
              <a className="link-block" href="">
                <div className="item">
                  <span className="title">达美乐（澳门路店）</span>
                  <span className="num">23</span>
                </div>
              </a>
              <a className="link-block" href="">
                <div className="item">
                  <span className="title">达美乐（亚运村店）</span>
                  <span className="num">23</span>
                </div>
              </a>
              <a className="link-block" href="">
                <div className="item">
                  <span className="title">达美乐（澳门路店）
                    <div className="iqg-star"><span width="80%"><i className="icon-star"></i></span></div>
                  </span>
                  <span className="num">23</span>
                </div>
              </a>
              <a className="link-block" href="">
                <div className="item">
                  <span className="title">达美乐（亚运村店）
                    <div className="iqg-star"><span width="80%"><i className="icon-star"></i></span></div>
                  </span>
                  <span className="num">23</span>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="iqg-banner">
          <p>数据类型：{this.state.type}</p>
          <p>数据类型：品牌</p>
          <p>数据ID：{this.state.brand_id}</p>
        </div>
        <NavLink/>
      </div>
    );
  }
});

module.exports = View;