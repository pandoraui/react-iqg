'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var Modal = require('../components/Modal');
var ModalTrigger = require('../components/ModalTrigger');
var Types = require('../modules/Types');

var View = React.createClass({
  renderModal: function() {
    var data = this.props.dataSubTitle,
        list = data.filter,
        title = '';

    var listHtml = (<Types data={list} />);
    return (<Modal className="iqg-lay" closeViaDimmer="true" type="custom" title={title}>{listHtml}</Modal>);
  },
  handleClick: function(e) {
    var type = e.target.getAttribute('type');
    console.log('点击了选项' + type);
  },
  render: function() {
    var data = this.props.dataSubTitle;
    var title = data.time + ' ' + data.title;
    return (
      <div className="sub-list-title box-title iqg-cf">
        <h3 className="gray">{title}</h3>
        <div className="iqg-select-btn">
          <ModalTrigger
              modal={this.renderModal()}>
              <span className="iqg-arr-btn iqg-btn">抢购率</span>
          </ModalTrigger>
          <span className="iqg-sort iqg-btn">
            <i className="iqg-icon-sort-numeric-asc"></i>
          </span>
        </div>
      </div>
    );
  }
});

module.exports = View;
