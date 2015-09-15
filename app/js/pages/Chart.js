'use strict';

var React = require('react');
// var RUI = require('amazeui-react');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var ReactChart = require('react-chartjs');
var LineChart = ReactChart.Line;

var pageInfo = {
  title: 'Chart 图表'
};

function rand(min, max, num) {
  var rtn = [];
  while (rtn.length < num) {
    rtn.push( parseInt((Math.random() * (max - min)) + min) );
  }
  return rtn;
}

var chartData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "My First dataset",
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
      data: rand(4, 100, 7)
    },
    {
      label: "My Second dataset",
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: rand(2, 100, 7)
    }
  ]
};

var chartOptions = {
  legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
};

var View = React.createClass({
  componentDidMount: function() {
    // AppActions.updateView(pageInfo);
  },
  render: function() {
    return (
      <div className="ask-page">
        <NavLink/>
        <div className="am-padding-vertical-lg">
          <h2>Chart 图表</h2>
          <LineChart data={chartData} options={chartOptions}/>
        </div>
      </div>
    );
  }
});

module.exports = View;
