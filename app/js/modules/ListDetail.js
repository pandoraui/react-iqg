'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var View = React.createClass({
  renderMap: function() {
    var data = this.props.data;
    var opts = this.props.opts;
    return opts.numTitle ? data.map(function(item) {
      return (
        <li>
          <span className="num">{item.num*100}%</span>
          <span className="value">{item.value}</span>
          <span className="time">{item.time}</span>
        </li>
      );
    }) : data.map(function(item) {
      return (
        <li>
          <span className="value">{item.value}</span>
          <span className="time">{item.time}</span>
        </li>
      );
    });
  },
  render: function() {
    var opts = this.props.opts;
    var numTitle;
    if(opts.numTitle){
      numTitle = (<span className="num">{opts.numTitle}</span>);
    }
    return (
      <div className="list-detail">
          <ul>
            <li className="title">
              {numTitle}
              <span className="value">{opts.valueTitle}</span>
              <span className="time">日期</span>
            </li>
            {this.renderMap()}
          </ul>
        </div>
    );
  }
});

module.exports = View;
