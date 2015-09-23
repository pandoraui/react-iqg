'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');

var Modal = require('../components/Modal');
var ModalTrigger = require('../components/ModalTrigger');
var Types = require('../modules/Types');

var View = React.createClass({
  getInitialState: function() {
    var pageInfo = AppStore.getPageInfo();
    return {
      order_by: pageInfo.order_by
    }
  },
  handleSelect: function() {
    var order_by = 'desc';
    if( this.state.order_by === 'desc' ) {
      order_by = 'asc';
    }
    this.setState({
      order_by: order_by
    });
    AppActions.updatePage({order_by: order_by});
  },
  renderModal: function() {
    var types = this.props.data || [],
        title = '';

    var listHtml = (<Types data={types} />);
    return (<Modal className="iqg-lay" closeViaDimmer="true" type="custom" title={title}>{listHtml}</Modal>);
  },
  render: function() {
    var timeInfo = AppStore.getPageInfo().timeInfo;
    var title = timeInfo + ' ' + this.props.pageTypeName + '总体数据';
    var className = 'iqg-icon-sort-numeric-' + this.state.order_by;
    return (
      <div className="sub-list-title box-title iqg-cf">
        <h3 className="gray">{title}</h3>
        <div className="iqg-select-btn">
          <ModalTrigger
              modal={this.renderModal()}>
              <span className="iqg-arr-btn iqg-btn">{this.props.typeName}</span>
          </ModalTrigger>
          <span className="iqg-sort iqg-btn" onClick={this.handleSelect}>
            <i className={className}></i>
          </span>
        </div>
      </div>
    );
  }
});

module.exports = View;
