'use strict';

var React = require('react');
// import Reflux from 'reflux';
var Router = require('react-router');



// global.uiRequire = function (src) {
//   if (src) {
//     return require('../../../src/js/' + src)
//   } else {
//     return require('../../../src/js')
//   }
// }

// var AppStore = require('./stores/AppStore');
// var AppActions = require('./actions/AppActions');

// var RUI = require('amazeui-react');
// var RUI = require('./reactui');
// var Topbar = RUI.Topbar;
// var Nav = RUI.Nav;
// var CollapsibleNav = RUI.CollapsibleNav;
// var Container = RUI.Container;
// var Header = RUI.Header;

// var RouteLink = require('./components/RouteLink');
// var SiteFooter = require('./components/SiteFooter');




// // Pages
// var Index = require('./pages/Index');
// var Page1 = require('./pages/Page1');
// var About = require('./pages/About');
// var Login = require('./pages/Login');
// var List = require('./pages/List');
// var Company = require('./pages/Company');
// var NotFound = require('./pages/NotFound');

// var routes = (
//   <Route name="app" path="/" handler={App}>
//     <DefaultRoute handler={Index}/>
//     <Route name='page1' handler={Page1}/>
//     <Route name='about' handler={About}/>
//     <Route name='login' handler={Login}/>
//     <Route name='list' path="list" handler={List}/>
//     <Route name='detail' path="list/:id" handler={List}/>
//     <Route name="company" path="about/company" handler={Company}/>

//     <NotFoundRoute handler={NotFound} />
//   </Route>
// );

var routes = require('./routes');

/*
Router.run(routes, Router.HistoryLocation, callback);

<Route path="/" handler={App}>
  // When the url is `/`, this route will be active.
  <DefaultRoute handler={Home}/>

  <Route name="about" handler={About}/>
  <Route name="users" handler={Users}>
    <Route name="user" handler={User} path="/user/:id"/>

    // when the url is `/users`, this will be active
    <DefaultRoute name="users-index" handler={UsersIndex}/>

  </Route>
</Route>
*/
//
// function hashListener(state) {
//   window.addEventListener('popstate', function(e){
//     console.warn('popstate')
//     console.warn(history.state)
//     if (history.state){
//       var state = e.state;
//       console.log('hash 变化')
//       console.log(state)
//       //do something(state.url, state.title);
//     }
//   });
// };



//    // Router.HashLocation,
document.addEventListener('DOMContentLoaded', function() {
  Router.run(routes,
    Router.HashLocation,
    function(Root, state) {
      React.render(<Root />, document.body);
    });
});
