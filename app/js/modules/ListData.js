'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var View = React.createClass({
  renderMap: function() {
    var data = this.props.data,
        list = data.list,
        
        params = this.props.params;

    var preLink = '#/brand/' + params.brand_id;
    if(!params.branch_id){
      preLink += '/branch/'
    }else{
      preLink += '/branch/' + params.branch_id + '/item/';
    }
    return list.map(function(item) {
      var link = preLink + item.id;
      var cssStyle = {
        width: item.rating * 20 + '%'
      };
      return (
        <a className="link-block" href={link}>
          <div className="item">
            <span className="num">{item.value}</span>
            <div className="title">
              <p>{item.name}</p>
              {item.rating ? (<div className="iqg-star" title={item.rating}><span style={cssStyle}><i className="icon-star"></i></span></div>) : ''}
            </div>
          </div>
        </a>
      );
    });
    // if (last_id) {
    //   html += (<p>点击加载更多</p>);
    // }
    // return html;
  },
  render: function() {
    var last_id = this.props.data.last_id;
    var moreList;
    if (last_id) {
      moreList = (<p className="load-more">点击加载更多</p>)
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
