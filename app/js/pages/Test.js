//AjaxService
'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var Loading = require('../modules/Loading');

var $ = require('../utils/Ajax');
// var $ = require('npm-zepto');

var pageInfo = {
  title: 'Ajax TEST'
};
var source;
// var options = {
//   type: "GET",
//   url: source || '',
//   success: function (data, status, xhr) {
//     var lastGist = result[0];
//     if (this.isMounted()) {
//       // var useData = {
//       //   username: lastGist.owner.login,
//       //   lastGistUrl: lastGist.html_url
//       // };
//       this.setState({
//         loading: false,
//         content: useData
//       });
//     }
//   },
//   error: function(xhr, errorType, error) {

//   },
//   complete: function(xhr, status) {

//   }
// };

var View = React.createClass({
  getInitialState: function() {
    return {
      loading: true,
      days: 1
    };
  },
  componentDidMount: function() {
    AppActions.updateView(pageInfo);

    this.loadAjaxData();
    //setInterval(this.loadAjaxData, this.props.pollInterval);
  },
  loadAjaxData: function() {
    $.ajax({
      type: "GET",
      url: $.Api.TJ_ALL,
      days: this.state.days,
      dataType: 'json',
      success: function(data, status, xhr) {
        if(this.isMounted()){
          this.setState({
            status: data.status,
            data: data.data,
            loading: false
          });
        }
      }.bind(this),
      error: function(xhr, errorType, error) {
        console.log(error)
        // this.setState({
        //   err: err,
        //   data: [],
        //   loading: false
        // });
        //console.error(this.props.url, status, err.toString());
      }.bind(this),
      complete: function(xhr, status) {

      }.bind(this)
    });
  },
  render: function() {
    return (
      <Loading loading={this.state.loading}>
        <div>子模块</div>
      </Loading>
    );
  }
});

module.exports = View;
