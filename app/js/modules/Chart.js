'use strict';

var React = require('react');

var AppActions = require('../actions/AppActions');

var ReactChart = require('react-chartjs');
var LineChart = ReactChart.Line;

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
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)",
      data: []
    }
    // ,
    // {
    //   label: "My Second dataset",
    //   fillColor: "rgba(220,220,220,0.2)",
    //   strokeColor: "rgba(220,220,220,1)",
    //   pointColor: "rgba(220,220,220,1)",
    //   pointStrokeColor: "#fff",
    //   pointHighlightFill: "#fff",
    //   pointHighlightStroke: "rgba(151,187,205,1)",
    //   data: rand(12, 100, 7)
    // }
  ]
};

//默认参数
var chartOptions = {
};

var View = React.createClass({
  render: function() {
    var data = this.props.data,
        length = data.datasets.length,
        sum = 0;
    chartData.labels = data.labels;
    chartData.datasets[0].data = data.datasets;
    if(length){
      sum = data.datasets.reduce(function(a, b) {
        return parseInt(a) + parseInt(b);
      });
    }
    var title = this.props.opts.valueTitle;
    var canvasWidth = length>8 ? 30*length : 280;
    return (
      <div className="iqg-chart">
        <h3>{title}（{sum}）{this.props.opts.numTitle}</h3>
        <div className="chart-box">
          <div className="scroll-box">
            <LineChart data={chartData} options={chartOptions} width={canvasWidth} height="280" />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = View;
