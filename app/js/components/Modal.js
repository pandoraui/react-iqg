'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var View = React.createClass({
  render: function() {
    return (
      <div className="modal-dialog">
        这是一个模态窗口
      </div>
    );
  }
});

module.exports = View;
