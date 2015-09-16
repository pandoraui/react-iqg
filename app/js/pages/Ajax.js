'use strict';

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var NavLink = require('../components/NavLink');

var AppActions = require('../actions/AppActions');

var $ = require('../utils/Ajax');
// var $ = require('npm-zepto');

var pageInfo = {
  title: 'Ajax请求'
};

var UserGist = React.createClass({
  getInitialState: function() {
    console.log('init');
    return {
      loading: true,
      content: null
    };
  },

  componentDidMount: function() {
    console.log('DidMount');
    AppActions.ajax({
      type: "GET",
      url: this.props.source,
      success: function (result) {
        var lastGist = result[0];
        if (this.isMounted()) {
          var useData = {
            username: lastGist.owner.login,
            lastGistUrl: lastGist.html_url
          };
          this.setState({
            loading: false,
            content: useData
          });
        }
      }.bind(this)
    });

    //$Ajax.get(this.props.source, function(result) {
    // $._get(this.props.source, function(result) {
    //     var lastGist = result[0];
    //     if (this.isMounted()) {
    //       this.setState({
    //         loaded: true,
    //         content: {
    //           username: lastGist.owner.login,
    //           lastGistUrl: lastGist.html_url
    //         }
    //       });
    //     }
    //   }.bind(this)
    // );
  },

//-webkit-animation: fa-spin 2s infinite linear;
//  animation: fa-spin 2s infinite linear;

  render: function() {
    var renderHtml;
    if (this.state.loading) {
      renderHtml = (<div className="ajax-loading"><i className="iqg-icon-spinner iqg-icon-spin"></i></div>);
    } else {
      renderHtml = (
        <div>
          {this.state.content.username}'s last gist is
          <a href={this.state.content.lastGistUrl}>here</a>.
        </div>
      );
    }
    return renderHtml;
  }
});

var Ajax = React.createClass({
  componentDidMount: function() {
    AppActions.updateView(pageInfo);
  },
  render: function() {
    return (
      <div className="iqg-page">
        <div className="ajax-loading"><i className="iqg-icon-spinner iqg-icon-spin"></i></div>
        <div className="iqg-banner">
          <h1>Ajax请求</h1>
          <p>Ajax 效果如下</p>
          <UserGist source={$.Api.TEST} />
        </div>
      </div>
    );
  }
});

module.exports = Ajax;
