'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

//<UserGist source={$.Api.TEST} />

var View = React.createClass({
  // getInitialState: function() {
  //   return {
  //     loading: this.props.loading
  //   };
  // },
  // componentWillReceiveProps: function() {
  //   this.setState({
  //     loading: this.props.loading
  //   });
  // },
  render: function() {
    return (<div className="iqg-ajax">
        {this.props.loading ? (<div className="ajax-loading"><i className="iqg-icon-spinner iqg-icon-spin"></i></div>) : this.props.children}
    </div>);
  }
});

module.exports = View;
