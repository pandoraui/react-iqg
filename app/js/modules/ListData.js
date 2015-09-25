'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var FormatData = require('../mixins/FormatData');

var View = React.createClass({
  mixins: [FormatData],

  renderMap: function() {
    var list = this.props.data,
        params = this.props.params;

    var preLink = '#/brand/' + params.brand_id;
    if(!params.branch_id){
      preLink += '/branch/'
    }else{
      preLink += '/branch/' + params.branch_id + '/item/';
    }

    var isPercentValue = this.props.isPercentValue;
    return list.map(function(item, i) {
      var link = preLink + item.id + '?title=' + item.name;
      var cssStyle = {
        width: item.rating * 20 + '%'
      };
      var outValue = isPercentValue ? ( this.formatNumber(item.value, '%') ) : item.value;
      var name = item.name;
      return (
        <a className="link-block" href={link} >
          <div className="item">
            <span className="num">{outValue}</span>
            <div className="title">
              <p>{name}</p>
              {item.rating ? (<div className="iqg-star" title={item.rating}><span style={cssStyle}><i className="icon-star"></i></span></div>) : ''}
            </div>
          </div>
        </a>
      );
    }.bind(this) );
  },
  render: function() {
    var moreList;
    if (this.props.hasMore) {
      moreList = (<p className="load-more" onClick={this.props.loadMore.bind(this )}>点击加载更多</p>)
    }
    return (
      <div className="list-box">
        {this.renderMap()}
        {moreList}
      </div>
    );
  }
});

module.exports = View;
