'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var View = React.createClass({
  renderMap: function() {
    var data = this.props.data || [],
        params = this.props.params || {};

    var preLink = '#/brand/' + params.brand_id;
    if (params.branch_id) {
      preLink += '/branch/' + params.branch_id;
      if(params.item_id) {
        preLink += '/item/' + params.item_id;
      }
    }
    console.log(params);
    return !data.length ? (<p className="blank">暂无数据</p>) : data.map(function(item) {
      var link = preLink + "/detail/" + item.type + '?title=' + item.name;
      if (item.type === 6 || item.type === 8) {
        return;
      }
      return (
        <a className="link-block" href={link} >
          <div className="item">
            <span className="num">{item.value}</span>
            <span className="title">{item.name}</span>
          </div>
        </a>
      );
    }.bind(this) );
  },
  render: function() {
    return (
      <div className="list-box">
        {this.renderMap()}
      </div>
    );
  }
});

module.exports = View;
