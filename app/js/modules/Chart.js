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

var dataType = 'datasets';

var View = React.createClass({
  getInitialState: function() {
    if ( this.hasPercent() ) {
      dataType = 'datasets';
    }
    return {
      dataType: dataType
    };
  },
  hasPercent: function() {
    var percents = this.props.data && this.props.data.percents;
    return !!(this.props.opts.numTitle && percents.length);
  },
  handleClick: function() {
    if (!this.props.opts.numTitle) {
      return;
    }
    dataType = this.state.dataType === 'datasets' ? 'percents' : 'datasets';
    this.setState({
      dataType: dataType
    });
  },
  renderChartTitle: function() {
    var data = this.props.data,
        length = data.datasets.length,
        title,
        percents = [],
        percentsTitle = '',
        sum;

    if(length){
      sum = this.props.valueSum;
    }
    title = this.props.opts.valueTitle + '('+ (sum || 0) +')';

    var selectClass;
    if ( this.hasPercent() ) {
      //percents = chartData.datasets[0].data = data.percents;
      percentsTitle = (this.props.opts.numTitle || '') + '(%)';
    }
    if (this.state.dataType !== 'percents') {
      if ( this.hasPercent() ) {
        percentsTitle = (<span onClick={this.handleClick}>{percentsTitle}</span>);
      }
      return (<h3><span className="strong">{title}</span> {percentsTitle}</h3>);
    } else {
      if ( this.hasPercent() ) {
        percentsTitle = (<span className="strong">{percentsTitle}</span>);
      }
      return (<h3><span onClick={this.handleClick}>{title}</span> {percentsTitle}</h3>);
    }

    //(<span className="strong">{title}</span>{percentsTitle});
    //(<span onClick={this.handleClick}>{title}</span> <span className="strong">{percentsTitle}</span>)
  },
  render: function() {
    var data = this.props.data,
        length = data.datasets.length;

    chartData.labels = data.labels;
    //chartData.datasets[0].data = data.datasets;

    if (this.state.dataType !== 'percents') {
      chartData.datasets[0].data = data.datasets;
    } else {
      chartData.datasets[0].data = data.percents;
    }

    var canvasWidth = length>8 ? 30*length : 280;
    return (
      <div className="iqg-chart">
        {this.renderChartTitle()}
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
