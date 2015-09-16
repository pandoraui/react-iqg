'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');
var $ = require('../utils/Ajax');
// var $ = require('npm-zepto');

var pageInfo = {
  title: 'Ajax请求'
};

// var UserGist = React.createClass({
//   getInitialState: function() {
//     console.log('init');
//     return {
//       loading: true,
//       content: null
//     };
//   },

//   componentDidMount: function() {
//     console.log('DidMount');
//     AppActions.ajax({
//       type: "GET",
//       url: this.props.source,
//       success: function (result) {
//         var lastGist = result[0];
//         if (this.isMounted()) {
//           var useData = {
//             username: lastGist.owner.login,
//             lastGistUrl: lastGist.html_url
//           };
//           this.setState({
//             loading: false,
//             content: useData
//           });
//         }
//       }.bind(this)
//     });

//     //$Ajax.get(this.props.source, function(result) {
//     // $._get(this.props.source, function(result) {
//     //     var lastGist = result[0];
//     //     if (this.isMounted()) {
//     //       this.setState({
//     //         loaded: true,
//     //         content: {
//     //           username: lastGist.owner.login,
//     //           lastGistUrl: lastGist.html_url
//     //         }
//     //       });
//     //     }
//     //   }.bind(this)
//     // );
//   },

// //-webkit-animation: fa-spin 2s infinite linear;
// //  animation: fa-spin 2s infinite linear;

//   render: function() {
//     var renderHtml;
//     if (this.state.loading) {
//       renderHtml = (<div className="tc iqg-loading"><i className="iqg-icon-spinner iqg-icon-spin"></i></div>);
//     } else {
//       renderHtml = (
//         <div>
//           {this.state.content.username}'s last gist is
//           <a href={this.state.content.lastGistUrl}>here</a>.
//         </div>
//       );
//     }
//     return renderHtml;
//   }
// });

//<UserGist source={$.Api.TEST} />

var AjaxService = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      loading: true
    };
  },
  loadingAjax: function() {
    $.ajax({
      url: this.props.url || $.Api.TEST,
      dataType: 'json',
      success: function(data) {
        this.setState({
          data: data,
          loading: false
        });
      }.bind(this),
      error: function(xhr, status, err) {
        // this.setState({
        //   err: err,
        //   data: [],
        //   loading: false
        // });
        //console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadingAjax();
    setInterval(this.loadingAjax, this.props.pollInterval);
  },
  // getInitialState: function() {
  //   return {};//AppStore.updateView();
  // },
  // componentDidMount: function() {
  //   AppStore.addChangeListener(this._onChange);
  // },
  // componentWillUnmount: function() {
  //   AppStore.removeChangeListener(this._onChange);
  // },
  // _onChange: function() {
  //   //此处要更新一下 TDK，目前只提供 title 的
  //   //console.log(React.findDOMNode())
  //   //var pageInfo = AppStore.updateView();
  //   //document.title = pageInfo.title + '-爱抢购';
  //   //this.setState(pageInfo);
  // },
  // componentDidMount: function() {
  //   //AppActions.updateView(pageInfo);
  // },
  render: function() {
    return (<div className="iqg-ajax">
        {this.state.loading ? (<div className="ajax-loading"><i className="iqg-icon-spinner iqg-icon-spin"></i></div>) : this.props.children}
    </div>);
  }
});

module.exports = AjaxService;
