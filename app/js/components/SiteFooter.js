'use strict';

var React = require('react');
var RUI = require('amazeui-react');
var year = new Date().getFullYear();

var SiteFooter = React.createClass({

  render: function() {
    return (
      <footer className="ask-footer">
        <RUI.Container>
          <p>© {year} iqg, Inc. Licensed under MIT license.
            Developed with WebStorm.</p>
        </RUI.Container>
      </footer>
    );
  }
});

module.exports = SiteFooter;
