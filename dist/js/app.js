(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 1.0.2
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function(){

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart;

	//Occupy the global variable of Chart, and create a simple base class
	var Chart = function(context){
		var chart = this;
		this.canvas = context.canvas;

		this.ctx = context;

		//Variables global to the chart
		var computeDimension = function(element,dimension)
		{
			if (element['offset'+dimension])
			{
				return element['offset'+dimension];
			}
			else
			{
				return document.defaultView.getComputedStyle(element).getPropertyValue(dimension);
			}
		}

		var width = this.width = computeDimension(context.canvas,'Width');
		var height = this.height = computeDimension(context.canvas,'Height');

		// Firefox requires this to work correctly
		context.canvas.width  = width;
		context.canvas.height = height;

		var width = this.width = context.canvas.width;
		var height = this.height = context.canvas.height;
		this.aspectRatio = this.width / this.height;
		//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
		helpers.retinaScale(this);

		return this;
	};
	//Globally expose the defaults to allow for user updating/changing
	Chart.defaults = {
		global: {
			// Boolean - Whether to animate the chart
			animation: true,

			// Number - Number of animation steps
			animationSteps: 60,

			// String - Animation easing effect
			animationEasing: "easeOutQuart",

			// Boolean - If we should show the scale at all
			showScale: true,

			// Boolean - If we want to override with a hard coded scale
			scaleOverride: false,

			// ** Required if scaleOverride is true **
			// Number - The number of steps in a hard coded scale
			scaleSteps: null,
			// Number - The value jump in the hard coded scale
			scaleStepWidth: null,
			// Number - The scale starting value
			scaleStartValue: null,

			// String - Colour of the scale line
			scaleLineColor: "rgba(0,0,0,.1)",

			// Number - Pixel width of the scale line
			scaleLineWidth: 1,

			// Boolean - Whether to show labels on the scale
			scaleShowLabels: true,

			// Interpolated JS string - can access value
			scaleLabel: "<%=value%>",

			// Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
			scaleIntegersOnly: true,

			// Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
			scaleBeginAtZero: false,

			// String - Scale label font declaration for the scale label
			scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Scale label font size in pixels
			scaleFontSize: 12,

			// String - Scale label font weight style
			scaleFontStyle: "normal",

			// String - Scale label font colour
			scaleFontColor: "#666",

			// Boolean - whether or not the chart should be responsive and resize when the browser does.
			responsive: false,

			// Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
			maintainAspectRatio: true,

			// Boolean - Determines whether to draw tooltips on the canvas or not - attaches events to touchmove & mousemove
			showTooltips: true,

			// Boolean - Determines whether to draw built-in tooltip or call custom tooltip function
			customTooltips: false,

			// Array - Array of string names to attach tooltip events
			tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],

			// String - Tooltip background colour
			tooltipFillColor: "rgba(0,0,0,0.8)",

			// String - Tooltip label font declaration for the scale label
			tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Tooltip label font size in pixels
			tooltipFontSize: 14,

			// String - Tooltip font weight style
			tooltipFontStyle: "normal",

			// String - Tooltip label font colour
			tooltipFontColor: "#fff",

			// String - Tooltip title font declaration for the scale label
			tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Tooltip title font size in pixels
			tooltipTitleFontSize: 14,

			// String - Tooltip title font weight style
			tooltipTitleFontStyle: "bold",

			// String - Tooltip title font colour
			tooltipTitleFontColor: "#fff",

			// Number - pixel width of padding around tooltip text
			tooltipYPadding: 6,

			// Number - pixel width of padding around tooltip text
			tooltipXPadding: 6,

			// Number - Size of the caret on the tooltip
			tooltipCaretSize: 8,

			// Number - Pixel radius of the tooltip border
			tooltipCornerRadius: 6,

			// Number - Pixel offset from point x to tooltip edge
			tooltipXOffset: 10,

			// String - Template string for single tooltips
			tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

			// String - Template string for single tooltips
			multiTooltipTemplate: "<%= value %>",

			// String - Colour behind the legend colour block
			multiTooltipKeyBackground: '#fff',

			// Function - Will fire on animation progression.
			onAnimationProgress: function(){},

			// Function - Will fire on animation completion.
			onAnimationComplete: function(){}

		}
	};

	//Create a dictionary of chart types, to allow for extension of existing types
	Chart.types = {};

	//Global Chart helpers object for utility methods and classes
	var helpers = Chart.helpers = {};

		//-- Basic js utility methods
	var each = helpers.each = function(loopable,callback,self){
			var additionalArgs = Array.prototype.slice.call(arguments, 3);
			// Check to see if null or undefined firstly.
			if (loopable){
				if (loopable.length === +loopable.length){
					var i;
					for (i=0; i<loopable.length; i++){
						callback.apply(self,[loopable[i], i].concat(additionalArgs));
					}
				}
				else{
					for (var item in loopable){
						callback.apply(self,[loopable[item],item].concat(additionalArgs));
					}
				}
			}
		},
		clone = helpers.clone = function(obj){
			var objClone = {};
			each(obj,function(value,key){
				if (obj.hasOwnProperty(key)) objClone[key] = value;
			});
			return objClone;
		},
		extend = helpers.extend = function(base){
			each(Array.prototype.slice.call(arguments,1), function(extensionObject) {
				each(extensionObject,function(value,key){
					if (extensionObject.hasOwnProperty(key)) base[key] = value;
				});
			});
			return base;
		},
		merge = helpers.merge = function(base,master){
			//Merge properties in left object over to a shallow clone of object right.
			var args = Array.prototype.slice.call(arguments,0);
			args.unshift({});
			return extend.apply(null, args);
		},
		indexOf = helpers.indexOf = function(arrayToSearch, item){
			if (Array.prototype.indexOf) {
				return arrayToSearch.indexOf(item);
			}
			else{
				for (var i = 0; i < arrayToSearch.length; i++) {
					if (arrayToSearch[i] === item) return i;
				}
				return -1;
			}
		},
		where = helpers.where = function(collection, filterCallback){
			var filtered = [];

			helpers.each(collection, function(item){
				if (filterCallback(item)){
					filtered.push(item);
				}
			});

			return filtered;
		},
		findNextWhere = helpers.findNextWhere = function(arrayToSearch, filterCallback, startIndex){
			// Default to start of the array
			if (!startIndex){
				startIndex = -1;
			}
			for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)){
					return currentItem;
				}
			}
		},
		findPreviousWhere = helpers.findPreviousWhere = function(arrayToSearch, filterCallback, startIndex){
			// Default to end of the array
			if (!startIndex){
				startIndex = arrayToSearch.length;
			}
			for (var i = startIndex - 1; i >= 0; i--) {
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)){
					return currentItem;
				}
			}
		},
		inherits = helpers.inherits = function(extensions){
			//Basic javascript inheritance based on the model created in Backbone.js
			var parent = this;
			var ChartElement = (extensions && extensions.hasOwnProperty("constructor")) ? extensions.constructor : function(){ return parent.apply(this, arguments); };

			var Surrogate = function(){ this.constructor = ChartElement;};
			Surrogate.prototype = parent.prototype;
			ChartElement.prototype = new Surrogate();

			ChartElement.extend = inherits;

			if (extensions) extend(ChartElement.prototype, extensions);

			ChartElement.__super__ = parent.prototype;

			return ChartElement;
		},
		noop = helpers.noop = function(){},
		uid = helpers.uid = (function(){
			var id=0;
			return function(){
				return "chart-" + id++;
			};
		})(),
		warn = helpers.warn = function(str){
			//Method for warning of errors
			if (window.console && typeof window.console.warn == "function") console.warn(str);
		},
		amd = helpers.amd = (typeof define == 'function' && define.amd),
		//-- Math methods
		isNumber = helpers.isNumber = function(n){
			return !isNaN(parseFloat(n)) && isFinite(n);
		},
		max = helpers.max = function(array){
			return Math.max.apply( Math, array );
		},
		min = helpers.min = function(array){
			return Math.min.apply( Math, array );
		},
		cap = helpers.cap = function(valueToCap,maxValue,minValue){
			if(isNumber(maxValue)) {
				if( valueToCap > maxValue ) {
					return maxValue;
				}
			}
			else if(isNumber(minValue)){
				if ( valueToCap < minValue ){
					return minValue;
				}
			}
			return valueToCap;
		},
		getDecimalPlaces = helpers.getDecimalPlaces = function(num){
			if (num%1!==0 && isNumber(num)){
				return num.toString().split(".")[1].length;
			}
			else {
				return 0;
			}
		},
		toRadians = helpers.radians = function(degrees){
			return degrees * (Math.PI/180);
		},
		// Gets the angle from vertical upright to the point about a centre.
		getAngleFromPoint = helpers.getAngleFromPoint = function(centrePoint, anglePoint){
			var distanceFromXCenter = anglePoint.x - centrePoint.x,
				distanceFromYCenter = anglePoint.y - centrePoint.y,
				radialDistanceFromCenter = Math.sqrt( distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);


			var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);

			//If the segment is in the top left quadrant, we need to add another rotation to the angle
			if (distanceFromXCenter < 0 && distanceFromYCenter < 0){
				angle += Math.PI*2;
			}

			return {
				angle: angle,
				distance: radialDistanceFromCenter
			};
		},
		aliasPixel = helpers.aliasPixel = function(pixelWidth){
			return (pixelWidth % 2 === 0) ? 0 : 0.5;
		},
		splineCurve = helpers.splineCurve = function(FirstPoint,MiddlePoint,AfterPoint,t){
			//Props to Rob Spencer at scaled innovation for his post on splining between points
			//http://scaledinnovation.com/analytics/splines/aboutSplines.html
			var d01=Math.sqrt(Math.pow(MiddlePoint.x-FirstPoint.x,2)+Math.pow(MiddlePoint.y-FirstPoint.y,2)),
				d12=Math.sqrt(Math.pow(AfterPoint.x-MiddlePoint.x,2)+Math.pow(AfterPoint.y-MiddlePoint.y,2)),
				fa=t*d01/(d01+d12),// scaling factor for triangle Ta
				fb=t*d12/(d01+d12);
			return {
				inner : {
					x : MiddlePoint.x-fa*(AfterPoint.x-FirstPoint.x),
					y : MiddlePoint.y-fa*(AfterPoint.y-FirstPoint.y)
				},
				outer : {
					x: MiddlePoint.x+fb*(AfterPoint.x-FirstPoint.x),
					y : MiddlePoint.y+fb*(AfterPoint.y-FirstPoint.y)
				}
			};
		},
		calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function(val){
			return Math.floor(Math.log(val) / Math.LN10);
		},
		calculateScaleRange = helpers.calculateScaleRange = function(valuesArray, drawingSize, textSize, startFromZero, integersOnly){

			//Set a minimum step of two - a point at the top of the graph, and a point at the base
			var minSteps = 2,
				maxSteps = Math.floor(drawingSize/(textSize * 1.5)),
				skipFitting = (minSteps >= maxSteps);

			var maxValue = max(valuesArray),
				minValue = min(valuesArray);

			// We need some degree of seperation here to calculate the scales if all the values are the same
			// Adding/minusing 0.5 will give us a range of 1.
			if (maxValue === minValue){
				maxValue += 0.5;
				// So we don't end up with a graph with a negative start value if we've said always start from zero
				if (minValue >= 0.5 && !startFromZero){
					minValue -= 0.5;
				}
				else{
					// Make up a whole number above the values
					maxValue += 0.5;
				}
			}

			var	valueRange = Math.abs(maxValue - minValue),
				rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange),
				graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
				graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
				graphRange = graphMax - graphMin,
				stepValue = Math.pow(10, rangeOrderOfMagnitude),
				numberOfSteps = Math.round(graphRange / stepValue);

			//If we have more space on the graph we'll use it to give more definition to the data
			while((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
				if(numberOfSteps > maxSteps){
					stepValue *=2;
					numberOfSteps = Math.round(graphRange/stepValue);
					// Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
					if (numberOfSteps % 1 !== 0){
						skipFitting = true;
					}
				}
				//We can fit in double the amount of scale points on the scale
				else{
					//If user has declared ints only, and the step value isn't a decimal
					if (integersOnly && rangeOrderOfMagnitude >= 0){
						//If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
						if(stepValue/2 % 1 === 0){
							stepValue /=2;
							numberOfSteps = Math.round(graphRange/stepValue);
						}
						//If it would make it a float break out of the loop
						else{
							break;
						}
					}
					//If the scale doesn't have to be an int, make the scale more granular anyway.
					else{
						stepValue /=2;
						numberOfSteps = Math.round(graphRange/stepValue);
					}

				}
			}

			if (skipFitting){
				numberOfSteps = minSteps;
				stepValue = graphRange / numberOfSteps;
			}

			return {
				steps : numberOfSteps,
				stepValue : stepValue,
				min : graphMin,
				max	: graphMin + (numberOfSteps * stepValue)
			};

		},
		/* jshint ignore:start */
		// Blows up jshint errors based on the new Function constructor
		//Templating methods
		//Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
		template = helpers.template = function(templateString, valuesObject){

			// If templateString is function rather than string-template - call the function for valuesObject

			if(templateString instanceof Function){
			 	return templateString(valuesObject);
		 	}

			var cache = {};
			function tmpl(str, data){
				// Figure out if we're getting a template, or if we need to
				// load the template - and be sure to cache the result.
				var fn = !/\W/.test(str) ?
				cache[str] = cache[str] :

				// Generate a reusable function that will serve as a template
				// generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +

					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +

					// Convert the template into pure JavaScript
					str
						.replace(/[\r\t\n]/g, " ")
						.split("<%").join("\t")
						.replace(/((^|%>)[^\t]*)'/g, "$1\r")
						.replace(/\t=(.*?)%>/g, "',$1,'")
						.split("\t").join("');")
						.split("%>").join("p.push('")
						.split("\r").join("\\'") +
					"');}return p.join('');"
				);

				// Provide some basic currying to the user
				return data ? fn( data ) : fn;
			}
			return tmpl(templateString,valuesObject);
		},
		/* jshint ignore:end */
		generateLabels = helpers.generateLabels = function(templateString,numberOfSteps,graphMin,stepValue){
			var labelsArray = new Array(numberOfSteps);
			if (labelTemplateString){
				each(labelsArray,function(val,index){
					labelsArray[index] = template(templateString,{value: (graphMin + (stepValue*(index+1)))});
				});
			}
			return labelsArray;
		},
		//--Animation methods
		//Easing functions adapted from Robert Penner's easing equations
		//http://www.robertpenner.com/easing/
		easingEffects = helpers.easingEffects = {
			linear: function (t) {
				return t;
			},
			easeInQuad: function (t) {
				return t * t;
			},
			easeOutQuad: function (t) {
				return -1 * t * (t - 2);
			},
			easeInOutQuad: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
				return -1 / 2 * ((--t) * (t - 2) - 1);
			},
			easeInCubic: function (t) {
				return t * t * t;
			},
			easeOutCubic: function (t) {
				return 1 * ((t = t / 1 - 1) * t * t + 1);
			},
			easeInOutCubic: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
				return 1 / 2 * ((t -= 2) * t * t + 2);
			},
			easeInQuart: function (t) {
				return t * t * t * t;
			},
			easeOutQuart: function (t) {
				return -1 * ((t = t / 1 - 1) * t * t * t - 1);
			},
			easeInOutQuart: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
				return -1 / 2 * ((t -= 2) * t * t * t - 2);
			},
			easeInQuint: function (t) {
				return 1 * (t /= 1) * t * t * t * t;
			},
			easeOutQuint: function (t) {
				return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
			},
			easeInOutQuint: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
				return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
			},
			easeInSine: function (t) {
				return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
			},
			easeOutSine: function (t) {
				return 1 * Math.sin(t / 1 * (Math.PI / 2));
			},
			easeInOutSine: function (t) {
				return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
			},
			easeInExpo: function (t) {
				return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
			},
			easeOutExpo: function (t) {
				return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
			},
			easeInOutExpo: function (t) {
				if (t === 0) return 0;
				if (t === 1) return 1;
				if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
				return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
			},
			easeInCirc: function (t) {
				if (t >= 1) return t;
				return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
			},
			easeOutCirc: function (t) {
				return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
			},
			easeInOutCirc: function (t) {
				if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
				return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
			},
			easeInElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1) == 1) return 1;
				if (!p) p = 1 * 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
			},
			easeOutElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1) == 1) return 1;
				if (!p) p = 1 * 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
			},
			easeInOutElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1 / 2) == 2) return 1;
				if (!p) p = 1 * (0.3 * 1.5);
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
			},
			easeInBack: function (t) {
				var s = 1.70158;
				return 1 * (t /= 1) * t * ((s + 1) * t - s);
			},
			easeOutBack: function (t) {
				var s = 1.70158;
				return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
			},
			easeInOutBack: function (t) {
				var s = 1.70158;
				if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
				return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
			},
			easeInBounce: function (t) {
				return 1 - easingEffects.easeOutBounce(1 - t);
			},
			easeOutBounce: function (t) {
				if ((t /= 1) < (1 / 2.75)) {
					return 1 * (7.5625 * t * t);
				} else if (t < (2 / 2.75)) {
					return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
				} else if (t < (2.5 / 2.75)) {
					return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
				} else {
					return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
				}
			},
			easeInOutBounce: function (t) {
				if (t < 1 / 2) return easingEffects.easeInBounce(t * 2) * 0.5;
				return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
			}
		},
		//Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
		requestAnimFrame = helpers.requestAnimFrame = (function(){
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					return window.setTimeout(callback, 1000 / 60);
				};
		})(),
		cancelAnimFrame = helpers.cancelAnimFrame = (function(){
			return window.cancelAnimationFrame ||
				window.webkitCancelAnimationFrame ||
				window.mozCancelAnimationFrame ||
				window.oCancelAnimationFrame ||
				window.msCancelAnimationFrame ||
				function(callback) {
					return window.clearTimeout(callback, 1000 / 60);
				};
		})(),
		animationLoop = helpers.animationLoop = function(callback,totalSteps,easingString,onProgress,onComplete,chartInstance){

			var currentStep = 0,
				easingFunction = easingEffects[easingString] || easingEffects.linear;

			var animationFrame = function(){
				currentStep++;
				var stepDecimal = currentStep/totalSteps;
				var easeDecimal = easingFunction(stepDecimal);

				callback.call(chartInstance,easeDecimal,stepDecimal, currentStep);
				onProgress.call(chartInstance,easeDecimal,stepDecimal);
				if (currentStep < totalSteps){
					chartInstance.animationFrame = requestAnimFrame(animationFrame);
				} else{
					onComplete.apply(chartInstance);
				}
			};
			requestAnimFrame(animationFrame);
		},
		//-- DOM methods
		getRelativePosition = helpers.getRelativePosition = function(evt){
			var mouseX, mouseY;
			var e = evt.originalEvent || evt,
				canvas = evt.currentTarget || evt.srcElement,
				boundingRect = canvas.getBoundingClientRect();

			if (e.touches){
				mouseX = e.touches[0].clientX - boundingRect.left;
				mouseY = e.touches[0].clientY - boundingRect.top;

			}
			else{
				mouseX = e.clientX - boundingRect.left;
				mouseY = e.clientY - boundingRect.top;
			}

			return {
				x : mouseX,
				y : mouseY
			};

		},
		addEvent = helpers.addEvent = function(node,eventType,method){
			if (node.addEventListener){
				node.addEventListener(eventType,method);
			} else if (node.attachEvent){
				node.attachEvent("on"+eventType, method);
			} else {
				node["on"+eventType] = method;
			}
		},
		removeEvent = helpers.removeEvent = function(node, eventType, handler){
			if (node.removeEventListener){
				node.removeEventListener(eventType, handler, false);
			} else if (node.detachEvent){
				node.detachEvent("on"+eventType,handler);
			} else{
				node["on" + eventType] = noop;
			}
		},
		bindEvents = helpers.bindEvents = function(chartInstance, arrayOfEvents, handler){
			// Create the events object if it's not already present
			if (!chartInstance.events) chartInstance.events = {};

			each(arrayOfEvents,function(eventName){
				chartInstance.events[eventName] = function(){
					handler.apply(chartInstance, arguments);
				};
				addEvent(chartInstance.chart.canvas,eventName,chartInstance.events[eventName]);
			});
		},
		unbindEvents = helpers.unbindEvents = function (chartInstance, arrayOfEvents) {
			each(arrayOfEvents, function(handler,eventName){
				removeEvent(chartInstance.chart.canvas, eventName, handler);
			});
		},
		getMaximumWidth = helpers.getMaximumWidth = function(domNode){
			var container = domNode.parentNode;
			// TODO = check cross browser stuff with this.
			return container.clientWidth;
		},
		getMaximumHeight = helpers.getMaximumHeight = function(domNode){
			var container = domNode.parentNode;
			// TODO = check cross browser stuff with this.
			return container.clientHeight;
		},
		getMaximumSize = helpers.getMaximumSize = helpers.getMaximumWidth, // legacy support
		retinaScale = helpers.retinaScale = function(chart){
			var ctx = chart.ctx,
				width = chart.canvas.width,
				height = chart.canvas.height;

			if (window.devicePixelRatio) {
				ctx.canvas.style.width = width + "px";
				ctx.canvas.style.height = height + "px";
				ctx.canvas.height = height * window.devicePixelRatio;
				ctx.canvas.width = width * window.devicePixelRatio;
				ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
			}
		},
		//-- Canvas methods
		clear = helpers.clear = function(chart){
			chart.ctx.clearRect(0,0,chart.width,chart.height);
		},
		fontString = helpers.fontString = function(pixelSize,fontStyle,fontFamily){
			return fontStyle + " " + pixelSize+"px " + fontFamily;
		},
		longestText = helpers.longestText = function(ctx,font,arrayOfStrings){
			ctx.font = font;
			var longest = 0;
			each(arrayOfStrings,function(string){
				var textWidth = ctx.measureText(string).width;
				longest = (textWidth > longest) ? textWidth : longest;
			});
			return longest;
		},
		drawRoundedRectangle = helpers.drawRoundedRectangle = function(ctx,x,y,width,height,radius){
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
		};


	//Store a reference to each instance - allowing us to globally resize chart instances on window resize.
	//Destroy method on the chart will remove the instance of the chart from this reference.
	Chart.instances = {};

	Chart.Type = function(data,options,chart){
		this.options = options;
		this.chart = chart;
		this.id = uid();
		//Add the chart instance to the global namespace
		Chart.instances[this.id] = this;

		// Initialize is always called when a chart type is created
		// By default it is a no op, but it should be extended
		if (options.responsive){
			this.resize();
		}
		this.initialize.call(this,data);
	};

	//Core methods that'll be a part of every chart type
	extend(Chart.Type.prototype,{
		initialize : function(){return this;},
		clear : function(){
			clear(this.chart);
			return this;
		},
		stop : function(){
			// Stops any current animation loop occuring
			cancelAnimFrame(this.animationFrame);
			return this;
		},
		resize : function(callback){
			this.stop();
			var canvas = this.chart.canvas,
				newWidth = getMaximumWidth(this.chart.canvas),
				newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

			canvas.width = this.chart.width = newWidth;
			canvas.height = this.chart.height = newHeight;

			retinaScale(this.chart);

			if (typeof callback === "function"){
				callback.apply(this, Array.prototype.slice.call(arguments, 1));
			}
			return this;
		},
		reflow : noop,
		render : function(reflow){
			if (reflow){
				this.reflow();
			}
			if (this.options.animation && !reflow){
				helpers.animationLoop(
					this.draw,
					this.options.animationSteps,
					this.options.animationEasing,
					this.options.onAnimationProgress,
					this.options.onAnimationComplete,
					this
				);
			}
			else{
				this.draw();
				this.options.onAnimationComplete.call(this);
			}
			return this;
		},
		generateLegend : function(){
			return template(this.options.legendTemplate,this);
		},
		destroy : function(){
			this.clear();
			unbindEvents(this, this.events);
			var canvas = this.chart.canvas;

			// Reset canvas height/width attributes starts a fresh with the canvas context
			canvas.width = this.chart.width;
			canvas.height = this.chart.height;

			// < IE9 doesn't support removeProperty
			if (canvas.style.removeProperty) {
				canvas.style.removeProperty('width');
				canvas.style.removeProperty('height');
			} else {
				canvas.style.removeAttribute('width');
				canvas.style.removeAttribute('height');
			}

			delete Chart.instances[this.id];
		},
		showTooltip : function(ChartElements, forceRedraw){
			// Only redraw the chart if we've actually changed what we're hovering on.
			if (typeof this.activeElements === 'undefined') this.activeElements = [];

			var isChanged = (function(Elements){
				var changed = false;

				if (Elements.length !== this.activeElements.length){
					changed = true;
					return changed;
				}

				each(Elements, function(element, index){
					if (element !== this.activeElements[index]){
						changed = true;
					}
				}, this);
				return changed;
			}).call(this, ChartElements);

			if (!isChanged && !forceRedraw){
				return;
			}
			else{
				this.activeElements = ChartElements;
			}
			this.draw();
			if(this.options.customTooltips){
				this.options.customTooltips(false);
			}
			if (ChartElements.length > 0){
				// If we have multiple datasets, show a MultiTooltip for all of the data points at that index
				if (this.datasets && this.datasets.length > 1) {
					var dataArray,
						dataIndex;

					for (var i = this.datasets.length - 1; i >= 0; i--) {
						dataArray = this.datasets[i].points || this.datasets[i].bars || this.datasets[i].segments;
						dataIndex = indexOf(dataArray, ChartElements[0]);
						if (dataIndex !== -1){
							break;
						}
					}
					var tooltipLabels = [],
						tooltipColors = [],
						medianPosition = (function(index) {

							// Get all the points at that particular index
							var Elements = [],
								dataCollection,
								xPositions = [],
								yPositions = [],
								xMax,
								yMax,
								xMin,
								yMin;
							helpers.each(this.datasets, function(dataset){
								dataCollection = dataset.points || dataset.bars || dataset.segments;
								if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()){
									Elements.push(dataCollection[dataIndex]);
								}
							});

							helpers.each(Elements, function(element) {
								xPositions.push(element.x);
								yPositions.push(element.y);


								//Include any colour information about the element
								tooltipLabels.push(helpers.template(this.options.multiTooltipTemplate, element));
								tooltipColors.push({
									fill: element._saved.fillColor || element.fillColor,
									stroke: element._saved.strokeColor || element.strokeColor
								});

							}, this);

							yMin = min(yPositions);
							yMax = max(yPositions);

							xMin = min(xPositions);
							xMax = max(xPositions);

							return {
								x: (xMin > this.chart.width/2) ? xMin : xMax,
								y: (yMin + yMax)/2
							};
						}).call(this, dataIndex);

					new Chart.MultiTooltip({
						x: medianPosition.x,
						y: medianPosition.y,
						xPadding: this.options.tooltipXPadding,
						yPadding: this.options.tooltipYPadding,
						xOffset: this.options.tooltipXOffset,
						fillColor: this.options.tooltipFillColor,
						textColor: this.options.tooltipFontColor,
						fontFamily: this.options.tooltipFontFamily,
						fontStyle: this.options.tooltipFontStyle,
						fontSize: this.options.tooltipFontSize,
						titleTextColor: this.options.tooltipTitleFontColor,
						titleFontFamily: this.options.tooltipTitleFontFamily,
						titleFontStyle: this.options.tooltipTitleFontStyle,
						titleFontSize: this.options.tooltipTitleFontSize,
						cornerRadius: this.options.tooltipCornerRadius,
						labels: tooltipLabels,
						legendColors: tooltipColors,
						legendColorBackground : this.options.multiTooltipKeyBackground,
						title: ChartElements[0].label,
						chart: this.chart,
						ctx: this.chart.ctx,
						custom: this.options.customTooltips
					}).draw();

				} else {
					each(ChartElements, function(Element) {
						var tooltipPosition = Element.tooltipPosition();
						new Chart.Tooltip({
							x: Math.round(tooltipPosition.x),
							y: Math.round(tooltipPosition.y),
							xPadding: this.options.tooltipXPadding,
							yPadding: this.options.tooltipYPadding,
							fillColor: this.options.tooltipFillColor,
							textColor: this.options.tooltipFontColor,
							fontFamily: this.options.tooltipFontFamily,
							fontStyle: this.options.tooltipFontStyle,
							fontSize: this.options.tooltipFontSize,
							caretHeight: this.options.tooltipCaretSize,
							cornerRadius: this.options.tooltipCornerRadius,
							text: template(this.options.tooltipTemplate, Element),
							chart: this.chart,
							custom: this.options.customTooltips
						}).draw();
					}, this);
				}
			}
			return this;
		},
		toBase64Image : function(){
			return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
		}
	});

	Chart.Type.extend = function(extensions){

		var parent = this;

		var ChartType = function(){
			return parent.apply(this,arguments);
		};

		//Copy the prototype object of the this class
		ChartType.prototype = clone(parent.prototype);
		//Now overwrite some of the properties in the base class with the new extensions
		extend(ChartType.prototype, extensions);

		ChartType.extend = Chart.Type.extend;

		if (extensions.name || parent.prototype.name){

			var chartName = extensions.name || parent.prototype.name;
			//Assign any potential default values of the new chart type

			//If none are defined, we'll use a clone of the chart type this is being extended from.
			//I.e. if we extend a line chart, we'll use the defaults from the line chart if our new chart
			//doesn't define some defaults of their own.

			var baseDefaults = (Chart.defaults[parent.prototype.name]) ? clone(Chart.defaults[parent.prototype.name]) : {};

			Chart.defaults[chartName] = extend(baseDefaults,extensions.defaults);

			Chart.types[chartName] = ChartType;

			//Register this new chart type in the Chart prototype
			Chart.prototype[chartName] = function(data,options){
				var config = merge(Chart.defaults.global, Chart.defaults[chartName], options || {});
				return new ChartType(data,config,this);
			};
		} else{
			warn("Name not provided for this chart, so it hasn't been registered");
		}
		return parent;
	};

	Chart.Element = function(configuration){
		extend(this,configuration);
		this.initialize.apply(this,arguments);
		this.save();
	};
	extend(Chart.Element.prototype,{
		initialize : function(){},
		restore : function(props){
			if (!props){
				extend(this,this._saved);
			} else {
				each(props,function(key){
					this[key] = this._saved[key];
				},this);
			}
			return this;
		},
		save : function(){
			this._saved = clone(this);
			delete this._saved._saved;
			return this;
		},
		update : function(newProps){
			each(newProps,function(value,key){
				this._saved[key] = this[key];
				this[key] = value;
			},this);
			return this;
		},
		transition : function(props,ease){
			each(props,function(value,key){
				this[key] = ((value - this._saved[key]) * ease) + this._saved[key];
			},this);
			return this;
		},
		tooltipPosition : function(){
			return {
				x : this.x,
				y : this.y
			};
		},
		hasValue: function(){
			return isNumber(this.value);
		}
	});

	Chart.Element.extend = inherits;


	Chart.Point = Chart.Element.extend({
		display: true,
		inRange: function(chartX,chartY){
			var hitDetectionRange = this.hitDetectionRadius + this.radius;
			return ((Math.pow(chartX-this.x, 2)+Math.pow(chartY-this.y, 2)) < Math.pow(hitDetectionRange,2));
		},
		draw : function(){
			if (this.display){
				var ctx = this.ctx;
				ctx.beginPath();

				ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
				ctx.closePath();

				ctx.strokeStyle = this.strokeColor;
				ctx.lineWidth = this.strokeWidth;

				ctx.fillStyle = this.fillColor;

				ctx.fill();
				ctx.stroke();
			}


			//Quick debug for bezier curve splining
			//Highlights control points and the line between them.
			//Handy for dev - stripped in the min version.

			// ctx.save();
			// ctx.fillStyle = "black";
			// ctx.strokeStyle = "black"
			// ctx.beginPath();
			// ctx.arc(this.controlPoints.inner.x,this.controlPoints.inner.y, 2, 0, Math.PI*2);
			// ctx.fill();

			// ctx.beginPath();
			// ctx.arc(this.controlPoints.outer.x,this.controlPoints.outer.y, 2, 0, Math.PI*2);
			// ctx.fill();

			// ctx.moveTo(this.controlPoints.inner.x,this.controlPoints.inner.y);
			// ctx.lineTo(this.x, this.y);
			// ctx.lineTo(this.controlPoints.outer.x,this.controlPoints.outer.y);
			// ctx.stroke();

			// ctx.restore();



		}
	});

	Chart.Arc = Chart.Element.extend({
		inRange : function(chartX,chartY){

			var pointRelativePosition = helpers.getAngleFromPoint(this, {
				x: chartX,
				y: chartY
			});

			//Check if within the range of the open/close angle
			var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle),
				withinRadius = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);

			return (betweenAngles && withinRadius);
			//Ensure within the outside of the arc centre, but inside arc outer
		},
		tooltipPosition : function(){
			var centreAngle = this.startAngle + ((this.endAngle - this.startAngle) / 2),
				rangeFromCentre = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
			return {
				x : this.x + (Math.cos(centreAngle) * rangeFromCentre),
				y : this.y + (Math.sin(centreAngle) * rangeFromCentre)
			};
		},
		draw : function(animationPercent){

			var easingDecimal = animationPercent || 1;

			var ctx = this.ctx;

			ctx.beginPath();

			ctx.arc(this.x, this.y, this.outerRadius, this.startAngle, this.endAngle);

			ctx.arc(this.x, this.y, this.innerRadius, this.endAngle, this.startAngle, true);

			ctx.closePath();
			ctx.strokeStyle = this.strokeColor;
			ctx.lineWidth = this.strokeWidth;

			ctx.fillStyle = this.fillColor;

			ctx.fill();
			ctx.lineJoin = 'bevel';

			if (this.showStroke){
				ctx.stroke();
			}
		}
	});

	Chart.Rectangle = Chart.Element.extend({
		draw : function(){
			var ctx = this.ctx,
				halfWidth = this.width/2,
				leftX = this.x - halfWidth,
				rightX = this.x + halfWidth,
				top = this.base - (this.base - this.y),
				halfStroke = this.strokeWidth / 2;

			// Canvas doesn't allow us to stroke inside the width so we can
			// adjust the sizes to fit if we're setting a stroke on the line
			if (this.showStroke){
				leftX += halfStroke;
				rightX -= halfStroke;
				top += halfStroke;
			}

			ctx.beginPath();

			ctx.fillStyle = this.fillColor;
			ctx.strokeStyle = this.strokeColor;
			ctx.lineWidth = this.strokeWidth;

			// It'd be nice to keep this class totally generic to any rectangle
			// and simply specify which border to miss out.
			ctx.moveTo(leftX, this.base);
			ctx.lineTo(leftX, top);
			ctx.lineTo(rightX, top);
			ctx.lineTo(rightX, this.base);
			ctx.fill();
			if (this.showStroke){
				ctx.stroke();
			}
		},
		height : function(){
			return this.base - this.y;
		},
		inRange : function(chartX,chartY){
			return (chartX >= this.x - this.width/2 && chartX <= this.x + this.width/2) && (chartY >= this.y && chartY <= this.base);
		}
	});

	Chart.Tooltip = Chart.Element.extend({
		draw : function(){

			var ctx = this.chart.ctx;

			ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);

			this.xAlign = "center";
			this.yAlign = "above";

			//Distance between the actual element.y position and the start of the tooltip caret
			var caretPadding = this.caretPadding = 2;

			var tooltipWidth = ctx.measureText(this.text).width + 2*this.xPadding,
				tooltipRectHeight = this.fontSize + 2*this.yPadding,
				tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;

			if (this.x + tooltipWidth/2 >this.chart.width){
				this.xAlign = "left";
			} else if (this.x - tooltipWidth/2 < 0){
				this.xAlign = "right";
			}

			if (this.y - tooltipHeight < 0){
				this.yAlign = "below";
			}


			var tooltipX = this.x - tooltipWidth/2,
				tooltipY = this.y - tooltipHeight;

			ctx.fillStyle = this.fillColor;

			// Custom Tooltips
			if(this.custom){
				this.custom(this);
			}
			else{
				switch(this.yAlign)
				{
				case "above":
					//Draw a caret above the x/y
					ctx.beginPath();
					ctx.moveTo(this.x,this.y - caretPadding);
					ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
					ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
					ctx.closePath();
					ctx.fill();
					break;
				case "below":
					tooltipY = this.y + caretPadding + this.caretHeight;
					//Draw a caret below the x/y
					ctx.beginPath();
					ctx.moveTo(this.x, this.y + caretPadding);
					ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
					ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
					ctx.closePath();
					ctx.fill();
					break;
				}

				switch(this.xAlign)
				{
				case "left":
					tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
					break;
				case "right":
					tooltipX = this.x - (this.cornerRadius + this.caretHeight);
					break;
				}

				drawRoundedRectangle(ctx,tooltipX,tooltipY,tooltipWidth,tooltipRectHeight,this.cornerRadius);

				ctx.fill();

				ctx.fillStyle = this.textColor;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(this.text, tooltipX + tooltipWidth/2, tooltipY + tooltipRectHeight/2);
			}
		}
	});

	Chart.MultiTooltip = Chart.Element.extend({
		initialize : function(){
			this.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);

			this.titleFont = fontString(this.titleFontSize,this.titleFontStyle,this.titleFontFamily);

			this.height = (this.labels.length * this.fontSize) + ((this.labels.length-1) * (this.fontSize/2)) + (this.yPadding*2) + this.titleFontSize *1.5;

			this.ctx.font = this.titleFont;

			var titleWidth = this.ctx.measureText(this.title).width,
				//Label has a legend square as well so account for this.
				labelWidth = longestText(this.ctx,this.font,this.labels) + this.fontSize + 3,
				longestTextWidth = max([labelWidth,titleWidth]);

			this.width = longestTextWidth + (this.xPadding*2);


			var halfHeight = this.height/2;

			//Check to ensure the height will fit on the canvas
			if (this.y - halfHeight < 0 ){
				this.y = halfHeight;
			} else if (this.y + halfHeight > this.chart.height){
				this.y = this.chart.height - halfHeight;
			}

			//Decide whether to align left or right based on position on canvas
			if (this.x > this.chart.width/2){
				this.x -= this.xOffset + this.width;
			} else {
				this.x += this.xOffset;
			}


		},
		getLineHeight : function(index){
			var baseLineHeight = this.y - (this.height/2) + this.yPadding,
				afterTitleIndex = index-1;

			//If the index is zero, we're getting the title
			if (index === 0){
				return baseLineHeight + this.titleFontSize/2;
			} else{
				return baseLineHeight + ((this.fontSize*1.5*afterTitleIndex) + this.fontSize/2) + this.titleFontSize * 1.5;
			}

		},
		draw : function(){
			// Custom Tooltips
			if(this.custom){
				this.custom(this);
			}
			else{
				drawRoundedRectangle(this.ctx,this.x,this.y - this.height/2,this.width,this.height,this.cornerRadius);
				var ctx = this.ctx;
				ctx.fillStyle = this.fillColor;
				ctx.fill();
				ctx.closePath();

				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillStyle = this.titleTextColor;
				ctx.font = this.titleFont;

				ctx.fillText(this.title,this.x + this.xPadding, this.getLineHeight(0));

				ctx.font = this.font;
				helpers.each(this.labels,function(label,index){
					ctx.fillStyle = this.textColor;
					ctx.fillText(label,this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(index + 1));

					//A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
					//ctx.clearRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);
					//Instead we'll make a white filled block to put the legendColour palette over.

					ctx.fillStyle = this.legendColorBackground;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);

					ctx.fillStyle = this.legendColors[index].fill;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);


				},this);
			}
		}
	});

	Chart.Scale = Chart.Element.extend({
		initialize : function(){
			this.fit();
		},
		buildYLabels : function(){
			this.yLabels = [];

			var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

			for (var i=0; i<=this.steps; i++){
				this.yLabels.push(template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
			}
			this.yLabelWidth = (this.display && this.showLabels) ? longestText(this.ctx,this.font,this.yLabels) : 0;
		},
		addXLabel : function(label){
			this.xLabels.push(label);
			this.valuesCount++;
			this.fit();
		},
		removeXLabel : function(){
			this.xLabels.shift();
			this.valuesCount--;
			this.fit();
		},
		// Fitting loop to rotate x Labels and figure out what fits there, and also calculate how many Y steps to use
		fit: function(){
			// First we need the width of the yLabels, assuming the xLabels aren't rotated

			// To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
			this.startPoint = (this.display) ? this.fontSize : 0;
			this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels

			// Apply padding settings to the start and end point.
			this.startPoint += this.padding;
			this.endPoint -= this.padding;

			// Cache the starting height, so can determine if we need to recalculate the scale yAxis
			var cachedHeight = this.endPoint - this.startPoint,
				cachedYLabelWidth;

			// Build the current yLabels so we have an idea of what size they'll be to start
			/*
			 *	This sets what is returned from calculateScaleRange as static properties of this class:
			 *
				this.steps;
				this.stepValue;
				this.min;
				this.max;
			 *
			 */
			this.calculateYRange(cachedHeight);

			// With these properties set we can now build the array of yLabels
			// and also the width of the largest yLabel
			this.buildYLabels();

			this.calculateXLabelRotation();

			while((cachedHeight > this.endPoint - this.startPoint)){
				cachedHeight = this.endPoint - this.startPoint;
				cachedYLabelWidth = this.yLabelWidth;

				this.calculateYRange(cachedHeight);
				this.buildYLabels();

				// Only go through the xLabel loop again if the yLabel width has changed
				if (cachedYLabelWidth < this.yLabelWidth){
					this.calculateXLabelRotation();
				}
			}

		},
		calculateXLabelRotation : function(){
			//Get the width of each grid by calculating the difference
			//between x offsets between 0 and 1.

			this.ctx.font = this.font;

			var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
				lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
				firstRotated,
				lastRotated;


			this.xScalePaddingRight = lastWidth/2 + 3;
			this.xScalePaddingLeft = (firstWidth/2 > this.yLabelWidth + 10) ? firstWidth/2 : this.yLabelWidth + 10;

			this.xLabelRotation = 0;
			if (this.display){
				var originalLabelWidth = longestText(this.ctx,this.font,this.xLabels),
					cosRotation,
					firstRotatedWidth;
				this.xLabelWidth = originalLabelWidth;
				//Allow 3 pixels x2 padding either side for label readability
				var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;

				//Max label rotate should be 90 - also act as a loop counter
				while ((this.xLabelWidth > xGridWidth && this.xLabelRotation === 0) || (this.xLabelWidth > xGridWidth && this.xLabelRotation <= 90 && this.xLabelRotation > 0)){
					cosRotation = Math.cos(toRadians(this.xLabelRotation));

					firstRotated = cosRotation * firstWidth;
					lastRotated = cosRotation * lastWidth;

					// We're right aligning the text now.
					if (firstRotated + this.fontSize / 2 > this.yLabelWidth + 8){
						this.xScalePaddingLeft = firstRotated + this.fontSize / 2;
					}
					this.xScalePaddingRight = this.fontSize/2;


					this.xLabelRotation++;
					this.xLabelWidth = cosRotation * originalLabelWidth;

				}
				if (this.xLabelRotation > 0){
					this.endPoint -= Math.sin(toRadians(this.xLabelRotation))*originalLabelWidth + 3;
				}
			}
			else{
				this.xLabelWidth = 0;
				this.xScalePaddingRight = this.padding;
				this.xScalePaddingLeft = this.padding;
			}

		},
		// Needs to be overidden in each Chart type
		// Otherwise we need to pass all the data into the scale class
		calculateYRange: noop,
		drawingArea: function(){
			return this.startPoint - this.endPoint;
		},
		calculateY : function(value){
			var scalingFactor = this.drawingArea() / (this.min - this.max);
			return this.endPoint - (scalingFactor * (value - this.min));
		},
		calculateX : function(index){
			var isRotated = (this.xLabelRotation > 0),
				// innerWidth = (this.offsetGridLines) ? this.width - offsetLeft - this.padding : this.width - (offsetLeft + halfLabelWidth * 2) - this.padding,
				innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight),
				valueWidth = innerWidth/Math.max((this.valuesCount - ((this.offsetGridLines) ? 0 : 1)), 1),
				valueOffset = (valueWidth * index) + this.xScalePaddingLeft;

			if (this.offsetGridLines){
				valueOffset += (valueWidth/2);
			}

			return Math.round(valueOffset);
		},
		update : function(newProps){
			helpers.extend(this, newProps);
			this.fit();
		},
		draw : function(){
			var ctx = this.ctx,
				yLabelGap = (this.endPoint - this.startPoint) / this.steps,
				xStart = Math.round(this.xScalePaddingLeft);
			if (this.display){
				ctx.fillStyle = this.textColor;
				ctx.font = this.font;
				each(this.yLabels,function(labelString,index){
					var yLabelCenter = this.endPoint - (yLabelGap * index),
						linePositionY = Math.round(yLabelCenter),
						drawHorizontalLine = this.showHorizontalLines;

					ctx.textAlign = "right";
					ctx.textBaseline = "middle";
					if (this.showLabels){
						ctx.fillText(labelString,xStart - 10,yLabelCenter);
					}

					// This is X axis, so draw it
					if (index === 0 && !drawHorizontalLine){
						drawHorizontalLine = true;
					}

					if (drawHorizontalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor;
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor;
					}

					linePositionY += helpers.aliasPixel(ctx.lineWidth);

					if(drawHorizontalLine){
						ctx.moveTo(xStart, linePositionY);
						ctx.lineTo(this.width, linePositionY);
						ctx.stroke();
						ctx.closePath();
					}

					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;
					ctx.beginPath();
					ctx.moveTo(xStart - 5, linePositionY);
					ctx.lineTo(xStart, linePositionY);
					ctx.stroke();
					ctx.closePath();

				},this);

				each(this.xLabels,function(label,index){
					var xPos = this.calculateX(index) + aliasPixel(this.lineWidth),
						// Check to see if line/bar here and decide where to place the line
						linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + aliasPixel(this.lineWidth),
						isRotated = (this.xLabelRotation > 0),
						drawVerticalLine = this.showVerticalLines;

					// This is Y axis, so draw it
					if (index === 0 && !drawVerticalLine){
						drawVerticalLine = true;
					}

					if (drawVerticalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor;
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor;
					}

					if (drawVerticalLine){
						ctx.moveTo(linePos,this.endPoint);
						ctx.lineTo(linePos,this.startPoint - 3);
						ctx.stroke();
						ctx.closePath();
					}


					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;


					// Small lines at the bottom of the base grid line
					ctx.beginPath();
					ctx.moveTo(linePos,this.endPoint);
					ctx.lineTo(linePos,this.endPoint + 5);
					ctx.stroke();
					ctx.closePath();

					ctx.save();
					ctx.translate(xPos,(isRotated) ? this.endPoint + 12 : this.endPoint + 8);
					ctx.rotate(toRadians(this.xLabelRotation)*-1);
					ctx.font = this.font;
					ctx.textAlign = (isRotated) ? "right" : "center";
					ctx.textBaseline = (isRotated) ? "middle" : "top";
					ctx.fillText(label, 0, 0);
					ctx.restore();
				},this);

			}
		}

	});

	Chart.RadialScale = Chart.Element.extend({
		initialize: function(){
			this.size = min([this.height, this.width]);
			this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
		},
		calculateCenterOffset: function(value){
			// Take into account half font size + the yPadding of the top value
			var scalingFactor = this.drawingArea / (this.max - this.min);

			return (value - this.min) * scalingFactor;
		},
		update : function(){
			if (!this.lineArc){
				this.setScaleSize();
			} else {
				this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
			}
			this.buildYLabels();
		},
		buildYLabels: function(){
			this.yLabels = [];

			var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

			for (var i=0; i<=this.steps; i++){
				this.yLabels.push(template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
			}
		},
		getCircumference : function(){
			return ((Math.PI*2) / this.valuesCount);
		},
		setScaleSize: function(){
			/*
			 * Right, this is really confusing and there is a lot of maths going on here
			 * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
			 *
			 * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
			 *
			 * Solution:
			 *
			 * We assume the radius of the polygon is half the size of the canvas at first
			 * at each index we check if the text overlaps.
			 *
			 * Where it does, we store that angle and that index.
			 *
			 * After finding the largest index and angle we calculate how much we need to remove
			 * from the shape radius to move the point inwards by that x.
			 *
			 * We average the left and right distances to get the maximum shape radius that can fit in the box
			 * along with labels.
			 *
			 * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
			 * on each side, removing that from the size, halving it and adding the left x protrusion width.
			 *
			 * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
			 * and position it in the most space efficient manner
			 *
			 * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
			 */


			// Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
			// Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
			var largestPossibleRadius = min([(this.height/2 - this.pointLabelFontSize - 5), this.width/2]),
				pointPosition,
				i,
				textWidth,
				halfTextWidth,
				furthestRight = this.width,
				furthestRightIndex,
				furthestRightAngle,
				furthestLeft = 0,
				furthestLeftIndex,
				furthestLeftAngle,
				xProtrusionLeft,
				xProtrusionRight,
				radiusReductionRight,
				radiusReductionLeft,
				maxWidthRadius;
			this.ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
			for (i=0;i<this.valuesCount;i++){
				// 5px to space the text slightly out - similar to what we do in the draw function.
				pointPosition = this.getPointPosition(i, largestPossibleRadius);
				textWidth = this.ctx.measureText(template(this.templateString, { value: this.labels[i] })).width + 5;
				if (i === 0 || i === this.valuesCount/2){
					// If we're at index zero, or exactly the middle, we're at exactly the top/bottom
					// of the radar chart, so text will be aligned centrally, so we'll half it and compare
					// w/left and right text sizes
					halfTextWidth = textWidth/2;
					if (pointPosition.x + halfTextWidth > furthestRight) {
						furthestRight = pointPosition.x + halfTextWidth;
						furthestRightIndex = i;
					}
					if (pointPosition.x - halfTextWidth < furthestLeft) {
						furthestLeft = pointPosition.x - halfTextWidth;
						furthestLeftIndex = i;
					}
				}
				else if (i < this.valuesCount/2) {
					// Less than half the values means we'll left align the text
					if (pointPosition.x + textWidth > furthestRight) {
						furthestRight = pointPosition.x + textWidth;
						furthestRightIndex = i;
					}
				}
				else if (i > this.valuesCount/2){
					// More than half the values means we'll right align the text
					if (pointPosition.x - textWidth < furthestLeft) {
						furthestLeft = pointPosition.x - textWidth;
						furthestLeftIndex = i;
					}
				}
			}

			xProtrusionLeft = furthestLeft;

			xProtrusionRight = Math.ceil(furthestRight - this.width);

			furthestRightAngle = this.getIndexAngle(furthestRightIndex);

			furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);

			radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI/2);

			radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI/2);

			// Ensure we actually need to reduce the size of the chart
			radiusReductionRight = (isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
			radiusReductionLeft = (isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

			this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight)/2;

			//this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
			this.setCenterPoint(radiusReductionLeft, radiusReductionRight);

		},
		setCenterPoint: function(leftMovement, rightMovement){

			var maxRight = this.width - rightMovement - this.drawingArea,
				maxLeft = leftMovement + this.drawingArea;

			this.xCenter = (maxLeft + maxRight)/2;
			// Always vertically in the centre as the text height doesn't change
			this.yCenter = (this.height/2);
		},

		getIndexAngle : function(index){
			var angleMultiplier = (Math.PI * 2) / this.valuesCount;
			// Start from the top instead of right, so remove a quarter of the circle

			return index * angleMultiplier - (Math.PI/2);
		},
		getPointPosition : function(index, distanceFromCenter){
			var thisAngle = this.getIndexAngle(index);
			return {
				x : (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
				y : (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
			};
		},
		draw: function(){
			if (this.display){
				var ctx = this.ctx;
				each(this.yLabels, function(label, index){
					// Don't draw a centre value
					if (index > 0){
						var yCenterOffset = index * (this.drawingArea/this.steps),
							yHeight = this.yCenter - yCenterOffset,
							pointPosition;

						// Draw circular lines around the scale
						if (this.lineWidth > 0){
							ctx.strokeStyle = this.lineColor;
							ctx.lineWidth = this.lineWidth;

							if(this.lineArc){
								ctx.beginPath();
								ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI*2);
								ctx.closePath();
								ctx.stroke();
							} else{
								ctx.beginPath();
								for (var i=0;i<this.valuesCount;i++)
								{
									pointPosition = this.getPointPosition(i, this.calculateCenterOffset(this.min + (index * this.stepValue)));
									if (i === 0){
										ctx.moveTo(pointPosition.x, pointPosition.y);
									} else {
										ctx.lineTo(pointPosition.x, pointPosition.y);
									}
								}
								ctx.closePath();
								ctx.stroke();
							}
						}
						if(this.showLabels){
							ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);
							if (this.showLabelBackdrop){
								var labelWidth = ctx.measureText(label).width;
								ctx.fillStyle = this.backdropColor;
								ctx.fillRect(
									this.xCenter - labelWidth/2 - this.backdropPaddingX,
									yHeight - this.fontSize/2 - this.backdropPaddingY,
									labelWidth + this.backdropPaddingX*2,
									this.fontSize + this.backdropPaddingY*2
								);
							}
							ctx.textAlign = 'center';
							ctx.textBaseline = "middle";
							ctx.fillStyle = this.fontColor;
							ctx.fillText(label, this.xCenter, yHeight);
						}
					}
				}, this);

				if (!this.lineArc){
					ctx.lineWidth = this.angleLineWidth;
					ctx.strokeStyle = this.angleLineColor;
					for (var i = this.valuesCount - 1; i >= 0; i--) {
						if (this.angleLineWidth > 0){
							var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
							ctx.beginPath();
							ctx.moveTo(this.xCenter, this.yCenter);
							ctx.lineTo(outerPosition.x, outerPosition.y);
							ctx.stroke();
							ctx.closePath();
						}
						// Extra 3px out for some label spacing
						var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
						ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
						ctx.fillStyle = this.pointLabelFontColor;

						var labelsCount = this.labels.length,
							halfLabelsCount = this.labels.length/2,
							quarterLabelsCount = halfLabelsCount/2,
							upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount),
							exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
						if (i === 0){
							ctx.textAlign = 'center';
						} else if(i === halfLabelsCount){
							ctx.textAlign = 'center';
						} else if (i < halfLabelsCount){
							ctx.textAlign = 'left';
						} else {
							ctx.textAlign = 'right';
						}

						// Set the correct text baseline based on outer positioning
						if (exactQuarter){
							ctx.textBaseline = 'middle';
						} else if (upperHalf){
							ctx.textBaseline = 'bottom';
						} else {
							ctx.textBaseline = 'top';
						}

						ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
					}
				}
			}
		}
	});

	// Attach global event to resize each chart instance when the browser resizes
	helpers.addEvent(window, "resize", (function(){
		// Basic debounce of resize function so it doesn't hurt performance when resizing browser.
		var timeout;
		return function(){
			clearTimeout(timeout);
			timeout = setTimeout(function(){
				each(Chart.instances,function(instance){
					// If the responsive flag is set in the chart instance config
					// Cascade the resize event down to the chart.
					if (instance.options.responsive){
						instance.resize(instance.render, true);
					}
				});
			}, 50);
		};
	})());


	if (amd) {
		define(function(){
			return Chart;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = Chart;
	}

	root.Chart = Chart;

	Chart.noConflict = function(){
		root.Chart = previous;
		return Chart;
	};

}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;


	var defaultConfig = {
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero : true,

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - If there is a stroke on each bar
		barShowStroke : true,

		//Number - Pixel width of the bar stroke
		barStrokeWidth : 2,

		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,

		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "Bar",
		defaults : defaultConfig,
		initialize:  function(data){

			//Expose options as a scope variable here so we can access it in the ScaleClass
			var options = this.options;

			this.ScaleClass = Chart.Scale.extend({
				offsetGridLines : true,
				calculateBarX : function(datasetCount, datasetIndex, barIndex){
					//Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
					var xWidth = this.calculateBaseWidth(),
						xAbsolute = this.calculateX(barIndex) - (xWidth/2),
						barWidth = this.calculateBarWidth(datasetCount);

					return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * options.barDatasetSpacing) + barWidth/2;
				},
				calculateBaseWidth : function(){
					return (this.calculateX(1) - this.calculateX(0)) - (2*options.barValueSpacing);
				},
				calculateBarWidth : function(datasetCount){
					//The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
					var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * options.barDatasetSpacing);

					return (baseWidth / datasetCount);
				}
			});

			this.datasets = [];

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeBars = (evt.type !== 'mouseout') ? this.getBarsAtEvent(evt) : [];

					this.eachBars(function(bar){
						bar.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activeBars, function(activeBar){
						activeBar.fillColor = activeBar.highlightFill;
						activeBar.strokeColor = activeBar.highlightStroke;
					});
					this.showTooltip(activeBars);
				});
			}

			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.BarClass = Chart.Rectangle.extend({
				strokeWidth : this.options.barStrokeWidth,
				showStroke : this.options.barShowStroke,
				ctx : this.chart.ctx
			});

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset,datasetIndex){

				var datasetObject = {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					bars : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.bars.push(new this.BarClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.strokeColor,
						fillColor : dataset.fillColor,
						highlightFill : dataset.highlightFill || dataset.fillColor,
						highlightStroke : dataset.highlightStroke || dataset.strokeColor
					}));
				},this);

			},this);

			this.buildScale(data.labels);

			this.BarClass.prototype.base = this.scale.endPoint;

			this.eachBars(function(bar, index, datasetIndex){
				helpers.extend(bar, {
					width : this.scale.calculateBarWidth(this.datasets.length),
					x: this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
					y: this.scale.endPoint
				});
				bar.save();
			}, this);

			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});

			this.eachBars(function(bar){
				bar.save();
			});
			this.render();
		},
		eachBars : function(callback){
			helpers.each(this.datasets,function(dataset, datasetIndex){
				helpers.each(dataset.bars, callback, this, datasetIndex);
			},this);
		},
		getBarsAtEvent : function(e){
			var barsArray = [],
				eventPosition = helpers.getRelativePosition(e),
				datasetIterator = function(dataset){
					barsArray.push(dataset.bars[barIndex]);
				},
				barIndex;

			for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
				for (barIndex = 0; barIndex < this.datasets[datasetIndex].bars.length; barIndex++) {
					if (this.datasets[datasetIndex].bars[barIndex].inRange(eventPosition.x,eventPosition.y)){
						helpers.each(this.datasets, datasetIterator);
						return barsArray;
					}
				}
			}

			return barsArray;
		},
		buildScale : function(labels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachBars(function(bar){
					values.push(bar.value);
				});
				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange: function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding : (this.options.showScale) ? 0 : (this.options.barShowStroke) ? this.options.barStrokeWidth : 0,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale
			};

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}

			this.scale = new this.ScaleClass(scaleOptions);
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			helpers.each(valuesArray,function(value,datasetIndex){
				//Add a new point for each piece of data, passing any required data to draw.
				this.datasets[datasetIndex].bars.push(new this.BarClass({
					value : value,
					label : label,
					x: this.scale.calculateBarX(this.datasets.length, datasetIndex, this.scale.valuesCount+1),
					y: this.scale.endPoint,
					width : this.scale.calculateBarWidth(this.datasets.length),
					base : this.scale.endPoint,
					strokeColor : this.datasets[datasetIndex].strokeColor,
					fillColor : this.datasets[datasetIndex].fillColor
				}));
			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.datasets,function(dataset){
				dataset.bars.shift();
			},this);
			this.update();
		},
		reflow : function(){
			helpers.extend(this.BarClass.prototype,{
				y: this.scale.endPoint,
				base : this.scale.endPoint
			});
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			this.scale.draw(easingDecimal);

			//Draw all the bars for each dataset
			helpers.each(this.datasets,function(dataset,datasetIndex){
				helpers.each(dataset.bars,function(bar,index){
					if (bar.hasValue()){
						bar.base = this.scale.endPoint;
						//Transition then draw
						bar.transition({
							x : this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
							y : this.scale.calculateY(bar.value),
							width : this.scale.calculateBarWidth(this.datasets.length)
						}, easingDecimal).draw();
					}
				},this);

			},this);
		}
	});


}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	var defaultConfig = {
		//Boolean - Whether we should show a stroke on each segment
		segmentShowStroke : true,

		//String - The colour of each segment stroke
		segmentStrokeColor : "#fff",

		//Number - The width of each segment stroke
		segmentStrokeWidth : 2,

		//The percentage of the chart that we cut out of the middle.
		percentageInnerCutout : 50,

		//Number - Amount of animation steps
		animationSteps : 100,

		//String - Animation easing effect
		animationEasing : "easeOutBounce",

		//Boolean - Whether we animate the rotation of the Doughnut
		animateRotate : true,

		//Boolean - Whether we animate scaling the Doughnut from the centre
		animateScale : false,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		//Passing in a name registers this chart in the Chart namespace
		name: "Doughnut",
		//Providing a defaults will also register the deafults in the chart namespace
		defaults : defaultConfig,
		//Initialize is fired when the chart is initialized - Data is passed in as a parameter
		//Config is automatically merged by the core of Chart.js, and is available at this.options
		initialize:  function(data){

			//Declare segments as a static property to prevent inheriting across the Chart type prototype
			this.segments = [];
			this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) -	this.options.segmentStrokeWidth/2)/2;

			this.SegmentArc = Chart.Arc.extend({
				ctx : this.chart.ctx,
				x : this.chart.width/2,
				y : this.chart.height/2
			});

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];

					helpers.each(this.segments,function(segment){
						segment.restore(["fillColor"]);
					});
					helpers.each(activeSegments,function(activeSegment){
						activeSegment.fillColor = activeSegment.highlightColor;
					});
					this.showTooltip(activeSegments);
				});
			}
			this.calculateTotal(data);

			helpers.each(data,function(datapoint, index){
				this.addData(datapoint, index, true);
			},this);

			this.render();
		},
		getSegmentsAtEvent : function(e){
			var segmentsArray = [];

			var location = helpers.getRelativePosition(e);

			helpers.each(this.segments,function(segment){
				if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
			},this);
			return segmentsArray;
		},
		addData : function(segment, atIndex, silent){
			var index = atIndex || this.segments.length;
			this.segments.splice(index, 0, new this.SegmentArc({
				value : segment.value,
				outerRadius : (this.options.animateScale) ? 0 : this.outerRadius,
				innerRadius : (this.options.animateScale) ? 0 : (this.outerRadius/100) * this.options.percentageInnerCutout,
				fillColor : segment.color,
				highlightColor : segment.highlight || segment.color,
				showStroke : this.options.segmentShowStroke,
				strokeWidth : this.options.segmentStrokeWidth,
				strokeColor : this.options.segmentStrokeColor,
				startAngle : Math.PI * 1.5,
				circumference : (this.options.animateRotate) ? 0 : this.calculateCircumference(segment.value),
				label : segment.label
			}));
			if (!silent){
				this.reflow();
				this.update();
			}
		},
		calculateCircumference : function(value){
			return (Math.PI*2)*(Math.abs(value) / this.total);
		},
		calculateTotal : function(data){
			this.total = 0;
			helpers.each(data,function(segment){
				this.total += Math.abs(segment.value);
			},this);
		},
		update : function(){
			this.calculateTotal(this.segments);

			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor']);
			});

			helpers.each(this.segments,function(segment){
				segment.save();
			});
			this.render();
		},

		removeData: function(atIndex){
			var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
			this.segments.splice(indexToDelete, 1);
			this.reflow();
			this.update();
		},

		reflow : function(){
			helpers.extend(this.SegmentArc.prototype,{
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) -	this.options.segmentStrokeWidth/2)/2;
			helpers.each(this.segments, function(segment){
				segment.update({
					outerRadius : this.outerRadius,
					innerRadius : (this.outerRadius/100) * this.options.percentageInnerCutout
				});
			}, this);
		},
		draw : function(easeDecimal){
			var animDecimal = (easeDecimal) ? easeDecimal : 1;
			this.clear();
			helpers.each(this.segments,function(segment,index){
				segment.transition({
					circumference : this.calculateCircumference(segment.value),
					outerRadius : this.outerRadius,
					innerRadius : (this.outerRadius/100) * this.options.percentageInnerCutout
				},animDecimal);

				segment.endAngle = segment.startAngle + segment.circumference;

				segment.draw();
				if (index === 0){
					segment.startAngle = Math.PI * 1.5;
				}
				//Check to see if it's the last segment, if not get the next and update the start angle
				if (index < this.segments.length-1){
					this.segments[index+1].startAngle = segment.endAngle;
				}
			},this);

		}
	});

	Chart.types.Doughnut.extend({
		name : "Pie",
		defaults : helpers.merge(defaultConfig,{percentageInnerCutout : 0})
	});

}).call(this);
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {

		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - Whether the line is curved between points
		bezierCurve : true,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 2,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "Line",
		defaults : defaultConfig,
		initialize:  function(data){
			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,
				radius : this.options.pointDotRadius,
				display: this.options.pointDot,
				hitDetectionRadius : this.options.pointHitDetectionRadius,
				ctx : this.chart.ctx,
				inRange : function(mouseX){
					return (Math.pow(mouseX-this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius,2));
				}
			});

			this.datasets = [];

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePoints, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});
					this.showTooltip(activePoints);
				});
			}

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){

				var datasetObject = {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);


				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.points.push(new this.PointClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);

				this.buildScale(data.labels);


				this.eachPoints(function(point, index){
					helpers.extend(point, {
						x: this.scale.calculateX(index),
						y: this.scale.endPoint
					});
					point.save();
				}, this);

			},this);


			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});
			this.eachPoints(function(point){
				point.save();
			});
			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},
		getPointsAtEvent : function(e){
			var pointsArray = [],
				eventPosition = helpers.getRelativePosition(e);
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,function(point){
					if (point.inRange(eventPosition.x,eventPosition.y)) pointsArray.push(point);
				});
			},this);
			return pointsArray;
		},
		buildScale : function(labels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachPoints(function(point){
					values.push(point.value);
				});

				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange : function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale
			};

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}


			this.scale = new Chart.Scale(scaleOptions);
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets

			helpers.each(valuesArray,function(value,datasetIndex){
				//Add a new point for each piece of data, passing any required data to draw.
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					x: this.scale.calculateX(this.scale.valuesCount+1),
					y: this.scale.endPoint,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));
			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.update();
		},
		reflow : function(){
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			// Some helper methods for getting the next/prev points
			var hasValue = function(item){
				return item.value !== null;
			},
			nextPoint = function(point, collection, index){
				return helpers.findNextWhere(collection, hasValue, index) || point;
			},
			previousPoint = function(point, collection, index){
				return helpers.findPreviousWhere(collection, hasValue, index) || point;
			};

			this.scale.draw(easingDecimal);


			helpers.each(this.datasets,function(dataset){
				var pointsWithValues = helpers.where(dataset.points, hasValue);

				//Transition each point first so that the line and point drawing isn't out of sync
				//We can use this extra loop to calculate the control points of this dataset also in this loop

				helpers.each(dataset.points, function(point, index){
					if (point.hasValue()){
						point.transition({
							y : this.scale.calculateY(point.value),
							x : this.scale.calculateX(index)
						}, easingDecimal);
					}
				},this);


				// Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
				// This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
				if (this.options.bezierCurve){
					helpers.each(pointsWithValues, function(point, index){
						var tension = (index > 0 && index < pointsWithValues.length - 1) ? this.options.bezierCurveTension : 0;
						point.controlPoints = helpers.splineCurve(
							previousPoint(point, pointsWithValues, index),
							point,
							nextPoint(point, pointsWithValues, index),
							tension
						);

						// Prevent the bezier going outside of the bounds of the graph

						// Cap puter bezier handles to the upper/lower scale bounds
						if (point.controlPoints.outer.y > this.scale.endPoint){
							point.controlPoints.outer.y = this.scale.endPoint;
						}
						else if (point.controlPoints.outer.y < this.scale.startPoint){
							point.controlPoints.outer.y = this.scale.startPoint;
						}

						// Cap inner bezier handles to the upper/lower scale bounds
						if (point.controlPoints.inner.y > this.scale.endPoint){
							point.controlPoints.inner.y = this.scale.endPoint;
						}
						else if (point.controlPoints.inner.y < this.scale.startPoint){
							point.controlPoints.inner.y = this.scale.startPoint;
						}
					},this);
				}


				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();

				helpers.each(pointsWithValues, function(point, index){
					if (index === 0){
						ctx.moveTo(point.x, point.y);
					}
					else{
						if(this.options.bezierCurve){
							var previous = previousPoint(point, pointsWithValues, index);

							ctx.bezierCurveTo(
								previous.controlPoints.outer.x,
								previous.controlPoints.outer.y,
								point.controlPoints.inner.x,
								point.controlPoints.inner.y,
								point.x,
								point.y
							);
						}
						else{
							ctx.lineTo(point.x,point.y);
						}
					}
				}, this);

				ctx.stroke();

				if (this.options.datasetFill && pointsWithValues.length > 0){
					//Round off the line by going to the base of the chart, back to the start, then fill.
					ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
					ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
					ctx.fillStyle = dataset.fillColor;
					ctx.closePath();
					ctx.fill();
				}

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(pointsWithValues,function(point){
					point.draw();
				});
			},this);
		}
	});


}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	var defaultConfig = {
		//Boolean - Show a backdrop to the scale label
		scaleShowLabelBackdrop : true,

		//String - The colour of the label backdrop
		scaleBackdropColor : "rgba(255,255,255,0.75)",

		// Boolean - Whether the scale should begin at zero
		scaleBeginAtZero : true,

		//Number - The backdrop padding above & below the label in pixels
		scaleBackdropPaddingY : 2,

		//Number - The backdrop padding to the side of the label in pixels
		scaleBackdropPaddingX : 2,

		//Boolean - Show line for each value in the scale
		scaleShowLine : true,

		//Boolean - Stroke a line around each segment in the chart
		segmentShowStroke : true,

		//String - The colour of the stroke on each segement.
		segmentStrokeColor : "#fff",

		//Number - The width of the stroke value in pixels
		segmentStrokeWidth : 2,

		//Number - Amount of animation steps
		animationSteps : 100,

		//String - Animation easing effect.
		animationEasing : "easeOutBounce",

		//Boolean - Whether to animate the rotation of the chart
		animateRotate : true,

		//Boolean - Whether to animate scaling the chart from the centre
		animateScale : false,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
	};


	Chart.Type.extend({
		//Passing in a name registers this chart in the Chart namespace
		name: "PolarArea",
		//Providing a defaults will also register the deafults in the chart namespace
		defaults : defaultConfig,
		//Initialize is fired when the chart is initialized - Data is passed in as a parameter
		//Config is automatically merged by the core of Chart.js, and is available at this.options
		initialize:  function(data){
			this.segments = [];
			//Declare segment class as a chart instance specific class, so it can share props for this instance
			this.SegmentArc = Chart.Arc.extend({
				showStroke : this.options.segmentShowStroke,
				strokeWidth : this.options.segmentStrokeWidth,
				strokeColor : this.options.segmentStrokeColor,
				ctx : this.chart.ctx,
				innerRadius : 0,
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.scale = new Chart.RadialScale({
				display: this.options.showScale,
				fontStyle: this.options.scaleFontStyle,
				fontSize: this.options.scaleFontSize,
				fontFamily: this.options.scaleFontFamily,
				fontColor: this.options.scaleFontColor,
				showLabels: this.options.scaleShowLabels,
				showLabelBackdrop: this.options.scaleShowLabelBackdrop,
				backdropColor: this.options.scaleBackdropColor,
				backdropPaddingY : this.options.scaleBackdropPaddingY,
				backdropPaddingX: this.options.scaleBackdropPaddingX,
				lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
				lineColor: this.options.scaleLineColor,
				lineArc: true,
				width: this.chart.width,
				height: this.chart.height,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				templateString: this.options.scaleLabel,
				valuesCount: data.length
			});

			this.updateScaleRange(data);

			this.scale.update();

			helpers.each(data,function(segment,index){
				this.addData(segment,index,true);
			},this);

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];
					helpers.each(this.segments,function(segment){
						segment.restore(["fillColor"]);
					});
					helpers.each(activeSegments,function(activeSegment){
						activeSegment.fillColor = activeSegment.highlightColor;
					});
					this.showTooltip(activeSegments);
				});
			}

			this.render();
		},
		getSegmentsAtEvent : function(e){
			var segmentsArray = [];

			var location = helpers.getRelativePosition(e);

			helpers.each(this.segments,function(segment){
				if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
			},this);
			return segmentsArray;
		},
		addData : function(segment, atIndex, silent){
			var index = atIndex || this.segments.length;

			this.segments.splice(index, 0, new this.SegmentArc({
				fillColor: segment.color,
				highlightColor: segment.highlight || segment.color,
				label: segment.label,
				value: segment.value,
				outerRadius: (this.options.animateScale) ? 0 : this.scale.calculateCenterOffset(segment.value),
				circumference: (this.options.animateRotate) ? 0 : this.scale.getCircumference(),
				startAngle: Math.PI * 1.5
			}));
			if (!silent){
				this.reflow();
				this.update();
			}
		},
		removeData: function(atIndex){
			var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
			this.segments.splice(indexToDelete, 1);
			this.reflow();
			this.update();
		},
		calculateTotal: function(data){
			this.total = 0;
			helpers.each(data,function(segment){
				this.total += segment.value;
			},this);
			this.scale.valuesCount = this.segments.length;
		},
		updateScaleRange: function(datapoints){
			var valuesArray = [];
			helpers.each(datapoints,function(segment){
				valuesArray.push(segment.value);
			});

			var scaleSizes = (this.options.scaleOverride) ?
				{
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				} :
				helpers.calculateScaleRange(
					valuesArray,
					helpers.min([this.chart.width, this.chart.height])/2,
					this.options.scaleFontSize,
					this.options.scaleBeginAtZero,
					this.options.scaleIntegersOnly
				);

			helpers.extend(
				this.scale,
				scaleSizes,
				{
					size: helpers.min([this.chart.width, this.chart.height]),
					xCenter: this.chart.width/2,
					yCenter: this.chart.height/2
				}
			);

		},
		update : function(){
			this.calculateTotal(this.segments);

			helpers.each(this.segments,function(segment){
				segment.save();
			});
			
			this.reflow();
			this.render();
		},
		reflow : function(){
			helpers.extend(this.SegmentArc.prototype,{
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.updateScaleRange(this.segments);
			this.scale.update();

			helpers.extend(this.scale,{
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});

			helpers.each(this.segments, function(segment){
				segment.update({
					outerRadius : this.scale.calculateCenterOffset(segment.value)
				});
			}, this);

		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			//Clear & draw the canvas
			this.clear();
			helpers.each(this.segments,function(segment, index){
				segment.transition({
					circumference : this.scale.getCircumference(),
					outerRadius : this.scale.calculateCenterOffset(segment.value)
				},easingDecimal);

				segment.endAngle = segment.startAngle + segment.circumference;

				// If we've removed the first segment we need to set the first one to
				// start at the top.
				if (index === 0){
					segment.startAngle = Math.PI * 1.5;
				}

				//Check to see if it's the last segment, if not get the next and update the start angle
				if (index < this.segments.length - 1){
					this.segments[index+1].startAngle = segment.endAngle;
				}
				segment.draw();
			}, this);
			this.scale.draw();
		}
	});

}).call(this);
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;



	Chart.Type.extend({
		name: "Radar",
		defaults:{
			//Boolean - Whether to show lines for each scale point
			scaleShowLine : true,

			//Boolean - Whether we show the angle lines out of the radar
			angleShowLineOut : true,

			//Boolean - Whether to show labels on the scale
			scaleShowLabels : false,

			// Boolean - Whether the scale should begin at zero
			scaleBeginAtZero : true,

			//String - Colour of the angle line
			angleLineColor : "rgba(0,0,0,.1)",

			//Number - Pixel width of the angle line
			angleLineWidth : 1,

			//String - Point label font declaration
			pointLabelFontFamily : "'Arial'",

			//String - Point label font weight
			pointLabelFontStyle : "normal",

			//Number - Point label font size in pixels
			pointLabelFontSize : 10,

			//String - Point label font colour
			pointLabelFontColor : "#666",

			//Boolean - Whether to show a dot for each point
			pointDot : true,

			//Number - Radius of each point dot in pixels
			pointDotRadius : 3,

			//Number - Pixel width of point dot stroke
			pointDotStrokeWidth : 1,

			//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
			pointHitDetectionRadius : 20,

			//Boolean - Whether to show a stroke for datasets
			datasetStroke : true,

			//Number - Pixel width of dataset stroke
			datasetStrokeWidth : 2,

			//Boolean - Whether to fill the dataset with a colour
			datasetFill : true,

			//String - A legend template
			legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		},

		initialize: function(data){
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,
				radius : this.options.pointDotRadius,
				display: this.options.pointDot,
				hitDetectionRadius : this.options.pointHitDetectionRadius,
				ctx : this.chart.ctx
			});

			this.datasets = [];

			this.buildScale(data);

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activePointsCollection = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];

					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePointsCollection, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});

					this.showTooltip(activePointsCollection);
				});
			}

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){

				var datasetObject = {
					label: dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					var pointPosition;
					if (!this.scale.animation){
						pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(dataPoint));
					}
					datasetObject.points.push(new this.PointClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						x: (this.options.animation) ? this.scale.xCenter : pointPosition.x,
						y: (this.options.animation) ? this.scale.yCenter : pointPosition.y,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);

			},this);

			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},

		getPointsAtEvent : function(evt){
			var mousePosition = helpers.getRelativePosition(evt),
				fromCenter = helpers.getAngleFromPoint({
					x: this.scale.xCenter,
					y: this.scale.yCenter
				}, mousePosition);

			var anglePerIndex = (Math.PI * 2) /this.scale.valuesCount,
				pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex),
				activePointsCollection = [];

			// If we're at the top, make the pointIndex 0 to get the first of the array.
			if (pointIndex >= this.scale.valuesCount || pointIndex < 0){
				pointIndex = 0;
			}

			if (fromCenter.distance <= this.scale.drawingArea){
				helpers.each(this.datasets, function(dataset){
					activePointsCollection.push(dataset.points[pointIndex]);
				});
			}

			return activePointsCollection;
		},

		buildScale : function(data){
			this.scale = new Chart.RadialScale({
				display: this.options.showScale,
				fontStyle: this.options.scaleFontStyle,
				fontSize: this.options.scaleFontSize,
				fontFamily: this.options.scaleFontFamily,
				fontColor: this.options.scaleFontColor,
				showLabels: this.options.scaleShowLabels,
				showLabelBackdrop: this.options.scaleShowLabelBackdrop,
				backdropColor: this.options.scaleBackdropColor,
				backdropPaddingY : this.options.scaleBackdropPaddingY,
				backdropPaddingX: this.options.scaleBackdropPaddingX,
				lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
				lineColor: this.options.scaleLineColor,
				angleLineColor : this.options.angleLineColor,
				angleLineWidth : (this.options.angleShowLineOut) ? this.options.angleLineWidth : 0,
				// Point labels at the edge of each line
				pointLabelFontColor : this.options.pointLabelFontColor,
				pointLabelFontSize : this.options.pointLabelFontSize,
				pointLabelFontFamily : this.options.pointLabelFontFamily,
				pointLabelFontStyle : this.options.pointLabelFontStyle,
				height : this.chart.height,
				width: this.chart.width,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				templateString: this.options.scaleLabel,
				labels: data.labels,
				valuesCount: data.datasets[0].data.length
			});

			this.scale.setScaleSize();
			this.updateScaleRange(data.datasets);
			this.scale.buildYLabels();
		},
		updateScaleRange: function(datasets){
			var valuesArray = (function(){
				var totalDataArray = [];
				helpers.each(datasets,function(dataset){
					if (dataset.data){
						totalDataArray = totalDataArray.concat(dataset.data);
					}
					else {
						helpers.each(dataset.points, function(point){
							totalDataArray.push(point.value);
						});
					}
				});
				return totalDataArray;
			})();


			var scaleSizes = (this.options.scaleOverride) ?
				{
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				} :
				helpers.calculateScaleRange(
					valuesArray,
					helpers.min([this.chart.width, this.chart.height])/2,
					this.options.scaleFontSize,
					this.options.scaleBeginAtZero,
					this.options.scaleIntegersOnly
				);

			helpers.extend(
				this.scale,
				scaleSizes
			);

		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			this.scale.valuesCount++;
			helpers.each(valuesArray,function(value,datasetIndex){
				var pointPosition = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(value));
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					x: pointPosition.x,
					y: pointPosition.y,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));
			},this);

			this.scale.labels.push(label);

			this.reflow();

			this.update();
		},
		removeData : function(){
			this.scale.valuesCount--;
			this.scale.labels.shift();
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.reflow();
			this.update();
		},
		update : function(){
			this.eachPoints(function(point){
				point.save();
			});
			this.reflow();
			this.render();
		},
		reflow: function(){
			helpers.extend(this.scale, {
				width : this.chart.width,
				height: this.chart.height,
				size : helpers.min([this.chart.width, this.chart.height]),
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});
			this.updateScaleRange(this.datasets);
			this.scale.setScaleSize();
			this.scale.buildYLabels();
		},
		draw : function(ease){
			var easeDecimal = ease || 1,
				ctx = this.chart.ctx;
			this.clear();
			this.scale.draw();

			helpers.each(this.datasets,function(dataset){

				//Transition each point first so that the line and point drawing isn't out of sync
				helpers.each(dataset.points,function(point,index){
					if (point.hasValue()){
						point.transition(this.scale.getPointPosition(index, this.scale.calculateCenterOffset(point.value)), easeDecimal);
					}
				},this);



				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();
				helpers.each(dataset.points,function(point,index){
					if (index === 0){
						ctx.moveTo(point.x,point.y);
					}
					else{
						ctx.lineTo(point.x,point.y);
					}
				},this);
				ctx.closePath();
				ctx.stroke();

				ctx.fillStyle = dataset.fillColor;
				ctx.fill();

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(dataset.points,function(point){
					if (point.hasValue()){
						point.draw();
					}
				});

			},this);

		}

	});





}).call(this);
},{}],2:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames() {
	var classes = '';
	var arg;

	for (var i = 0; i < arguments.length; i++) {
		arg = arguments[i];
		if (!arg) {
			continue;
		}

		if ('string' === typeof arg || 'number' === typeof arg) {
			classes += ' ' + arg;
		} else if (Object.prototype.toString.call(arg) === '[object Array]') {
			classes += ' ' + classNames.apply(null, arg);
		} else if ('object' === typeof arg) {
			for (var key in arg) {
				if (!arg.hasOwnProperty(key) || !arg[key]) {
					continue;
				}
				classes += ' ' + key;
			}
		}
	}
	return classes.substr(1);
}

// safely export classNames for node / browserify
if (typeof module !== 'undefined' && module.exports) {
	module.exports = classNames;
}

// safely export classNames for RequireJS
if (typeof define !== 'undefined' && define.amd) {
	define('classnames', [], function() {
		return classNames;
	});
}

},{}],3:[function(require,module,exports){
(function (main) {
	'use strict';

	/**
	 * Parse or format dates
	 * @class fecha
	 */
	var fecha = {},
		token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,
		dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		amPm = ['am', 'pm'],
		twoDigits = /\d\d?/, threeDigits = /\d{3}/, fourDigits = /\d{4}/,
		word = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
		noop = function () {},
		dayNamesShort = [], monthNamesShort = [],
		parseFlags = {
			D: [twoDigits, function (d, v) {
				d.day = v;
			}],
			M: [twoDigits, function (d, v) {
				d.month = v - 1;
			}],
			YY: [twoDigits, function (d, v) {
				var da = new Date(), cent = +('' + da.getFullYear()).substr(0, 2);
				d.year = '' + (v > 68 ? cent - 1 : cent) + v;
			}],
			h: [twoDigits, function (d, v) {
				d.hour = v;
			}],
			m: [twoDigits, function (d, v) {
				d.minute = v;
			}],
			s: [twoDigits, function (d, v) {
				d.second = v;
			}],
			YYYY: [fourDigits, function (d, v) {
				d.year = v;
			}],
			S: [/\d/, function (d, v) {
				d.millisecond = v * 100;
			}],
			SS: [/\d{2}/, function (d, v) {
				d.millisecond = v * 10;
			}],
			SSS: [threeDigits, function (d, v) {
				d.millisecond = v;
			}],
			d: [twoDigits, noop],
			ddd: [word, noop],
			MMM: [word, monthUpdate('monthNamesShort')],
			MMMM: [word, monthUpdate('monthNames')],
			a: [word, function (d, v) {
				if (amPm.indexOf(v.toLowerCase())) {
					d.isPm = true;
				}
			}],
			ZZ: [/[\+\-]\d\d:?\d\d/, function (d, v) {
				var parts = (v + '').match(/([\+\-]|\d\d)/gi), minutes;

				if (parts) {
					minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
					d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
				}

			}]
		};
	parseFlags.dd = parseFlags.d;
	parseFlags.dddd = parseFlags.ddd;
	parseFlags.Do = parseFlags.DD = parseFlags.D;
	parseFlags.mm = parseFlags.m;
	parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
	parseFlags.MM = parseFlags.M;
	parseFlags.ss = parseFlags.s;
	parseFlags.A = parseFlags.a;

	shorten(monthNames, monthNamesShort, 3);
	shorten(dayNames, dayNamesShort, 3);

	function monthUpdate(arrName) {
		return function (d, v) {
			var index = fecha.i18n[arrName].indexOf(v.charAt(0).toUpperCase() + v.substr(1).toLowerCase());
			if (~index) {
				d.month = index;
			}
		}
	}

	function pad(val, len) {
		val = String(val);
		len = len || 2;
		while (val.length < len) {
			val = '0' + val;
		}
		return val;
	}

	function shorten(arr, newArr, sLen) {
		for (var i = 0, len = arr.length; i < len; i++) {
			newArr.push(arr[i].substr(0, sLen));
		}
	}

	function DoFn(D) {
		return D + [ 'th', 'st', 'nd', 'rd' ][ D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10 ];
	}

	fecha.i18n = {
		dayNamesShort: dayNamesShort,
		dayNames: dayNames,
		monthNamesShort: monthNamesShort,
		monthNames: monthNames,
		amPm: amPm,
		DoFn: DoFn
	};

	// Some common format strings
	fecha.masks = {
		'default': 'ddd MMM DD YYYY HH:mm:ss',
		shortDate: 'M/D/YY',
		mediumDate: 'MMM D, YYYY',
		longDate: 'MMMM D, YYYY',
		fullDate: 'dddd, MMMM D, YYYY',
		shortTime: 'HH:mm',
		mediumTime: 'HH:mm:ss',
		longTime: 'HH:mm:ss.SSS'
	};

	/***
	 * Format a date
	 * @method format
	 * @param {Date|string} dateObj
	 * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
	 */
	fecha.format = function (dateObj, mask) {
		// Passing date through Date applies Date.parse, if necessary
		if (typeof dateObj === 'string') {
			dateObj = fecha.parse(dateObj);
		} else if (!dateObj) {
			dateObj = new Date();
		}
		if (isNaN(dateObj)) {
			throw new SyntaxError('invalid date');
		}

		mask = fecha.masks[mask] || mask || fecha.masks['default'];

		var D = dateObj.getDate(), d = dateObj.getDay(), M = dateObj.getMonth(), y = dateObj.getFullYear(), H = dateObj.getHours(), m = dateObj.getMinutes(), s = dateObj.getSeconds(), S = dateObj.getMilliseconds(), o = dateObj.getTimezoneOffset(), flags = {
				D: D,
				DD: pad(D),
				Do: fecha.i18n.DoFn(D),
				d: d,
				dd: pad(d),
				ddd: fecha.i18n.dayNamesShort[d],
				dddd: fecha.i18n.dayNames[d],
				M: M + 1,
				MM: pad(M + 1),
				MMM: fecha.i18n.monthNamesShort[M],
				MMMM: fecha.i18n.monthNames[M],
				YY: String(y).slice(2),
				YYYY: y,
				h: H % 12 || 12,
				hh: pad(H % 12 || 12),
				H: H,
				HH: pad(H),
				m: m,
				mm: pad(m),
				s: s,
				ss: pad(s),
				S: Math.round(S / 100),
				SS: pad(Math.round(S / 10), 2),
				SSS: pad(S, 3),
				a: H < 12 ? fecha.i18n.amPm[0] : fecha.i18n.amPm[1],
				A: H < 12 ? fecha.i18n.amPm[0].toUpperCase() : fecha.i18n.amPm[1].toUpperCase(),
				ZZ: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};

	/**
	 * Parse a date string into an object, changes - into /
	 * @method parse
	 * @param {string} dateStr Date string
	 * @param {string} format Date parse format
	 * @returns {Date}
	 */
	fecha.parse = function (dateStr, format) {
		if (!format) {
			return new Date(dateStr.replace(/\-/g, '/'));
		} else {
			format = fecha.masks[format] || format;

			var isValid = true, dateInfo = {};
			format.replace(token, function ($0) {
				if (parseFlags[$0]) {
					var info = parseFlags[$0];
					var index = dateStr.search(info[0]);
					if (!~index) {
						isValid = false;
					} else {
						dateStr.replace(info[0], function (result) {
							info[1](dateInfo, result);
							dateStr = dateStr.substr(index + result.length);
							return result;
						});
					}
				}

				return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
			});
		}

		if (!isValid) {
			return false;
		}

		var today = new Date(), date;
		if (dateInfo.isPm && dateInfo.hour) {
			dateInfo.hour = +dateInfo.hour + 12
		}

		if (dateInfo.timezoneOffset) {
			dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
			date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
				dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
		} else {
			date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
				dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
		}
		return date;
	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = fecha;
	} else if (typeof require !== 'undefined' && require.amd) {
		define(function () {
			return fecha;
		});
	} else {
		main.fecha = fecha;
	}
})(this);

},{}],4:[function(require,module,exports){
'use strict';

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}],5:[function(require,module,exports){
/*!
 * object.omit <https://github.com/jonschlinkert/object.omit>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');
var forOwn = require('for-own');

module.exports = function omit(obj, keys) {
  if (!isObject(obj)) return {};
  if (!keys) return obj;

  keys = Array.isArray(keys) ? keys : [keys];
  var res = {};

  forOwn(obj, function (value, key) {
    if (keys.indexOf(key) === -1) {
      res[key] = value;
    }
  });
  return res;
};

},{"for-own":6,"isobject":8}],6:[function(require,module,exports){
/*!
 * for-own <https://github.com/jonschlinkert/for-own>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var forIn = require('for-in');
var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function forOwn(o, fn, thisArg) {
  forIn(o, function (val, key) {
    if (hasOwn.call(o, key)) {
      return fn.call(thisArg, o[key], key, o);
    }
  });
};

},{"for-in":7}],7:[function(require,module,exports){
/*!
 * for-in <https://github.com/jonschlinkert/for-in>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function forIn(o, fn, thisArg) {
  for (var key in o) {
    if (fn.call(thisArg, o[key], key, o) === false) {
      break;
    }
  }
};
},{}],8:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]'
    && typeof val === 'object';
};

},{}],9:[function(require,module,exports){
module.exports = {
  Bar: require('./lib/bar'),
  Doughnut: require('./lib/doughnut'),
  Line: require('./lib/line'),
  Pie: require('./lib/pie'),
  PolarArea: require('./lib/polar-area'),
  Radar: require('./lib/radar'),
  createClass: require('./lib/core').createClass
};

},{"./lib/bar":10,"./lib/core":11,"./lib/doughnut":12,"./lib/line":13,"./lib/pie":14,"./lib/polar-area":15,"./lib/radar":16}],10:[function(require,module,exports){
var vars = require('./core');

module.exports = vars.createClass('Bar', ['getBarsAtEvent']);

},{"./core":11}],11:[function(require,module,exports){
(function (global){
module.exports = {
  createClass: function(chartType, methodNames, dataKey) {
    var classData = {
      displayName: chartType + 'Chart',
      getInitialState: function() { return {}; },
      render: function() {
        var _props = {
          ref: 'canvass'
        };
        for (var name in this.props) {
          if (this.props.hasOwnProperty(name)) {
            if (name !== 'data' && name !== 'options') {
              _props[name] = this.props[name];
            }
          }
        }
        return React.createElement('canvas', _props);
      }
    };

    var extras = ['clear', 'stop', 'resize', 'toBase64Image', 'generateLegend', 'update', 'addData', 'removeData'];
    function extra(type) {
      classData[type] = function() {
        this.state.chart[name].apply(this.state.chart, arguments);
      };
    }

    classData.componentDidMount = function() {
      this.initializeChart(this.props);
    };

    classData.componentWillUnmount = function() {
      var chart = this.state.chart;
      chart.destroy();
    };

    classData.componentWillReceiveProps = function(nextProps) {
      var chart = this.state.chart;
      if (this.props.redraw) {
        chart.destroy();
        this.initializeChart(nextProps);
      } else {
        dataKey = dataKey || dataKeys[chart.name];
        updatePoints(nextProps, chart, dataKey);
        chart.update();
      }
    };

    classData.initializeChart = function(nextProps) {
      var Chart = require('chart.js');
      var el = this.getDOMNode();
      var ctx = el.getContext("2d");
      var chart = new Chart(ctx)[chartType](nextProps.data, nextProps.options || {});
      this.state.chart = chart;
    };

    // return the chartjs instance
    classData.getChart = function() {
      return this.state.chart;
    };

    // return the canvass element that contains the chart
    classData.getCanvass = function() {
      return this.refs.canvass.getDOMNode();
    };

    var i;
    for (i=0; i<extras.length; i++) {
      extra(extras[i]);
    }
    for (i=0; i<methodNames.length; i++) {
      extra(methodNames[i]);
    }

    var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
    return React.createClass(classData);
  }
};

var dataKeys = {
  'Line': 'points',
  'Radar': 'points',
  'Bar': 'bars'
};

var updatePoints = function(nextProps, chart, dataKey) {
  var name = chart.name;

  if (name === 'PolarArea' || name === 'Pie' || name === 'Doughnut') {
    nextProps.data.forEach(function(segment, segmentIndex) {
      chart.segments[segmentIndex].value = segment.value;
    });
  } else {
    nextProps.data.datasets.forEach(function(set, setIndex) {
      set.data.forEach(function(val, pointIndex) {
        chart.datasets[setIndex][dataKey][pointIndex].value = val;
      });
    });
  }
};





}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"chart.js":1}],12:[function(require,module,exports){
var vars = require('./core');

module.exports = vars.createClass('Doughnut', ['getSegmentsAtEvent']);

},{"./core":11}],13:[function(require,module,exports){
var vars = require('./core');

module.exports = vars.createClass('Line', ['getPointsAtEvent']);

},{"./core":11}],14:[function(require,module,exports){
var vars = require('./core');

module.exports = vars.createClass('Pie', ['getSegmentsAtEvent']);

},{"./core":11}],15:[function(require,module,exports){
var vars = require('./core');

module.exports = vars.createClass('PolarArea', ['getSegmentsAtEvent']);

},{"./core":11}],16:[function(require,module,exports){
var vars = require('./core');

module.exports = vars.createClass('Radar', ['getPointsAtEvent']);

},{"./core":11}],17:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

if (!React) {
  throw new Error('AMUIReact requires React.');
}

module.exports = {
  VERSION: '__VERSION__',

  // layout
  Grid: require('./Grid'),
  Col: require('./Col'),
  Container: require('./Container'),
  AvgGrid: require('./AvgGrid'),

  // elements
  Button: require('./Button'),
  ButtonToolbar: require('./ButtonToolbar'),
  ButtonCheck: require('./ButtonCheck'),
  ButtonGroup: require('./ButtonGroup'),

  // form related
  Form: require('./Form'),
  FormGroup: require('./FormGroup'),
  FormFile: require('./FormFile'),
  Input: require('./Input'),
  UCheck: require('./UCheck'),

  Image: require('./Image'),
  Thumbnail: require('./Thumbnail'),
  Thumbnails: require('./Thumbnails'),
  Table: require('./Table'),
  // Code: require('./Code'),

  // Navs
  Nav: require('./Nav'),
  NavItem: require('./NavItem'),
  Breadcrumb: require('./Breadcrumb'),
  Pagination: require('./Pagination'),
  Topbar: require('./Topbar'),
  Tabs: require('./Tabs'),
  CollapsibleNav: require('./CollapsibleNav'),

  Article: require('./Article'),
  Badge: require('./Badge'),
  Close: require('./Close'),
  Icon: require('./Icon'),
  List: require('./List'),
  ListItem: require('./ListItem'),
  Panel: require('./Panel'),
  PanelGroup: require('./PanelGroup'),
  Progress: require('./Progress'),

  Alert: require('./Alert'),
  Date: require('./DatePicker'),
  DateTimeInput: require('./DateTimeInput'),
  DateTimePicker: require('./DateTimePicker'),
  TimePicker: require('./TimePicker'),
  Dropdown: require('./Dropdown'),
  Modal: require('./Modal'),
  ModalTrigger: require('./ModalTrigger'),
  Popover: require('./Popover'),
  PopoverTrigger: require('./PopoverTrigger'),
  NProgress: require('./NProgress'),
  ScrollSpy: require('./ScrollSpy'),
  ScrollSpyNav: require('./ScrollSpyNav'),
  Selected: require('./Selected'),
  Slider: require('./Slider'),
  Sticky: require('./Sticky'),

  // widgets
  Accordion: require('./Accordion'),
  Divider: require('./Divider'),
  Footer: require('./Footer'),
  Gallery: require('./Gallery'),
  GoTop: require('./GoTop'),
  Header: require('./Header'),
  ListNews: require('./ListNews'),
  Menu: require('./Menu'),
  Navbar: require('./Navbar'),
  Titlebar: require('./Titlebar'),

  // mixins
  mixins: require('./mixins')
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Accordion":18,"./Alert":19,"./Article":20,"./AvgGrid":21,"./Badge":22,"./Breadcrumb":23,"./Button":24,"./ButtonCheck":25,"./ButtonGroup":26,"./ButtonToolbar":27,"./Close":28,"./Col":29,"./CollapsibleNav":30,"./Container":31,"./DatePicker":32,"./DateTimeInput":33,"./DateTimePicker":34,"./Divider":35,"./Dropdown":36,"./Footer":37,"./Form":38,"./FormFile":39,"./FormGroup":40,"./Gallery":41,"./GoTop":42,"./Grid":43,"./Header":44,"./Icon":45,"./Image":46,"./Input":47,"./List":48,"./ListItem":49,"./ListNews":50,"./Menu":51,"./Modal":52,"./ModalTrigger":53,"./NProgress":54,"./Nav":55,"./NavItem":56,"./Navbar":57,"./Pagination":58,"./Panel":59,"./PanelGroup":60,"./Popover":61,"./PopoverTrigger":62,"./Progress":63,"./ScrollSpy":64,"./ScrollSpyNav":65,"./Selected":66,"./Slider":67,"./Sticky":68,"./Table":69,"./Tabs":70,"./Thumbnail":71,"./Thumbnails":72,"./TimePicker":73,"./Titlebar":74,"./Topbar":75,"./UCheck":76,"./mixins":83}],18:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var CollapseMixin = require('./mixins/CollapseMixin');

var Accordion = React.createClass({
  displayName: 'Accordion',

  mixins: [ClassNameMixin],

  propTypes: {
    theme: React.PropTypes.oneOf(['default', 'basic', 'gapped']),
    data: React.PropTypes.array,
    activeKey: React.PropTypes.any,
    defaultActiveKey: React.PropTypes.any
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'accordion',
      theme: 'default'
    };
  },

  getInitialState: function getInitialState() {
    return {
      activeKey: this.props.defaultActiveKey
    };
  },

  handleSelect: function handleSelect(e, key) {
    e.preventDefault();

    if (this.state.activeKey === key) {
      key = null;
    }

    this.setState({
      activeKey: key
    });
  },

  render: function render() {
    var classSet = this.getClassSet();

    classSet[this.prefixClass(this.props.theme)] = true;

    return React.createElement(
      'section',
      _extends({}, this.props, {
        'data-am-widget': this.props.classPrefix,
        className: classNames(classSet, this.props.className) }),
      this.props.data.map(function (item, index) {
        return React.createElement(
          Accordion.Item,
          {
            title: item.title,
            expanded: item.active && item.disabled,
            defaultExpanded: item.active && !item.disabled,
            eventKey: index,
            key: index },
          item.content
        );
      })
    );
  }
});

Accordion.Item = React.createClass({
  displayName: 'Item',

  mixins: [ClassNameMixin, CollapseMixin],

  propTypes: {
    title: React.PropTypes.node,
    expanded: React.PropTypes.bool
  },

  handleToggle: function handleToggle() {
    this.setState({ expanded: !this.state.expanded });
  },

  getCollapsibleDimensionValue: function getCollapsibleDimensionValue() {
    return React.findDOMNode(this.refs.panel).scrollHeight;
  },

  getCollapsibleDOMNode: function getCollapsibleDOMNode() {
    if (!this.isMounted() || !this.refs || !this.refs.panel) {
      return null;
    }

    return React.findDOMNode(this.refs.panel);
  },

  render: function render() {
    return React.createElement(
      'dl',
      { className: classNames(this.setClassNamespace('accordion-item'), this.isExpanded() ? this.setClassNamespace('active') : null, this.props.expanded ? this.setClassNamespace('disabled') : null) },
      React.createElement(
        'dt',
        {
          onClick: this.handleToggle,
          className: this.setClassNamespace('accordion-title') },
        this.props.title
      ),
      React.createElement(
        'dd',
        {
          className: classNames(this.getCollapsibleClassSet()),
          ref: 'panel' },
        React.createElement('div', {
          className: this.setClassNamespace('accordion-content'),
          dangerouslySetInnerHTML: { __html: this.props.children } })
      )
    );
  }
});

module.exports = Accordion;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"./mixins/CollapseMixin":79,"classnames":2}],19:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Alert = React.createClass({
  displayName: 'Alert',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    amStyle: React.PropTypes.oneOf(['secondary', 'success', 'warning', 'danger']),
    onClose: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'alert'
    };
  },

  renderCloseBtn: function renderCloseBtn() {
    return React.createElement(
      'button',
      {
        type: 'button',
        className: this.setClassNamespace('close'),
        onClick: this.props.onClose },
      '×'
    );
  },

  render: function render() {
    var classSet = this.getClassSet();
    var isCloseable = !!this.props.onClose;

    if (this.props.amStyle) {
      classSet[this.prefixClass(this.props.amStyle)] = true;
    }

    classSet[this.prefixClass('closeable')] = isCloseable;

    return React.createElement(
      'div',
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      isCloseable ? this.renderCloseBtn() : null,
      this.props.children
    );
  }
});

module.exports = Alert;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],20:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Article = React.createClass({
  displayName: 'Article',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    title: React.PropTypes.node,
    meta: React.PropTypes.node,
    lead: React.PropTypes.node
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'article'
    };
  },

  render: function render() {
    var classSet = this.getClassSet();

    return React.createElement(
      'article',
      _extends({}, this.props, {
        className: classNames(classSet, this.props.className) }),
      React.createElement(
        'header',
        { className: this.prefixClass('hd') },
        this.props.title ? React.createElement(
          Article.Child,
          { role: 'title' },
          this.props.title
        ) : null,
        this.props.meta ? React.createElement(
          Article.Child,
          { role: 'meta' },
          this.props.meta
        ) : null
      ),
      React.createElement(
        'div',
        { className: this.prefixClass('bd') },
        this.props.lead ? React.createElement(
          Article.Child,
          { role: 'lead' },
          this.props.lead
        ) : null,
        this.props.children
      )
    );
  }
});

Article.Child = React.createClass({
  displayName: 'Child',

  mixins: [ClassNameMixin],

  propTypes: {
    role: React.PropTypes.string.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      role: 'title'
    };
  },

  render: function render() {
    var role = this.props.role;
    var Component;
    var classes = classNames(this.props.className, this.setClassNamespace('article-' + role));

    switch (role) {
      case 'meta':
      case 'lead':
        Component = 'p';
        break;
      case 'title':
        Component = 'h1';
        break;
      default:
        Component = 'div';
    }

    return role === 'divider' ? React.createElement('hr', _extends({}, this.props, {
      className: classes })) : React.createElement(
      Component,
      _extends({}, this.props, {
        className: classes }),
      this.props.children
    );
  }
});

module.exports = Article;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],21:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var AvgGrid = React.createClass({
  displayName: 'AvgGrid',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    componentTag: React.PropTypes.node,
    sm: React.PropTypes.number,
    md: React.PropTypes.number,
    lg: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'avg',
      componentTag: 'ul'
    };
  },

  render: function render() {
    var Component = this.props.componentTag;
    var classSet = {};
    var prefixClass = this.prefixClass;
    var props = this.props;

    ['sm', 'md', 'lg'].forEach(function (size) {
      if (props[size]) {
        classSet[prefixClass(size + '-' + props[size])] = true;
      }
    });

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      this.props.children
    );
  }
});

module.exports = AvgGrid;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],22:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Badge = React.createClass({
  displayName: 'Badge',

  mixins: [ClassNameMixin],

  propTypes: {
    componentTag: React.PropTypes.node,
    href: React.PropTypes.string,
    round: React.PropTypes.bool,
    radius: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'badge',
      componentTag: 'span'
    };
  },

  renderAnchor: function renderAnchor(classSet) {
    var Component = this.props.componentTag || 'a';
    var href = this.props.href || '#';

    return React.createElement(
      Component,
      _extends({}, this.props, {
        href: href,
        className: classNames(classSet, this.props.className),
        role: 'badge' }),
      this.props.children
    );
  },

  render: function render() {
    var classSet = this.getClassSet();
    var Component = this.props.componentTag;
    var renderAnchor = this.props.href;

    if (renderAnchor) {
      return this.renderAnchor(classSet);
    }

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(classSet, this.props.className) }),
      this.props.children
    );
  }
});

module.exports = Badge;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],23:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Breadcrumb = React.createClass({
  displayName: 'Breadcrumb',

  mixins: [ClassNameMixin],

  propTypes: {
    slash: React.PropTypes.bool,
    componentTag: React.PropTypes.node.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'breadcrumb',
      componentTag: 'ul'
    };
  },

  render: function render() {
    var classes = this.getClassSet();
    var Component = this.props.componentTag;

    classes[this.prefixClass('slash')] = this.props.slash;

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(classes, this.props.className) }),
      this.props.children
    );
  }
});

Breadcrumb.Item = React.createClass({
  displayName: 'Item',

  mixins: [ClassNameMixin],

  propTypes: {
    active: React.PropTypes.bool,
    href: React.PropTypes.string,
    title: React.PropTypes.string,
    target: React.PropTypes.string
  },

  renderAnchor: function renderAnchor(classes) {
    return React.createElement(
      'li',
      _extends({}, this.props, {
        className: classes }),
      React.createElement(
        'a',
        {
          href: this.props.href,
          title: this.props.title,
          target: this.props.target },
        this.props.children
      )
    );
  },

  render: function render() {
    var classes = classNames(this.props.className);

    if (this.props.href) {
      return this.renderAnchor(classes);
    }

    return React.createElement(
      'li',
      _extends({}, this.props, {
        className: classes }),
      this.props.children
    );
  }
});

module.exports = Breadcrumb;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],24:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var omit = require('object.omit');

var Button = React.createClass({
  displayName: 'Button',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    active: React.PropTypes.bool,
    block: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    radius: React.PropTypes.bool,
    round: React.PropTypes.bool,
    componentTag: React.PropTypes.node,
    href: React.PropTypes.string,
    target: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'btn',
      type: 'button',
      amStyle: 'default'
    };
  },

  renderAnchor: function renderAnchor(classSet) {
    var Component = this.props.componentTag || 'a';
    var href = this.props.href || '#';
    var props = omit(this.props, 'type');

    return React.createElement(
      Component,
      _extends({}, props, {
        href: href,
        className: classNames(this.props.className, classSet),
        role: 'button' }),
      this.props.children
    );
  },

  renderButton: function renderButton(classSet) {
    var Component = this.props.componentTag || 'button';

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      this.props.children
    );
  },

  render: function render() {
    var classSet = this.getClassSet();
    var renderType = this.props.href || this.props.target ? 'renderAnchor' : 'renderButton';

    // block button
    this.props.block && (classSet[this.prefixClass('block')] = true);

    return this[renderType](classSet);
  }
});

module.exports = Button;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],25:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var CSSCore = require('./utils/CSSCore');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var ButtonGroup = require('./ButtonGroup');
var constants = require('./constants');

var ButtonCheck = React.createClass({
  displayName: 'ButtonCheck',

  mixins: [ClassNameMixin],

  propTypes: {
    clickHandler: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      clickHandler: function clickHandler() {}
    };
  },

  handleClick: function handleClick(e) {
    var changed = true;
    var target = e.target;
    var activeClassName = constants.CLASSES.active;

    if (target && target.nodeName === 'INPUT') {
      var parent = target.parentNode;

      if (target.type === 'radio') {
        if (target.checked && CSSCore.hasClass(parent, activeClassName)) {
          changed = false;
        } else {
          var siblings = parent.parentNode.children;

          // remove siblings activeClassName
          for (var i = 0; i < siblings.length; i++) {
            siblings[i] !== parent && CSSCore.removeClass(siblings[i], activeClassName);
          }
        }
      }

      if (changed) {
        CSSCore.toggleClass(parent, activeClassName);
      }
    }

    this.props.clickHandler.call(this);
  },

  render: function render() {
    return React.createElement(
      ButtonGroup,
      _extends({}, this.props, {
        onClick: this.handleClick,
        className: this.setClassNamespace('btn-group-check') }),
      this.props.children
    );
  }
});

module.exports = ButtonCheck;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ButtonGroup":26,"./constants":77,"./mixins/ClassNameMixin":78,"./utils/CSSCore":84}],26:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var ButtonGroup = React.createClass({
  displayName: 'ButtonGroup',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    stacked: React.PropTypes.bool,
    justify: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'btn-group'
    };
  },

  render: function render() {
    var classSet = this.getClassSet();

    classSet[this.prefixClass('stacked')] = this.props.stacked;
    classSet[this.prefixClass('justify')] = this.props.justify;

    return React.createElement(
      'div',
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      this.props.children
    );
  }
});

module.exports = ButtonGroup;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],27:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var ButtonToolbar = React.createClass({
  displayName: 'ButtonToolbar',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'btn-toolbar'
    };
  },

  render: function render() {
    var classSet = this.getClassSet();

    return React.createElement(
      'div',
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      this.props.children
    );
  }
});

module.exports = ButtonToolbar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],28:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Icon = require('./Icon');

var Close = React.createClass({
  displayName: 'Close',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    componentTag: React.PropTypes.node,
    spin: React.PropTypes.bool,
    alt: React.PropTypes.bool,
    icon: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'close',
      type: 'button'
    };
  },

  render: function render() {
    var Component = this.props.componentTag || 'button';
    var classSet = this.getClassSet();
    var props = this.props;

    // transfer type
    if (Component !== 'button') {
      props.type = undefined;
    }

    // className am-close-alt am-close-spin
    classSet[this.prefixClass('alt')] = this.props.alt;
    classSet[this.prefixClass('spin')] = this.props.spin;

    return React.createElement(
      Component,
      _extends({}, props, {
        className: classNames(classSet, this.props.className),
        role: 'close' }),
      this.props.icon ? React.createElement(Icon, { icon: 'times' }) : '×'
    );
  }
});

module.exports = Close;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Icon":45,"./mixins/ClassNameMixin":78,"classnames":2}],29:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Col = React.createClass({
  displayName: 'Col',

  mixins: [ClassNameMixin],

  propTypes: {
    sm: React.PropTypes.number,
    md: React.PropTypes.number,
    lg: React.PropTypes.number,
    smOffset: React.PropTypes.number,
    mdOffset: React.PropTypes.number,
    lgOffset: React.PropTypes.number,
    smPush: React.PropTypes.number,
    mdPush: React.PropTypes.number,
    lgPush: React.PropTypes.number,
    smPull: React.PropTypes.number,
    mdPull: React.PropTypes.number,
    lgPull: React.PropTypes.number,
    classPrefix: React.PropTypes.string.isRequired,
    componentTag: React.PropTypes.node.isRequired,
    end: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'u',
      componentTag: 'div'
    };
  },

  render: function render() {
    var Component = this.props.componentTag;
    var classSet = {};
    var props = this.props;
    var prefixClass = this.prefixClass;

    ['sm', 'md', 'lg'].forEach(function (size) {
      var prop = size;

      if (props[size]) {
        classSet[prefixClass(size + '-' + props[prop])] = true;
      }

      prop = size + 'Offset';
      if (props[prop] >= 0) {
        classSet[prefixClass(size + '-offset-') + props[prop]] = true;
      }

      prop = size + 'Push';
      if (props[prop] >= 0) {
        classSet[prefixClass(size + '-push-') + props[prop]] = true;
      }

      prop = size + 'Pull';
      if (props[prop] >= 0) {
        classSet[prefixClass(size + '-pull-') + props[prop]] = true;
      }

      // `xxResetOrder` prop
      // - smResetOrder
      // - mdResetOrder
      // - lgResetOrder
      if (props[size + 'ResetOrder']) {
        classSet[prefixClass(size + '-reset-order')] = true;
      }

      // `xxCentered` prop
      // - smCentered
      // - mdCentered
      // - lgCentered
      if (props[size + 'Centered']) {
        classSet[prefixClass(size + '-centered')] = true;
      }

      // `xxUnCentered` prop
      // - smUnCentered
      // - mdUnCentered
      // - lgUnCentered
      if (props[size + 'UnCentered']) {
        classSet[prefixClass(size + '-uncentered')] = true;
      }
    });

    // `end` prop - end column
    props.end && (classSet[prefixClass('end')] = true);

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      this.props.children
    );
  }
});

module.exports = Col;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],30:[function(require,module,exports){
(function (global){
'use strict';

/*
* https://github.com/react-bootstrap/react-bootstrap/blob/master/src/CollapsibleNav.js
* */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var CollapseMixin = require('./mixins/CollapseMixin');
var createChainedFunction = require('./utils/createChainedFunction');

var CollapsibleNav = React.createClass({
  displayName: 'CollapsibleNav',

  mixins: [ClassNameMixin, CollapseMixin],

  propTypes: {
    collapsible: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    activeHref: React.PropTypes.string,
    activeKey: React.PropTypes.any,
    expanded: React.PropTypes.bool,
    eventKey: React.PropTypes.any
  },

  handleToggle: function handleToggle() {
    this.setState({ expanded: !this.state.expanded });
  },

  getCollapsibleDimensionValue: function getCollapsibleDimensionValue() {
    var height = 0;
    var nodes = this.refs;

    for (var key in nodes) {
      if (nodes.hasOwnProperty(key)) {
        var n = React.findDOMNode(nodes[key]);
        var h = n.offsetHeight;
        var computedStyles = getComputedStyle(n, null);

        height += h + parseInt(computedStyles.marginTop, 10) + parseInt(computedStyles.marginBottom, 10);
      }
    }

    return height;
  },

  getCollapsibleDOMNode: function getCollapsibleDOMNode() {
    return React.findDOMNode(this);
  },

  getChildActiveProp: function getChildActiveProp(child) {
    if (child.props.active) {
      return true;
    }

    if (this.props.activeKey != null) {
      if (child.props.eventKey === this.props.activeKey) {
        return true;
      }
    }

    if (this.props.activeHref != null) {
      if (child.props.href === this.props.activeHref) {
        return true;
      }
    }

    return child.props.active;
  },

  renderChildren: function renderChildren(child, index) {
    var key = child.key ? child.key : index;

    return React.cloneElement(child, {
      activeKey: this.props.activeKey,
      activeHref: this.props.activeHref,
      ref: 'nocollapse_' + key,
      key: key,
      navItem: true
    });
  },

  renderCollapsibleNavChildren: function renderCollapsibleNavChildren(child, index) {
    var key = child.key ? child.key : index;

    return React.cloneElement(child, {
      active: this.getChildActiveProp(child),
      activeKey: this.props.activeKey,
      activeHref: this.props.activeHref,
      onSelect: createChainedFunction(child.props.onSelect, this.props.onSelect),
      ref: 'collapsible_' + key,
      key: key
    });
  },

  render: function render() {
    var collapsible = this.props.collapsible;
    var classSet = collapsible ? this.getCollapsibleClassSet() : {};

    classSet[this.setClassNamespace('topbar-collapse')] = this.props.topbar;

    return React.createElement(
      'div',
      {
        eventKey: this.props.eventKey,
        className: classNames(classSet, this.props.className) },
      React.Children.map(this.props.children, collapsible ? this.renderCollapsibleNavChildren : this.renderChildren)
    );
  }
});

module.exports = CollapsibleNav;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"./mixins/CollapseMixin":79,"./utils/createChainedFunction":87,"classnames":2}],31:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Container = React.createClass({
  displayName: 'Container',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    componentTag: React.PropTypes.node.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'container',
      componentTag: 'div'
    };
  },

  render: function render() {
    var Component = this.props.componentTag;
    var classSet = this.getClassSet();

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      this.props.children
    );
  }
});

module.exports = Container;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],32:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var fecha = require('fecha');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var dateUtils = require('./utils/dateUtils');

var DatePicker = React.createClass({
  displayName: 'DatePicker',

  mixins: [ClassNameMixin],

  propTypes: {
    onSelect: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func,
    viewMode: React.PropTypes.string,
    minViewMode: React.PropTypes.string,
    daysOfWeekDisabled: React.PropTypes.array,
    format: React.PropTypes.string,
    date: React.PropTypes.object,
    weekStart: React.PropTypes.number,
    minDate: React.PropTypes.string,
    maxDate: React.PropTypes.string,
    locale: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker',
      date: new Date(),
      daysOfWeekDisabled: [],
      viewMode: 'days',
      minViewMode: 'days',
      format: 'YYYY-MM-DD',
      displayed: {
        days: { display: 'block' },
        months: { display: 'none' },
        years: { display: 'none' }
      }
    };
  },

  getInitialState: function getInitialState() {
    var displayed;

    switch (this.props.viewMode) {
      case 'days':
        displayed = {
          days: { display: 'block' },
          months: { display: 'none' },
          years: { display: 'none' }
        };
        break;

      case 'months':
        displayed = {
          days: { display: 'none' },
          months: { display: 'block' },
          years: { display: 'none' }
        };
        break;

      case 'years':
        displayed = {
          days: { display: 'none' },
          months: { display: 'none' },
          years: { display: 'block' }
        };
        break;
    }

    return {
      locale: dateUtils.getLocale(this.props.locale),
      viewDate: this.props.date,
      selectedDate: this.props.date,
      displayed: displayed
    };
  },

  // DaysPicker props function

  subtractMonth: function subtractMonth() {
    var viewDate = this.state.viewDate;
    var newDate = new Date(viewDate.valueOf());

    newDate.setMonth(viewDate.getMonth() - 1);
    this.setState({
      viewDate: newDate
    });
  },

  addMonth: function addMonth() {
    var viewDate = this.state.viewDate;
    var newDate = new Date(viewDate.valueOf());

    newDate.setMonth(viewDate.getMonth() + 1);
    this.setState({
      viewDate: newDate
    });
  },

  setSelectedDate: function setSelectedDate(event) {
    if (/disabled/ig.test(event.target.className)) {
      return;
    }

    var viewDate = this.state.viewDate;

    if (/new/ig.test(event.target.className)) {
      viewDate.setMonth(viewDate.getMonth() + 1);
    } else if (/old/ig.test(event.target.className)) {
      viewDate.setMonth(viewDate.getMonth() - 1);
    }

    viewDate.setDate(event.target.innerHTML);

    this.setViewDate(viewDate);
  },

  setViewDate: function setViewDate(viewDate) {
    this.setState({
      viewDate: viewDate,
      selectedDate: new Date(viewDate.valueOf())
    }, function () {
      this.props.onSelect(this.state.selectedDate);
      this.props.onClose && this.props.onClose();
    });
  },

  showMonths: function showMonths() {
    return this.setState({
      displayed: {
        days: { display: 'none' },
        months: { display: 'block' },
        years: { display: 'none' }
      }
    });
  },

  // MonthsPicker props function

  subtractYear: function subtractYear() {
    var viewDate = this.state.viewDate;
    var newDate = new Date(viewDate.valueOf());

    newDate.setFullYear(viewDate.getFullYear() - 1);

    return this.setState({
      viewDate: newDate
    });
  },

  addYear: function addYear() {
    var viewDate = this.state.viewDate;
    var newDate = new Date(viewDate.valueOf());

    newDate.setFullYear(viewDate.getFullYear() + 1);
    return this.setState({
      viewDate: newDate
    });
  },

  showYears: function showYears() {
    return this.setState({
      displayed: {
        days: { display: 'none' },
        months: { display: 'none' },
        years: { display: 'block' }
      }
    });
  },

  setViewMonth: function setViewMonth(event) {
    var viewDate = this.state.viewDate;
    var month = event.target.innerHTML;
    var months = this.state.locale.monthsShort;
    var i = 0;
    var len = months.length;

    for (; i < len; i++) {
      if (month === months[i]) {
        viewDate.setMonth(i);
      }
    }

    if (this.props.minViewMode === 'months') {
      this.setViewDate(viewDate);
    }

    this.setState({
      viewDate: viewDate,
      displayed: {
        days: { display: 'block' },
        months: { display: 'none' },
        years: { display: 'none' }
      }
    });
  },

  // YearsPicker props function

  setViewYear: function setViewYear(event) {
    var year = event.target.innerHTML;
    var viewDate = this.state.viewDate;

    viewDate.setFullYear(year);

    if (this.props.minViewMode === 'years') {
      this.setViewDate(viewDate);
    }

    this.setState({
      viewDate: viewDate,
      displayed: {
        days: { display: 'none' },
        months: { display: 'block' },
        years: { display: 'none' }
      }
    });
  },

  addDecade: function addDecade() {
    var viewDate = this.state.viewDate;
    var newDate = new Date(viewDate.valueOf());

    newDate.setFullYear(viewDate.getFullYear() + 10);
    this.setState({
      viewDate: newDate
    });
  },

  subtractDecade: function subtractDecade() {
    var viewDate = this.state.viewDate;
    var newDate = new Date(viewDate.valueOf());

    newDate.setFullYear(viewDate.getFullYear() - 10);

    this.setState({
      viewDate: newDate
    });
  },

  // render children
  renderDays: function renderDays() {
    return React.createElement(DaysPicker, {
      style: this.state.displayed.days,
      selectedDate: this.state.selectedDate,
      viewDate: this.state.viewDate,

      subtractMonth: this.subtractMonth,
      addMonth: this.addMonth,
      setSelectedDate: this.setSelectedDate,
      showMonths: this.showMonths,

      locale: this.state.locale,
      weekStart: this.props.weekStart,
      daysOfWeekDisabled: this.props.daysOfWeekDisabled,
      minDate: this.props.minDate,
      maxDate: this.props.maxDate
    });
  },

  renderMonths: function renderMonths() {
    return React.createElement(MonthsPicker, {
      style: this.state.displayed.months,
      locale: this.state.locale,
      addYear: this.addYear,
      subtractYear: this.subtractYear,
      viewDate: this.state.viewDate,
      selectedDate: this.state.selectedDate,
      showYears: this.showYears,
      setViewMonth: this.setViewMonth });
  },

  renderYears: function renderYears() {
    return React.createElement(YearsPicker, {
      style: this.state.displayed.years,
      viewDate: this.state.viewDate,
      selectDate: this.state.selectedDate,
      setViewYear: this.setViewYear,
      addDecade: this.addDecade,
      subtractDecade: this.subtractDecade });
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: this.prefixClass('body') },
      this.renderDays(),
      this.renderMonths(),
      this.renderYears()
    );
  }
});

var DaysPicker = React.createClass({
  displayName: 'DaysPicker',

  mixins: [ClassNameMixin],

  propTypes: {
    subtractMonth: React.PropTypes.func.isRequired,
    addMonth: React.PropTypes.func.isRequired,

    setSelectedDate: React.PropTypes.func.isRequired,
    selectedDate: React.PropTypes.object.isRequired,

    viewDate: React.PropTypes.object.isRequired,
    showMonths: React.PropTypes.func.isRequired,

    locale: React.PropTypes.object,
    weekStart: React.PropTypes.number,
    daysOfWeekDisabled: React.PropTypes.array,
    minDate: React.PropTypes.string,
    maxDate: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker'
    };
  },

  renderDays: function renderDays() {
    var row;
    var i;
    var _ref;
    var _i;
    var _len;
    var prevY;
    var prevM;
    var classes = {};
    var html = [];
    var cells = [];
    var weekStart = this.props.weekStart || this.props.locale.weekStart;

    var weekEnd = (weekStart + 6) % 7;

    var d = this.props.viewDate;
    var year = d.getFullYear();
    var month = d.getMonth();
    var selectedDate = this.props.selectedDate;

    var currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0).valueOf();

    var prevMonth = new Date(year, month - 1, 28, 0, 0, 0, 0);
    var day = dateUtils.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());

    prevMonth.setDate(day);
    prevMonth.setDate(day - (prevMonth.getDay() - weekStart + 7) % 7);

    var nextMonth = new Date(prevMonth);

    nextMonth.setDate(nextMonth.getDate() + 42);
    nextMonth = nextMonth.valueOf();

    var minDate = this.props.minDate && fecha.parse(this.props.minDate);
    var maxDate = this.props.maxDate && fecha.parse(this.props.maxDate);

    while (prevMonth.valueOf() < nextMonth) {
      classes[this.prefixClass('day')] = true;

      prevY = prevMonth.getFullYear();
      prevM = prevMonth.getMonth();

      // set className old new
      if (prevM < month && prevY === year || prevY < year) {
        classes[this.prefixClass('old')] = true;
      } else if (prevM > month && prevY === year || prevY > year) {
        classes[this.prefixClass('new')] = true;
      }

      // set className active
      if (prevMonth.valueOf() === currentDate) {
        classes[this.setClassNamespace('active')] = true;
      }

      // set className disabled
      if (minDate && prevMonth.valueOf() < minDate || maxDate && prevMonth.valueOf() > maxDate) {
        classes[this.setClassNamespace('disabled')] = true;
      }

      // week disabled
      if (this.props.daysOfWeekDisabled) {
        _ref = this.props.daysOfWeekDisabled;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          if (prevMonth.getDay() === this.props.daysOfWeekDisabled[i]) {
            classes[this.setClassNamespace('disabled')] = true;
            break;
          }
        }
      }

      cells.push(React.createElement(
        'td',
        {
          key: prevMonth.getMonth() + '-' + prevMonth.getDate(),
          className: classNames(classes),
          onClick: this.props.setSelectedDate },
        prevMonth.getDate()
      ));

      // add tr
      if (prevMonth.getDay() === weekEnd) {
        row = React.createElement(
          'tr',
          { key: prevMonth.getMonth() + '-' + prevMonth.getDate() },
          cells
        );
        html.push(row);
        cells = [];
      }

      classes = {};
      prevMonth.setDate(prevMonth.getDate() + 1);
    }

    return html;
  },

  renderWeek: function renderWeek() {
    var ths = [];
    var locale = this.props.locale;
    var weekStart = this.props.weekStart || this.props.locale.weekStart;
    var weekEnd = weekStart + 7;

    while (weekStart < weekEnd) {
      ths.push(React.createElement(
        'th',
        { key: weekStart, className: this.prefixClass('dow') },
        locale.daysMin[weekStart++ % 7]
      ));
    }

    return React.createElement(
      'tr',
      null,
      ths
    );
  },

  render: function render() {
    var viewDate = this.props.viewDate;
    var prefixClass = this.prefixClass;
    var locale = this.props.locale;

    return React.createElement(
      'div',
      {
        className: prefixClass('days'),
        style: this.props.style },
      React.createElement(
        'table',
        { className: prefixClass('table') },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { className: prefixClass('header') },
            React.createElement(
              'th',
              { className: prefixClass('prev'), onClick: this.props.subtractMonth },
              React.createElement('i', { className: prefixClass('prev-icon') })
            ),
            React.createElement(
              'th',
              {
                className: prefixClass('switch'),
                colSpan: '5',
                onClick: this.props.showMonths },
              React.createElement(
                'div',
                { className: this.prefixClass('select') },
                locale.monthsShort[viewDate.getMonth()],
                viewDate.getFullYear()
              )
            ),
            React.createElement(
              'th',
              { className: prefixClass('next'), onClick: this.props.addMonth },
              React.createElement('i', { className: prefixClass('next-icon') })
            )
          ),
          this.renderWeek()
        ),
        React.createElement(
          'tbody',
          null,
          this.renderDays()
        )
      )
    );
  }
});

var MonthsPicker = React.createClass({
  displayName: 'MonthsPicker',

  mixins: [ClassNameMixin],

  propTypes: {
    locale: React.PropTypes.object,
    subtractYear: React.PropTypes.func.isRequired,
    addYear: React.PropTypes.func.isRequired,
    viewDate: React.PropTypes.object.isRequired,
    selectedDate: React.PropTypes.object.isRequired,
    showYears: React.PropTypes.func.isRequired,
    setViewMonth: React.PropTypes.func.isRequired,
    minDate: React.PropTypes.string,
    maxDate: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker'
    };
  },

  renderMonths: function renderMonths() {
    var classes = {};
    var month = this.props.selectedDate.getMonth();
    var year = this.props.selectedDate.getFullYear();
    var i = 0;
    var months = [];
    var minDate = this.props.minDate && fecha.parse(this.props.minDate);
    var maxDate = this.props.maxDate && fecha.parse(this.props.maxDate);
    var prevMonth = new Date(year, month);

    // TODO: minDate maxDate months
    while (i < 12) {
      classes[this.prefixClass('month')] = true;

      if (this.props.viewDate.getFullYear() === this.props.selectedDate.getFullYear() && i === month) {
        classes[this.setClassNamespace('active')] = true;
      }

      // set className disabled
      if (minDate && prevMonth.valueOf() < minDate || maxDate && prevMonth.valueOf() > maxDate) {
        classes[this.setClassNamespace('disabled')] = true;
      }

      months.push(React.createElement(
        'span',
        {
          className: classNames(classes),
          onClick: this.props.setViewMonth,
          key: i },
        this.props.locale.monthsShort[i]
      ));

      classes = {};
      i++;
    }

    return months;
  },

  render: function render() {
    return React.createElement(SubPicker, {
      displayName: 'months',
      style: this.props.style,
      subtract: this.props.subtractYear,
      add: this.props.addYear,
      showFunc: this.props.showYears,
      showText: this.props.viewDate.getFullYear(),
      body: this.renderMonths() });
  }
});

var YearsPicker = React.createClass({
  displayName: 'YearsPicker',

  mixins: [ClassNameMixin],

  propTypes: {
    viewDate: React.PropTypes.object.isRequired,
    selectDate: React.PropTypes.object.isRequired,
    subtractDecade: React.PropTypes.func.isRequired,
    addDecade: React.PropTypes.func.isRequired,
    setViewYear: React.PropTypes.func.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker'
    };
  },

  renderYears: function renderYears() {
    var classes = {};
    var years = [];
    var i = -1;
    var year = parseInt(this.props.viewDate.getFullYear() / 10, 10) * 10;

    year--;

    while (i < 11) {
      classes[this.prefixClass('year')] = true;

      if (i === -1 || i === 10) {
        classes[this.prefixClass('old')] = true;
      }

      if (this.props.selectDate.getFullYear() === year) {
        classes[this.setClassNamespace('active')] = true;
      }

      years.push(React.createElement(
        'span',
        {
          className: classNames(classes),
          onClick: this.props.setViewYear,
          key: year },
        year
      ));

      classes = {};
      year++;
      i++;
    }

    return years;
  },

  render: function render() {
    var year = parseInt(this.props.viewDate.getFullYear() / 10, 10) * 10;
    var addYear = year + 9;
    var showYear = year + '-' + addYear;

    return React.createElement(SubPicker, {
      displayName: 'years',
      style: this.props.style,
      subtract: this.props.subtractDecade,
      add: this.props.addDecade,
      showText: showYear,
      body: this.renderYears() });
  }
});

var SubPicker = React.createClass({
  displayName: 'SubPicker',

  mixins: [ClassNameMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker'
    };
  },

  render: function render() {
    var prefixClass = this.prefixClass;

    return React.createElement(
      'div',
      {
        className: prefixClass(this.props.displayName),
        style: this.props.style },
      React.createElement(
        'table',
        { className: prefixClass('table') },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { className: prefixClass('header') },
            React.createElement(
              'th',
              { className: prefixClass('prev'), onClick: this.props.subtract },
              React.createElement('i', { className: prefixClass('prev-icon') })
            ),
            React.createElement(
              'th',
              {
                className: prefixClass('switch'),
                colSpan: '5',
                onClick: this.props.showFunc },
              React.createElement(
                'div',
                { className: this.prefixClass('select') },
                this.props.showText
              )
            ),
            React.createElement(
              'th',
              { className: prefixClass('next'), onClick: this.props.add },
              React.createElement('i', { className: prefixClass('next-icon') })
            )
          )
        ),
        React.createElement(
          'tbody',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement(
              'td',
              { colSpan: '7' },
              this.props.body
            )
          )
        )
      )
    );
  }
});

module.exports = DatePicker;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"./utils/dateUtils":88,"classnames":2,"fecha":3}],33:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var fecha = require('fecha');
var Events = require('./utils/Events');
var isNodeInTree = require('./utils/isNodeInTree');
var Input = require('./Input');
var DateTimePicker = require('./DateTimePicker');

var DateTimeInput = React.createClass({
  displayName: 'DateTimeInput',

  propTypes: {
    format: React.PropTypes.string,
    dateTime: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      dateTime: '',
      format: 'YYYY-MM-DD HH:mm'
    };
  },

  getInitialState: function getInitialState() {
    return {
      value: this.props.dateTime || fecha.format(new Date(), this.props.format),
      showPicker: false
    };
  },

  handleOuterClick: function handleOuterClick(event) {
    var picker = React.findDOMNode(this.refs.DateTimePicker.getDOMNode());

    if (!isNodeInTree(event.target, picker)) {
      this.handleClose();
    }
  },

  bindOuterHandlers: function bindOuterHandlers() {
    Events.on(document, 'click', this.handleOuterClick);
  },

  unbindOuterHandlers: function unbindOuterHandlers() {
    Events.off(document, 'click', this.handleOuterClick);
  },

  handleClose: function handleClose() {
    this.unbindOuterHandlers();
    return this.setState({
      showPicker: false
    });
  },

  handleClick: function handleClick() {
    this.bindOuterHandlers();
    var posObj = this.refs.dateInput.getDOMNode();

    var offset = {
      top: posObj.offsetTop + posObj.offsetHeight,
      left: posObj.offsetLeft
    };

    var styles = {
      display: 'block',
      top: offset.top,
      left: offset.left,
      position: 'absolute',
      zIndex: 1120
    };

    this.setState({
      showPicker: true,
      pickerStyle: styles
    });
  },

  handleChange: function handleChange(event) {
    return this.setState({
      value: event.target.value
    });
  },

  handleSelect: function handleSelect(date) {
    return this.setState({
      value: date
    });
  },

  renderPicker: function renderPicker() {
    if (this.state.showPicker) {
      return React.createElement(DateTimePicker, {
        style: this.state.pickerStyle,
        ref: 'DateTimePicker',
        showDatePicker: this.props.showDatePicker,
        showTimePicker: this.props.showTimePicker,
        onSelect: this.handleSelect,
        onClose: this.handleClose,
        amStyle: this.props.amStyle,
        dateTime: this.state.value,
        viewMode: this.props.viewMode,
        minViewMode: this.props.minViewMode,
        daysOfWeekDisabled: this.props.daysOfWeekDisabled,
        weekStart: this.props.weekStart,
        format: this.props.format,
        locale: this.props.locale,
        maxDate: this.props.maxDate,
        minDate: this.props.minDate });
    }
  },

  render: function render() {
    return React.createElement(
      'div',
      null,
      React.createElement(Input, _extends({}, this.props, {
        type: 'text',
        onClick: this.handleClick,
        value: this.state.value,
        onChange: this.handleChange,
        ref: 'dateInput' })),
      this.renderPicker()
    );
  }
});

module.exports = DateTimeInput;

// TODO: 动画

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./DateTimePicker":34,"./Input":47,"./utils/Events":85,"./utils/isNodeInTree":93,"fecha":3}],34:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var DatePicker = require('./DatePicker');
var TimePicker = require('./TimePicker');
var fecha = require('fecha');
var Icon = require('./Icon');

var DateTimePicker = React.createClass({
  displayName: 'DateTimePicker',

  mixins: [ClassNameMixin],

  propTypes: {
    showTimePicker: React.PropTypes.bool,
    showDatePicker: React.PropTypes.bool,
    caretDisplayed: React.PropTypes.bool,
    amStyle: React.PropTypes.oneOfType(['success', 'danger', 'warning']),
    viewMode: React.PropTypes.string,
    minViewMode: React.PropTypes.string,
    onSelect: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func,
    daysOfWeekDisabled: React.PropTypes.array,
    format: React.PropTypes.string,
    dateTime: React.PropTypes.string,
    locale: React.PropTypes.string,
    weekStart: React.PropTypes.number,
    minDate: React.PropTypes.string,
    maxDate: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker',
      dateTime: '',
      format: 'YYYY-MM-DD HH:mm',
      showTimePicker: true,
      showDatePicker: true,
      caretDisplayed: true
    };
  },

  getInitialState: function getInitialState() {
    var showToggle;
    var showTimePicker;

    if (this.props.showTimePicker && this.props.showDatePicker) {
      showToggle = true;
      showTimePicker = false;
    }

    if (!showToggle && !this.props.showDatePicker) {
      showTimePicker = true;
    }

    return {
      showTimePicker: showTimePicker,
      showDatePicker: this.props.showDatePicker,
      caretDisplayed: this.props.caretDisplayed,
      showToggle: showToggle,
      date: fecha.parse(this.props.dateTime, this.props.format),
      toggleDisplay: {
        toggleTime: { display: 'block' },
        toggleDate: { display: 'none' }
      }
    };
  },

  handleToggleTime: function handleToggleTime() {
    this.setState({
      showDatePicker: false,
      showTimePicker: true,
      toggleDisplay: {
        toggleTime: { display: 'none' },
        toggleDate: { display: 'block' }
      }
    });
  },

  handleToggleDate: function handleToggleDate() {
    this.setState({
      showDatePicker: true,
      showTimePicker: false,
      toggleDisplay: {
        toggleTime: { display: 'block' },
        toggleDate: { display: 'none' }
      }
    });
  },

  handleSelect: function handleSelect(date) {
    this.setState({
      date: date
    });
    this.props.onSelect(fecha.format(date, this.props.format));
  },

  renderToggleTime: function renderToggleTime() {
    if (this.state.showToggle) {
      return React.createElement(
        'div',
        { style: this.state.toggleDisplay.toggleTime, className: this.prefixClass('toggle'), onClick: this.handleToggleTime },
        React.createElement(Icon, { icon: 'clock-o' })
      );
    }
  },

  renderToggleDate: function renderToggleDate() {
    if (this.state.showToggle) {
      return React.createElement(
        'div',
        { style: this.state.toggleDisplay.toggleDate, className: this.prefixClass('toggle'), onClick: this.handleToggleDate },
        React.createElement(Icon, { icon: 'calendar' })
      );
    }
  },

  renderDatePicker: function renderDatePicker() {
    if (this.state.showDatePicker) {
      return React.createElement(DatePicker, {
        onSelect: this.handleSelect,
        onClose: this.props.onClose,
        weekStart: this.props.weekStart,
        viewMode: this.props.viewMode,
        minViewMode: this.props.minViewMode,
        daysOfWeekDisabled: this.props.daysOfWeekDisabled,
        format: this.props.format,
        date: this.state.date,
        locale: this.props.locale,
        minDate: this.props.minDate,
        maxDate: this.props.maxDate });
    }
  },

  renderTimePicker: function renderTimePicker() {
    if (this.state.showTimePicker) {
      return React.createElement(TimePicker, {
        onSelect: this.handleSelect,
        date: this.state.date,
        format: this.props.format });
    }
  },

  renderCaret: function renderCaret() {
    if (this.state.caretDisplayed) {
      return React.createElement('div', { className: this.prefixClass('caret') });
    }
  },

  render: function render() {
    var classSet = this.getClassSet();

    this.props.amStyle && (classSet[this.prefixClass(this.props.amStyle)] = true);

    return React.createElement(
      'div',
      _extends({}, this.props, {
        className: classNames(classSet, this.props.className),
        style: this.props.style }),
      this.renderCaret(),
      React.createElement(
        'div',
        { className: this.prefixClass('date') },
        this.renderDatePicker()
      ),
      React.createElement(
        'div',
        { className: this.prefixClass('time') },
        this.renderTimePicker()
      ),
      this.renderToggleTime(),
      this.renderToggleDate()
    );
  }
});

module.exports = DateTimePicker;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./DatePicker":32,"./Icon":45,"./TimePicker":73,"./mixins/ClassNameMixin":78,"classnames":2,"fecha":3}],35:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Divider = React.createClass({
  displayName: 'Divider',

  mixins: [ClassNameMixin],

  propTypes: {
    theme: React.PropTypes.oneOf(['default', 'dotted', 'dashed']),
    classPrefix: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'divider',
      theme: 'default'
    };
  },

  render: function render() {
    var classSet = this.getClassSet();

    return React.createElement('hr', _extends({}, this.props, {
      'data-am-widget': this.props.classPrefix,
      className: classNames(this.props.className, classSet) }));
  }
});

module.exports = Divider;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],36:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var constants = require('./constants');
var Button = require('./Button');
var Icon = require('./Icon');
var Events = require('./utils/Events');
var isNodeInTree = require('./utils/isNodeInTree');

var Dropdown = React.createClass({
  displayName: 'Dropdown',

  mixins: [ClassNameMixin],

  propTypes: {
    title: React.PropTypes.node.isRequired,
    dropup: React.PropTypes.bool,
    navItem: React.PropTypes.bool,
    btnStyle: React.PropTypes.string,
    btnInlineStyle: React.PropTypes.object,
    contentInlineStyle: React.PropTypes.object,
    contentTag: React.PropTypes.node,
    toggleClassName: React.PropTypes.string,
    caretClassName: React.PropTypes.string,
    contentClassName: React.PropTypes.string,
    onOpen: React.PropTypes.func, // open callback
    onClose: React.PropTypes.func // close callback
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'dropdown',
      contentTag: 'ul'
    };
  },

  getInitialState: function getInitialState() {
    return {
      open: false
    };
  },

  componentWillMount: function componentWillMount() {
    this.unbindOuterHandlers();
  },

  componentWillUnmount: function componentWillUnmount() {
    this.unbindOuterHandlers();
  },

  setDropdownState: function setDropdownState(state, callback) {
    if (state) {
      this.bindOuterHandlers();
    } else {
      this.unbindOuterHandlers();
    }

    this.setState({
      open: state
    }, function () {
      callback && callback();

      state && this.props.onOpen && this.props.onOpen();
      !state && this.props.onClose && this.props.onClose();
    });
  },

  // close dropdown on `esc` keyup
  handleKeyup: function handleKeyup(e) {
    e.keyCode === 27 && this.setDropdownState(false);
  },

  // close dropdown when click outer dropdown
  handleOuterClick: function handleOuterClick(e) {
    if (isNodeInTree(e.target, React.findDOMNode(this))) {
      return false;
    }

    this.setDropdownState(false);
  },

  bindOuterHandlers: function bindOuterHandlers() {
    Events.on(document, 'click', this.handleOuterClick);
    Events.on(document, 'keyup', this.handleKeyup);
  },

  unbindOuterHandlers: function unbindOuterHandlers() {
    Events.off(document, 'click', this.handleOuterClick);
    Events.off(document, 'keyup', this.handleKeyup);
  },

  handleDropdownClick: function handleDropdownClick(e) {
    e.preventDefault();

    this.setDropdownState(!this.state.open);
  },

  render: function render() {
    var classSet = this.getClassSet();
    var Component = this.props.navItem ? 'li' : 'div';
    var caret = React.createElement(Icon, {
      className: this.props.caretClassName,
      icon: 'caret-' + (this.props.dropup ? 'up' : 'down') });
    var animation = this.state.open ? this.setClassNamespace('animation-slide-top-fixed') : this.setClassNamespace('dropdown-animation');
    var ContentTag = this.props.contentTag;

    classSet[constants.CLASSES.active] = this.state.open;
    classSet[this.prefixClass('up')] = this.props.dropup;

    return React.createElement(
      Component,
      {
        btnStyle: null,
        className: classNames(this.props.className, classSet) },
      React.createElement(
        Button,
        {
          onClick: this.handleDropdownClick,
          amStyle: this.props.btnStyle,
          style: this.props.btnInlineStyle,
          className: classNames(this.prefixClass('toggle'), this.props.toggleClassName),
          ref: 'dropdownToggle' },
        this.props.title,
        ' ',
        caret
      ),
      React.createElement(
        ContentTag,
        {
          ref: 'dropdownContent',
          style: this.props.contentInlineStyle,
          className: classNames(this.prefixClass('content'), animation, this.props.contentClassName) },
        this.props.children
      )
    );
  }
});

Dropdown.Item = React.createClass({
  displayName: 'Item',

  mixins: [ClassNameMixin],

  propTypes: {
    href: React.PropTypes.string,
    target: React.PropTypes.string,
    title: React.PropTypes.string,
    header: React.PropTypes.bool,
    divider: React.PropTypes.bool
  },

  render: function render() {
    var classSet = this.getClassSet();
    var children = null;

    classSet[this.setClassNamespace('dropdown-header')] = this.props.header;

    if (this.props.header) {
      children = this.props.children;
    } else if (!this.props.divider) {
      children = React.createElement(
        'a',
        {
          onClick: this.handleClick,
          href: this.props.href,
          target: this.props.target,
          title: this.props.title },
        this.props.children
      );
    }

    return React.createElement(
      'li',
      _extends({}, this.props, {
        title: null,
        href: null,
        className: classNames(this.props.className, classSet) }),
      children
    );
  }
});

module.exports = Dropdown;

/*
* TODO:
*   1. 关闭动画
*   2. 位置检测/宽度适应
* */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Button":24,"./Icon":45,"./constants":77,"./mixins/ClassNameMixin":78,"./utils/Events":85,"./utils/isNodeInTree":93,"classnames":2}],37:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Footer = React.createClass({
  displayName: 'Footer',

  mixins: [ClassNameMixin],

  propTypes: {
    theme: React.PropTypes.oneOf(['default']),
    classPrefix: React.PropTypes.string,
    mobileTitle: React.PropTypes.string,
    mobileLink: React.PropTypes.string,
    desktopTitle: React.PropTypes.string,
    desktopLink: React.PropTypes.string,
    onRequestMobile: React.PropTypes.func,
    onRequestDesktop: React.PropTypes.func,
    data: React.PropTypes.array
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'footer',
      theme: 'default',
      mobileTitle: '适配版',
      desktopTitle: '电脑版'
    };
  },

  render: function render() {
    var classSet = this.getClassSet();
    var MobileTag = this.props.mobileLink ? 'a' : 'span';

    return React.createElement(
      'footer',
      _extends({}, this.props, {
        'data-am-widget': this.props.classPrefix,
        className: classNames(this.props.className, classSet) }),
      React.createElement(
        'div',
        { className: this.prefixClass('switch') },
        React.createElement(
          MobileTag,
          {
            className: this.prefixClass('ysp'),
            onClick: this.props.onRequestMobile,
            href: this.props.mobileLink,
            'data-rel': 'mobile' },
          this.props.mobileTitle
        ),
        React.createElement(
          'span',
          { className: this.prefixClass('divider') },
          '|'
        ),
        React.createElement(
          'a',
          {
            'data-rel': 'desktop',
            href: this.props.desktopLink,
            onClick: this.props.onRequestDesktop,
            className: this.prefixClass('desktop') },
          this.props.desktopTitle
        )
      ),
      React.createElement(
        'div',
        { className: this.prefixClass('miscs') },
        this.props.data ? this.props.data.map(function (item, i) {
          return React.createElement(
            'p',
            { key: i },
            item
          );
        }) : this.props.children
      )
    );
  }
});

module.exports = Footer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],38:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Form = React.createClass({
  displayName: 'Form',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    horizontal: React.PropTypes.bool,
    inline: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'form'
    };
  },

  render: function render() {
    var classSet = this.getClassSet();

    classSet[this.prefixClass('horizontal')] = this.props.horizontal;
    classSet[this.prefixClass('inline')] = this.props.inline;

    return React.createElement(
      'form',
      _extends({}, this.props, {
        className: classNames(classSet, this.props.className) }),
      this.props.children
    );
  }
});

module.exports = Form;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],39:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Button = require('./Button');
var Input = require('./Input');

var FormFile = React.createClass({
  displayName: 'FormFile',

  mixins: [ClassNameMixin],

  propTypes: {},

  getDefaultProps: function getDefaultProps() {
    return {};
  },

  render: function render() {
    return React.createElement(
      FormGroup,
      {
        className: this.setClassNamespace('form-file') },
      React.createElement(Input, { type: 'file', standalone: true })
    );
  }
});

module.exports = FormFile;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Button":24,"./Input":47,"./mixins/ClassNameMixin":78,"classnames":2}],40:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var FormGroup = React.createClass({
  displayName: 'FormGroup',

  mixins: [ClassNameMixin],

  propTypes: {
    validation: React.PropTypes.string,
    amSize: React.PropTypes.oneOf(['sm', 'lg']),
    hasFeedback: React.PropTypes.bool
  },

  render: function render() {
    var classSet = {};

    classSet[this.setClassNamespace('form-group')] = true;
    this.props.validation && (classSet[this.setClassNamespace('form-' + this.props.validation)] = true);
    classSet[this.setClassNamespace('form-feedback')] = this.props.hasFeedback;
    classSet[this.setClassNamespace('form-icon')] = this.props.hasFeedback;

    if (this.props.amSize) {
      classSet[this.setClassNamespace('form-group-' + this.props.amSize)] = true;
    }

    return React.createElement(
      'div',
      { className: classNames(classSet, this.props.className) },
      this.props.children
    );
  }
});

module.exports = FormGroup;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],41:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var AvgGrid = require('./AvgGrid');
var omit = require('object.omit');

var Gallery = React.createClass({
  displayName: 'Gallery',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    theme: React.PropTypes.oneOf(['default', 'overlay', 'bordered', 'imgbordered']),
    data: React.PropTypes.array,
    sm: React.PropTypes.number,
    md: React.PropTypes.number,
    lg: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'gallery',
      theme: 'default',
      data: []
    };
  },

  renderItem: function renderItem(item) {
    var img = item.img ? React.createElement('img', {
      src: item.img,
      key: 'galeryImg',
      alt: item.alt || item.title || null }) : null;
    var title = item.title ? React.createElement(
      'h3',
      {
        key: 'galleryTitle',
        className: this.prefixClass('title') },
      item.title
    ) : null;
    var desc = item.desc ? React.createElement(
      'div',
      {
        key: 'galleryDesc',
        className: this.prefixClass('desc') },
      item.desc
    ) : null;
    var galleryItem = item.link ? React.createElement(
      'a',
      { href: item.link },
      img,
      title,
      desc
    ) : [img, title, desc];

    return React.createElement(
      'div',
      {
        className: classNames(this.props.className, this.prefixClass('item')) },
      galleryItem
    );
  },

  render: function render() {
    var classSet = this.getClassSet();
    var props = omit(this.props, ['classPrefix', 'data', 'theme']);

    return React.createElement(
      AvgGrid,
      _extends({}, props, {
        sm: this.props.sm || 2,
        md: this.props.md || 3,
        lg: this.props.lg || 4,
        'data-am-widget': this.props.classPrefix,
        className: classNames(this.props.className, classSet) }),
      this.props.data.map((function (item, i) {
        return React.createElement(
          'li',
          { key: i },
          this.renderItem(item)
        );
      }).bind(this))
    );
  }
});

module.exports = Gallery;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AvgGrid":21,"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],42:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var SmoothScrollMixin = require('./mixins/SmoothScrollMixin');
var Events = require('./utils/Events');
var debounce = require('./utils/debounce');
var dom = require('./utils/domUtils');
var CSSCore = require('./utils/CSSCore');
var Icon = require('./Icon');

var GoTop = React.createClass({
  displayName: 'GoTop',

  mixins: [ClassNameMixin, SmoothScrollMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    theme: React.PropTypes.oneOf(['default', 'fixed']),
    title: React.PropTypes.string,
    src: React.PropTypes.string,
    icon: React.PropTypes.string,
    autoHide: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'gotop',
      theme: 'default'
    };
  },

  componentDidMount: function componentDidMount() {
    if (this.isAutoHide()) {
      var check = this.checkPosition;

      check();

      this._listener = Events.on(window, 'scroll', debounce(check, 100));
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    this._listener && this._listener.off();
  },

  checkPosition: function checkPosition() {
    var action = (dom.scrollTop(window) > 50 ? 'add' : 'remove') + 'Class';

    CSSCore[action](React.findDOMNode(this), this.setClassNamespace('active'));
  },

  isAutoHide: function isAutoHide() {
    return this.props.theme === 'fixed' && this.props.autoHide;
  },

  handleClick: function handleClick(e) {
    e.preventDefault();
    this.smoothScroll();
  },

  renderIcon: function renderIcon() {
    return this.props.src ? React.createElement('img', {
      className: this.prefixClass('icon-custom'),
      src: this.props.src,
      alt: this.props.title }) : React.createElement(Icon, {
      className: this.prefixClass('icon'),
      icon: this.props.icon || 'chevron-up' });
  },

  render: function render() {
    var classSet = this.getClassSet();

    classSet[this.prefixClass(this.props.theme)] = true;
    classSet[this.setClassNamespace('active')] = !this.isAutoHide();

    return React.createElement(
      'div',
      _extends({}, this.props, {
        'data-am-widget': this.props.classPrefix,
        className: classNames(classSet, this.props.className) }),
      React.createElement(
        'a',
        {
          href: '#top',
          onClick: this.handleClick,
          title: this.props.title },
        this.props.title ? React.createElement(
          'span',
          { className: this.prefixClass('title') },
          this.props.title
        ) : null,
        this.renderIcon()
      )
    );
  }
});

module.exports = GoTop;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Icon":45,"./mixins/ClassNameMixin":78,"./mixins/SmoothScrollMixin":82,"./utils/CSSCore":84,"./utils/Events":85,"./utils/debounce":89,"./utils/domUtils":90,"classnames":2}],43:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Grid = React.createClass({
  displayName: 'Grid',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    componentTag: React.PropTypes.node.isRequired,
    collapse: React.PropTypes.bool,
    fixed: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'g',
      componentTag: 'div'
    };
  },

  render: function render() {
    var Component = this.props.componentTag;
    var classSet = this.getClassSet();
    var props = this.props;

    // .am-g-fixed
    classSet[this.prefixClass('fixed')] = props.fixed;

    // .am-g-collapse
    classSet[this.prefixClass('collapse')] = props.collapse;

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      this.props.children
    );
  }
});

module.exports = Grid;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],44:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Icon = require('./Icon');
var omit = require('object.omit');

var Header = React.createClass({
  displayName: 'Header',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    theme: React.PropTypes.oneOf(['default']),
    data: React.PropTypes.object,
    fixed: React.PropTypes.bool,
    title: React.PropTypes.node,
    subTitle: React.PropTypes.string,
    link: React.PropTypes.string,
    callback: React.PropTypes.func,
    onSelect: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'header',
      theme: 'default',
      onSelect: function onSelect() {}
    };
  },

  renderTitle: function renderTitle() {
    var subTitleClass = this.props.subTitle ? 'subtitle' : '';
    return this.props.title ? React.createElement(
      'h1',
      {
        className: this.prefixClass('title ' + subTitleClass),
        onClick: this.props.onSelect.bind(this, {
          title: this.props.title,
          link: this.props.link
        }) },
      this.props.link ? React.createElement(
        'a',
        { href: this.props.link },
        this.props.title
      ) : this.props.title,
      this.props.subTitle ? React.createElement(
        'small',
        { className: this.prefixClass(subTitleClass) },
        this.props.subTitle
      ) : ''
    ) : null;
  },

  renderNav: function renderNav(position) {
    var data = this.props.data;
    var renderItem = (function (item, i) {
      //这里检测 callback 是否为函数
      var callback = typeof item.callback === 'function' ? item.callback : this.props.onSelect;
      return React.createElement(
        'a',
        { href: item.link,
          onClick: callback.bind(this, item),
          key: 'headerNavItem' + i },
        item.title ? React.createElement(
          'span',
          { className: this.prefixClass('nav-title') },
          item.title
        ) : null,
        item.customIcon ? React.createElement('img', { src: item.customIcon, alt: item.title || null }) : item.icon ? React.createElement(Icon, {
          className: this.prefixClass('icon'),
          icon: item.icon }) : null
      );
    }).bind(this);

    return data && data[position] ? React.createElement(
      'div',
      {
        className: classNames(this.prefixClass('nav'), this.prefixClass(position)) },
      data[position].map(function (item, i) {
        return renderItem(item, i);
      })
    ) : null;
  },

  render: function render() {
    var classSet = this.getClassSet();

    // am-header-fixed: fixed header
    classSet[this.prefixClass('fixed')] = this.props.fixed;

    return React.createElement(
      'header',
      _extends({}, omit(this.props, ['data', 'title']), {
        'data-am-widget': this.props.classPrefix,
        className: classNames(this.props.className, classSet) }),
      this.renderNav('left'),
      this.renderTitle(),
      this.renderNav('right')
    );
  }
});

module.exports = Header;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Icon":45,"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],45:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Icon = React.createClass({
  displayName: 'Icon',

  mixins: [ClassNameMixin],

  propTypes: {
    amStyle: React.PropTypes.string,
    fw: React.PropTypes.bool,
    spin: React.PropTypes.bool,
    button: React.PropTypes.bool,
    size: React.PropTypes.string,
    href: React.PropTypes.string,
    componentTag: React.PropTypes.node.isRequired,
    icon: React.PropTypes.string.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'icon',
      componentTag: 'span'
    };
  },

  render: function render() {
    var classes = this.getClassSet(true);
    var props = this.props;
    var Component = props.href ? 'a' : props.componentTag;
    var prefixClass = this.prefixClass;
    var setClassNamespace = this.setClassNamespace;

    // am-icon-[iconName]
    classes[prefixClass(props.icon)] = true;

    // am-icon-btn
    classes[prefixClass('btn')] = props.button;

    // button style
    props.button && props.amStyle && (classes[setClassNamespace(props.amStyle)] = true);

    // am-icon-fw
    classes[prefixClass('fw')] = props.fw;

    // am-icon-spin
    classes[prefixClass('spin')] = props.spin;

    return React.createElement(
      Component,
      _extends({}, props, {
        className: classNames(classes, this.props.className) }),
      this.props.children
    );
  }
});

module.exports = Icon;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],46:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var constants = require('./constants');

var Image = React.createClass({
  displayName: 'Image',

  mixins: [ClassNameMixin],

  propTypes: {
    src: React.PropTypes.string.isRequired,
    circle: React.PropTypes.bool,
    radius: React.PropTypes.bool,
    round: React.PropTypes.bool,
    responsive: React.PropTypes.bool,
    thumbnail: React.PropTypes.bool,
    placeholder: React.PropTypes.string,
    threshold: React.PropTypes.number,
    callback: React.PropTypes.func,
    asBgImage: React.PropTypes.bool
  },

  render: function render() {
    var classSet = {};

    classSet[constants.CLASSES.radius] = this.props.radius;
    classSet[constants.CLASSES.round] = this.props.round;
    classSet[constants.CLASSES.circle] = this.props.circle;
    classSet[this.setClassNamespace('img-responsive')] = this.props.responsive;
    classSet[this.setClassNamespace('img-thumbnail')] = this.props.thumbnail;

    return React.createElement('img', _extends({}, this.props, {
      className: classNames(this.props.className, classSet) }));
  }
});

module.exports = Image;

/*
TODO:
- srcset/sizes 支持
  - http://caniuse.com/#feat=srcset
  - http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset
  - https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-srcset/
- lazyload
- asBackground ?
*/
/*
 http://odin.s0.no/web/srcset/polyfill.htm
 https://github.com/borismus/srcset-polyfill
 https://github.com/JimBobSquarePants/srcset-polyfill
 http://www.html5rocks.com/en/mobile/high-dpi/
 http://www.html5rocks.com/en/tutorials/responsive/picture-element/
 https://ericportis.com/posts/2014/srcset-sizes/

 gif 占位符
 http://proger.i-forge.net/The_smallest_transparent_pixel/eBQ
 http://stackoverflow.com/questions/9126105/blank-image-encoded-as-data-uri
*/

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./constants":77,"./mixins/ClassNameMixin":78,"classnames":2}],47:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Inputs Components
 * @desc includes input, input-group
 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var FormGroup = require('./FormGroup');
var Button = require('./Button');
var Icon = require('./Icon');
var constants = require('./constants');

var Input = React.createClass({
  displayName: 'Input',

  mixins: [ClassNameMixin],

  propTypes: {
    type: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    radius: React.PropTypes.bool,
    round: React.PropTypes.bool,
    amSize: React.PropTypes.oneOf(['sm', 'lg']),
    amStyle: React.PropTypes.string,
    validation: React.PropTypes.oneOf(['success', 'warning', 'error']),
    label: React.PropTypes.node,
    help: React.PropTypes.node,
    addonBefore: React.PropTypes.node,
    addonAfter: React.PropTypes.node,
    btnBefore: React.PropTypes.node,
    btnAfter: React.PropTypes.node,
    id: React.PropTypes.string,
    groupClassName: React.PropTypes.string,
    wrapperClassName: React.PropTypes.string,
    labelClassName: React.PropTypes.string,
    helpClassName: React.PropTypes.string,
    icon: React.PropTypes.string,
    standalone: React.PropTypes.bool,
    inline: React.PropTypes.bool,
    hasFeedback: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      type: 'text'
    };
  },

  getFieldDOMNode: function getFieldDOMNode() {
    return React.findDOMNode(this.refs.field);
  },

  getValue: function getValue() {
    if (this.props.type === 'select' && this.props.multiple) {
      return this.getSelectedOptions();
    } else {
      return this.getFieldDOMNode().value;
    }
  },

  getChecked: function getChecked() {
    return this.getFieldDOMNode().checked;
  },

  getSelectedOptions: function getSelectedOptions() {
    var values = [];
    var options = this.getFieldDOMNode().getElementsByTagName('option');

    options.forEach(function (option) {
      if (option.selected) {
        var value = option.getAttribute('value') || option.innerHtml;

        values.push(value);
      }
    });

    return values;
  },

  isCheckboxOrRadio: function isCheckboxOrRadio() {
    return this.props.type === 'radio' || this.props.type === 'checkbox';
  },

  isFile: function isFile() {
    return this.props.type === 'file';
  },

  renderInput: function renderInput() {
    var input = null;
    var fieldClassName = this.isCheckboxOrRadio() || this.isFile() ? '' : this.setClassNamespace('form-field');
    var classSet = {};

    classSet[constants.CLASSES.round] = this.props.round;
    classSet[constants.CLASSES.radius] = this.props.radius;

    if (this.props.amSize && !this.props.standalone) {
      classSet[this.setClassNamespace('input-' + this.props.amSize)] = true;
    }

    var classes = classNames(this.props.className, fieldClassName, classSet);

    switch (this.props.type) {
      case 'select':
        input = React.createElement(
          'select',
          _extends({}, this.props, {
            className: classes,
            ref: 'field', key: 'field' }),
          this.props.children
        );
        break;
      case 'textarea':
        input = React.createElement('textarea', _extends({}, this.props, {
          className: classes,
          ref: 'field',
          key: 'field' }));
        break;
      case 'submit':
      case 'reset':
        input = React.createElement(Button, _extends({}, this.props, {
          componentTag: 'input',
          ref: 'field',
          key: 'field' }));
        break;
      default:
        input = React.createElement('input', _extends({}, this.props, {
          className: classes,
          ref: 'field',
          key: 'field' }));
    }

    return input;
  },

  // Input wrapper if wrapperClassName set
  renderWrapper: function renderWrapper(children) {
    return this.props.wrapperClassName ? React.createElement(
      'div',
      {
        className: this.props.wrapperClassName,
        key: 'wrapper' },
      children
    ) : children;
  },

  // Wrap block checkbox/radio
  renderCheckboxAndRadioWrapper: function renderCheckboxAndRadioWrapper(children) {
    // Don't wrap inline checkbox/radio
    return this.props.inline ? children : React.createElement(
      'div',
      {
        className: this.setClassNamespace(this.props.type),
        key: 'checkboxAndRadioWrapper' },
      children
    );
  },

  renderLabel: function renderLabel(children) {
    // label doesn't work with icon
    /*if (this.props.icon) {
      return null;
    }*/

    var classSet = {};

    if (this.isCheckboxOrRadio()) {
      // inline checkbox and radio
      this.props.inline && (classSet[this.setClassNamespace(this.props.type + '-inline')] = true);
    } else {
      // normal form label
      classSet[this.setClassNamespace('form-label')] = true;
    }

    return this.props.label ? React.createElement(
      'label',
      {
        htmlFor: this.props.id,
        className: classNames(this.props.labelClassName, classSet),
        key: 'label' },
      children,
      this.props.label
    ) : children;
  },

  renderInputGroup: function renderInputGroup(children) {
    var groupPrefix = this.setClassNamespace('input-group');
    var addonClassName = groupPrefix + '-label';
    var btnClassName = groupPrefix + '-btn';
    var addonBefore = this.props.addonBefore ? React.createElement(
      'span',
      { className: addonClassName, key: 'addonBefore' },
      this.props.addonBefore
    ) : null;
    var addonAfter = this.props.addonAfter ? React.createElement(
      'span',
      { className: addonClassName, key: 'addonAfter' },
      this.props.addonAfter
    ) : null;
    var btnBefore = this.props.btnBefore ? React.createElement(
      'span',
      { className: btnClassName, key: 'btnBefore' },
      this.props.btnBefore
    ) : null;
    var btnAfter = this.props.btnAfter ? React.createElement(
      'span',
      { className: btnClassName, key: 'btnAfter' },
      this.props.btnAfter
    ) : null;
    var classSet = {};

    if (this.props.amSize) {
      classSet[groupPrefix + '-' + this.props.amSize] = true;
    }

    if (this.props.amStyle) {
      classSet[groupPrefix + '-' + this.props.amStyle] = true;
    }

    return addonBefore || addonAfter || btnBefore || btnAfter ? React.createElement(
      'div',
      {
        className: classNames(groupPrefix, classSet),
        key: 'inputGroup' },
      addonBefore,
      btnBefore,
      children,
      addonAfter,
      btnAfter
    ) : children;
  },

  // form help
  renderHelp: function renderHelp() {
    return this.props.help ? React.createElement(
      'p',
      {
        className: classNames(this.setClassNamespace('form-help'), this.props.helpClassName),
        key: 'help' },
      this.props.help
    ) : '';
  },

  renderIcon: function renderIcon() {
    // TODO: replace with Icon component
    var props = this.props;
    var feedbackIcon = {
      success: 'check',
      warning: 'warning',
      error: 'times'
    };
    var icon = props.icon || props.hasFeedback && props.validation && feedbackIcon[props.validation];

    return icon ? React.createElement(Icon, { icon: icon, key: 'icon' }) : null;
  },

  render: function render() {
    // standalone mode
    if (this.props.standalone) {
      return this.renderInput();
    }

    // render checkbox and radio, without FormGroup wrapper
    if (this.isCheckboxOrRadio()) {
      return this.renderWrapper(this.renderCheckboxAndRadioWrapper(this.renderLabel(this.renderInput())));
    }

    var groupClassName = classNames(this.props.type === 'select' ? this.setClassNamespace('form-select') : null, this.props.icon && this.setClassNamespace('form-icon'), this.props.groupClassName);

    return React.createElement(
      FormGroup,
      {
        className: groupClassName,
        validation: this.props.validation,
        amSize: this.props.amSize,
        hasFeedback: this.props.hasFeedback },
      [this.renderLabel(), this.renderWrapper(this.renderInputGroup(this.renderInput())), this.renderIcon(), this.renderHelp()]
    );
  }
});

module.exports = Input;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Button":24,"./FormGroup":40,"./Icon":45,"./constants":77,"./mixins/ClassNameMixin":78,"classnames":2}],48:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var List = React.createClass({
  displayName: 'List',

  mixins: [ClassNameMixin],

  propTypes: {
    border: React.PropTypes.bool,
    striped: React.PropTypes.bool,
    'static': React.PropTypes.bool,
    componentTag: React.PropTypes.node.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'list',
      componentTag: 'ul'
    };
  },

  render: function render() {
    var classes = this.getClassSet();
    var Component = this.props.componentTag;
    var props = this.props;
    var prefixClass = this.prefixClass;

    // am-list-border
    classes[prefixClass('border')] = props.border;

    // am-list-striped
    classes[prefixClass('striped')] = props.striped;

    // am-list-static
    classes[prefixClass('static')] = props['static'];

    return React.createElement(
      Component,
      _extends({}, props, {
        className: classNames(classes, props.className) }),
      props.children
    );
  }
});

module.exports = List;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],49:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var ListItem = React.createClass({
  displayName: 'ListItem',

  mixins: [ClassNameMixin],

  propTypes: {
    href: React.PropTypes.string,
    truncate: React.PropTypes.bool,
    componentTag: React.PropTypes.node.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      componentTag: 'li'
    };
  },

  render: function render() {
    var classes = {};
    var Component = this.props.componentTag;

    // set .am-text-truncate
    classes['am-text-truncate'] = this.props.truncate;

    // render Anchor
    if (this.props.href) {
      return this.renderAnchor(classes);
    }

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(classes, this.props.className) }),
      this.props.children
    );
  },

  renderAnchor: function renderAnchor(classes) {
    var props = this.props;
    var Component = props.componentTag;
    var truncate = props.truncate ? 'am-text-truncate' : '';

    return React.createElement(
      Component,
      _extends({}, props, {
        className: classNames(classes, this.props.className) }),
      React.createElement(
        'a',
        {
          className: truncate,
          href: this.props.href,
          title: this.props.title,
          target: this.props.target },
        this.props.children
      )
    );
  }
});

module.exports = ListItem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],50:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Button = require('./Button');
var Col = require('./Col');

var ListNews = React.createClass({
  displayName: 'ListNews',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    theme: React.PropTypes.oneOf(['default']),
    data: React.PropTypes.object,
    header: React.PropTypes.node,
    footer: React.PropTypes.node,
    morePosition: React.PropTypes.oneOf(['top', 'bottom']),
    moreText: React.PropTypes.string,
    thumbPosition: React.PropTypes.oneOf(['top', 'left', 'right', 'bottom-left', 'bottom-right'])
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'list-news',
      theme: 'default',
      moreText: '更多 »'
    };
  },

  renderHeader: function renderHeader() {
    var data = this.props.data;

    return data && data.header && data.header.title ? React.createElement(
      'div',
      {
        className: classNames(this.prefixClass('hd'), this.setClassNamespace('cf')) },
      data.header.link ? React.createElement(
        'a',
        { href: data.header.link },
        React.createElement(
          'h2',
          null,
          data.header.title
        ),
        this.props.morePosition === 'top' ? React.createElement(
          'span',
          {
            className: classNames(this.prefixClass('more'), this.setClassNamespace('fr')) },
          this.props.moreText
        ) : null
      ) : React.createElement(
        'h2',
        null,
        data.header.title
      )
    ) : null;
  },

  // `more` on bottom
  renderFooter: function renderFooter() {
    return this.props.morePosition === 'bottom' && this.props.data.header.link ? React.createElement(
      'div',
      { className: this.prefixClass('ft') },
      React.createElement(
        Button,
        {
          className: this.prefixClass('more'),
          href: this.props.data.header.link },
        this.props.moreText
      )
    ) : null;
  },

  getListItemClasses: function getListItemClasses(item) {
    return classNames(this.setClassNamespace('g'), item.date ? this.setClassNamespace('list-item-dated') : false, item.desc ? this.setClassNamespace('list-item-desced') : false, item.img ? this.setClassNamespace('list-item-thumbed') : false, this.props.thumbPosition ? this.setClassNamespace('list-item-thumb-' + this.props.thumbPosition) : false);
  },

  renderBody: function renderBody(children) {
    return React.createElement(
      'div',
      { className: this.prefixClass('bd') },
      React.createElement(
        'ul',
        { className: this.setClassNamespace('list') },
        children
      )
    );
  },

  renderList: function renderList() {
    var position = this.props.thumbPosition;
    var orderChildren = (function (item, i) {
      var thumb = this.renderItemThumb(item, i);
      var main = this.renderItemMain(item, i);

      return position === 'right' || position === 'bottom-right' ? [main, thumb] : [thumb, main];
    }).bind(this);

    return this.props.data.main.map((function (item, i) {
      return React.createElement(
        'li',
        {
          key: i,
          className: this.getListItemClasses(item) },
        position === 'bottom-left' || position === 'bottom-right' ? this.renderThumbItemTitle(item) : null,
        orderChildren(item, i)
      );
    }).bind(this));
  },

  renderItemMisc: function renderItemMisc(item, type) {
    var Tag = type === 'date' ? 'span' : 'div';
    var className;

    switch (type) {
      case 'date':
        className = 'list-date';
        break;
      case 'desc':
        className = 'list-item-text';
        break;
      case 'mainAddition':
        className = 'list-news-addon';
        break;
      case 'thumbAddition':
        className = 'list-thumb-addon';
    }

    return item[type] ? React.createElement(
      Tag,
      { className: this.setClassNamespace(className) },
      item[type]
    ) : null;
  },

  renderItemThumb: function renderItemThumb(item, i) {
    var cols = this.props.thumbPosition === 'top' ? 12 : 4;

    return item.img ? React.createElement(
      Col,
      {
        key: 'thumb' + i,
        sm: cols,
        className: this.setClassNamespace('list-thumb') },
      React.createElement(
        'a',
        { href: item.link },
        React.createElement('img', { src: item.img, alt: item.title })
      ),
      this.renderItemMisc(item, 'thumbAddition')
    ) : null;
  },

  renderItemMain: function renderItemMain(item, i) {
    var position = this.props.thumbPosition;
    var date = this.renderItemMisc(item, 'date');
    var desc = this.renderItemMisc(item, 'desc');
    var addon = this.renderItemMisc(item, 'mainAddition');
    // title of list without thumbnail
    var itemWithoutThumbTitle = !position && item.title ? React.createElement(
      'a',
      {
        key: 'title' + i,
        className: this.setClassNamespace('list-item-hd'),
        href: item.link },
      item.title
    ) : null;
    var cols = position === 'top' ? 12 : item.img ? 8 : 12;

    return position ? React.createElement(
      Col,
      {
        sm: cols,
        className: this.setClassNamespace('list-main'),
        key: 'itemMain' + i },
      position !== 'bottom-left' && position !== 'bottom-right' ? this.renderThumbItemTitle(item) : null,
      date,
      desc,
      addon
    ) : [itemWithoutThumbTitle, date, desc, addon];
  },

  renderThumbItemTitle: function renderThumbItemTitle(item) {
    return item.title ? React.createElement(
      'h3',
      { className: this.setClassNamespace('list-item-hd') },
      React.createElement(
        'a',
        { href: item.link },
        item.title
      )
    ) : null;
  },

  render: function render() {
    var classSet = this.getClassSet();

    return React.createElement(
      'div',
      _extends({}, this.props, {
        'data-am-widget': this.props.classPrefix,
        className: classNames(this.props.className, classSet) }),
      this.props.header || this.renderHeader(),
      this.renderBody(this.renderList()),
      this.props.footer || this.renderFooter()
    );
  }
});

module.exports = ListNews;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Button":24,"./Col":29,"./mixins/ClassNameMixin":78,"classnames":2}],51:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Icon = require('./Icon');
var AvgGrid = require('./AvgGrid');
var omit = require('object.omit');

var Menu = React.createClass({
  displayName: 'Menu',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    theme: React.PropTypes.oneOf(['default', 'dropdown1', 'dropdown2', 'slide1', 'stack']),
    data: React.PropTypes.array,
    onSelect: React.PropTypes.func,
    toggleTitle: React.PropTypes.string,
    toggleCustomIcon: React.PropTypes.string,
    toggleIcon: React.PropTypes.string,
    cols: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'menu',
      theme: 'default',
      data: [],
      onSelect: function onSelect() {}
    };
  },

  getInitialState: function getInitialState() {
    return {
      data: this.props.data,
      expanded: !this.isDropdown()
    };
  },

  handleClick: function handleClick(nav, index, closeAll, e) {
    if (nav && nav.subMenu) {
      this.handleParentClick(nav, index, closeAll, e);
    }

    this.props.onSelect.call(this, nav, index, e);
  },

  /**
   * handle nav with subMenu click
   * @param {object} nav - clicked nav
   * @param {number} index - clicked nav index
   * @param {bool} closeAll - close all submenu
   * @param {object} e
   */
  handleParentClick: function handleParentClick(nav, index, closeAll, e) {
    e && e.preventDefault();

    var data = this.state.data.map(function (item, i) {
      item.subActive = closeAll ? false : index === i ? !item.subActive : false;
      return item;
    });

    this.setState({
      data: data
    });
  },

  closeAll: function closeAll() {
    this.handleParentClick(null, null, true, undefined);
  },

  // handle toggle button click for dropdown/slide theme
  handleToggle: function handleToggle(e) {
    e && e.preventDefault();
    this.setState({
      expanded: !this.state.expanded
    }, (function () {
      !this.state.expanded && this.closeAll();
    }).bind(this));
  },

  isDropdown: function isDropdown() {
    return ['dropdown1', 'dropdown2', 'slide1'].indexOf(this.props.theme) > -1;
  },

  renderMenuToggle: function renderMenuToggle() {
    var title = this.props.toggleTitle ? React.createElement(
      'span',
      { className: this.prefixClass('toggle-title') },
      this.props.toggleTitle
    ) : null;
    var icon = this.props.toggleCustomIcon ? React.createElement('img', { src: this.props.toggleCustomIcon, alt: 'Menu Toggle' }) : React.createElement(Icon, {
      className: this.prefixClass('toggle-icon'),
      icon: this.props.toggleIcon || 'bars' });

    return React.createElement(
      'a',
      {
        href: '#',
        onClick: this.handleToggle,
        className: classNames(this.prefixClass('toggle'), this.state.expanded ? this.setClassNamespace('active') : null) },
      title,
      icon
    );
  },

  renderNavs: function renderNavs() {
    var _this = this;
    var openClassName = this.setClassNamespace('open');
    var inClassName = this.setClassNamespace('in');

    return this.state.data.map(function (nav, i) {
      return React.createElement(
        'li',
        {
          key: i,
          className: classNames(nav.subMenu ? _this.setClassNamespace('parent') : null, nav.subActive ? openClassName : null) },
        React.createElement(
          'a',
          {
            onClick: _this.handleClick.bind(_this, nav, i, false),
            href: nav.link },
          nav.title
        ),
        nav.subMenu ? React.createElement(
          AvgGrid,
          {
            sm: nav.subCols || 1,
            className: classNames(_this.prefixClass('sub'), _this.setClassNamespace('collapse'), nav.subActive ? inClassName : null) },
          nav.subMenu.map(function (subNav, index) {
            return React.createElement(
              'li',
              { key: index },
              React.createElement(
                'a',
                {
                  onClick: _this.handleClick.bind(_this, subNav, [i, index], false),
                  target: subNav.target,
                  href: subNav.link },
                subNav.title
              )
            );
          })
        ) : null
      );
    });
  },

  render: function render() {
    var classSet = this.getClassSet();
    var props = omit(this.props, 'data');
    var hideTopLevel = !this.state.expanded ? this.setClassNamespace('collapse') : null;

    return React.createElement(
      'nav',
      _extends({}, props, {
        'data-am-widget': this.props.classPrefix,
        className: classNames(this.props.className, classSet) }),
      this.renderMenuToggle(),
      React.createElement(
        AvgGrid,
        {
          sm: this.props.cols,
          className: classNames(this.prefixClass('nav'), hideTopLevel) },
        this.renderNavs()
      )
    );
  }
});

module.exports = Menu;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AvgGrid":21,"./Icon":45,"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],52:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var DimmerMixin = require('./mixins/DimmerMixin');
var Events = require('./utils/Events');
var Close = require('./Close');
var Icon = require('./Icon');

var Modal = React.createClass({
  displayName: 'Modal',

  mixins: [ClassNameMixin, DimmerMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf(['alert', 'confirm', 'prompt', 'loading', 'loadmask', 'actions', 'popup']),
    title: React.PropTypes.node,
    confirmText: React.PropTypes.string,
    cancelText: React.PropTypes.string,
    closeIcon: React.PropTypes.bool,
    closeViaDimmer: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'modal',
      closeIcon: true,
      confirmText: '确定',
      cancelText: '取消'
    };
  },

  getInitialState: function getInitialState() {
    return {
      transitioning: false
    };
  },

  componentDidMount: function componentDidMount() {
    this._documentKeyupListener = Events.on(document, 'keyup', this.handleDocumentKeyUp, false);

    this.setDimmerContainer();

    // TODO: 何为添加动画效果的最佳时机？ render 完成以后添加动画 Class？
    this.setState({
      transitioning: true
    });
  },

  componentWillUnmount: function componentWillUnmount() {
    this._documentKeyupListener.off();
    this.resetDimmerContainer();
  },

  handleDimmerClick: function handleDimmerClick() {
    if (this.props.closeViaDimmer) {
      this.props.onRequestClose();
    }
  },

  handleBackdropClick: function handleBackdropClick(e) {
    if (e.target !== e.currentTarget) {
      return;
    }

    this.props.onRequestClose();
  },

  handleDocumentKeyUp: function handleDocumentKeyUp(e) {
    if (!this.props.keyboard && e.keyCode === 27) {
      this.props.onRequestClose();
    }
  },

  isPopup: function isPopup() {
    return this.props.type === 'popup';
  },

  isActions: function isActions() {
    return this.props.type === 'actions';
  },

  // Get input data for prompt modal
  getPromptData: function getPromptData() {
    var data = [];
    var inputs = React.findDOMNode(this).querySelectorAll('input');

    if (inputs) {
      var i = 0;

      for (; i < inputs.length; i++) {
        data.push(inputs[i].value);
      }
    }

    return data.length === 0 ? null : data.length === 1 ? data[0] : data;
  },

  handleConfirm: function handleConfirm(e) {
    var data = e;

    if (this.props.type === 'prompt') {
      data = this.getPromptData();
    }

    this.props.onConfirm(data);
  },

  renderActions: function renderActions() {
    return React.createElement(
      'div',
      {
        style: { display: 'block' },
        className: classNames(this.props.className, this.setClassNamespace('modal-actions'), this.setClassNamespace('modal-active')) },
      this.props.children
    );
  },

  renderPopup: function renderPopup() {
    return React.createElement(
      'div',
      {
        style: { display: 'block' },
        className: classNames(this.props.className, this.setClassNamespace('popup'), this.setClassNamespace('modal-active')) },
      React.createElement(
        'div',
        { className: this.setClassNamespace('popup-inner') },
        React.createElement(
          'div',
          { className: this.setClassNamespace('popup-hd') },
          this.props.title ? React.createElement(
            'h4',
            { className: this.setClassNamespace('popup-title') },
            this.props.title
          ) : null,
          React.createElement(Close, { onClick: this.props.onRequestClose })
        ),
        React.createElement(
          'div',
          { className: this.setClassNamespace('popup-bd') },
          this.props.children
        )
      )
    );
  },

  renderHeader: function renderHeader() {
    var title = this.props.title;
    var closeIcon = this.props.closeIcon && !this.props.type ? React.createElement(Close, {
      spin: true,
      onClick: this.props.onRequestClose }) : null;

    return this.props.title || closeIcon ? React.createElement(
      'div',
      { className: this.prefixClass('hd') },
      title ? React.createElement(
        'h4',
        {
          className: this.setClassNamespace('margin-bottom-sm') },
        title
      ) : null,
      closeIcon
    ) : null;
  },

  // Render alert/confirm/prompt buttons
  renderFooter: function renderFooter() {
    var buttons;
    var btnClass = this.prefixClass('btn');
    var props = this.props;

    switch (this.props.type) {
      case 'alert':
        buttons = React.createElement(
          'span',
          {
            onClick: this.props.onConfirm,
            className: btnClass },
          this.props.confirmText
        );
        break;
      case 'confirm':
      case 'prompt':
        buttons = [props.cancelText, props.confirmText].map((function (text, i) {
          return React.createElement(
            'span',
            {
              key: i,
              onClick: i === 0 ? this.props.onCancel : this.handleConfirm,
              className: btnClass },
            text
          );
        }).bind(this));
        break;
      default:
        buttons = null;
    }

    return buttons ? React.createElement(
      'div',
      { className: this.prefixClass('footer') },
      buttons
    ) : null;
  },

  render: function render() {
    if (this.isActions()) {
      return this.renderDimmer(this.renderActions());
    }

    if (this.isPopup()) {
      return this.renderDimmer(this.renderPopup());
    }

    var classSet = this.getClassSet();
    var props = this.props;
    var footer = this.renderFooter();
    var style = {
      display: 'block',
      width: props.modalWidth,
      height: props.modalHeight,
      marginLeft: props.marginLeft,
      marginTop: props.marginTop
    };

    classSet[this.prefixClass('active')] = this.state.transitioning;

    // .am-modal-no-btn -> refactor this style using `~` selector
    classSet[this.prefixClass('no-btn')] = !footer;
    props.type && (classSet[this.prefixClass(props.type)] = true);

    var modal = React.createElement(
      'div',
      _extends({}, props, {
        style: style,
        ref: 'modal',
        title: null,
        className: classNames(classSet, props.className) }),
      React.createElement(
        'div',
        { className: this.prefixClass('dialog') },
        props.type !== 'loadmask' ? this.renderHeader() : function () {},
        React.createElement(
          'div',
          { className: this.prefixClass('bd'), ref: 'modalBody' },
          props.type === 'loadmask' ? React.createElement(Icon, { icon: 'spinner', spin: true }) : props.type === 'loading' ? props.children ? props.children : React.createElement(Icon, { icon: 'spinner', spin: true }) : props.children
        ),
        footer
      )
    );

    return this.renderDimmer(modal);
  }
});

module.exports = Modal;

// TODO: Modal 动画效果实现
// -> 如何关闭 Loading Modal?
// -> 关闭 Modal 以后窗口滚动会原来滚动条所在位置

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Close":28,"./Icon":45,"./mixins/ClassNameMixin":78,"./mixins/DimmerMixin":80,"./utils/Events":85,"classnames":2}],53:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var cloneElement = React.cloneElement;
var OverlayMixin = require('./mixins/OverlayMixin');
var DimmerMixin = require('./mixins/DimmerMixin');
var createChainedFunction = require('./utils/createChainedFunction');

var ModalTrigger = React.createClass({
  displayName: 'ModalTrigger',

  mixins: [OverlayMixin, DimmerMixin],

  propTypes: {
    modal: React.PropTypes.node.isRequired,
    onConfirm: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    title: React.PropTypes.string
  },

  getInitialState: function getInitialState() {
    return {
      isModalActive: false,
      modalWidth: null,
      modalMarginLeft: null,
      modalHeight: null,
      modalMarginTop: null
    };
  },

  open: function open() {
    this.setState({
      isModalActive: true
    }, this.setModalStyle);
  },

  close: function close() {
    this.setState({
      isModalActive: false
    });
  },

  toggle: function toggle() {
    if (this.state.isModalActive) {
      this.close();
    } else {
      this.open();
    }
  },

  setModalStyle: function setModalStyle() {
    if (!this.isMounted()) {
      return;
    }

    // TODO: selector
    var modal = this.getOverlayDOMNode().querySelector('.am-modal');

    if (!modal) {
      return;
    }

    var style = {};

    if (this.props.modalHeight) {
      style.modalHeight = this.props.modalHeight;
      style.modalMarginTop = -this.props.height / 2;
    } else {
      style.modalMarginTop = -modal.offsetHeight / 2;
    }

    if (this.props.modalWidth) {
      style.modalWidth = this.props.modalWidth;
      style.modalMarginLeft = -this.props.modalWidth / 2;
    }

    this.setState(style);
  },

  // overlay is the modal
  renderOverlay: function renderOverlay() {
    if (!this.state.isModalActive) {
      return React.createElement('span', null);
    }

    return cloneElement(this.props.modal, {
      onRequestClose: this.close,
      marginTop: this.state.modalMarginTop,
      marginLeft: this.state.modalMarginLeft,
      modalWidth: this.state.modalWidth,
      modalHeight: this.state.modalHeight,
      title: this.props.modal.props.title || this.props.title,
      onConfirm: createChainedFunction(this.close, this.props.onConfirm),
      onCancel: createChainedFunction(this.close, this.props.onCancel)
    });
  },

  render: function render() {
    var child = React.Children.only(this.props.children);
    var props = {};

    props.onClick = createChainedFunction(child.props.onClick, this.toggle);
    props.onMouseOver = createChainedFunction(child.props.onMouseOver, this.props.onMouseOver);
    props.onMouseOut = createChainedFunction(child.props.onMouseOut, this.props.onMouseOut);
    props.onFocus = createChainedFunction(child.props.onFocus, this.props.onFocus);
    props.onBlur = createChainedFunction(child.props.onBlur, this.props.onBlur);

    return cloneElement(child, props);
  }
});

module.exports = ModalTrigger;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/DimmerMixin":80,"./mixins/OverlayMixin":81,"./utils/createChainedFunction":87}],54:[function(require,module,exports){
(function (global){
'use strict';

/**
 * React version of NProgress
 * https://github.com/rstacruz/nprogress/
 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var ClassNameMixin = require('./mixins/ClassNameMixin');

function clamp(n, min, max) {
  if (n < min) {
    return min;
  }

  if (n > max) {
    return max;
  }

  return n;
}

function toBarPercentage(n) {
  return (-1 + n) * 100;
}

var NProgress = React.createClass({
  displayName: 'NProgress',

  mixins: [ClassNameMixin],

  propTypes: {
    minimum: React.PropTypes.number,
    easing: React.PropTypes.string,
    speed: React.PropTypes.number,
    spinner: React.PropTypes.bool,
    trickle: React.PropTypes.bool,
    trickleRate: React.PropTypes.number,
    trickleSpeed: React.PropTypes.number
  },

  getInitialState: function getInitialState() {
    return {
      status: null
    };
  },

  getDefaultProps: function getDefaultProps() {
    return {
      minimum: 0.08,
      easing: 'ease',
      speed: 200,
      trickle: true,
      trickleRate: 0.02,
      trickleSpeed: 800
    };
  },

  start: function start() {
    var _this = this;

    !this.state.status && this.set(0);

    var work = function work() {
      setTimeout(function () {
        if (!_this.state.status || _this.state.status === 1) {
          return;
        }

        _this.trickle();
        work();
      }, _this.props.trickleSpeed);
    };

    this.props.trickle && work();
  },

  set: function set(n) {
    var _this = this;

    n = clamp(n, this.props.minimum, 1);
    this.setState({
      status: n
    });

    if (n === 1) {
      var progress = React.findDOMNode(this.refs.progress);

      progress.style.opacity = 1;
      progress.style.transition = 'none';
      progress.offsetWidth;

      setTimeout(function () {
        progress.style.opacity = 0;
        progress.style.transition = 'all ' + _this.props.speed + 'ms linear';

        setTimeout(function () {
          _this.reset();
        }, _this.props.speed + 100);
      }, _this.props.speed);
    }
  },

  reset: function reset() {
    this.setState({
      status: null
    });
  },

  done: function done() {
    if (this.state.status) {
      this.inc(0.3 + 0.5 * Math.random());
      this.set(1);
    }
  },

  inc: function inc(amount) {
    var n = this.state.status;

    if (!n) {
      return this.start();
    } else {
      if (typeof amount !== 'number') {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return this.set(n);
    }
  },

  trickle: function trickle() {
    if (this.state.status < 1) {
      this.inc(Math.random() * this.props.trickleRate);
    }
  },

  render: function render() {
    var props = this.props;
    var percent = this.state.status === null ? '-100' : toBarPercentage(this.state.status);
    var barStyle = {
      transition: 'all ' + props.speed + 'ms ' + props.easing,
      transform: 'translate(' + percent + '%,0)'
    };
    var spinner = props.spinner ? React.createElement(
      'div',
      { className: 'nprogress-spinner', ref: 'spinner' },
      React.createElement('div', { className: 'nprogress-spinner-icon' })
    ) : null;

    return this.state.status ? React.createElement(
      'div',
      { id: 'nprogress', ref: 'progress' },
      React.createElement(
        'div',
        { className: 'nprogress-bar', ref: 'bar', style: barStyle },
        React.createElement('div', { className: 'nprogress-peg' })
      ),
      spinner
    ) : null;
  }
});

module.exports = NProgress;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78}],55:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Nav = React.createClass({
  displayName: 'Nav',

  mixins: [ClassNameMixin],

  propTypes: {
    justify: React.PropTypes.bool,
    pills: React.PropTypes.bool,
    tabs: React.PropTypes.bool,
    componentTag: React.PropTypes.node.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'nav',
      componentTag: 'ul'
    };
  },

  render: function render() {
    var classes = this.getClassSet();
    var Component = this.props.componentTag;

    // set classes
    classes[this.prefixClass('pills')] = this.props.pills || this.props.topbar;
    classes[this.prefixClass('tabs')] = this.props.tabs;
    classes[this.prefixClass('justify')] = this.props.justify;

    // topbar class
    classes[this.setClassNamespace('topbar-nav')] = this.props.topbar;

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(classes, this.props.className) }),
      this.props.children
    );
  }
});

module.exports = Nav;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],56:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var NavItem = React.createClass({
  displayName: 'NavItem',

  mixins: [ClassNameMixin],

  propTypes: {
    active: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    header: React.PropTypes.bool,
    divider: React.PropTypes.bool,
    href: React.PropTypes.any,
    componentTag: React.PropTypes.node.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'nav',
      componentTag: 'li'
    };
  },

  render: function render() {
    var classes = this.getClassSet();
    var props = this.props;
    var Component = props.componentTag;

    // del am-nav
    classes[this.setClassNamespace(props.classPrefix)] = false;

    // set classes
    classes[this.prefixClass('header')] = props.header;
    classes[this.prefixClass('divider')] = props.divider;

    if (props.href) {
      return this.renderAnchor(classes);
    }

    return React.createElement(
      Component,
      _extends({}, props, {
        className: classNames(classes, props.className) }),
      this.props.children
    );
  },

  renderAnchor: function renderAnchor(classes) {
    var Component = this.props.componentTag;

    var linkProps = {
      href: this.props.href,
      title: this.props.tilte,
      target: this.props.target
    };

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(classes, this.props.className) }),
      React.createElement(
        'a',
        linkProps,
        this.props.children
      )
    );
  }
});

module.exports = NavItem;

// TODO: DropDown Tab 处理
//       disabled 没有禁止链接跳转

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],57:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Icon = require('./Icon');
var omit = require('object.omit');

var Navbar = React.createClass({
  displayName: 'Navbar',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    theme: React.PropTypes.oneOf(['default']),
    data: React.PropTypes.array,
    onSelect: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'navbar',
      theme: 'default',
      data: [],
      onSelect: function onSelect() {}
    };
  },

  render: function render() {
    var classSet = this.getClassSet();
    var props = omit(this.props, 'data');

    return React.createElement(
      'div',
      _extends({}, props, {
        'data-am-widget': this.props.classPrefix,
        cf: true,
        className: classNames(this.props.className, classSet) }),
      React.createElement(
        'ul',
        { className: this.prefixClass('nav') },
        this.props.data.map((function (item, i) {
          return React.createElement(
            'li',
            { key: i,
              onClick: this.props.onSelect.bind(this, item.link) },
            React.createElement(
              'a',
              { href: item.link },
              item.customIcon ? React.createElement('img', { src: item.customIcon, alt: item.title }) : item.icon ? React.createElement(Icon, { icon: item.icon }) : null,
              item.title ? React.createElement(
                'span',
                { className: this.prefixClass('label') },
                item.title
              ) : null
            )
          );
        }).bind(this))
      )
    );
  }
});

module.exports = Navbar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Icon":45,"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],58:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Pagination = React.createClass({
  displayName: 'Pagination',

  mixins: [ClassNameMixin],

  PropTypes: {
    componentTag: React.PropTypes.node.isRequired,
    centered: React.PropTypes.bool,
    right: React.PropTypes.bool,
    theme: React.PropTypes.oneOf(['default', 'select']),
    data: React.PropTypes.object,
    onSelect: React.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'pagination',
      componentTag: 'ul'
    };
  },

  renderItem: function renderItem(type) {
    var data = this.props.data;

    return data && data[type + 'Title'] && data[type + 'Link'] ? React.createElement(
      Pagination.Item,
      {
        onClick: this.props.onSelect && this.props.onSelect.bind(this, data[type + 'Link']),
        key: type,
        href: data[type + 'Link'],
        className: this.prefixClass(type) },
      data[type + 'Title']
    ) : null;
  },

  handleChange: function handleChange(e) {
    if (this.props.onSelect) {
      var select = React.findDOMNode(this.refs.select);

      this.props.onSelect.call(this, select && select.value, e);
    }
  },

  renderPages: function renderPages() {
    var data = this.props.data;

    if (data.pages) {
      return this.props.theme === 'select' ? React.createElement(
        'li',
        { className: this.prefixClass('select') },
        React.createElement(
          'select',
          {
            onChange: this.handleChange,
            ref: 'select' },
          data.pages.map(function (page, i) {
            return React.createElement(
              'option',
              { value: page.link, key: i },
              page.title,
              ' / ',
              data.pages.length
            );
          })
        )
      ) : data.pages.map((function (page, i) {
        return React.createElement(
          Pagination.Item,
          {
            key: i,
            onClick: this.props.onSelect && this.props.onSelect.bind(this, page.link),
            active: page.active,
            disabled: page.disabled,
            href: page.link },
          page.title
        );
      }).bind(this));
    }
  },

  render: function render() {
    var props = this.props;
    var Component = props.componentTag;
    var classSet = this.getClassSet();
    var notSelect = props.theme !== 'select';

    // .am-pagination-right
    classSet[this.prefixClass('right')] = props.right;

    // .am-pagination-centered
    classSet[this.prefixClass('centered')] = props.centered;

    return props.data ? React.createElement(
      Component,
      _extends({}, props, {
        className: classNames(classSet, props.className) }),
      notSelect && this.renderItem('first'),
      this.renderItem('prev'),
      this.renderPages(),
      this.renderItem('next'),
      notSelect && this.renderItem('last')
    ) : React.createElement(
      Component,
      _extends({}, props, {
        className: classNames(classSet, props.className) }),
      this.props.children
    );
  }
});

Pagination.Item = React.createClass({
  displayName: 'Item',

  mixins: [ClassNameMixin],

  propTypes: {
    active: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    prev: React.PropTypes.bool,
    next: React.PropTypes.bool,
    href: React.PropTypes.string,
    componentTag: React.PropTypes.node.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'pagination',
      href: '#',
      componentTag: 'li'
    };
  },

  render: function render() {
    var Component = this.props.componentTag;
    var classSet = this.getClassSet(true);
    var props = this.props;

    // .am-pagination-prev
    classSet[this.prefixClass('prev')] = props.prev;

    // .am-pagination-next
    classSet[this.prefixClass('next')] = props.next;

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(classSet, this.props.className) }),
      React.createElement(
        'a',
        {
          href: this.props.href,
          title: this.props.title,
          target: this.props.target,
          ref: 'anchor' },
        this.props.children
      )
    );
  }
});

module.exports = Pagination;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],59:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var CollapseMixin = require('./mixins/CollapseMixin');

var Panel = React.createClass({
  displayName: 'Panel',

  mixins: [ClassNameMixin, CollapseMixin],

  propTypes: {
    collapsible: React.PropTypes.bool,
    header: React.PropTypes.node,
    footer: React.PropTypes.node,
    id: React.PropTypes.string,
    amStyle: React.PropTypes.string,
    onSelect: React.PropTypes.func,
    eventKey: React.PropTypes.any
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'panel',
      amStyle: 'default'
    };
  },

  handleClick: function handleClick(e) {
    e.selected = true;

    if (this.props.onSelect) {
      this.props.onSelect(e, this.props.eventKey);
    } else {
      e.preventDefault();
    }

    if (e.selected) {
      this.handleToggle();
    }
  },

  handleToggle: function handleToggle() {
    this.setState({ expanded: !this.state.expanded });
  },

  getCollapsibleDimensionValue: function getCollapsibleDimensionValue() {
    return React.findDOMNode(this.refs.panel).scrollHeight;
  },

  getCollapsibleDOMNode: function getCollapsibleDOMNode() {
    if (!this.isMounted() || !this.refs || !this.refs.panel) {
      return null;
    }

    return React.findDOMNode(this.refs.panel);
  },

  renderHeader: function renderHeader() {
    if (!this.props.header) {
      return null;
    }

    var header = this.props.header;

    return React.createElement(
      'div',
      { className: this.prefixClass('hd') },
      this.props.collapsible ? React.createElement(
        'h4',
        {
          'data-am-collapse': true,
          className: classNames(this.prefixClass('title'), this.isExpanded() ? null : this.setClassNamespace('collapsed')),
          onClick: this.handleClick },
        header
      ) : header
    );
  },

  renderBody: function renderBody() {
    var bodyClass = this.prefixClass('bd');
    var bodyChildren = this.props.children;
    var bodyElements = [];
    var panelBodyChildren = [];

    function getProps() {
      return {
        key: bodyElements.length
      };
    }

    function addFillChild(child) {
      bodyElements.push(React.cloneElement(child, getProps()));
    }

    function addPanelBody(child) {
      bodyElements.push(React.createElement(
        'div',
        _extends({ className: bodyClass }, getProps, { key: 'panelBody' }),
        child
      ));
    }

    function maybeRenderPanelBody() {
      if (panelBodyChildren.length === 0) {
        return;
      }

      addPanelBody(panelBodyChildren);
      panelBodyChildren = [];
    }

    if (Array.isArray(bodyChildren)) {
      bodyChildren.forEach((function (child) {
        // props fill and isValidElement
        if (this.shouldRenderFill(child)) {
          maybeRenderPanelBody();

          addFillChild(child);
        } else {
          panelBodyChildren.push(child);
        }
      }).bind(this));

      maybeRenderPanelBody();
    } else {
      if (this.shouldRenderFill(bodyChildren)) {
        addFillChild(bodyChildren);
      } else {
        addPanelBody(bodyChildren);
      }
    }

    return bodyElements;
  },

  renderCollapsibleBody: function renderCollapsibleBody() {
    var collapseClass = this.prefixClass('collapse');

    return React.createElement(
      'div',
      {
        className: classNames(this.getCollapsibleClassSet(collapseClass)),
        id: this.props.id,
        ref: 'panel' },
      this.renderBody()
    );
  },

  shouldRenderFill: function shouldRenderFill(child) {
    return React.isValidElement(child) && child.props.fill;
  },

  renderFooter: function renderFooter() {
    if (!this.props.footer) {
      return null;
    }

    return React.createElement(
      'div',
      { className: this.prefixClass('footer') },
      this.props.footer
    );
  },

  render: function render() {
    var classes = this.getClassSet();
    var collapsible = this.props.collapsible;

    return React.createElement(
      'div',
      _extends({}, this.props, {
        id: collapsible ? null : this.props.id,
        className: classNames(classes, this.props.className) }),
      this.renderHeader(),
      collapsible ? this.renderCollapsibleBody() : this.renderBody(),
      this.renderFooter()
    );
  }
});

module.exports = Panel;
// just for `pointer` style

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"./mixins/CollapseMixin":79,"classnames":2}],60:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var PanelGroup = React.createClass({
  displayName: 'PanelGroup',

  mixins: [ClassNameMixin],

  propTypes: {
    amStyle: React.PropTypes.string,
    activeKey: React.PropTypes.any,
    defaultActiveKey: React.PropTypes.any,
    onSelect: React.PropTypes.func,
    accordion: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'panel-group'
    };
  },

  getInitialState: function getInitialState() {
    return {
      activeKey: this.props.defaultActiveKey
    };
  },

  shouldComponentUpdate: function shouldComponentUpdate() {
    // Defer any updates to this component during the `onSelect` handler.
    return !this._isChanging;
  },

  handleSelect: function handleSelect(e, key) {
    e.preventDefault();

    if (this.props.onSelect) {
      this._isChanging = true;
      this.props.onSelect(key);
      this._isChanging = false;
    }

    if (this.state.activeKey === key) {
      key = null;
    }

    this.setState({
      activeKey: key
    });
  },

  renderPanel: function renderPanel(child, index) {
    var activeKey = this.props.activeKey != null ? this.props.activeKey : this.state.activeKey;

    var props = {
      amStyle: child.props.amStyle || this.props.amStyle,
      key: child.key ? child.key : index,
      ref: child.ref
    };

    if (this.props.accordion) {
      props.collapsible = true;
      props.expanded = child.props.eventKey === activeKey;
      props.onSelect = this.handleSelect;
    }

    return React.cloneElement(child, props);
  },

  render: function render() {
    var classes = this.getClassSet();

    return React.createElement(
      'div',
      _extends({}, this.props, {
        className: classNames(classes, this.props.className) }),
      React.Children.map(this.props.children, this.renderPanel)
    );
  }
});

module.exports = PanelGroup;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],61:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Popover = React.createClass({
  displayName: 'Popover',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    placement: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    positionLeft: React.PropTypes.number,
    positionTop: React.PropTypes.number,
    amSize: React.PropTypes.oneOf(['sm', 'lg']),
    amStyle: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'popover'
    };
  },

  render: function render() {
    var classSet = this.getClassSet();
    var style = {
      left: this.props.positionLeft,
      top: this.props.positionTop,
      display: 'block'
    };

    classSet[this.setClassNamespace('active')] = true;
    classSet[this.prefixClass(this.props.placement)] = true;

    return React.createElement(
      'div',
      _extends({}, this.props, {
        style: style,
        className: classNames(classSet, this.props.className) }),
      React.createElement(
        'div',
        { className: this.prefixClass('inner') },
        this.props.children
      ),
      React.createElement('div', { className: this.prefixClass('caret') })
    );
  }
});

module.exports = Popover;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],62:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var cloneElement = React.cloneElement;
var OverlayMixin = require('./mixins/OverlayMixin');
var assign = require('object-assign');
var dom = require('./utils/domUtils');
var createChainedFunction = require('./utils/createChainedFunction');

function isOneOf(one, of) {
  if (Array.isArray(of)) {
    return of.indexOf(one) >= 0;
  }
  return one === of;
}

var PopoverTrigger = React.createClass({
  displayName: 'PopoverTrigger',

  mixins: [OverlayMixin],

  propTypes: {
    trigger: React.PropTypes.oneOfType([React.PropTypes.oneOf(['click', 'hover', 'focus']), React.PropTypes.arrayOf(React.PropTypes.oneOf(['click', 'hover', 'focus']))]),
    placement: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    delay: React.PropTypes.number,
    delayOpen: React.PropTypes.number,
    delayClose: React.PropTypes.number,
    defaultPopoverActive: React.PropTypes.bool,
    popover: React.PropTypes.node.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      placement: 'right',
      trigger: ['hover', 'focus']
    };
  },

  getInitialState: function getInitialState() {
    return {
      isPopoverActive: this.props.defaultPopoverActive == null ? false : this.props.defaultPopoverActive,
      popoverLeft: null,
      popoverTop: null
    };
  },

  componentDidMount: function componentDidMount() {
    if (this.props.defaultPopoverActive) {
      this.updatePopoverPosition();
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this._hoverDelay);
  },

  open: function open() {
    this.setState({
      isPopoverActive: true
    }, function () {
      this.updatePopoverPosition();
    });
  },

  close: function close() {
    this.setState({
      isPopoverActive: false
    });
  },

  toggle: function toggle() {
    this.state.isPopoverActive ? this.close() : this.open();
  },

  handleDelayedOpen: function handleDelayedOpen() {
    if (this._hoverDelay != null) {
      clearTimeout(this._hoverDelay);
      this._hoverDelay = null;
      return;
    }

    var delay = this.props.delayOpen != null ? this.props.delayOpen : this.props.delay;

    if (!delay) {
      this.open();
      return;
    }

    this._hoverDelay = setTimeout((function () {
      this._hoverDelay = null;
      this.open();
    }).bind(this), delay);
  },

  handleDelayedClose: function handleDelayedClose() {
    if (this._hoverDelay != null) {
      clearTimeout(this._hoverDelay);
      this._hoverDelay = null;
      return;
    }

    var delay = this.props.delayClose != null ? this.props.delayClose : this.props.delay;

    if (!delay) {
      this.close();
      return;
    }

    this._hoverDelay = setTimeout((function () {
      this._hoverDelay = null;
      this.close();
    }).bind(this), delay);
  },

  updatePopoverPosition: function updatePopoverPosition() {
    if (!this.isMounted()) {
      return;
    }

    var position = this.calcPopoverPosition();

    this.setState({
      popoverLeft: position.left,
      popoverTop: position.top
    });
  },

  calcPopoverPosition: function calcPopoverPosition() {
    var childOffset = this.getPosition();
    var popoverNode = this.getOverlayDOMNode();
    var popoverHeight = popoverNode.offsetHeight;
    var popoverWidth = popoverNode.offsetWidth;
    var caretSize = 8;

    switch (this.props.placement) {
      case 'right':
        return {
          top: childOffset.top + childOffset.height / 2 - popoverHeight / 2,
          left: childOffset.left + childOffset.width + caretSize
        };
      case 'left':
        return {
          top: childOffset.top + childOffset.height / 2 - popoverHeight / 2,
          left: childOffset.left - popoverWidth - caretSize
        };
      case 'top':
        return {
          top: childOffset.top - popoverHeight - caretSize,
          left: childOffset.left + childOffset.width / 2 - popoverWidth / 2
        };
      case 'bottom':
        return {
          top: childOffset.top + childOffset.height + caretSize,
          left: childOffset.left + childOffset.width / 2 - popoverWidth / 2
        };
      default:
        throw new Error('calcPopoverPosition(): No such placement of [' + this.props.placement + '] found.');
    }
  },

  getPosition: function getPosition() {
    var node = React.findDOMNode(this);
    var container = this.getContainerDOMNode();

    var offset = container.tagName === 'BODY' ? dom.offset(node) : dom.position(node, container);

    return assign({}, offset, {
      height: node.offsetHeight,
      width: node.offsetWidth
    });
  },

  // used by Mixin
  renderOverlay: function renderOverlay() {
    if (!this.state.isPopoverActive) {
      return React.createElement('span', null);
    }

    var popover = this.props.popover;

    return cloneElement(this.props.popover, {
      onRequestHide: this.close,
      placement: this.props.placement,
      positionLeft: this.state.popoverLeft,
      positionTop: this.state.popoverTop,
      amStyle: popover.props.amStyle || this.props.amStyle,
      amSize: popover.props.amSize || this.props.amSize
    });
  },

  render: function render() {
    var child = React.Children.only(this.props.children);

    var props = {};

    props.onClick = createChainedFunction(child.props.onClick, this.props.onClick);

    if (isOneOf('click', this.props.trigger)) {
      props.onClick = createChainedFunction(this.toggle, props.onClick);
    }

    if (isOneOf('hover', this.props.trigger)) {
      props.onMouseOver = createChainedFunction(this.handleDelayedOpen, this.props.onMouseOver);
      props.onMouseOut = createChainedFunction(this.handleDelayedClose, this.props.onMouseOut);
    }

    if (isOneOf('focus', this.props.trigger)) {
      props.onFocus = createChainedFunction(this.handleDelayedOpen, this.props.onFocus);
      props.onBlur = createChainedFunction(this.handleDelayedClose, this.props.onBlur);
    }

    return cloneElement(child, props);
  }
});

module.exports = PopoverTrigger;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/OverlayMixin":81,"./utils/createChainedFunction":87,"./utils/domUtils":90,"object-assign":4}],63:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Progress = React.createClass({
  displayName: 'Progress',

  mixins: [ClassNameMixin],

  propTypes: {
    now: React.PropTypes.number,
    label: React.PropTypes.string,
    active: React.PropTypes.bool,
    striped: React.PropTypes.bool,
    amSize: React.PropTypes.string,
    amStyle: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'progress'
    };
  },

  renderProgressBar: function renderProgressBar() {
    var styleSheet = {
      width: this.props.now + '%'
    };
    var classes = {};
    var prefix = this.prefixClass('bar');
    var amStyle = this.props.amStyle;

    // set am-progress-bar
    classes[prefix] = true;

    if (amStyle) {
      classes[prefix + '-' + amStyle] = true;
    }

    return React.createElement(
      'div',
      {
        className: classNames(classes),
        style: styleSheet,
        role: 'progressbar' },
      this.props.label
    );
  },

  renderChildBar: function renderChildBar(child, index) {
    return React.cloneElement(child, {
      isChild: true,
      key: child.key ? child.key : index
    });
  },

  render: function render() {
    var classes = this.getClassSet();

    // set class
    classes[this.prefixClass('striped')] = this.props.striped;

    if (this.props.active) {
      classes[this.prefixClass('striped')] = true;
    }

    if (!this.props.children) {
      if (!this.props.isChild) {
        return React.createElement(
          'div',
          _extends({}, this.props, {
            className: classNames(classes, this.props.className)
          }),
          this.renderProgressBar()
        );
      } else {
        return this.renderProgressBar();
      }
    } else {
      return React.createElement(
        'div',
        _extends({}, this.props, {
          className: classNames(classes, this.props.className)
        }),
        React.Children.map(this.props.children, this.renderChildBar)
      );
    }
  }
});

module.exports = Progress;

// Todo: 删除无用 class
//     : key ref 处理问题

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],64:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var cloneElement = React.cloneElement;
var assign = require('object-assign');
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var isInViewport = require('./utils/isInViewport');
var Events = require('./utils/Events');
var TransitionEvents = require('./utils/TransitionEvents');
var requestAnimationFrame = require('./utils/requestAnimationFrame');
var debounce = require('./utils/debounce');

var ScrollSpy = React.createClass({
  displayName: 'ScrollSpy',

  mixins: [ClassNameMixin],

  propTypes: {
    animation: React.PropTypes.string,
    delay: React.PropTypes.number,
    repeat: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      animation: 'fade',
      delay: 0,
      repeat: false
    };
  },

  getInitialState: function getInitialState() {
    return {
      inViewport: false
    };
  },

  componentDidMount: function componentDidMount() {
    this.checkRAF();

    var debounced = debounce(this.checkRAF, 60).bind(this);

    this._scrollListener = Events.on(window, 'scroll', this.checkRAF);
    this._resizeListener = Events.on(window, 'resize', debounced);
    this._orientationListener = Events.on(window, 'orientationchange', debounced);
  },

  componentWillMount: function componentWillMount() {
    this._scrollListener && this._scrollListener.off();
    this._resizeListener && this._resizeListener.off();
    this._orientationListener && this._orientationListener.off();
    clearTimeout(this._timer);
  },

  checkIsInView: function checkIsInView() {
    if (!TransitionEvents.support.animationend) {
      return;
    }

    if (this.isMounted) {
      var isInView = isInViewport(React.findDOMNode(this));

      if (isInView && !this.state.inViewport) {
        if (this._timer) {
          clearTimeout(this._timer);
        }

        this._timer = setTimeout((function () {
          this.setState({
            inViewport: true
          });
        }).bind(this), this.props.delay);
      }

      if (this.props.repeat && !isInView) {
        this.setState({
          inViewport: false
        });
      }
    }
  },

  checkRAF: function checkRAF() {
    requestAnimationFrame(this.checkIsInView);
  },

  render: function render() {
    var animation = this.state.inViewport ? this.setClassNamespace('animation-' + this.props.animation) : null;
    var child = React.Children.only(this.props.children);

    // transfer child's props to cloned element
    return cloneElement(child, assign({}, child.props, {
      className: classNames(child.props.className, animation),
      'data-am-scrollspy': 'animation', // style helper
      delay: this.props.delay
    }));
  }
});

module.exports = ScrollSpy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"./utils/Events":85,"./utils/TransitionEvents":86,"./utils/debounce":89,"./utils/isInViewport":92,"./utils/requestAnimationFrame":94,"classnames":2,"object-assign":4}],65:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var cloneElement = React.cloneElement;
var assign = require('object-assign');
var classNames = require('classnames');
var SmoothScrollMixin = require('./mixins/SmoothScrollMixin');
var isInViewport = require('./utils/isInViewport');
var Events = require('./utils/Events');
var requestAnimationFrame = require('./utils/requestAnimationFrame');
var debounce = require('./utils/debounce');
var CSSCore = require('./utils/CSSCore');
var domUtils = require('./utils/domUtils');
var createChainedFunction = require('./utils/createChainedFunction');
var constants = require('./constants');

var ScrollSpyNav = React.createClass({
  displayName: 'ScrollSpyNav',

  mixins: [SmoothScrollMixin],

  propTypes: {
    activeClass: React.PropTypes.string,
    offsetTop: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      activeClass: constants.CLASSES.active
    };
  },

  componentDidMount: function componentDidMount() {
    this._init();
    this.checkRAF();

    var debounced = debounce(this.checkRAF, 100).bind(this);

    this._scrollListener = Events.on(window, 'scroll', this.checkRAF);
    this._resizeListener = Events.on(window, 'resize', debounced);
    this._orientationListener = Events.on(window, 'orientationchange', debounced);
  },

  componentWillMount: function componentWillMount() {
    this._scrollListener && this._scrollListener.off();
    this._resizeListener && this._resizeListener.off();
    this._orientationListener && this._orientationListener.off();
  },

  _init: function _init() {
    this._linkNodes = React.findDOMNode(this).querySelectorAll('a[href^="#"]');
    this._anchorNodes = [];

    Array.prototype.forEach.call(this._linkNodes, (function (link) {
      var anchor = document.getElementById(link.getAttribute('href').substr(1));

      if (anchor) {
        this._anchorNodes.push(anchor);
      }
    }).bind(this));
  },

  checkIsInView: function checkIsInView() {
    if (this.isMounted) {
      var inViewsNodes = [];

      this._anchorNodes.forEach(function (anchor) {
        if (isInViewport(anchor)) {
          inViewsNodes.push(anchor);
        }
      });

      if (inViewsNodes.length) {
        var targetNode;

        inViewsNodes.every(function (node) {
          if (domUtils.offset(node).top >= domUtils.scrollTop(window)) {
            targetNode = node;
            return false; // break loop
          }
          return true;
        });

        if (!targetNode) {
          return;
        }

        Array.prototype.forEach.call(this._linkNodes, (function (link) {
          CSSCore.removeClass(link, this.props.activeClass);
        }).bind(this));

        var targetLink = React.findDOMNode(this).querySelector('a[href="#' + targetNode.id + '"]');

        targetLink && CSSCore.addClass(targetLink, this.props.activeClass);
      }
    }
  },

  checkRAF: function checkRAF() {
    requestAnimationFrame(this.checkIsInView);
  },

  // Smooth scroll
  handleClick: function handleClick(e) {
    e.preventDefault();

    if (e.target && e.target.nodeName === 'A') {
      var targetNode = document.getElementById(e.target.getAttribute('href').substr(1));

      targetNode && this.smoothScroll(window, {
        position: domUtils.offset(targetNode).top - this.props.offsetTop || 0
      });
    }
  },

  render: function render() {
    var child = React.Children.only(this.props.children);

    // transfer child's props to cloned element
    return cloneElement(child, assign({}, this.props, child.props, {
      onClick: createChainedFunction(this.handleClick, child.props.onClick),
      className: classNames(this.props.className, child.props.className)
    }));
  }
});

module.exports = ScrollSpyNav;

// TODO: improve in view logic

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./constants":77,"./mixins/SmoothScrollMixin":82,"./utils/CSSCore":84,"./utils/Events":85,"./utils/createChainedFunction":87,"./utils/debounce":89,"./utils/domUtils":90,"./utils/isInViewport":92,"./utils/requestAnimationFrame":94,"classnames":2,"object-assign":4}],66:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Dropdown = require('./Dropdown');
var Icon = require('./Icon');
var Input = require('./Input');

var Selected = React.createClass({
  displayName: 'Selected',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    data: React.PropTypes.array.isRequired,
    placeholder: React.PropTypes.string,
    value: React.PropTypes.string,
    multiple: React.PropTypes.bool,
    searchBox: React.PropTypes.bool,
    name: React.PropTypes.string,
    onChange: React.PropTypes.func,
    optionFilter: React.PropTypes.func,
    dropup: React.PropTypes.bool,
    btnWidth: React.PropTypes.number,
    btnStyle: React.PropTypes.string,
    maxHeight: React.PropTypes.number,

    // delimiter to use to join multiple values
    delimiter: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'selected',
      placeholder: '点击选择...',
      onChange: function onChange() {},
      delimiter: ',',
      optionFilter: function optionFilter(filterText, option) {
        return option.label.toLowerCase().indexOf(filterText) > -1;
      }
    };
  },

  getInitialState: function getInitialState() {
    return {
      value: this.props.value,
      dropdownWidth: null,
      filterText: null
    };
  },

  componentDidMount: function componentDidMount() {
    this.setDropdownWidth();
  },

  setDropdownWidth: function setDropdownWidth() {
    if (this.isMounted) {
      var toggleButton = React.findDOMNode(this.refs.dropdown.refs.dropdownToggle);

      toggleButton && this.setState({ dropdownWidth: toggleButton.offsetWidth });
    }
  },

  getValueArray: function getValueArray() {
    return this.state.value ? this.state.value.split(this.props.delimiter) : [];
  },

  hasValue: function hasValue(value) {
    return this.getValueArray().indexOf(value) > -1;
  },

  setValue: function setValue(value, callback) {
    this.setState({
      value: value
    }, function () {
      this.props.onChange(value);
      callback && callback();
    });
  },

  handleCheck: function handleCheck(option, e) {
    e.preventDefault();

    var clickedValue = option.value;

    // multiple select
    if (this.props.multiple) {
      var values = this.getValueArray();

      if (this.hasValue(clickedValue)) {
        values.splice(values.indexOf(clickedValue), 1);
      } else {
        values.push(clickedValue);
      }

      this.setValue(values.join(this.props.delimiter));
    } else {
      this.setValue(clickedValue);
      this.refs.dropdown.setDropdownState(false);
    }
  },

  handleUserInput: function handleUserInput(e) {
    e.preventDefault();

    this.setState({
      filterText: React.findDOMNode(this.refs.filterInput).value
    });
  },

  // clear filter
  clearFilterInput: function clearFilterInput() {
    if (this.props.multiple && this.props.searchBox) {
      this.setState({
        filterText: null
      });
      React.findDOMNode(this.refs.filterInput).value = null;
    }
  },

  // API for getting component value
  getValue: function getValue() {
    return this.state.value;
  },

  render: function render() {
    var classSet = this.getClassSet();
    var selectedLabel = [];
    var items = [];
    var filterText = this.state.filterText;
    var groupHeader;

    this.props.data.forEach((function (option, i) {
      var checked = this.hasValue(option.value);
      var checkedClass = checked ? this.setClassNamespace('checked') : null;
      var checkedIcon = checked ? React.createElement(Icon, { icon: 'check' }) : null;

      checked && selectedLabel.push(option.label);

      // add group header
      if (option.group && groupHeader !== option.group) {
        groupHeader = option.group;
        items.push(React.createElement(
          'li',
          {
            className: this.prefixClass('list-header'),
            key: 'header' + i },
          groupHeader
        ));
      }

      if (filterText && !this.props.optionFilter(filterText, option)) {
        return;
      }

      items.push(React.createElement(
        'li',
        {
          className: checkedClass,
          onClick: this.handleCheck.bind(this, option),
          key: i },
        React.createElement(
          'span',
          { className: this.prefixClass('text') },
          option.label
        ),
        checkedIcon
      ));
    }).bind(this));

    var status = React.createElement(
      'span',
      {
        className: classNames(this.prefixClass('status'), this.setClassNamespace('fl')) },
      selectedLabel.length ? selectedLabel.join(', ') : React.createElement(
        'span',
        { className: this.prefixClass('placeholder ') },
        this.props.placeholder
      )
    );
    var optionsStyle = {};

    if (this.props.maxHeight) {
      optionsStyle = {
        maxHeight: this.props.maxHeight,
        overflowY: 'scroll'
      };
    }

    return React.createElement(
      Dropdown,
      {
        className: classNames(this.props.className, classSet),
        title: status,
        onClose: this.clearFilterInput,
        btnStyle: this.props.btnStyle,
        btnInlineStyle: { width: this.props.btnWidth },
        contentInlineStyle: { minWidth: this.state.dropdownWidth },
        toggleClassName: this.prefixClass('btn'),
        caretClassName: this.prefixClass('icon'),
        contentClassName: this.prefixClass('content'),
        contentTag: 'div',
        dropup: this.props.dropup,
        ref: 'dropdown' },
      this.props.searchBox ? React.createElement(
        'div',
        { className: this.prefixClass('search') },
        React.createElement(Input, {
          onChange: this.handleUserInput,
          autoComplete: 'off',
          standalone: true,
          ref: 'filterInput' })
      ) : null,
      React.createElement(
        'ul',
        {
          style: optionsStyle,
          className: this.prefixClass('list') },
        items
      ),
      React.createElement('input', {
        name: this.props.name,
        type: 'hidden',
        ref: 'selectedField',
        value: this.state.value })
    );
  }
});

module.exports = Selected;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Dropdown":36,"./Icon":45,"./Input":47,"./mixins/ClassNameMixin":78,"classnames":2}],67:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var TransitionEvents = require('./utils/TransitionEvents');

React.initializeTouchEvents(true);

var Slider = React.createClass({
  displayName: 'Slider',

  mixins: [ClassNameMixin],

  propTypes: {
    theme: React.PropTypes.oneOf(['default', 'a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'c4', 'd1', 'd2', 'd3']),
    directionNav: React.PropTypes.bool, // prev/next icon
    controlNav: React.PropTypes.bool,

    animation: React.PropTypes.string, // not working
    slide: React.PropTypes.bool,
    autoPlay: React.PropTypes.bool,
    slideSpeed: React.PropTypes.number, // interval
    loop: React.PropTypes.bool, // loop slide

    pauseOnHover: React.PropTypes.bool,
    touch: React.PropTypes.bool, // TODO: add touch support

    onSelect: React.PropTypes.func,
    onSlideEnd: React.PropTypes.func,
    activeIndex: React.PropTypes.number,
    defaultActiveIndex: React.PropTypes.number,
    direction: React.PropTypes.oneOf(['prev', 'next'])
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'slider',
      theme: 'default',
      directionNav: true,
      controlNav: true,
      slide: true,
      autoPlay: true,
      loop: true,
      slideSpeed: 5000,
      pauseOnHover: true
    };
  },

  getInitialState: function getInitialState() {
    return {
      activeIndex: this.props.defaultActiveIndex == null ? 0 : this.props.defaultActiveIndex,
      previousActiveIndex: null,
      direction: null
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var activeIndex = this.getActiveIndex();

    if (nextProps.activeIndex != null && nextProps.activeIndex !== activeIndex) {
      clearTimeout(this.timeout);
      this.setState({
        previousActiveIndex: activeIndex,
        direction: nextProps.direction != null ? nextProps.direction : this.getDirection(activeIndex, nextProps.activeIndex)
      });
    }
  },

  componentDidMount: function componentDidMount() {
    this.props.autoPlay && this.waitForNext();
  },

  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this.timeout);
  },

  getDirection: function getDirection(prevIndex, index) {
    if (prevIndex === index) {
      return null;
    }

    return prevIndex > index ? 'prev' : 'next';
  },

  next: function next(e) {
    e && e.preventDefault();

    var index = this.getActiveIndex() + 1;
    var count = React.Children.count(this.props.children);

    if (index > count - 1) {
      if (!this.props.loop) {
        return;
      }
      index = 0;
    }

    this.handleSelect(index, 'next');
  },

  prev: function prev(e) {
    e && e.preventDefault();

    var index = this.getActiveIndex() - 1;

    if (index < 0) {
      if (!this.props.loop) {
        return;
      }
      index = React.Children.count(this.props.children) - 1;
    }

    this.handleSelect(index, 'prev');
  },

  pause: function pause() {
    this.isPaused = true;
    clearTimeout(this.timeout);
  },

  play: function play() {
    this.isPaused = false;
    this.waitForNext();
  },

  waitForNext: function waitForNext() {
    if (!this.isPaused && this.props.slide && this.props.slideSpeed && this.props.activeIndex == null) {
      this.timeout = setTimeout(this.next, this.props.slideSpeed);
    }
  },

  handleMouseOver: function handleMouseOver() {
    if (this.props.pauseOnHover) {
      this.pause();
    }
  },

  handleMouseOut: function handleMouseOut() {
    if (this.isPaused) {
      this.play();
    }
  },

  getActiveIndex: function getActiveIndex() {
    return this.props.activeIndex != null ? this.props.activeIndex : this.state.activeIndex;
  },

  handleItemAnimateOutEnd: function handleItemAnimateOutEnd() {
    this.setState({
      previousActiveIndex: null,
      direction: null
    }, function () {
      this.waitForNext();

      if (this.props.onSlideEnd) {
        this.props.onSlideEnd();
      }
    });
  },

  handleSelect: function handleSelect(index, direction, e) {
    e && e.preventDefault();
    clearTimeout(this.timeout);

    var previousActiveIndex = this.getActiveIndex();

    direction = direction || this.getDirection(previousActiveIndex, index);

    if (this.props.onSelect) {
      this.props.onSelect(index, direction);
    }

    if (this.props.activeIndex == null && index !== previousActiveIndex) {
      if (this.state.previousActiveIndex != null) {
        // If currently animating don't activate the new index.
        // TODO: look into queuing this canceled call and
        // animating after the current animation has ended.
        return;
      }

      this.setState({
        activeIndex: index,
        previousActiveIndex: previousActiveIndex,
        direction: direction
      });
    }
  },

  renderDirectionNav: function renderDirectionNav() {
    return this.props.directionNav ? React.createElement(
      'ul',
      { className: this.setClassNamespace('direction-nav') },
      React.createElement(
        'li',
        null,
        React.createElement(
          'a',
          {
            onClick: this.prev,
            className: this.setClassNamespace('prev'),
            href: '#prev' },
          'Previous'
        )
      ),
      React.createElement(
        'li',
        null,
        React.createElement(
          'a',
          {
            onClick: this.next,
            className: this.setClassNamespace('next'),
            href: '#next' },
          'Next'
        )
      )
    ) : null;
  },

  renderControlNav: function renderControlNav() {
    if (this.props.controlNav) {
      var isThumbnailNav = false;
      var children = React.Children.map(this.props.children, (function (child, i) {
        var className = i === this.getActiveIndex() ? this.setClassNamespace('active') : null;

        if (!isThumbnailNav) {
          isThumbnailNav = !!child.props.thumbnail;
        }

        var thumb = child.props.thumbnail;

        return React.createElement(
          'li',
          {
            onClick: this.handleSelect.bind(this, i, null),
            key: i },
          thumb ? React.createElement('img', { className: className, src: thumb }) : React.createElement('a', { href: '#' + i, className: className }),
          React.createElement('i', null)
        );
      }).bind(this));
      var controlClass = this.setClassNamespace('control-' + (isThumbnailNav ? 'thumbs' : 'paging'));

      return React.createElement(
        'ol',
        {
          className: classNames(this.setClassNamespace('control-nav'), controlClass) },
        children
      );
    }

    return null;
  },

  renderItem: function renderItem(child, index) {
    var activeIndex = this.getActiveIndex();
    var isActive = index === activeIndex;
    var isPreviousActive = this.state.previousActiveIndex != null && this.state.previousActiveIndex === index && this.props.slide;

    return React.cloneElement(child, {
      active: isActive,
      ref: child.ref,
      key: child.key ? child.key : index,
      index: index,
      animateOut: isPreviousActive,
      animateIn: isActive && this.state.previousActiveIndex != null && this.props.slide,
      direction: this.state.direction,
      onAnimateOutEnd: isPreviousActive ? this.handleItemAnimateOutEnd : null
    });
  },

  render: function render() {
    var classSet = this.getClassSet();
    var viewportStyle = {
      overflow: 'hidden',
      position: 'relative',
      width: '100%'
    };

    // React version slider style
    classSet[this.prefixClass('slide')] = true;

    return React.createElement(
      'div',
      _extends({}, this.props, {
        className: classNames(classSet, this.props.className),
        onMouseOver: this.handleMouseOver,
        onMouseOut: this.handleMouseOut }),
      React.createElement(
        'div',
        {
          className: this.setClassNamespace('viewport'),
          style: viewportStyle },
        React.createElement(
          'ul',
          { className: this.setClassNamespace('slides') },
          React.Children.map(this.props.children, this.renderItem)
        )
      ),
      this.renderDirectionNav(),
      this.renderControlNav()
    );
  }
});

Slider.Item = React.createClass({
  displayName: 'Item',

  propTypes: {
    direction: React.PropTypes.oneOf(['prev', 'next']),
    onAnimateOutEnd: React.PropTypes.func,
    active: React.PropTypes.bool,
    animateIn: React.PropTypes.bool,
    animateOut: React.PropTypes.bool,
    caption: React.PropTypes.node,
    index: React.PropTypes.number,
    thumbnail: React.PropTypes.string
  },

  getInitialState: function getInitialState() {
    return {
      direction: null
    };
  },

  getDefaultProps: function getDefaultProps() {
    return {
      animation: true
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      this.setState({
        direction: null
      });
    }
  },

  componentDidUpdate: function componentDidUpdate(prevProps) {
    if (!this.props.active && prevProps.active) {
      TransitionEvents.on(React.findDOMNode(this), this.handleAnimateOutEnd);
    }

    if (this.props.active !== prevProps.active) {
      setTimeout(this.startAnimation, 20);
    }
  },

  handleAnimateOutEnd: function handleAnimateOutEnd() {
    if (this.props.onAnimateOutEnd && this.isMounted()) {
      this.props.onAnimateOutEnd(this.props.index);
    }
  },

  startAnimation: function startAnimation() {
    if (!this.isMounted()) {
      return;
    }

    this.setState({
      direction: this.props.direction === 'prev' ? 'right' : 'left'
    });
  },

  render: function render() {
    var classSet = {
      active: this.props.active && !this.props.animateIn || this.props.animateOut,
      next: this.props.active && this.props.animateIn && this.props.direction === 'next',
      prev: this.props.active && this.props.animateIn && this.props.direction === 'prev'
    };

    if (this.state.direction && (this.props.animateIn || this.props.animateOut)) {
      classSet[this.state.direction] = true;
    }

    return React.createElement(
      'li',
      {
        className: classNames(this.props.className, classSet) },
      this.props.children
    );
  }
});

module.exports = Slider;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"./utils/TransitionEvents":86,"classnames":2}],68:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var assign = require('object-assign');
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Events = require('./utils/Events');
var debounce = require('./utils/debounce');
var domUtils = require('./utils/domUtils');

var Sticky = React.createClass({
  displayName: 'Sticky',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    media: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
    top: React.PropTypes.number,
    animation: React.PropTypes.string,
    bottom: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.func])
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'sticky',
      top: 0
    };
  },

  getInitialState: function getInitialState() {
    return {
      sticked: false,
      holderStyle: null,
      initialized: false,
      stickerStyle: null
    };
  },

  componentDidMount: function componentDidMount() {
    this._init();
    this.checkPosition();
    var ownerWindow = domUtils.ownerWindow(React.findDOMNode(this.refs.sticker));

    this._scrollListener = Events.on(ownerWindow, 'scroll', debounce(this.checkPosition, 10).bind(this));
    this._resizeListener = Events.on(ownerWindow, 'resize', debounce(this.checkPosition, 50).bind(this));
  },

  componentWillMount: function componentWillMount() {
    this._scrollListener && this._scrollListener.off();
    this._resizeListener && this._resizeListener.off();
  },

  _init: function _init() {
    if (this.state.initialized || !this.isMounted || !this.checkMedia()) {
      return;
    }

    var sticker = React.findDOMNode(this.refs.sticker);
    var elStyle = getComputedStyle(sticker);
    var outerHeight = parseInt(elStyle.height, 10) + parseInt(elStyle.marginTop, 10) + parseInt(elStyle.marginBottom, 10);
    var style = {
      height: elStyle.position !== 'absolute' ? outerHeight : '',
      float: elStyle.float !== 'none' ? elStyle.float : '',
      margin: elStyle.margin
    };

    this.setState({
      initialized: true,
      holderStyle: style,
      stickerStyle: {
        margin: 0
      }
    });
  },

  checkPosition: function checkPosition() {
    if (this.isMounted) {
      var scrollTop = domUtils.scrollTop(window);
      var offsetTop = this.props.top;
      var offsetBottom = this.props.bottom;
      var holder = React.findDOMNode(this);

      if (typeof offsetBottom === 'function') {
        offsetBottom = offsetBottom();
      }

      var checkResult = scrollTop > domUtils.offset(holder).top;

      if (checkResult && !this.state.sticked) {
        this.setState({
          stickerStyle: {
            top: offsetTop,
            left: domUtils.offset(holder).left,
            width: holder.offsetWidth
          }
        });
      }

      if (this.state.sticked && !checkResult) {
        this.resetSticker();
      }

      this.setState({
        sticked: checkResult
      });
    }
  },

  checkMedia: function checkMedia() {
    // TODO: add element visible detector
    /*if (!this.$element.is(':visible')) {
     return false;
     }*/

    var media = this.props.media;

    if (media) {
      switch (typeof media) {
        case 'number':
          if (window.innerWidth < media) {
            return false;
          }
          break;

        case 'string':
          if (window.matchMedia && !window.matchMedia(media).matches) {
            return false;
          }
          break;
      }
    }

    return true;
  },

  resetSticker: function resetSticker() {
    this.setState({
      stickerStyle: {
        position: '',
        top: '',
        width: '',
        left: '',
        margin: 0
      }
    });
  },

  // Smooth scroll
  handleClick: function handleClick(e) {
    e.preventDefault();

    if (e.target && e.target.nodeName === 'A') {
      var targetNode = document.getElementById(e.target.getAttribute('href').substr(1));

      targetNode && this.smoothScroll(window, {
        position: domUtils.offset(targetNode).top - this.props.offsetTop || 0
      });
    }
  },

  render: function render() {
    var stickyClass = this.getClassSet();
    var child = React.Children.only(this.props.children);
    var animation = this.props.animation && this.state.sticked ? this.setClassNamespace('animation-' + this.props.animation) : null;

    // transfer child's props to cloned element
    return React.createElement(
      'div',
      _extends({}, this.props, {
        style: this.state.holderStyle,
        className: classNames(this.props.className, this.prefixClass('placeholder')) }),
      React.cloneElement(child, assign({}, child.props, {
        style: this.state.stickerStyle,
        ref: 'sticker',
        className: classNames(child.props.className, this.state.sticked ? stickyClass : null, animation)
      }))
    );
  }
});

module.exports = Sticky;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"./utils/Events":85,"./utils/debounce":89,"./utils/domUtils":90,"classnames":2,"object-assign":4}],69:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var Button = React.createClass({
  displayName: 'Button',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string.isRequired,
    bordered: React.PropTypes.bool,
    compact: React.PropTypes.bool,
    hover: React.PropTypes.bool,
    striped: React.PropTypes.bool,
    radius: React.PropTypes.bool,
    responsive: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'table'
    };
  },

  render: function render() {
    var classSet = this.getClassSet();
    var responsive = this.props.responsive;

    classSet[this.prefixClass('bordered')] = this.props.bordered;
    classSet[this.prefixClass('compact')] = this.props.compact;
    classSet[this.prefixClass('hover')] = this.props.hover;
    classSet[this.prefixClass('striped')] = this.props.striped;
    classSet[this.prefixClass('radius')] = this.props.radius;

    // add `.am-text-nowrap` to responsive table
    classSet[this.setClassNamespace('text-nowrap')] = responsive;

    var table = React.createElement(
      'table',
      _extends({}, this.props, {
        className: classNames(this.props.className, classSet) }),
      this.props.children
    );

    return responsive ? React.createElement(
      'div',
      { className: this.setClassNamespace('scrollable-horizontal') },
      table
    ) : table;
  }
});

module.exports = Button;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],70:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var omit = require('object.omit');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Nav = require('./Nav');
var NavItem = require('./NavItem');

var Tabs = React.createClass({
  displayName: 'Tabs',

  mixins: [ClassNameMixin],

  propTypes: {
    theme: React.PropTypes.oneOf(['default', 'd2']),
    onSelect: React.PropTypes.func,
    animation: React.PropTypes.oneOf(['slide', 'fade']),
    defaultActiveKey: React.PropTypes.any,
    justify: React.PropTypes.bool,
    data: React.PropTypes.array
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'tabs',
      animation: 'fade'
    };
  },

  getInitialState: function getInitialState() {
    var defaultActiveKey = this.props.defaultActiveKey != null ? this.props.defaultActiveKey : this.getDefaultActiveKey(this.props.children);

    return {
      activeKey: defaultActiveKey,
      previousActiveKey: null
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.activeKey != null && nextProps.activeKey !== this.props.activeKey) {
      this.setState({
        previousActiveKey: this.props.activeKey
      });
    }
  },

  getDefaultActiveKey: function getDefaultActiveKey(children) {
    var defaultActiveKey = null;

    if (this.props.data) {
      this.props.data.every(function (item, i) {
        if (item.active) {
          defaultActiveKey = i;
          return false;
        }

        return true;
      });

      return defaultActiveKey == null ? 0 : defaultActiveKey;
    }

    React.Children.forEach(children, function (child) {
      if (defaultActiveKey == null) {
        defaultActiveKey = child.props.eventKey;
      }
    });

    return defaultActiveKey;
  },

  handleClick: function handleClick(key, disabled, e) {
    e.preventDefault();
    var activeKey = this.state.activeKey;

    if (disabled) {
      return null;
    }

    if (this.props.onSelect) {
      this.props.onSelect(key);
    }

    if (activeKey !== key) {
      this.setState({
        activeKey: key,
        previousActiveKey: activeKey
      });
    }
  },

  renderNav: function renderNav() {
    var activeKey = this.state.activeKey;

    return React.Children.map(this.props.children, (function (child, index) {
      var key = child.props.key || child.props.eventKey || index;
      var disabled = child.props.disabled;

      return React.createElement(
        NavItem,
        {
          href: '#',
          ref: 'ref' + key,
          key: key,
          onClick: this.handleClick.bind(this, key, disabled),
          active: child.props.eventKey === activeKey,
          disabled: disabled },
        child.props.title
      );
    }).bind(this));
  },

  renderTabPanels: function renderTabPanels() {
    var activeKey = this.state.activeKey;

    return React.Children.map(this.props.children, function (child, index) {
      return React.createElement(
        Tabs.Item,
        {
          active: child.props.eventKey === activeKey,
          key: child.props.key ? child.props.key : index },
        child.props.children
      );
    });
  },

  // for Amaze UI tabs widget
  renderData: function renderData() {
    var activeKey = this.state.activeKey;
    var navs = [];
    var panels = [];

    this.props.data.forEach((function (item, key) {
      navs.push(React.createElement(
        NavItem,
        {
          href: '#',
          ref: 'ref' + key,
          key: key,
          onClick: this.handleClick.bind(this, key, item.disabled),
          active: key === activeKey,
          disabled: item.disabled },
        item.title
      ));

      panels.push(React.createElement(
        Tabs.Item,
        {
          eventKey: key,
          // active={item.active}
          active: key === activeKey,
          key: key },
        item.content
      ));
    }).bind(this));

    return {
      navs: navs,
      panels: panels
    };
  },

  renderWrapper: function renderWrapper(children) {
    var classSet = this.getClassSet();
    var props = omit(this.props, 'data');

    return React.createElement(
      'div',
      _extends({}, props, {
        'data-am-widget': this.props.theme ? this.props.classPrefix : null,
        className: classNames(classSet, this.props.className) }),
      children
    );
  },

  renderNavWrapper: function renderNavWrapper(children) {
    var TabsNav = this.props.theme ? 'ul' : Nav;

    return React.createElement(
      TabsNav,
      {
        key: 'tabsNav',
        tabs: true,
        className: classNames(this.prefixClass('nav'), this.setClassNamespace('cf')),
        justify: this.props.justify },
      children
    );
  },

  renderBodyWrapper: function renderBodyWrapper(children) {
    var animationClass = this.prefixClass(this.props.animation);

    return React.createElement(
      'div',
      {
        key: 'tabsBody',
        className: classNames(this.prefixClass('bd'), animationClass) },
      children
    );
  },

  render: function render() {
    var children = this.props.data ? this.renderData() : {};

    return this.renderWrapper([this.renderNavWrapper(children.navs || this.renderNav()), this.renderBodyWrapper(children.panels || this.renderTabPanels())]);
  }
});

Tabs.Item = React.createClass({
  displayName: 'Item',

  mixins: [ClassNameMixin],

  propTypes: {
    title: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    eventKey: React.PropTypes.any,
    active: React.PropTypes.bool
  },

  render: function render() {
    var classSet = {};

    classSet[this.setClassNamespace('tab-panel')] = true;
    classSet[this.setClassNamespace('fade')] = true;
    classSet[this.setClassNamespace('active')] = this.props.active;
    classSet[this.setClassNamespace('in')] = this.props.active;

    return React.createElement(
      'div',
      { className: classNames(classSet) },
      this.props.children
    );
  }
});

module.exports = Tabs;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Nav":55,"./NavItem":56,"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],71:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var omit = require('object.omit');

var Thumbnail = React.createClass({
  displayName: 'Thumbnail',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    standalone: React.PropTypes.bool,
    caption: React.PropTypes.node,
    componentTag: React.PropTypes.node
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'thumbnail',
      componentTag: 'figure'
    };
  },

  renderImg: function renderImg(classes, props) {
    props = props || {};

    return props.src ? React.createElement('img', _extends({}, props, {
      className: classes })) : null;
  },

  render: function render() {
    var classes = classNames(this.getClassSet(), this.props.className);

    if (this.props.standalone) {
      return this.renderImg(classes, this.props);
    }

    var Component = this.props.href ? 'a' : this.props.componentTag;
    var imgProps = {
      alt: this.props.alt,
      src: this.props.src,
      width: this.props.width,
      height: this.props.height
    };
    var props = omit(this.props, ['alt', 'src', 'width', 'height']);
    var caption = this.props.caption;

    return React.createElement(
      Component,
      _extends({}, props, {
        className: classes }),
      this.renderImg(null, imgProps),
      caption || this.props.children ? React.createElement(
        Thumbnail.Caption,
        {
          componentTag: typeof caption === 'string' ? 'figcaption' : 'div' },
        this.props.caption || this.props.children
      ) : null
    );
  }
});

Thumbnail.Caption = React.createClass({
  displayName: 'Caption',

  mixins: [ClassNameMixin],

  propTypes: {
    componentTag: React.PropTypes.node
  },

  getDefaultProps: function getDefaultProps() {
    return {
      componentTag: 'div'
    };
  },

  render: function render() {
    var Component = this.props.componentTag;
    var classes = classNames(this.props.className, this.setClassNamespace('thumbnail-caption'));

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classes }),
      this.props.children
    );
  }
});

module.exports = Thumbnail;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],72:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var AvgGrid = require('./AvgGrid');
var omit = require('object.omit');

var Thumbnails = React.createClass({
  displayName: 'Thumbnails',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'thumbnails'
    };
  },

  render: function render() {
    var classes = classNames(this.getClassSet(), this.props.className);
    var props = omit(this.props, 'classPrefix');

    return React.createElement(
      AvgGrid,
      _extends({}, props, {
        className: classes }),
      React.Children.map(this.props.children, function (child, i) {
        return React.createElement(
          'li',
          { key: i },
          child
        );
      })
    );
  }
});

module.exports = Thumbnails;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AvgGrid":21,"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],73:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');

var TimePicker = React.createClass({
  displayName: 'TimePicker',

  mixins: [ClassNameMixin],

  propTypes: {
    onSelect: React.PropTypes.func.isRequired,
    date: React.PropTypes.object,
    format: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker',
      format: 'HH:mm'
    };
  },

  getInitialState: function getInitialState() {
    return {
      viewDate: this.props.date,
      selectedDate: this.props.date,
      displayed: {
        times: { display: 'block' },
        minutes: { display: 'none' },
        hours: { display: 'none' }
      }
    };
  },

  // Minutes
  addMinute: function addMinute() {
    var viewDate = this.state.viewDate;

    viewDate.setMinutes(viewDate.getMinutes() + 1);

    this.setTime(viewDate);
  },

  subtractMinute: function subtractMinute() {
    var viewDate = this.state.viewDate;

    viewDate.setMinutes(viewDate.getMinutes() - 1);

    this.setTime(viewDate);
  },

  setTime: function setTime(viewDate) {
    this.setState({
      viewDate: viewDate,
      selectedDate: new Date(viewDate.valueOf())
    }, function () {
      this.props.onSelect(this.state.selectedDate);
    });
  },

  // set Minutes
  setSelectedMinute: function setSelectedMinute(event) {
    var viewDate = this.state.viewDate;
    var minute = parseInt(event.target.innerHTML.substr(3));

    viewDate.setMinutes(minute);
    this.setTime(viewDate);

    this.setState({
      displayed: {
        times: { display: 'block' },
        minutes: { display: 'none' },
        hours: { display: 'none' }
      }
    });
  },

  showMinutes: function showMinutes() {
    this.setState({
      displayed: {
        times: { display: 'none' },
        minutes: { display: 'block' },
        hours: { display: 'none' }
      }
    });
  },

  // Hours
  showHours: function showHours() {
    this.setState({
      displayed: {
        times: { display: 'none' },
        minutes: { display: 'none' },
        hours: { display: 'block' }
      }
    });
  },

  setSelectedHour: function setSelectedHour(event) {
    var viewDate = this.state.viewDate;
    var hour = parseInt(event.target.innerHTML);

    viewDate.setHours(hour);
    this.setTime(viewDate);

    this.setState({
      displayed: {
        times: { display: 'block' },
        minutes: { display: 'none' },
        hours: { display: 'none' }
      }
    });
  },

  addHour: function addHour() {
    var viewDate = this.state.viewDate;

    viewDate.setHours(viewDate.getHours() + 1);

    this.setTime(viewDate);
  },

  subtractHour: function subtractHour() {
    var viewDate = this.state.viewDate;

    viewDate.setHours(viewDate.getHours() - 1);

    this.setTime(viewDate);
  },

  showTimeText: function showTimeText() {
    var hour = this.state.viewDate.getHours();
    var minute = this.state.viewDate.getMinutes();

    if (minute < 10) {
      minute = '0' + minute;
    }

    if (hour < 10) {
      hour = '0' + hour;
    }

    return {
      hour: hour,
      minute: minute
    };
  },

  renderHours: function renderHours() {
    var time = this.showTimeText().hour + ':' + this.showTimeText().minute;

    return React.createElement(HoursPicker, {
      style: this.state.displayed.hours,
      setSelectedHour: this.setSelectedHour,
      selectedDate: this.state.selectedDate,
      addHour: this.addHour,
      subtractHour: this.subtractHour,
      showTime: time });
  },

  renderMinutes: function renderMinutes() {
    var time = this.showTimeText().hour + ':' + this.showTimeText().minute;

    return React.createElement(MinutesPicker, {
      style: this.state.displayed.minutes,
      setSelectedMinute: this.setSelectedMinute,
      selectedDate: this.state.selectedDate,
      addMinute: this.addMinute,
      subtractMinute: this.subtractMinute,
      showTime: time });
  },

  render: function render() {
    var time = this.showTimeText();

    var content = React.createElement(
      'div',
      { className: this.prefixClass('time-box') },
      React.createElement(
        'strong',
        { onClick: this.showHours },
        time.hour
      ),
      React.createElement(
        'em',
        null,
        ':'
      ),
      React.createElement(
        'strong',
        { onClick: this.showMinutes },
        time.minute
      )
    );

    return React.createElement(
      'div',
      { className: this.prefixClass('body') },
      React.createElement(SubPicker, {
        style: this.state.displayed.times,
        displayName: 'time-wrapper',
        body: content,
        add: this.addMinute,
        subtract: this.subtractMinute,
        showFunc: this.props.showDate,
        showText: 'today' }),
      this.renderHours(),
      this.renderMinutes()
    );
  }
});

var HoursPicker = React.createClass({
  displayName: 'HoursPicker',

  mixins: [ClassNameMixin],

  propTypes: {
    setSelectedHour: React.PropTypes.func.isRequired,
    selectedDate: React.PropTypes.object.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker'
    };
  },

  renderHour: function renderHour() {
    var classes;
    var hour = this.props.selectedDate.getHours();
    var i = 0;
    var hours = [];

    while (i < 24) {
      classes = {};
      classes[this.prefixClass('hour')] = true;

      if (i === hour) {
        classes[this.setClassNamespace('active')] = true;
      }

      hours.push(React.createElement(
        'span',
        {
          className: classNames(classes),
          onClick: this.props.setSelectedHour,
          key: i },
        i < 10 ? '0' + i + ':00' : i + ':00'
      ));

      i++;
    }

    return hours;
  },

  render: function render() {
    return React.createElement(SubPicker, {
      displayName: 'hours',
      style: this.props.style,
      subtract: this.props.subtractHour,
      add: this.props.addHour,
      showText: this.props.showTime,
      body: this.renderHour() });
  }
});

var MinutesPicker = React.createClass({
  displayName: 'MinutesPicker',

  mixins: [ClassNameMixin],

  propTypes: {
    setSelectedMinute: React.PropTypes.func.isRequired,
    selectedDate: React.PropTypes.object.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker'
    };
  },

  renderMinute: function renderMinute() {
    var classes;
    var minute = this.props.selectedDate.getMinutes();
    var hour = this.props.selectedDate.getHours();
    var i = 0;
    var minutes = [];

    while (i < 60) {
      classes = {};
      classes[this.prefixClass('minute')] = true;

      if (i === minute) {
        classes[this.setClassNamespace('active')] = true;
      }

      if (i % 5 === 0) {
        minutes.push(React.createElement(
          'span',
          {
            className: classNames(classes),
            onClick: this.props.setSelectedMinute,
            key: i
          },
          i < 10 ? hour + ':0' + i : hour + ':' + i
        ));
      }

      i++;
    }

    return minutes;
  },

  render: function render() {
    return React.createElement(SubPicker, {
      displayName: 'minutes',
      style: this.props.style,
      subtract: this.props.subtractMinute,
      add: this.props.addMinute,
      showText: this.props.showTime,
      body: this.renderMinute() });
  }
});

var SubPicker = React.createClass({
  displayName: 'SubPicker',

  mixins: [ClassNameMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'datepicker'
    };
  },

  render: function render() {
    var prefixClass = this.prefixClass;

    return React.createElement(
      'div',
      {
        className: prefixClass(this.props.displayName),
        style: this.props.style },
      React.createElement(
        'table',
        { className: prefixClass('table') },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { className: prefixClass('header') },
            React.createElement(
              'th',
              { className: prefixClass('prev'), onClick: this.props.subtract },
              React.createElement('i', { className: prefixClass('prev-icon') })
            ),
            React.createElement(
              'th',
              {
                className: prefixClass('switch'),
                colSpan: '5',
                onClick: this.props.showFunc
              },
              React.createElement(
                'div',
                { className: this.prefixClass('select') },
                this.props.showText
              )
            ),
            React.createElement(
              'th',
              { className: prefixClass('next'), onClick: this.props.add },
              React.createElement('i', { className: prefixClass('next-icon') })
            )
          )
        ),
        React.createElement(
          'tbody',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement(
              'td',
              { colSpan: '7' },
              this.props.body
            )
          )
        )
      )
    );
  }
});

module.exports = TimePicker;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixins/ClassNameMixin":78,"classnames":2}],74:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var AvgGrid = require('./AvgGrid');
var omit = require('object.omit');

var Titlebar = React.createClass({
  displayName: 'Titlebar',

  mixins: [ClassNameMixin],

  propTypes: {
    classPrefix: React.PropTypes.string,
    theme: React.PropTypes.oneOf(['default', 'multi', 'cols']),
    nav: React.PropTypes.array,
    title: React.PropTypes.node
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'titlebar',
      theme: 'default',
      data: []
    };
  },

  render: function render() {
    var classSet = this.getClassSet();
    var props = omit(this.props, ['classPrefix', 'nav', 'theme']);

    return React.createElement(
      'div',
      _extends({}, props, {
        'data-am-widget': this.props.classPrefix,
        className: classNames(this.props.className, classSet) }),
      React.createElement(
        'h2',
        { className: this.prefixClass('title') },
        this.props.href ? React.createElement(
          'a',
          { href: this.props.href },
          this.props.title
        ) : this.props.title
      ),
      this.props.nav ? React.createElement(
        'nav',
        { className: this.prefixClass('nav') },
        this.props.nav.map(function (item, i) {
          return React.createElement(
            'a',
            { href: item.link, key: i },
            item.title
          );
        })
      ) : null
    );
  }
});

module.exports = Titlebar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AvgGrid":21,"./mixins/ClassNameMixin":78,"classnames":2,"object.omit":5}],75:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var assign = require('object-assign');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var createChainedFunction = require('./utils/createChainedFunction');
var Icon = require('./Icon');
var Button = require('./Button');

var Topbar = React.createClass({
  displayName: 'Topbar',

  mixins: [ClassNameMixin],

  propTypes: {
    componentTag: React.PropTypes.node,
    brand: React.PropTypes.node,
    brandLink: React.PropTypes.string,
    inverse: React.PropTypes.bool,
    fixedTop: React.PropTypes.bool,
    fixedBottom: React.PropTypes.bool,
    toggleBtn: React.PropTypes.node,
    toggleNavKey: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
    onToggle: React.PropTypes.func,
    navExpanded: React.PropTypes.bool,
    defaultNavExpanded: React.PropTypes.bool,
    fluid: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      classPrefix: 'topbar',
      componentTag: 'header'
    };
  },

  getInitialState: function getInitialState() {
    return {
      navExpanded: this.props.defaultNavExpanded
    };
  },

  shouldComponentUpdate: function shouldComponentUpdate() {
    // Defer any updates to this component during the `onSelect` handler.
    return !this._isChanging;
  },

  handleToggle: function handleToggle() {
    if (this.props.onToggle) {
      this._isChanging = true;
      this.props.onToggle();
      this._isChanging = false;
    }

    this.setState({
      navExpanded: !this.state.navExpanded
    });
  },

  isNavExpanded: function isNavExpanded() {
    return this.props.navExpanded != null ? this.props.navExpanded : this.state.navExpanded;
  },

  renderBrand: function renderBrand() {
    var brand = this.props.brand;
    var brandClassName = this.prefixClass('brand');

    if (React.isValidElement(brand)) {
      return React.cloneElement(brand, assign({}, brand.props, {
        className: classNames(brand.props.className, brandClassName),
        onClick: createChainedFunction(this.handleToggle, brand.props.onClick)
      }));
    }

    return brand ? React.createElement(
      'h1',
      { className: brandClassName },
      this.props.brandLink ? React.createElement(
        'a',
        { href: this.props.brandLink },
        this.props.brand
      ) : this.props.brand
    ) : null;
  },

  renderToggleButton: function renderToggleButton() {
    var toggleBtn = this.props.toggleBtn;
    var toggleBtnClassName = this.prefixClass('toggle');

    if (React.isValidElement(toggleBtn)) {
      return React.cloneElement(toggleBtn, assign({}, toggleBtn.props, {
        className: classNames(toggleBtn.props.className, toggleBtnClassName),
        onClick: createChainedFunction(this.handleToggle, toggleBtn.props.onClick)
      }));
    }

    return React.createElement(
      Button,
      {
        amSize: 'sm',
        onClick: this.handleToggle,
        className: classNames(this.prefixClass('btn'), this.prefixClass('toggle'), this.setClassNamespace('show-sm-only')) },
      React.createElement(
        'span',
        { className: this.setClassNamespace('sr-only') },
        '导航切换'
      ),
      React.createElement(Icon, { icon: 'bars' })
    );
  },

  renderChild: function renderChild(child, i) {
    return React.cloneElement(child, assign({}, child.props, {
      topbar: true,
      collapsible: this.props.toggleNavKey != null && this.props.toggleNavKey === child.props.eventKey,
      expanded: this.props.toggleNavKey != null && this.props.toggleNavKey === child.props.eventKey && this.isNavExpanded(),
      key: child.key ? child.key : i,
      className: classNames(child.props.className, child.props.right ? this.prefixClass('right') : null)
    }));
  },

  render: function render() {
    var classes = this.getClassSet();
    var Component = this.props.componentTag;

    // set classes
    classes[this.prefixClass('inverse')] = this.props.inverse;
    classes[this.prefixClass('fixed-top')] = this.props.fixedTop;
    classes[this.prefixClass('fixed-bottom')] = this.props.fixedBottom;

    return React.createElement(
      Component,
      _extends({}, this.props, {
        className: classNames(classes, this.props.className) }),
      React.createElement(
        'div',
        {
          className: !this.props.fluid ? this.setClassNamespace('container') : null },
        this.renderBrand(),
        this.renderToggleButton(),
        React.Children.map(this.props.children, this.renderChild)
      )
    );
  }
});

module.exports = Topbar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Button":24,"./Icon":45,"./mixins/ClassNameMixin":78,"./utils/createChainedFunction":87,"classnames":2,"object-assign":4}],76:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Custom radio/checkbox style
 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Input = require('./Input');
var constants = require('./constants');

var UCheck = React.createClass({
  displayName: 'UCheck',

  mixins: [ClassNameMixin],

  propTypes: {
    type: React.PropTypes.oneOf(['radio', 'checkbox']),
    disabled: React.PropTypes.bool,
    amStyle: React.PropTypes.oneOf(['secondary', 'success', 'warning', 'danger']),
    inline: React.PropTypes.bool,
    hasFeedback: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      type: 'checkbox'
    };
  },

  render: function render() {
    var classSet = {};

    classSet[this.setClassNamespace(this.props.type)] = !this.props.inline;
    classSet[this.setClassNamespace(this.props.type + '-inline')] = this.props.inline;

    if (this.props.amStyle) {
      classSet[this.setClassNamespace(this.props.amStyle)] = true;
    }

    return React.createElement(
      'label',
      { className: classNames(this.props.className, classSet) },
      React.createElement(Input, _extends({}, this.props, {
        ref: 'field',
        className: this.setClassNamespace('ucheck-checkbox'), standalone: true })),
      React.createElement(
        'span',
        { className: this.setClassNamespace('ucheck-icons') },
        React.createElement('i', { className: 'am-icon-unchecked' }),
        React.createElement('i', { className: 'am-icon-checked' })
      ),
      this.props.label
    );
  }
});

module.exports = UCheck;

// TODO: replace icon with Icon component

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Input":47,"./constants":77,"./mixins/ClassNameMixin":78,"classnames":2}],77:[function(require,module,exports){
'use strict';

var NAMESPACE = 'am';
var setNamespace = function setNamespace(className) {
  return (NAMESPACE ? NAMESPACE + '-' : '') + className;
};

module.exports = {
  NAMESPACE: NAMESPACE,

  CLASSES: {
    active: setNamespace('active'),
    disabled: setNamespace('disabled'),
    round: setNamespace('round'),
    radius: setNamespace('radius'),
    square: setNamespace('square'),
    circle: setNamespace('circle'),
    divider: setNamespace('divider'),
    cf: setNamespace('cf'),
    fl: setNamespace('fl'),
    fr: setNamespace('fr')
  },

  STYLES: {
    'default': 'default',
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    warning: 'warning',
    danger: 'danger'
  },

  SIZES: {}
};

},{}],78:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var constants = require('../constants');
var nsPrefix = constants.NAMESPACE ? constants.NAMESPACE + '-' : '';

module.exports = {
  getClassSet: function getClassSet(ignorePrefix) {
    var classNames = {};
    // uses `.am-` as prefix if `classPrefix` is not defined
    var prefix = nsPrefix;

    if (this.props.classPrefix) {
      var classPrefix = this.setClassNamespace();

      prefix = classPrefix + '-';

      // don't return prefix if flag set
      !ignorePrefix && (classNames[classPrefix] = true);
    }

    var amSize = this.props.amSize;
    var amStyle = this.props.amStyle;

    if (amSize) {
      classNames[prefix + amSize] = true;
    }

    if (amStyle) {
      classNames[prefix + amStyle] = true;
    }

    // add theme className for widgets
    if (this.props.theme) {
      classNames[prefix + this.props.theme] = true;
    }

    // states
    classNames[constants.CLASSES.active] = this.props.active;
    classNames[constants.CLASSES.disabled] = this.props.disabled;

    // shape
    classNames[constants.CLASSES.radius] = this.props.radius;
    classNames[constants.CLASSES.round] = this.props.round;

    // clearfix
    classNames[constants.CLASSES.cf] = this.props.cf;

    // am-divider
    if (this.props.classPrefix !== 'divider') {
      classNames[constants.CLASSES.divider] = this.props.divider;
    }

    return classNames;
  },

  // add namespace to classPrefix
  setClassNamespace: function setClassNamespace(classPrefix) {
    var prefix = classPrefix || this.props.classPrefix || '';

    return nsPrefix + prefix;
  },

  prefixClass: function prefixClass(subClass) {
    return this.setClassNamespace() + '-' + subClass;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../constants":77}],79:[function(require,module,exports){
(function (global){
/**
 * modified version of:
 * https://github.com/react-bootstrap/react-bootstrap/blob/master/src/CollapsibleMixin.js
 */

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var TransitionEvents = require('../utils/TransitionEvents');

var CollapseMixin = {
  propTypes: {
    defaultExpanded: React.PropTypes.bool,
    expanded: React.PropTypes.bool
  },

  getInitialState: function getInitialState() {
    var defaultExpanded = this.props.defaultExpanded != null ? this.props.defaultExpanded : this.props.expanded != null ? this.props.expanded : false;

    return {
      expanded: defaultExpanded,
      collapsing: false
    };
  },

  componentWillUpdate: function componentWillUpdate(nextProps, nextState) {
    var willExpanded = nextProps.expanded != null ? nextProps.expanded : nextState.expanded;

    if (willExpanded === this.isExpanded()) {
      return;
    }

    // if the expanded state is being toggled, ensure node has a dimension value
    // this is needed for the animation to work and needs to be set before
    // the collapsing class is applied (after collapsing is applied the in class
    // is removed and the node's dimension will be wrong)

    var node = this.getCollapsibleDOMNode();
    var dimension = this.dimension();
    var value = '0';

    if (!willExpanded) {
      // get height
      value = this.getCollapsibleDimensionValue();
    }

    node.style[dimension] = value + 'px';

    this._afterWillUpdate();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    // check if expanded is being toggled; if so, set collapsing
    this._checkToggleCollapsing(prevProps, prevState);

    // check if collapsing was turned on; if so, start animation
    this._checkStartAnimation();
  },

  // helps enable test stubs
  _afterWillUpdate: function _afterWillUpdate() {},

  _checkStartAnimation: function _checkStartAnimation() {
    if (!this.state.collapsing) {
      return;
    }

    var node = this.getCollapsibleDOMNode();
    var dimension = this.dimension();
    var value = this.getCollapsibleDimensionValue();

    // setting the dimension here starts the transition animation
    var result;

    if (this.isExpanded()) {
      result = value + 'px';
    } else {
      result = '0px';
    }
    node.style[dimension] = result;
  },

  _checkToggleCollapsing: function _checkToggleCollapsing(prevProps, prevState) {
    var wasExpanded = prevProps.expanded != null ? prevProps.expanded : prevState.expanded;
    var isExpanded = this.isExpanded();

    if (wasExpanded !== isExpanded) {
      if (wasExpanded) {
        this._handleCollapse();
      } else {
        this._handleExpand();
      }
    }
  },

  _handleExpand: function _handleExpand() {
    var node = this.getCollapsibleDOMNode();
    var dimension = this.dimension();

    var complete = (function () {
      this._removeEndEventListener(node, complete);
      // remove dimension value - this ensures the collapsible item can grow
      // in dimension after initial display (such as an image loading)
      node.style[dimension] = '';
      this.setState({
        collapsing: false
      });
    }).bind(this);

    this._addEndEventListener(node, complete);

    this.setState({
      collapsing: true
    });
  },

  _handleCollapse: function _handleCollapse() {
    var node = this.getCollapsibleDOMNode();
    var _this = this;
    var complete = function complete() {
      _this._removeEndEventListener(node, complete);
      _this.setState({
        collapsing: false
      });
    };

    this._addEndEventListener(node, complete);

    this.setState({
      collapsing: true
    });
  },

  // helps enable test stubs
  _addEndEventListener: function _addEndEventListener(node, complete) {
    TransitionEvents.on(node, complete);
  },

  // helps enable test stubs
  _removeEndEventListener: function _removeEndEventListener(node, complete) {
    TransitionEvents.off(node, complete);
  },

  dimension: function dimension() {
    return typeof this.getCollapsibleDimension === 'function' ? this.getCollapsibleDimension() : 'height';
  },

  isExpanded: function isExpanded() {
    return this.props.expanded != null ? this.props.expanded : this.state.expanded;
  },

  getCollapsibleClassSet: function getCollapsibleClassSet(className) {
    var classSet = {};

    if (typeof className === 'string') {
      className.split(' ').forEach(function (subClass) {
        if (subClass) {
          classSet[subClass] = true;
        }
      });
    }

    classSet[this.setClassNamespace('collapsing')] = this.state.collapsing;
    classSet[this.setClassNamespace('collapse')] = !this.state.collapsing;
    classSet[this.setClassNamespace('in')] = this.isExpanded() && !this.state.collapsing;

    return classSet;
  }
};

module.exports = CollapseMixin;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils/TransitionEvents":86}],80:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var classNames = require('classnames');
var getScrollbarWidth = require('../utils/getScrollbarWidth');
var CSSCore = require('../utils/CSSCore');

module.exports = {
  setDimmerContainer: function setDimmerContainer() {
    var container = this.props.container && React.findDOMNode(this.props.container) || document.body;
    var bodyPaddingRight = parseInt(container.style.paddingRight || 0, 10);
    var barWidth = getScrollbarWidth();

    if (barWidth) {
      container.style.paddingRight = bodyPaddingRight + barWidth + 'px';
    }

    CSSCore.addClass(container, this.setClassNamespace('dimmer-active'));
  },

  resetDimmerContainer: function resetDimmerContainer(nextProps, nextState) {
    var container = this.props.container && React.findDOMNode(this.props.container) || document.body;

    CSSCore.removeClass(container, this.setClassNamespace('dimmer-active'));

    container.style.paddingRight = '';
  },

  renderDimmer: function renderDimmer(children) {
    var onClick = this.handleDimmerClick || null;
    var classSet = {};

    classSet[this.setClassNamespace('dimmer')] = true;
    classSet[this.setClassNamespace('active')] = true;

    return React.createElement(
      'div',
      null,
      React.createElement('div', {
        onClick: onClick,
        ref: 'dimmer',
        style: { display: 'block' },
        className: classNames(classSet) }),
      children
    );
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils/CSSCore":84,"../utils/getScrollbarWidth":91,"classnames":2}],81:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

/**
 * Overlay Mixin
 *
 * @desc `overlay` is something like Popover, Modal, etc.
 * */

module.exports = {
  propTypes: {
    container: React.PropTypes.node
  },

  componentDidMount: function componentDidMount() {
    this._renderOverlay();
  },

  componentDidUpdate: function componentDidUpdate() {
    this._renderOverlay();
  },

  // Remove Overlay related DOM node
  componentWillUnmount: function componentWillUnmount() {
    this._unmountOverlay();

    if (this._overlayWrapper) {
      this.getContainerDOMNode().removeChild(this._overlayWrapper);
      this._overlayWrapper = null;
    }
  },

  // Create Overlay wrapper
  _mountOverlayWrapper: function _mountOverlayWrapper() {
    this._overlayWrapper = document.createElement('div');
    this.getContainerDOMNode().appendChild(this._overlayWrapper);
  },

  // Render Overlay to wrapper
  _renderOverlay: function _renderOverlay() {
    if (!this._overlayWrapper) {
      this._mountOverlayWrapper();
    }

    var overlay = this.renderOverlay();

    if (overlay !== null) {
      this._overlayInstance = React.render(overlay, this._overlayWrapper);
    } else {
      // Unmount if the component is null for transitions to null
      this._unmountOverlay();
    }
  },

  // Remove a mounted Overlay from wrapper
  _unmountOverlay: function _unmountOverlay() {
    React.unmountComponentAtNode(this._overlayWrapper);
    this._overlayInstance = null;
  },

  getOverlayDOMNode: function getOverlayDOMNode() {
    if (!this.isMounted()) {
      throw new Error('getOverlayDOMNode(): A component must be mounted to' + ' have a DOM node.');
    }

    if (this._overlayInstance) {
      return React.findDOMNode(this._overlayInstance);
    }

    return null;
  },

  getContainerDOMNode: function getContainerDOMNode() {
    return React.findDOMNode(this.props.container) || document.body;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],82:[function(require,module,exports){
(function (global){
/**
 * modified version of:
 * http://mir.aculo.us/2014/01/19/scrolling-dom-elements-to-the-top-a-zepto-plugin/
 */

'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Events = require('../utils/Events');
var dom = require('../utils/domUtils');
var rAF = require('../utils/requestAnimationFrame');
var scrollInProgress = false;

var SmoothScrollMixin = {
  smoothScroll: function smoothScroll(element, options) {
    options = options || {};
    var scrollTarget = element || window;
    var targetY = options.position && parseInt(options.position, 10) || 0;
    var initialY = dom.scrollTop(scrollTarget);
    var lastY = initialY;
    var delta = targetY - initialY;
    // duration in ms, make it a bit shorter for short distances
    // this is not scientific and you might want to adjust this for
    // your preferences
    var speed = options.speed || Math.min(750, Math.min(1500, Math.abs(initialY - targetY)));
    // temp variables (t will be a position between 0 and 1, y is the calculated scrollTop)
    var start;
    var t;
    var y;
    var cancelScroll = function cancelScroll() {
      abort();
    };

    // abort if already in progress or nothing to scroll
    if (scrollInProgress) {
      console.log(scrollInProgress);
      return;
    }

    if (delta === 0) {
      return;
    }

    // quint ease-in-out smoothing, from
    // https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/penner.js#L127-L136
    function smooth(pos) {
      if ((pos /= 0.5) < 1) {
        return 0.5 * Math.pow(pos, 5);
      }

      return 0.5 * (Math.pow(pos - 2, 5) + 2);
    }

    function abort() {
      Events.off(scrollTarget, 'touchstart', cancelScroll);
      scrollInProgress = false;
    }

    // when there's a touch detected while scrolling is in progress, abort
    // the scrolling (emulates native scrolling behavior)
    Events.on(scrollTarget, 'touchstart', cancelScroll);
    scrollInProgress = true;

    // start rendering away! note the function given to frame
    // is named "render" so we can reference it again further down
    rAF(function render(now) {
      if (!scrollInProgress) {
        return;
      }

      if (!start) {
        start = now;
      }

      // calculate t, position of animation in [0..1]
      t = Math.min(1, Math.max((now - start) / speed, 0));
      // calculate the new scrollTop position (don't forget to smooth)
      y = Math.round(initialY + delta * smooth(t));
      // bracket scrollTop so we're never over-scrolling
      if (delta > 0 && y > targetY) {
        y = targetY;
      }

      if (delta < 0 && y < targetY) {
        y = targetY;
      }
      // only actually set scrollTop if there was a change front he last frame
      if (lastY !== y) {
        dom.scrollTop(scrollTarget, y);
      }

      lastY = y;
      // if we're not done yet, queue up an other frame to render,
      // or clean up
      if (y !== targetY) {
        rAF(render);
      } else {
        abort();
      }
    });
  }
};

module.exports = SmoothScrollMixin;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../utils/Events":85,"../utils/domUtils":90,"../utils/requestAnimationFrame":94}],83:[function(require,module,exports){
'use strict';

module.exports = {
  ClassNameMixin: require('./ClassNameMixin'),
  CollapseMixin: require('./CollapseMixin'),
  DimmerMixin: require('./DimmerMixin'),
  OverlayMixin: require('./OverlayMixin'),
  SmoothScrollMixin: require('./SmoothScrollMixin.js')
};

},{"./ClassNameMixin":78,"./CollapseMixin":79,"./DimmerMixin":80,"./OverlayMixin":81,"./SmoothScrollMixin.js":82}],84:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @via https://github.com/facebook/react/blob/master/src/vendor/core/CSSCore.js
 */

'use strict';

var CSSCore = {

  /**
   * Adds the class passed in to the element if it doesn't already have it.
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @return {DOMElement} the element passed in
   */
  addClass: function addClass(element, className) {
    if (className) {
      if (element.classList) {
        element.classList.add(className);
      } else if (!CSSCore.hasClass(element, className)) {
        element.className = element.className + ' ' + className;
      }
    }
    return element;
  },

  /**
   * Removes the class passed in from the element
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @return {DOMElement} the element passed in
   */
  removeClass: function removeClass(element, className) {
    if (className) {
      if (element.classList) {
        element.classList.remove(className);
      } else if (CSSCore.hasClass(element, className)) {
        element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), '$1').replace(/\s+/g, ' ') // multiple spaces to one
        .replace(/^\s*|\s*$/g, ''); // trim the ends
      }
    }
    return element;
  },

  /**
   * Helper to add or remove a class from an element based on a condition.
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @param {*} bool condition to whether to add or remove the class
   * @return {DOMElement} the element passed in
   */
  conditionClass: function conditionClass(element, className, bool) {
    return (bool ? CSSCore.addClass : CSSCore.removeClass)(element, className);
  },

  /**
   * Tests whether the element has the class specified.
   *
   * @param {DOMNode|DOMWindow} element the element to set the class on
   * @param {string} className the CSS className
   * @return {boolean} true if the element has the class, false if not
   */
  hasClass: function hasClass(element, className) {
    if (element.classList) {
      return !!className && element.classList.contains(className);
    }
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
  },

  toggleClass: function toggleClass(element, className) {
    return CSSCore.hasClass(element, className) ? CSSCore.removeClass(element, className) : CSSCore.addClass(element, className);
  }
};

module.exports = CSSCore;

},{}],85:[function(require,module,exports){
'use strict';

var bind = window.addEventListener ? 'addEventListener' : 'attachEvent';
var unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
var prefix = bind !== 'addEventListener' ? 'on' : '';

var events = {
  one: function one(node, eventNames, eventListener) {
    var typeArray = eventNames.split(' ');
    var recursiveFunction = function recursiveFunction(e) {
      e.target.removeEventListener(e.type, recursiveFunction);
      return eventListener(e);
    };

    for (var i = typeArray.length - 1; i >= 0; i--) {
      this.on(node, typeArray[i], recursiveFunction);
    }
  },

  /**
   * Bind `node` event `eventName` to `eventListener`.
   *
   * @param {Element} node
   * @param {String} eventName
   * @param {Function} eventListener
   * @param {Boolean} capture
   * @return {Obejct}
   * @api public
   */

  on: function on(node, eventName, eventListener, capture) {
    node[bind](prefix + eventName, eventListener, capture || false);

    return {
      off: function off() {
        node[unbind](prefix + eventName, eventListener, capture || false);
      }
    };
  },

  /**
   * Unbind `node` event `eventName`'s callback `eventListener`.
   *
   * @param {Element} node
   * @param {String} eventName
   * @param {Function} eventListener
   * @param {Boolean} capture
   * @return {Function}
   * @api public
   */

  off: function off(node, eventName, eventListener, capture) {
    node[unbind](prefix + eventName, eventListener, capture || false);
    return eventListener;
  }
};

module.exports = events;

},{}],86:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * modified version of:
 * https://github.com/facebook/react/blob/0.13-stable/src/addons/transitions/ReactTransitionEvents.js
 */

'use strict';

var CSSCore = require('./CSSCore');

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/**
 * EVENT_NAME_MAP is used to determine which event fired when a
 * transition/animation ends, based on the style property used to
 * define that event.
 */
var EVENT_NAME_MAP = {
  transitionend: {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'mozTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd'
  },

  animationend: {
    'animation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'mozAnimationEnd',
    'OAnimation': 'oAnimationEnd',
    'msAnimation': 'MSAnimationEnd'
  }
};

var endEvents = [];
var support = {};

function detectEvents() {
  var testEl = document.createElement('div');
  var style = testEl.style;

  // On some platforms, in particular some releases of Android 4.x,
  // the un-prefixed "animation" and "transition" properties are defined on the
  // style object but the events that fire will still be prefixed, so we need
  // to check if the un-prefixed events are useable, and if not remove them
  // from the map
  if (!('AnimationEvent' in window)) {
    delete EVENT_NAME_MAP.animationend.animation;
  }

  if (!('TransitionEvent' in window)) {
    delete EVENT_NAME_MAP.transitionend.transition;
  }

  for (var baseEventName in EVENT_NAME_MAP) {
    var baseEvents = EVENT_NAME_MAP[baseEventName];
    support[baseEventName] = false;

    for (var styleName in baseEvents) {
      if (styleName in style) {
        support[baseEventName] = baseEvents[styleName];
        endEvents.push(baseEvents[styleName]);
        break;
      }
    }
  }
}

if (canUseDOM) {
  detectEvents();
}

if (support.animationend) {
  CSSCore.addClass(document.documentElement, 'cssanimations');
}

// We use the raw {add|remove}EventListener() call because EventListener
// does not know how to remove event listeners and we really should
// clean up. Also, these events are not triggered in older browsers
// so we should be A-OK here.

function addEventListener(node, eventName, eventListener) {
  node.addEventListener(eventName, eventListener, false);
}

function removeEventListener(node, eventName, eventListener) {
  node.removeEventListener(eventName, eventListener, false);
}

var TransitionEvents = {
  on: function on(node, eventListener) {
    if (endEvents.length === 0) {
      // If CSS transitions are not supported, trigger an "end animation"
      // event immediately.
      window.setTimeout(eventListener, 0);
      return;
    }
    endEvents.forEach(function (endEvent) {
      addEventListener(node, endEvent, eventListener);
    });
  },

  off: function off(node, eventListener) {
    if (endEvents.length === 0) {
      return;
    }
    endEvents.forEach(function (endEvent) {
      removeEventListener(node, endEvent, eventListener);
    });
  },

  support: support
};

module.exports = TransitionEvents;

},{"./CSSCore":84}],87:[function(require,module,exports){
/**
 * modified version of:
 * https://github.com/react-bootstrap/react-bootstrap/blob/master/src/utils/createChainedFunction.js
 */

'use strict';

/**
 * Safe chained function
 *
 * Will only create a new function if needed,
 * otherwise will pass back existing functions or null.
 *
 * @param {function} one
 * @param {function} two
 * @returns {function|null}
 */

function createChainedFunction(one, two) {
  var hasOne = typeof one === 'function';
  var hasTwo = typeof two === 'function';

  if (!hasOne && !hasTwo) {
    return null;
  }

  if (!hasOne) {
    return two;
  }

  if (!hasTwo) {
    return one;
  }

  return function chainedFunction() {
    one.apply(this, arguments);
    two.apply(this, arguments);
  };
}

module.exports = createChainedFunction;

},{}],88:[function(require,module,exports){
'use strict';

var locales = {
  'en_US': {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    weekStart: 0
  },
  'zh_CN': {
    days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    daysMin: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    today: '今天',
    weekStart: 0
  }
};

var dateUtils = {
  isLeapYear: function isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  },

  getDaysInMonth: function getDaysInMonth(year, month) {
    return [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  },

  getLocale: function getLocale(locale) {
    if (!locale) {
      locale = navigator.language && navigator.language.split('-');
      locale[1] = locale[1].toUpperCase();
      locale = locale.join('_');
    }

    return locales[locale] || locales['en_US'];
  }
};

module.exports = dateUtils;

},{}],89:[function(require,module,exports){
'use strict';

/**
 * Debounce function
 * @param {function} fn  Function to be debounced
 * @param {number} wait Function execution threshold in milliseconds
 * @param {bool} immediate  Whether the function should be called at
 *                          the beginning of the delay instead of the
 *                          end. Default is false.
 * @desc Executes a function when it stops being invoked for n seconds
 * @via  _.debounce() http://underscorejs.org
 */

module.exports = function (fn, wait, immediate) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;
    var later = function later() {
      timeout = null;
      if (!immediate) {
        fn.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      fn.apply(context, args);
    }
  };
};

},{}],90:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

/**
 * Get ownerDocument
 * @param {ReactComponent|HTMLElement} componentOrElement
 * @returns {HTMLDocument}
 */
function ownerDocument(componentOrElement) {
  var element = React.findDOMNode(componentOrElement);

  return element && element.ownerDocument || document;
}

/**
 * Get ownerWindow
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 * @refer https://github.com/jquery/jquery/blob/6df669f0fb87cd9975a18bf6bbe3c3548afa4fee/src/event.js#L294-L297
 */
function ownerWindow(element) {
  var doc = ownerDocument(element);

  return doc.defaultView || doc.parentWindow || window;
}

module.exports = {
  ownerDocument: ownerDocument,

  ownerWindow: ownerWindow,

  scrollTop: function scrollTop(element, value) {
    if (!element) {
      return;
    }

    var hasScrollTop = ('scrollTop' in element);

    if (value === undefined) {
      return hasScrollTop ? element.scrollTop : element.pageYOffset;
    }

    hasScrollTop ? element.scrollTop = value : element.scrollTo(element.scrollX, value);
  },

  offset: function offset(element) {
    if (element) {
      var rect = element.getBoundingClientRect();
      var body = document.body;
      var clientTop = element.clientTop || body.clientTop || 0;
      var clientLeft = element.clientLeft || body.clientLeft || 0;
      var scrollTop = window.pageYOffset || element.scrollTop;
      var scrollLeft = window.pageXOffset || element.scrollLeft;

      return {
        top: rect.top + scrollTop - clientTop,
        left: rect.left + scrollLeft - clientLeft
      };
    }

    return null;
  },

  position: function position(element) {
    return {
      left: element.offsetLeft,
      top: element.offsetTop
    };
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],91:[function(require,module,exports){
'use strict';

/**
 * getScrollbarWidth
 *
 * @desc via http://davidwalsh.name/detect-scrollbar-width
 * @returns {number}
 */

function getScrollbarWidth() {
  if (document.body.clientWidth >= window.innerWidth) {
    return 0;
  }

  // Create the measurement node
  var measure = document.createElement('div');

  measure.className = 'am-scrollbar-measure';
  document.body.appendChild(measure);

  // Get the scrollbar width
  var scrollbarWidth = measure.offsetWidth - measure.clientWidth;

  // Delete the DIV
  document.body.removeChild(measure);

  return scrollbarWidth;
}

module.exports = getScrollbarWidth;

},{}],92:[function(require,module,exports){
'use strict';

/**
 * isInViewport
 *
 * @desc determine if any part of the element is visible in the viewport
 * @reference https://github.com/Josh-Miller/isInViewport
 * @param {HTMLElement} element
 * @returns {boolean}
 */

function isInViewport(element) {
  var top = element.offsetTop;
  var left = element.offsetLeft;
  var width = element.offsetWidth;
  var height = element.offsetHeight;

  while (element.offsetParent) {
    element = element.offsetParent;
    top += element.offsetTop;
    left += element.offsetLeft;
  }

  return top < window.pageYOffset + window.innerHeight && left < window.pageXOffset + window.innerWidth && top + height > window.pageYOffset && left + width > window.pageXOffset;
}

module.exports = isInViewport;

},{}],93:[function(require,module,exports){
'use strict';

module.exports = function (node, tree) {
  while (node) {
    if (node === tree) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
};

},{}],94:[function(require,module,exports){
(function (global){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * modified version of:
 * https://github.com/facebook/react/blob/0.13-stable/src/vendor/core/requestAnimationFrame.js
 */

'use strict';

var nativeRAF = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame;

var lastTime = 0;

var requestAnimationFrame = nativeRAF || function (callback) {
  var currTime = Date.now();
  var timeDelay = Math.max(0, 16 - (currTime - lastTime));

  lastTime = currTime + timeDelay;
  return global.setTimeout(function () {
    callback(Date.now());
  }, timeDelay);
};

// Works around a rare bug in Safari 6 where the first request is never invoked.
requestAnimationFrame(function () {});

module.exports = requestAnimationFrame;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],95:[function(require,module,exports){
'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');
var assign = require('object-assign');

// ajax状态更新示例
// function showArticle(articleId) {
//     dispatch({type: "SHOW_ARTICLE", id: articleId, state: "loading"});
//     $.ajax({
//         url: "/article/#{articleId}"
//         success: function (data, textStatus, jqXHR) {
//             dispatch({type: "ARTICLE_LOADED", id: articleId, state: "ready", content: data});
//         }
//     });
// }

var AppActions = {
  ajax: function ajax(options) {
    var _options = assign({}, options);
    // AppDispatcher.dispatch({
    //     actionType: options.react_actionType,
    //     id: options._react_id,
    //     loaded: false
    //   });
    // var tempSuc = options.success;
    // function _suc(data, textStatus, jqXHR) {
    //   tempSuc.apply(null, arguments);
    //   // AppDispatcher.dispatch({
    //   //   actionType: options.react_actionType,
    //   //   id: options._react_id,
    //   //   loaded: true,
    //   //   content: data
    //   // });
    // }
    // _options.success = _suc;
    delete _options.react_id;
    delete _options.react_actionType;
    $._ajax(_options);
  },
  updateHeader: function updateHeader(obj) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_HEADER,
      obj: obj
    });
  },
  create: function create(text) {
    AppDispatcher.dispatch({
      actionType: AppConstants.APP_CREATE,
      text: text
    });
  }
};

module.exports = AppActions;

},{"../constants/AppConstants":99,"../dispatcher/AppDispatcher":100,"object-assign":125}],96:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
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

document.addEventListener('DOMContentLoaded', function () {
  Router.run(routes, Router.HashLocation, function (Handler) {
    React.render(React.createElement(Handler, null), document.body);
  });
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./routes":115,"react-router":150}],97:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = require('react-router');

var RUI = require('../reactUI');
var Header = RUI.Header;

var AppStore = require('../stores/AppStore');

//console.log(Router.HistoryLocation.getCurrentPath());

var HeaderBar = React.createClass({
  displayName: 'HeaderBar',

  getInitialState: function getInitialState() {
    return AppStore.getHeaderInfo();
  },
  componentDidMount: function componentDidMount() {
    AppStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange);
  },
  render: function render() {
    if (!this.state.data) {
      return React.createElement('div', null);
    }
    return React.createElement(Header, this.state);
  },
  _onChange: function _onChange() {
    //此处要更新一下 TDK，目前只提供 title 的
    //console.log(React.findDOMNode())
    var headerInfo = AppStore.getHeaderInfo();
    document.title = headerInfo.title + '-爱抢购';
    this.setState(headerInfo);
  }
});

module.exports = HeaderBar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../reactUI":114,"../stores/AppStore":116,"react-router":150}],98:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = require('react-router');
var Route = Router.Route;
var State = Router.State;
var Link = Router.Link;

var RUI = require('../reactUI');

var NavLink = React.createClass({
  displayName: 'NavLink',

  render: function render() {
    return React.createElement(
      RUI.Container,
      { className: 'am-padding-vertical-lg ask-nav' },
      React.createElement(
        'h2',
        null,
        '测试链接'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/' },
        '首页'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/page1' },
        '页面1'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/about' },
        '关于'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/login' },
        '登录'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/list' },
        '列表'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/list/34' },
        '列表项'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/about/company' },
        '公司'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/action' },
        '活动页'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/ajax' },
        'Ajax 数据'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/complex' },
        '复杂数据'
      ),
      React.createElement(
        'a',
        { className: 'am-btn am-btn-link', href: '#/chart' },
        '图表'
      )
    );
  }
});

module.exports = NavLink;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../reactUI":114,"react-router":150}],99:[function(require,module,exports){
'use strict';

var keyMirror = require('keymirror');

module.exports = keyMirror({
  APP_AJAX: null,
  APP_HEADER: null,
  APP_CREATE: null,
  APP_COMPLETE: null,
  APP_DESTROY: null,
  APP_DESTROY_COMPLETED: null,
  APP_TOGGLE_COMPLETE_ALL: null,
  APP_UNDO_COMPLETE: null,
  APP_UPDATE_TEXT: null
});

},{"keymirror":123}],100:[function(require,module,exports){
/*
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * AppDispatcher
 *
 * A singleton that operates as the central hub for application updates.
 */
'use strict';

var Dispatcher = require('flux').Dispatcher;

module.exports = new Dispatcher();

},{"flux":120}],101:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '关于我们',
  pageId: '100000',
  header: {
    right: [{
      link: '#right-link',
      icon: 'bars',
      callback: function callback(nav, e) {
        e.preventDefault();
        console.log('点击了自定义侧边栏');
      }
    }]
  }
};

var About = React.createClass({
  displayName: 'About',

  getInitialState: function getInitialState() {
    return {};
  },
  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(NavLink, null),
      React.createElement(
        RUI.Container,
        { className: 'am-padding-vertical-lg' },
        React.createElement(
          'h2',
          null,
          '关于我们'
        ),
        React.createElement(
          'p',
          null,
          '页面内容'
        )
      )
    );
  }
});

module.exports = About;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114}],102:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var AppActions = require('../actions/AppActions');

var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');

var pageInfo = {
  title: '活动页面',
  header: null
};

var Action = React.createClass({
  displayName: 'Action',

  getInitialState: function getInitialState() {
    return {};
  },
  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    console.log('全屏页面');
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(NavLink, null),
      React.createElement(
        'div',
        { className: 'ask-banner' },
        React.createElement(
          RUI.Container,
          null,
          React.createElement(
            'h1',
            null,
            '活动或主题页面'
          ),
          React.createElement(
            'h2',
            null,
            '这是一个全屏单页面，无头部。'
          )
        )
      )
    );
  }
});

module.exports = Action;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114,"react-router":150}],103:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var RUI = require('../reactUI');

var NavLink = require('../components/NavLink');

var AppActions = require('../actions/AppActions');

var $ = require('../utils/Ajax');
// var $ = require('npm-zepto');

var pageInfo = {
  title: 'Ajax请求'
};

var UserGist = React.createClass({
  displayName: 'UserGist',

  getInitialState: function getInitialState() {
    console.log('init');
    return {
      loading: true,
      content: null
    };
  },

  componentDidMount: function componentDidMount() {
    console.log('DidMount');
    AppActions.ajax({
      type: 'GET',
      url: this.props.source,
      success: (function (result) {
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
      }).bind(this)
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

  render: function render() {
    var renderHtml;
    if (this.state.loading) {
      renderHtml = React.createElement(
        'div',
        { className: 'am-text-center' },
        React.createElement('i', { className: 'am-icon-spinner am-icon-spin' })
      );
    } else {
      renderHtml = React.createElement(
        'div',
        null,
        this.state.content.username,
        '\'s last gist is',
        React.createElement(
          'a',
          { href: this.state.content.lastGistUrl },
          'here'
        ),
        '.'
      );
    }
    return renderHtml;
  }
});

var Ajax = React.createClass({
  displayName: 'Ajax',

  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(
        'div',
        { className: 'ask-banner' },
        React.createElement(
          RUI.Container,
          null,
          React.createElement(
            'h1',
            null,
            'Ajax请求'
          ),
          React.createElement(
            'p',
            null,
            'Ajax 效果如下'
          ),
          React.createElement(UserGist, { source: 'https://api.github.com/users/octocat/gists' })
        )
      )
    );
  }
});

module.exports = Ajax;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114,"../utils/Ajax":117,"react-router":150}],104:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
// import Reflux from 'reflux';
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

// import analyticsStore from 'stores/analytics';

var HeaderBar = require('../components/HeaderBar');

var Application = React.createClass({
  displayName: 'Application',

  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-pages' },
      React.createElement(HeaderBar, null),
      React.createElement(
        'main',
        { className: 'ask-main' },
        React.createElement(RouteHandler, null)
      )
    );
  }
});

module.exports = Application;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../components/HeaderBar":97,"react-router":150}],105:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
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
    rtn.push(parseInt(Math.random() * (max - min) + min));
  }
  return rtn;
}

var chartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [{
    label: 'My First dataset',
    fillColor: 'rgba(220,220,220,0.2)',
    strokeColor: 'rgba(220,220,220,1)',
    pointColor: 'rgba(220,220,220,1)',
    pointStrokeColor: '#fff',
    pointHighlightFill: '#fff',
    pointHighlightStroke: 'rgba(220,220,220,1)',
    data: rand(4, 100, 7)
  }, {
    label: 'My Second dataset',
    fillColor: 'rgba(151,187,205,0.2)',
    strokeColor: 'rgba(151,187,205,1)',
    pointColor: 'rgba(151,187,205,1)',
    pointStrokeColor: '#fff',
    pointHighlightFill: '#fff',
    pointHighlightStroke: 'rgba(151,187,205,1)',
    data: rand(2, 100, 7)
  }]
};

var chartOptions = {
  legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
};

var ChartJs = React.createClass({
  displayName: 'ChartJs',

  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(NavLink, null),
      React.createElement(
        RUI.Container,
        { className: 'am-padding-vertical-lg' },
        React.createElement(
          'h2',
          null,
          'Chart 图表'
        ),
        React.createElement(LineChart, { data: chartData, options: chartOptions })
      )
    );
  }
});

module.exports = ChartJs;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114,"react-chartjs":9}],106:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '公司'
};

var Company = React.createClass({
  displayName: 'Company',

  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(NavLink, null),
      React.createElement(
        RUI.Container,
        { className: 'am-padding-vertical-lg' },
        React.createElement(
          'h2',
          null,
          '公司'
        ),
        React.createElement(
          'p',
          null,
          '页面内容'
        )
      )
    );
  }
});

module.exports = Company;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114}],107:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;
//var LocalStorageMixin = require('react-localstorage');

var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');
var Tabs = RUI.Tabs;

var AppActions = require('../actions/AppActions');

var $ = require('../utils/Ajax');
// var $ = require('npm-zepto');

var pageInfo = {
  title: '复杂 ajax 页面'
};

var tabkey = '1';
var cData = [{
  data: '这里是复杂的数据 1'
}, {
  data: '这里是复杂的数据 2'
}, {
  data: '这里是复杂的数据 3'
}];

var TabContent = function TabContent(index, state) {
  var key = state.key;
  var curData = state.cData[index - 1];
  if (curData.loaded) {
    return React.createElement(
      'div',
      null,
      ' ',
      curData.data,
      ' '
    );
  } else if (key === index) {
    console.log(111);
    return React.createElement(
      'div',
      { className: 'am-text-center' },
      React.createElement('i', { className: 'am-icon-spinner am-icon-spin' })
    );
  } else {
    return React.createElement(
      'div',
      null,
      '这是位置 ',
      index,
      ' 这里数据要去请求。。。'
    );
  }
};

var Complex = React.createClass({
  displayName: 'APP_Complex',
  //mixins: [LocalStorageMixin],
  getInitialState: function getInitialState() {
    //这里每次被调用都被初始化了，不爽，
    //应该对应一个组件，这个组件的状态一直被记住（基于组件位置唯一）
    //需要设置一个当前状态记忆变量，同步更新
    //console.log("这里每次都被初始化了，不爽");
    return {
      key: tabkey || '1',
      cData: cData
    };
  },
  handleSelect: function handleSelect(key) {
    console.log('你点击了：', key);
    //this.props.handleSelect(key);
    tabkey = key;
    cData = this.state.cData;

    this.setState({
      key: key
    });

    var self = this;
    setTimeout(function () {
      cData[key - 1].loaded = true;
      self.setState({
        cData: cData
      });
    }, 1000);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(
        Tabs,
        { justify: true, defaultActiveKey: this.state.key, onSelect: this.handleSelect },
        React.createElement(
          Tabs.Item,
          { eventKey: '1', title: '恣意' },
          TabContent(1, this.state)
        ),
        React.createElement(
          Tabs.Item,
          { eventKey: '2', title: '等候' },
          TabContent(2, this.state)
        ),
        React.createElement(
          Tabs.Item,
          { eventKey: '3', title: '流浪' },
          TabContent(3, this.state)
        )
      )
    );
  }
});

module.exports = Complex;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114,"../utils/Ajax":117,"react-router":150}],108:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var AppActions = require('../actions/AppActions');

var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');

var pageInfo = {
  title: '首页'
};

var Index = React.createClass({
  displayName: 'Index',

  getInitialState: function getInitialState() {
    return {};
  },
  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(NavLink, null),
      React.createElement(
        'div',
        { className: 'ask-banner' },
        React.createElement(
          RUI.Container,
          null,
          React.createElement(
            'h1',
            null,
            'Hello World!'
          ),
          React.createElement(
            'h2',
            null,
            '欢迎使用 Amaze UI React 入门套件。'
          )
        )
      )
    );
  }
});

module.exports = Index;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114,"react-router":150}],109:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');

var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '列表页'
};

var List = React.createClass({
  displayName: 'List',

  getInitialState: function getInitialState() {
    return {
      id: this.props.params.id
    };
  },
  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(NavLink, null),
      React.createElement(
        RUI.Container,
        { className: 'am-padding-vertical-lg' },
        React.createElement(
          'h2',
          null,
          '列表页面'
        ),
        React.createElement(
          'p',
          null,
          '列表ID：',
          this.state.id
        )
      )
    );
  }
});

module.exports = List;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114}],110:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '登录'
};

var Login = React.createClass({
  displayName: 'Login',

  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(NavLink, null),
      React.createElement(
        RUI.Container,
        { className: 'am-padding-vertical-lg' },
        React.createElement(
          'h2',
          null,
          '登录'
        ),
        React.createElement(
          'p',
          null,
          '登录页面'
        )
      )
    );
  }
});

module.exports = Login;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114}],111:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var RUI = require('../reactUI');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '404'
};

var NotFound = React.createClass({
  displayName: 'NotFound',

  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(
        'div',
        { className: 'ask-banner' },
        React.createElement(
          RUI.Container,
          null,
          React.createElement(
            'h1',
            null,
            '404 页面未找到！！！'
          ),
          React.createElement(
            'h2',
            null,
            '点此返回',
            React.createElement(
              'a',
              { className: 'am-btn am-btn-link', href: '#/' },
              '首页'
            )
          )
        )
      )
    );
  }
});

module.exports = NotFound;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114,"react-router":150}],112:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
var TabsSelect = require('./Tab');
var NavLink = require('../components/NavLink');
var AppActions = require('../actions/AppActions');

var pageInfo = {
  title: '页面1'
};

var Page1 = React.createClass({
  displayName: 'Page1',

  componentDidMount: function componentDidMount() {
    AppActions.updateHeader(pageInfo);
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'ask-page' },
      React.createElement(NavLink, null),
      React.createElement(
        RUI.Container,
        { className: 'am-padding-vertical-lg' },
        React.createElement(
          'h2',
          null,
          '页面 1'
        ),
        React.createElement(
          'p',
          null,
          '页面内容'
        ),
        React.createElement(TabsSelect, null)
      )
    );
  }
});

module.exports = Page1;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/AppActions":95,"../components/NavLink":98,"../reactUI":114,"./Tab":113}],113:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
// var RUI = require('amazeui-react');
var RUI = require('../reactUI');
var Tabs = RUI.Tabs;

var tabkey = '1';

var TabsSelect = React.createClass({
  displayName: 'TabsSelect',

  getInitialState: function getInitialState() {
    //这里每次被调用都被初始化了，不爽，
    //应该对应一个组件，这个组件的状态一直被记住（基于组件位置唯一）
    //需要设置一个当前状态记忆变量，同步更新
    //console.log("这里每次都被初始化了，不爽");
    return {
      key: tabkey || '1'
    };
  },
  handleSelect: function handleSelect(key) {
    console.log('你点击了：', key);
    //this.props.handleSelect(key);
    tabkey = key;

    this.setState({
      key: key
    });
  },
  render: function render() {
    return React.createElement(
      Tabs,
      { justify: true, defaultActiveKey: this.state.key, onSelect: this.handleSelect },
      React.createElement(
        Tabs.Item,
        { eventKey: '1', title: '恣意' },
        '置身人群中',
        React.createElement('br', null),
        '你只需要被淹没 享受 沉默',
        React.createElement('br', null),
        '退到人群后',
        React.createElement('br', null),
        '你只需给予双手 微笑 等候'
      ),
      React.createElement(
        Tabs.Item,
        { eventKey: '2', title: '等候' },
        '走在忠孝东路',
        React.createElement('br', null),
        '徘徊在茫然中',
        React.createElement('br', null),
        '在我的人生旅途',
        React.createElement('br', null),
        '选择了多少错误',
        React.createElement('br', null),
        '我在睡梦中惊醒',
        React.createElement('br', null),
        '感叹悔言无尽',
        React.createElement('br', null),
        '恨我不能说服自己',
        React.createElement('br', null),
        '接受一切教训',
        React.createElement('br', null),
        '让生命去等候',
        React.createElement('br', null),
        '等候下一个漂流',
        React.createElement('br', null),
        '让生命去等候',
        React.createElement('br', null),
        '等候下一个伤口'
      ),
      React.createElement(
        Tabs.Item,
        { eventKey: '3', title: '流浪' },
        '我就这样告别山下的家，我实在不愿轻易让眼泪留下。我以为我并不差不会害怕，我就这样自己照顾自己长大。我不想因为现实把头低下，我以为我并不差能学会虚假。怎样才能够看穿面具里的谎话？别让我的真心散的像沙。如果有一天我变得更复杂，还能不能唱出歌声里的那幅画？'
      )
    );
  }
});

module.exports = TabsSelect;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../reactUI":114}],114:[function(require,module,exports){
'use strict';

// var uiRequire = function (src) {
//   if (src) {
//     return require('../../../src/' + src);
//   } else {
//     return require('../../../src/AMUIReact');
//   }
// };

// global.uiRequire = uiRequire;

// module.exports = uiRequire;
module.exports = require('../../../src/AMUIReact');

},{"../../../src/AMUIReact":17}],115:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

// Pages
var Application = require('./pages/Application');
var Index = require('./pages/Index');
var Page1 = require('./pages/Page1');
var About = require('./pages/About');
var Login = require('./pages/Login');
var List = require('./pages/List');
var Company = require('./pages/Company');
var Action = require('./pages/Action');
var Ajax = require('./pages/Ajax');
var Complex = require('./pages/Complex');
var Chart = require('./pages/Chart');
var NotFound = require('./pages/NotFound');

var routes = React.createElement(
  Route,
  { name: 'home', path: '/', handler: Application },
  React.createElement(DefaultRoute, { handler: Index }),
  React.createElement(Route, { name: 'page1', handler: Page1 }),
  React.createElement(Route, { name: 'about', handler: About }),
  React.createElement(Route, { name: 'login', handler: Login }),
  React.createElement(Route, { name: 'list', path: 'list', handler: List }),
  React.createElement(Route, { name: 'detail', path: 'list/:id', handler: List }),
  React.createElement(Route, { name: 'company', path: 'about/company', handler: Company }),
  React.createElement(Route, { name: 'action', handler: Action }),
  React.createElement(Route, { name: 'ajax', handler: Ajax }),
  React.createElement(Route, { name: 'complex', handler: Complex }),
  React.createElement(Route, { name: 'chart', handler: Chart }),
  React.createElement(NotFoundRoute, { handler: NotFound })
);

module.exports = routes;

/*
<Route name="home" path="/" handler={Application}>

  <DefaultRoute handler={MainLanding} />

  <Route name="login" handler={Login} />
  <Route name="signup" handler={Signup} />
  <Route name="logout" handler={Logout} />
  <Route name="forgot" handler={Forgot} />

  <Route name="calculator" handler={Calculator} />

  <Route name="feed" handler={Feed} />
  <Route name="status-update" path="status-update/:id"  handler={StatusUpdate} />
  <Route name="status-update-edit" path="status-update/:id/edit"  handler={StatusUpdateEdit} />

  <Route name="recipes" handler={Recipes} />
  <Route name="recipe" path="recipes/:id" handler={Recipe} />
  <Route name="editRecipe" path="recipes/:id/edit" handler={RecipeEdit} />
  <Route name="printRecipe" path="recipes/:id/print" handler={RecipePrint} />

  <Route name="recipe-journal" path="recipes/:recipeId/journals/:journalId" handler={RecipeJournal} />
  <Route name="recipe-journal-edit" path="recipes/:recipeId/journals/:journalId/edit" handler={RecipeJournalEdit} />


  <Route name="oils" handler={Oils} />
  <Route name="oil" path="oils/:id" handler={Oil} />

  <Route name="print" handler={PrintCalculation} />

  <Route name="resources" handler={Resources} />

  <Route name="userProfile" path="users/:id" handler={UserProfile} />

  <Route name="account" path="/my" handler={Account}>
    <Route name="profile" handler={MyProfile} />
    <Route name="my-recipes" handler={MyRecipes} />
    <Route name="my-friend-recipes" handler={MyFriendsRecipes} />
    <Route name="saved-recipes" handler={SavedRecipes} />
    <Route name="my-comments" handler={MyComments} />
    <Route name="my-status-updates" handler={MyStatusUpdates} />
  </Route>

  </Route>

 */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./pages/About":101,"./pages/Action":102,"./pages/Ajax":103,"./pages/Application":104,"./pages/Chart":105,"./pages/Company":106,"./pages/Complex":107,"./pages/Index":108,"./pages/List":109,"./pages/Login":110,"./pages/NotFound":111,"./pages/Page1":112,"react-router":150}],116:[function(require,module,exports){
'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _headerInfo = {
  title: 'React UI',
  link: '#title-link',
  fixed: true,
  data: {
    left: [{
      link: '#back',
      icon: 'home',
      customIcon: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 20"><path d="M10,0l2,2l-8,8l8,8l-2,2L0,10L10,0z" fill="%23fff"/></svg>',
      callback: function callback(nav, e) {
        e.preventDefault();
        var history = window.history;
        history.back();
      }
    }],
    right: [{
      link: '#right-link',
      icon: 'bars'
    }]
  },
  onSelect: function onSelect(nav, e) {
    e.preventDefault();
    // do something
    // if (nav.link === "#back") {
    //   var history = window.history;
    //   history.back();
    // } else {
    //   console.log('你点击了', nav);
    // }
  }
};

var headerInfo = assign({}, _headerInfo);

function update(obj) {
  //console.log('更新 Header')
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  //var id = pageName;
  var tempData = {};
  var tempObj = assign({}, obj);
  //console.log(obj)
  if (tempObj.header) {
    tempData = assign({}, tempObj.header);
    tempData = assign({}, _headerInfo.data, tempData);
    delete tempObj.header;
    headerInfo = assign({}, _headerInfo, tempObj);
    headerInfo.data = tempData;
    //console.log(tempData)
  } else {
    headerInfo = assign({}, _headerInfo, tempObj);
  }
  if (obj.header === null) {
    headerInfo.data = null;
  }
  //console.log(headerInfo.data)
}
// function update(obj) {
//   _headerInfo = assign({}, _headerInfo, {info: obj});
//   // if (_datas[id]) {
//   //   _datas[id] = assign({}, _datas[id], obj);
//   // } else {
//   //   create(id, obj);
//   // }
// }

var AppStore = assign({}, EventEmitter.prototype, {
  getHeaderInfo: function getHeaderInfo() {
    return headerInfo;
  },
  emitChange: function emitChange() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register callback to handle all updates
AppDispatcher.register(function (action) {
  var text;

  switch (action.actionType) {
    case AppConstants.APP_AJAX:
      if (action.obj) {
        update(action.content);
      }
      AppStore.emitChange();
      break;
    case AppConstants.APP_HEADER:
      if (action.obj) {
        update(action.obj);
      }
      AppStore.emitChange();
      break;
    default:
    // no op
  }
});

module.exports = AppStore;

},{"../constants/AppConstants":99,"../dispatcher/AppDispatcher":100,"events":118,"object-assign":125}],117:[function(require,module,exports){
'use strict';

var $ = require('npm-zepto');

//这里统一添加一些公共参数
var dealParams = function dealParams(params) {
  params = params || {};
  var header = {};
  //获取地理位置 geo,当前城市等信息
  if (params.data && params.data.apiVersion) {
    header.version = params.data.apiVersion;
    delete params.data.apiVersion;
  }

  params = $.extend({}, params);

  //get请求修改 headers不能跨域了
  // if (!params.type === "GET") {
  //   params.headers = {version:11};
  // } else {
  //   delete params.headers;
  // }
  //$.extend(header, params.headers)
  return params;
};

//统一处理成功及报错 code
function _ajax(options) {
  var params = dealParams(options);
  return $.ajax(params);
}

function parseArguments(url, data, success, dataType) {
  if ($.isFunction(data)) {
    dataType = success;
    success = data;
    data = undefined;
  }
  if (!$.isFunction(success)) {
    dataType = success;
    success = undefined;
  }
  return {
    url: url,
    data: data,
    success: success,
    dataType: dataType
  };
}

var _get = function _get() {
  return _ajax(parseArguments.apply(null, arguments));
};

var _post = function _post() {
  var options = parseArguments.apply(null, arguments);
  options.type = 'POST';
  return _ajax(options);
};

var _getJSON = function _getJSON() {
  var options = parseArguments.apply(null, arguments);
  options.dataType = 'json';
  return _ajax(options);
};

$._ajax = _ajax;
$._get = _get;
$._post = _post;
$._getJSON = _getJSON;

module.exports = $;

//tech: "reactUI"

//tech: "reactUI"
//dataType: 'json',
//capture401AutoRedirect: false,
//timeout: 20 * 1000,
/* url, data, success, dataType */ /* url, data, success, dataType */ /* url, data, success */

},{"npm-zepto":124}],118:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],119:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],120:[function(require,module,exports){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher');

},{"./lib/Dispatcher":121}],121:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * 
 * @preventMunge
 */

'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var invariant = require('fbjs/lib/invariant');

var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this._callbacks = {};
    this._isDispatching = false;
    this._isHandled = {};
    this._isPending = {};
    this._lastID = 1;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */

  Dispatcher.prototype.register = function register(callback) {
    var id = _prefix + this._lastID++;
    this._callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   */

  Dispatcher.prototype.unregister = function unregister(id) {
    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
    delete this._callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

  Dispatcher.prototype.waitFor = function waitFor(ids) {
    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this._isPending[id]) {
        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
        continue;
      }
      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
      this._invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   */

  Dispatcher.prototype.dispatch = function dispatch(payload) {
    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   */

  Dispatcher.prototype.isDispatching = function isDispatching() {
    return this._isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @internal
   */

  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    this._isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
    for (var id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    this._isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
    delete this._pendingPayload;
    this._isDispatching = false;
  };

  return Dispatcher;
})();

module.exports = Dispatcher;
}).call(this,require('_process'))
},{"_process":119,"fbjs/lib/invariant":122}],122:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function (condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;
}).call(this,require('_process'))
},{"_process":119}],123:[function(require,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

"use strict";

/**
 * Constructs an enumeration with keys equal to their value.
 *
 * For example:
 *
 *   var COLORS = keyMirror({blue: null, red: null});
 *   var myColor = COLORS.blue;
 *   var isColorValid = !!COLORS[myColor];
 *
 * The last line could not be performed if the values of the generated enum were
 * not equal to their keys.
 *
 *   Input:  {key1: val1, key2: val2}
 *   Output: {key1: key1, key2: key2}
 *
 * @param {object} obj
 * @return {object}
 */
var keyMirror = function(obj) {
  var ret = {};
  var key;
  if (!(obj instanceof Object && !Array.isArray(obj))) {
    throw new Error('keyMirror(...): Argument must be an object.');
  }
  for (key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = key;
  }
  return ret;
};

module.exports = keyMirror;

},{}],124:[function(require,module,exports){
/* Zepto 1.1.6 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)
;

if (typeof exports === "object") {
  module.exports = Zepto;
}

},{}],125:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],126:[function(require,module,exports){
/**
 * Represents a cancellation caused by navigating away
 * before the previous transition has fully resolved.
 */
"use strict";

function Cancellation() {}

module.exports = Cancellation;
},{}],127:[function(require,module,exports){
'use strict';

var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;

var History = {

  /**
   * The current number of entries in the history.
   *
   * Note: This property is read-only.
   */
  length: 1,

  /**
   * Sends the browser back one entry in the history.
   */
  back: function back() {
    invariant(canUseDOM, 'Cannot use History.back without a DOM');

    // Do this first so that History.length will
    // be accurate in location change listeners.
    History.length -= 1;

    window.history.back();
  }

};

module.exports = History;
},{"react/lib/ExecutionEnvironment":165,"react/lib/invariant":168}],128:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/* jshint -W084 */
var PathUtils = require('./PathUtils');

function deepSearch(route, pathname, query) {
  // Check the subtree first to find the most deeply-nested match.
  var childRoutes = route.childRoutes;
  if (childRoutes) {
    var match, childRoute;
    for (var i = 0, len = childRoutes.length; i < len; ++i) {
      childRoute = childRoutes[i];

      if (childRoute.isDefault || childRoute.isNotFound) continue; // Check these in order later.

      if (match = deepSearch(childRoute, pathname, query)) {
        // A route in the subtree matched! Add this route and we're done.
        match.routes.unshift(route);
        return match;
      }
    }
  }

  // No child routes matched; try the default route.
  var defaultRoute = route.defaultRoute;
  if (defaultRoute && (params = PathUtils.extractParams(defaultRoute.path, pathname))) {
    return new Match(pathname, params, query, [route, defaultRoute]);
  } // Does the "not found" route match?
  var notFoundRoute = route.notFoundRoute;
  if (notFoundRoute && (params = PathUtils.extractParams(notFoundRoute.path, pathname))) {
    return new Match(pathname, params, query, [route, notFoundRoute]);
  } // Last attempt: check this route.
  var params = PathUtils.extractParams(route.path, pathname);
  if (params) {
    return new Match(pathname, params, query, [route]);
  }return null;
}

var Match = (function () {
  function Match(pathname, params, query, routes) {
    _classCallCheck(this, Match);

    this.pathname = pathname;
    this.params = params;
    this.query = query;
    this.routes = routes;
  }

  _createClass(Match, null, [{
    key: 'findMatch',

    /**
     * Attempts to match depth-first a route in the given route's
     * subtree against the given path and returns the match if it
     * succeeds, null if no match can be made.
     */
    value: function findMatch(routes, path) {
      var pathname = PathUtils.withoutQuery(path);
      var query = PathUtils.extractQuery(path);
      var match = null;

      for (var i = 0, len = routes.length; match == null && i < len; ++i) match = deepSearch(routes[i], pathname, query);

      return match;
    }
  }]);

  return Match;
})();

module.exports = Match;
},{"./PathUtils":130}],129:[function(require,module,exports){
'use strict';

var PropTypes = require('./PropTypes');

/**
 * A mixin for components that modify the URL.
 *
 * Example:
 *
 *   var MyLink = React.createClass({
 *     mixins: [ Router.Navigation ],
 *     handleClick(event) {
 *       event.preventDefault();
 *       this.transitionTo('aRoute', { the: 'params' }, { the: 'query' });
 *     },
 *     render() {
 *       return (
 *         <a onClick={this.handleClick}>Click me!</a>
 *       );
 *     }
 *   });
 */
var Navigation = {

  contextTypes: {
    router: PropTypes.router.isRequired
  },

  /**
   * Returns an absolute URL path created from the given route
   * name, URL parameters, and query values.
   */
  makePath: function makePath(to, params, query) {
    return this.context.router.makePath(to, params, query);
  },

  /**
   * Returns a string that may safely be used as the href of a
   * link to the route with the given name.
   */
  makeHref: function makeHref(to, params, query) {
    return this.context.router.makeHref(to, params, query);
  },

  /**
   * Transitions to the URL specified in the arguments by pushing
   * a new URL onto the history stack.
   */
  transitionTo: function transitionTo(to, params, query) {
    this.context.router.transitionTo(to, params, query);
  },

  /**
   * Transitions to the URL specified in the arguments by replacing
   * the current URL in the history stack.
   */
  replaceWith: function replaceWith(to, params, query) {
    this.context.router.replaceWith(to, params, query);
  },

  /**
   * Transitions to the previous URL.
   */
  goBack: function goBack() {
    return this.context.router.goBack();
  }

};

module.exports = Navigation;
},{"./PropTypes":131}],130:[function(require,module,exports){
'use strict';

var invariant = require('react/lib/invariant');
var assign = require('object-assign');
var qs = require('qs');

var paramCompileMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;
var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;
var paramInjectTrailingSlashMatcher = /\/\/\?|\/\?\/|\/\?/g;
var queryMatcher = /\?(.*)$/;

var _compiledPatterns = {};

function compilePattern(pattern) {
  if (!(pattern in _compiledPatterns)) {
    var paramNames = [];
    var source = pattern.replace(paramCompileMatcher, function (match, paramName) {
      if (paramName) {
        paramNames.push(paramName);
        return '([^/?#]+)';
      } else if (match === '*') {
        paramNames.push('splat');
        return '(.*?)';
      } else {
        return '\\' + match;
      }
    });

    _compiledPatterns[pattern] = {
      matcher: new RegExp('^' + source + '$', 'i'),
      paramNames: paramNames
    };
  }

  return _compiledPatterns[pattern];
}

var PathUtils = {

  /**
   * Returns true if the given path is absolute.
   */
  isAbsolute: function isAbsolute(path) {
    return path.charAt(0) === '/';
  },

  /**
   * Joins two URL paths together.
   */
  join: function join(a, b) {
    return a.replace(/\/*$/, '/') + b;
  },

  /**
   * Returns an array of the names of all parameters in the given pattern.
   */
  extractParamNames: function extractParamNames(pattern) {
    return compilePattern(pattern).paramNames;
  },

  /**
   * Extracts the portions of the given URL path that match the given pattern
   * and returns an object of param name => value pairs. Returns null if the
   * pattern does not match the given path.
   */
  extractParams: function extractParams(pattern, path) {
    var _compilePattern = compilePattern(pattern);

    var matcher = _compilePattern.matcher;
    var paramNames = _compilePattern.paramNames;

    var match = path.match(matcher);

    if (!match) {
      return null;
    }var params = {};

    paramNames.forEach(function (paramName, index) {
      params[paramName] = match[index + 1];
    });

    return params;
  },

  /**
   * Returns a version of the given route path with params interpolated. Throws
   * if there is a dynamic segment of the route path for which there is no param.
   */
  injectParams: function injectParams(pattern, params) {
    params = params || {};

    var splatIndex = 0;

    return pattern.replace(paramInjectMatcher, function (match, paramName) {
      paramName = paramName || 'splat';

      // If param is optional don't check for existence
      if (paramName.slice(-1) === '?') {
        paramName = paramName.slice(0, -1);

        if (params[paramName] == null) return '';
      } else {
        invariant(params[paramName] != null, 'Missing "%s" parameter for path "%s"', paramName, pattern);
      }

      var segment;
      if (paramName === 'splat' && Array.isArray(params[paramName])) {
        segment = params[paramName][splatIndex++];

        invariant(segment != null, 'Missing splat # %s for path "%s"', splatIndex, pattern);
      } else {
        segment = params[paramName];
      }

      return segment;
    }).replace(paramInjectTrailingSlashMatcher, '/');
  },

  /**
   * Returns an object that is the result of parsing any query string contained
   * in the given path, null if the path contains no query string.
   */
  extractQuery: function extractQuery(path) {
    var match = path.match(queryMatcher);
    return match && qs.parse(match[1]);
  },

  /**
   * Returns a version of the given path without the query string.
   */
  withoutQuery: function withoutQuery(path) {
    return path.replace(queryMatcher, '');
  },

  /**
   * Returns a version of the given path with the parameters in the given
   * query merged into the query string.
   */
  withQuery: function withQuery(path, query) {
    var existingQuery = PathUtils.extractQuery(path);

    if (existingQuery) query = query ? assign(existingQuery, query) : existingQuery;

    var queryString = qs.stringify(query, { arrayFormat: 'brackets' });

    if (queryString) {
      return PathUtils.withoutQuery(path) + '?' + queryString;
    }return PathUtils.withoutQuery(path);
  }

};

module.exports = PathUtils;
},{"object-assign":159,"qs":160,"react/lib/invariant":168}],131:[function(require,module,exports){
(function (global){
'use strict';

var assign = require('react/lib/Object.assign');
var ReactPropTypes = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null).PropTypes;
var Route = require('./Route');

var PropTypes = assign({}, ReactPropTypes, {

  /**
   * Indicates that a prop should be falsy.
   */
  falsy: function falsy(props, propName, componentName) {
    if (props[propName]) {
      return new Error('<' + componentName + '> should not have a "' + propName + '" prop');
    }
  },

  /**
   * Indicates that a prop should be a Route object.
   */
  route: ReactPropTypes.instanceOf(Route),

  /**
   * Indicates that a prop should be a Router object.
   */
  //router: ReactPropTypes.instanceOf(Router) // TODO
  router: ReactPropTypes.func

});

module.exports = PropTypes;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Route":133,"react/lib/Object.assign":166}],132:[function(require,module,exports){
/**
 * Encapsulates a redirect to the given route.
 */
"use strict";

function Redirect(to, params, query) {
  this.to = to;
  this.params = params;
  this.query = query;
}

module.exports = Redirect;
},{}],133:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var assign = require('react/lib/Object.assign');
var invariant = require('react/lib/invariant');
var warning = require('react/lib/warning');
var PathUtils = require('./PathUtils');

var _currentRoute;

var Route = (function () {
  function Route(name, path, ignoreScrollBehavior, isDefault, isNotFound, onEnter, onLeave, handler) {
    _classCallCheck(this, Route);

    this.name = name;
    this.path = path;
    this.paramNames = PathUtils.extractParamNames(this.path);
    this.ignoreScrollBehavior = !!ignoreScrollBehavior;
    this.isDefault = !!isDefault;
    this.isNotFound = !!isNotFound;
    this.onEnter = onEnter;
    this.onLeave = onLeave;
    this.handler = handler;
  }

  _createClass(Route, [{
    key: 'appendChild',

    /**
     * Appends the given route to this route's child routes.
     */
    value: function appendChild(route) {
      invariant(route instanceof Route, 'route.appendChild must use a valid Route');

      if (!this.childRoutes) this.childRoutes = [];

      this.childRoutes.push(route);
    }
  }, {
    key: 'toString',
    value: function toString() {
      var string = '<Route';

      if (this.name) string += ' name="' + this.name + '"';

      string += ' path="' + this.path + '">';

      return string;
    }
  }], [{
    key: 'createRoute',

    /**
     * Creates and returns a new route. Options may be a URL pathname string
     * with placeholders for named params or an object with any of the following
     * properties:
     *
     * - name                     The name of the route. This is used to lookup a
     *                            route relative to its parent route and should be
     *                            unique among all child routes of the same parent
     * - path                     A URL pathname string with optional placeholders
     *                            that specify the names of params to extract from
     *                            the URL when the path matches. Defaults to `/${name}`
     *                            when there is a name given, or the path of the parent
     *                            route, or /
     * - ignoreScrollBehavior     True to make this route (and all descendants) ignore
     *                            the scroll behavior of the router
     * - isDefault                True to make this route the default route among all
     *                            its siblings
     * - isNotFound               True to make this route the "not found" route among
     *                            all its siblings
     * - onEnter                  A transition hook that will be called when the
     *                            router is going to enter this route
     * - onLeave                  A transition hook that will be called when the
     *                            router is going to leave this route
     * - handler                  A React component that will be rendered when
     *                            this route is active
     * - parentRoute              The parent route to use for this route. This option
     *                            is automatically supplied when creating routes inside
     *                            the callback to another invocation of createRoute. You
     *                            only ever need to use this when declaring routes
     *                            independently of one another to manually piece together
     *                            the route hierarchy
     *
     * The callback may be used to structure your route hierarchy. Any call to
     * createRoute, createDefaultRoute, createNotFoundRoute, or createRedirect
     * inside the callback automatically uses this route as its parent.
     */
    value: function createRoute(options, callback) {
      options = options || {};

      if (typeof options === 'string') options = { path: options };

      var parentRoute = _currentRoute;

      if (parentRoute) {
        warning(options.parentRoute == null || options.parentRoute === parentRoute, 'You should not use parentRoute with createRoute inside another route\'s child callback; it is ignored');
      } else {
        parentRoute = options.parentRoute;
      }

      var name = options.name;
      var path = options.path || name;

      if (path && !(options.isDefault || options.isNotFound)) {
        if (PathUtils.isAbsolute(path)) {
          if (parentRoute) {
            invariant(path === parentRoute.path || parentRoute.paramNames.length === 0, 'You cannot nest path "%s" inside "%s"; the parent requires URL parameters', path, parentRoute.path);
          }
        } else if (parentRoute) {
          // Relative paths extend their parent.
          path = PathUtils.join(parentRoute.path, path);
        } else {
          path = '/' + path;
        }
      } else {
        path = parentRoute ? parentRoute.path : '/';
      }

      if (options.isNotFound && !/\*$/.test(path)) path += '*'; // Auto-append * to the path of not found routes.

      var route = new Route(name, path, options.ignoreScrollBehavior, options.isDefault, options.isNotFound, options.onEnter, options.onLeave, options.handler);

      if (parentRoute) {
        if (route.isDefault) {
          invariant(parentRoute.defaultRoute == null, '%s may not have more than one default route', parentRoute);

          parentRoute.defaultRoute = route;
        } else if (route.isNotFound) {
          invariant(parentRoute.notFoundRoute == null, '%s may not have more than one not found route', parentRoute);

          parentRoute.notFoundRoute = route;
        }

        parentRoute.appendChild(route);
      }

      // Any routes created in the callback
      // use this route as their parent.
      if (typeof callback === 'function') {
        var currentRoute = _currentRoute;
        _currentRoute = route;
        callback.call(route, route);
        _currentRoute = currentRoute;
      }

      return route;
    }
  }, {
    key: 'createDefaultRoute',

    /**
     * Creates and returns a route that is rendered when its parent matches
     * the current URL.
     */
    value: function createDefaultRoute(options) {
      return Route.createRoute(assign({}, options, { isDefault: true }));
    }
  }, {
    key: 'createNotFoundRoute',

    /**
     * Creates and returns a route that is rendered when its parent matches
     * the current URL but none of its siblings do.
     */
    value: function createNotFoundRoute(options) {
      return Route.createRoute(assign({}, options, { isNotFound: true }));
    }
  }, {
    key: 'createRedirect',

    /**
     * Creates and returns a route that automatically redirects the transition
     * to another route. In addition to the normal options to createRoute, this
     * function accepts the following options:
     *
     * - from         An alias for the `path` option. Defaults to *
     * - to           The path/route/route name to redirect to
     * - params       The params to use in the redirect URL. Defaults
     *                to using the current params
     * - query        The query to use in the redirect URL. Defaults
     *                to using the current query
     */
    value: function createRedirect(options) {
      return Route.createRoute(assign({}, options, {
        path: options.path || options.from || '*',
        onEnter: function onEnter(transition, params, query) {
          transition.redirect(options.to, options.params || params, options.query || query);
        }
      }));
    }
  }]);

  return Route;
})();

module.exports = Route;
},{"./PathUtils":130,"react/lib/Object.assign":166,"react/lib/invariant":168,"react/lib/warning":169}],134:[function(require,module,exports){
'use strict';

var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;
var getWindowScrollPosition = require('./getWindowScrollPosition');

function shouldUpdateScroll(state, prevState) {
  if (!prevState) {
    return true;
  } // Don't update scroll position when only the query has changed.
  if (state.pathname === prevState.pathname) {
    return false;
  }var routes = state.routes;
  var prevRoutes = prevState.routes;

  var sharedAncestorRoutes = routes.filter(function (route) {
    return prevRoutes.indexOf(route) !== -1;
  });

  return !sharedAncestorRoutes.some(function (route) {
    return route.ignoreScrollBehavior;
  });
}

/**
 * Provides the router with the ability to manage window scroll position
 * according to its scroll behavior.
 */
var ScrollHistory = {

  statics: {

    /**
     * Records curent scroll position as the last known position for the given URL path.
     */
    recordScrollPosition: function recordScrollPosition(path) {
      if (!this.scrollHistory) this.scrollHistory = {};

      this.scrollHistory[path] = getWindowScrollPosition();
    },

    /**
     * Returns the last known scroll position for the given URL path.
     */
    getScrollPosition: function getScrollPosition(path) {
      if (!this.scrollHistory) this.scrollHistory = {};

      return this.scrollHistory[path] || null;
    }

  },

  componentWillMount: function componentWillMount() {
    invariant(this.constructor.getScrollBehavior() == null || canUseDOM, 'Cannot use scroll behavior without a DOM');
  },

  componentDidMount: function componentDidMount() {
    this._updateScroll();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    this._updateScroll(prevState);
  },

  _updateScroll: function _updateScroll(prevState) {
    if (!shouldUpdateScroll(this.state, prevState)) {
      return;
    }var scrollBehavior = this.constructor.getScrollBehavior();

    if (scrollBehavior) scrollBehavior.updateScrollPosition(this.constructor.getScrollPosition(this.state.path), this.state.action);
  }

};

module.exports = ScrollHistory;
},{"./getWindowScrollPosition":149,"react/lib/ExecutionEnvironment":165,"react/lib/invariant":168}],135:[function(require,module,exports){
'use strict';

var PropTypes = require('./PropTypes');

/**
 * A mixin for components that need to know the path, routes, URL
 * params and query that are currently active.
 *
 * Example:
 *
 *   var AboutLink = React.createClass({
 *     mixins: [ Router.State ],
 *     render() {
 *       var className = this.props.className;
 *
 *       if (this.isActive('about'))
 *         className += ' is-active';
 *
 *       return React.DOM.a({ className: className }, this.props.children);
 *     }
 *   });
 */
var State = {

  contextTypes: {
    router: PropTypes.router.isRequired
  },

  /**
   * Returns the current URL path.
   */
  getPath: function getPath() {
    return this.context.router.getCurrentPath();
  },

  /**
   * Returns the current URL path without the query string.
   */
  getPathname: function getPathname() {
    return this.context.router.getCurrentPathname();
  },

  /**
   * Returns an object of the URL params that are currently active.
   */
  getParams: function getParams() {
    return this.context.router.getCurrentParams();
  },

  /**
   * Returns an object of the query params that are currently active.
   */
  getQuery: function getQuery() {
    return this.context.router.getCurrentQuery();
  },

  /**
   * Returns an array of the routes that are currently active.
   */
  getRoutes: function getRoutes() {
    return this.context.router.getCurrentRoutes();
  },

  /**
   * A helper method to determine if a given route, params, and query
   * are active.
   */
  isActive: function isActive(to, params, query) {
    return this.context.router.isActive(to, params, query);
  }

};

module.exports = State;
},{"./PropTypes":131}],136:[function(require,module,exports){
/* jshint -W058 */

'use strict';

var Cancellation = require('./Cancellation');
var Redirect = require('./Redirect');

/**
 * Encapsulates a transition to a given path.
 *
 * The willTransitionTo and willTransitionFrom handlers receive
 * an instance of this class as their first argument.
 */
function Transition(path, retry) {
  this.path = path;
  this.abortReason = null;
  // TODO: Change this to router.retryTransition(transition)
  this.retry = retry.bind(this);
}

Transition.prototype.abort = function (reason) {
  if (this.abortReason == null) this.abortReason = reason || 'ABORT';
};

Transition.prototype.redirect = function (to, params, query) {
  this.abort(new Redirect(to, params, query));
};

Transition.prototype.cancel = function () {
  this.abort(new Cancellation());
};

Transition.from = function (transition, routes, components, callback) {
  routes.reduce(function (callback, route, index) {
    return function (error) {
      if (error || transition.abortReason) {
        callback(error);
      } else if (route.onLeave) {
        try {
          route.onLeave(transition, components[index], callback);

          // If there is no callback in the argument list, call it automatically.
          if (route.onLeave.length < 3) callback();
        } catch (e) {
          callback(e);
        }
      } else {
        callback();
      }
    };
  }, callback)();
};

Transition.to = function (transition, routes, params, query, callback) {
  routes.reduceRight(function (callback, route) {
    return function (error) {
      if (error || transition.abortReason) {
        callback(error);
      } else if (route.onEnter) {
        try {
          route.onEnter(transition, params, query, callback);

          // If there is no callback in the argument list, call it automatically.
          if (route.onEnter.length < 4) callback();
        } catch (e) {
          callback(e);
        }
      } else {
        callback();
      }
    };
  }, callback)();
};

module.exports = Transition;
},{"./Cancellation":126,"./Redirect":132}],137:[function(require,module,exports){
/**
 * Actions that modify the URL.
 */
'use strict';

var LocationActions = {

  /**
   * Indicates a new location is being pushed to the history stack.
   */
  PUSH: 'push',

  /**
   * Indicates the current location should be replaced.
   */
  REPLACE: 'replace',

  /**
   * Indicates the most recent entry should be removed from the history stack.
   */
  POP: 'pop'

};

module.exports = LocationActions;
},{}],138:[function(require,module,exports){
'use strict';

var LocationActions = require('../actions/LocationActions');

/**
 * A scroll behavior that attempts to imitate the default behavior
 * of modern browsers.
 */
var ImitateBrowserBehavior = {

  updateScrollPosition: function updateScrollPosition(position, actionType) {
    switch (actionType) {
      case LocationActions.PUSH:
      case LocationActions.REPLACE:
        window.scrollTo(0, 0);
        break;
      case LocationActions.POP:
        if (position) {
          window.scrollTo(position.x, position.y);
        } else {
          window.scrollTo(0, 0);
        }
        break;
    }
  }

};

module.exports = ImitateBrowserBehavior;
},{"../actions/LocationActions":137}],139:[function(require,module,exports){
/**
 * A scroll behavior that always scrolls to the top of the page
 * after a transition.
 */
"use strict";

var ScrollToTopBehavior = {

  updateScrollPosition: function updateScrollPosition() {
    window.scrollTo(0, 0);
  }

};

module.exports = ScrollToTopBehavior;
},{}],140:[function(require,module,exports){
(function (global){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

/**
 * This component is necessary to get around a context warning
 * present in React 0.13.0. It sovles this by providing a separation
 * between the "owner" and "parent" contexts.
 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var ContextWrapper = (function (_React$Component) {
  function ContextWrapper() {
    _classCallCheck(this, ContextWrapper);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(ContextWrapper, _React$Component);

  _createClass(ContextWrapper, [{
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);

  return ContextWrapper;
})(React.Component);

module.exports = ContextWrapper;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],141:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var PropTypes = require('../PropTypes');
var RouteHandler = require('./RouteHandler');
var Route = require('./Route');

/**
 * A <DefaultRoute> component is a special kind of <Route> that
 * renders when its parent matches but none of its siblings do.
 * Only one such route may be used at any given level in the
 * route hierarchy.
 */

var DefaultRoute = (function (_Route) {
  function DefaultRoute() {
    _classCallCheck(this, DefaultRoute);

    if (_Route != null) {
      _Route.apply(this, arguments);
    }
  }

  _inherits(DefaultRoute, _Route);

  return DefaultRoute;
})(Route);

// TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619

DefaultRoute.propTypes = {
  name: PropTypes.string,
  path: PropTypes.falsy,
  children: PropTypes.falsy,
  handler: PropTypes.func.isRequired
};

DefaultRoute.defaultProps = {
  handler: RouteHandler
};

module.exports = DefaultRoute;
},{"../PropTypes":131,"./Route":145,"./RouteHandler":146}],142:[function(require,module,exports){
(function (global){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var assign = require('react/lib/Object.assign');
var PropTypes = require('../PropTypes');

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * <Link> components are used to create an <a> element that links to a route.
 * When that route is active, the link gets an "active" class name (or the
 * value of its `activeClassName` prop).
 *
 * For example, assuming you have the following route:
 *
 *   <Route name="showPost" path="/posts/:postID" handler={Post}/>
 *
 * You could use the following component to link to that route:
 *
 *   <Link to="showPost" params={{ postID: "123" }} />
 *
 * In addition to params, links may pass along query string parameters
 * using the `query` prop.
 *
 *   <Link to="showPost" params={{ postID: "123" }} query={{ show:true }}/>
 */

var Link = (function (_React$Component) {
  function Link() {
    _classCallCheck(this, Link);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Link, _React$Component);

  _createClass(Link, [{
    key: 'handleClick',
    value: function handleClick(event) {
      var allowTransition = true;
      var clickResult;

      if (this.props.onClick) clickResult = this.props.onClick(event);

      if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
        return;
      }if (clickResult === false || event.defaultPrevented === true) allowTransition = false;

      event.preventDefault();

      if (allowTransition) this.context.router.transitionTo(this.props.to, this.props.params, this.props.query);
    }
  }, {
    key: 'getHref',

    /**
     * Returns the value of the "href" attribute to use on the DOM element.
     */
    value: function getHref() {
      return this.context.router.makeHref(this.props.to, this.props.params, this.props.query);
    }
  }, {
    key: 'getClassName',

    /**
     * Returns the value of the "class" attribute to use on the DOM element, which contains
     * the value of the activeClassName property when this <Link> is active.
     */
    value: function getClassName() {
      var className = this.props.className;

      if (this.getActiveState()) className += ' ' + this.props.activeClassName;

      return className;
    }
  }, {
    key: 'getActiveState',
    value: function getActiveState() {
      return this.context.router.isActive(this.props.to, this.props.params, this.props.query);
    }
  }, {
    key: 'render',
    value: function render() {
      var props = assign({}, this.props, {
        href: this.getHref(),
        className: this.getClassName(),
        onClick: this.handleClick.bind(this)
      });

      if (props.activeStyle && this.getActiveState()) props.style = props.activeStyle;

      return React.DOM.a(props, this.props.children);
    }
  }]);

  return Link;
})(React.Component);

// TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619

Link.contextTypes = {
  router: PropTypes.router.isRequired
};

Link.propTypes = {
  activeClassName: PropTypes.string.isRequired,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.route]).isRequired,
  params: PropTypes.object,
  query: PropTypes.object,
  activeStyle: PropTypes.object,
  onClick: PropTypes.func
};

Link.defaultProps = {
  activeClassName: 'active',
  className: ''
};

module.exports = Link;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../PropTypes":131,"react/lib/Object.assign":166}],143:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var PropTypes = require('../PropTypes');
var RouteHandler = require('./RouteHandler');
var Route = require('./Route');

/**
 * A <NotFoundRoute> is a special kind of <Route> that
 * renders when the beginning of its parent's path matches
 * but none of its siblings do, including any <DefaultRoute>.
 * Only one such route may be used at any given level in the
 * route hierarchy.
 */

var NotFoundRoute = (function (_Route) {
  function NotFoundRoute() {
    _classCallCheck(this, NotFoundRoute);

    if (_Route != null) {
      _Route.apply(this, arguments);
    }
  }

  _inherits(NotFoundRoute, _Route);

  return NotFoundRoute;
})(Route);

// TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619

NotFoundRoute.propTypes = {
  name: PropTypes.string,
  path: PropTypes.falsy,
  children: PropTypes.falsy,
  handler: PropTypes.func.isRequired
};

NotFoundRoute.defaultProps = {
  handler: RouteHandler
};

module.exports = NotFoundRoute;
},{"../PropTypes":131,"./Route":145,"./RouteHandler":146}],144:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var PropTypes = require('../PropTypes');
var Route = require('./Route');

/**
 * A <Redirect> component is a special kind of <Route> that always
 * redirects to another route when it matches.
 */

var Redirect = (function (_Route) {
  function Redirect() {
    _classCallCheck(this, Redirect);

    if (_Route != null) {
      _Route.apply(this, arguments);
    }
  }

  _inherits(Redirect, _Route);

  return Redirect;
})(Route);

// TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619

Redirect.propTypes = {
  path: PropTypes.string,
  from: PropTypes.string, // Alias for path.
  to: PropTypes.string,
  handler: PropTypes.falsy
};

// Redirects should not have a default handler
Redirect.defaultProps = {};

module.exports = Redirect;
},{"../PropTypes":131,"./Route":145}],145:[function(require,module,exports){
(function (global){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var invariant = require('react/lib/invariant');
var PropTypes = require('../PropTypes');
var RouteHandler = require('./RouteHandler');

/**
 * <Route> components specify components that are rendered to the page when the
 * URL matches a given pattern.
 *
 * Routes are arranged in a nested tree structure. When a new URL is requested,
 * the tree is searched depth-first to find a route whose path matches the URL.
 * When one is found, all routes in the tree that lead to it are considered
 * "active" and their components are rendered into the DOM, nested in the same
 * order as they are in the tree.
 *
 * The preferred way to configure a router is using JSX. The XML-like syntax is
 * a great way to visualize how routes are laid out in an application.
 *
 *   var routes = [
 *     <Route handler={App}>
 *       <Route name="login" handler={Login}/>
 *       <Route name="logout" handler={Logout}/>
 *       <Route name="about" handler={About}/>
 *     </Route>
 *   ];
 *   
 *   Router.run(routes, function (Handler) {
 *     React.render(<Handler/>, document.body);
 *   });
 *
 * Handlers for Route components that contain children can render their active
 * child route using a <RouteHandler> element.
 *
 *   var App = React.createClass({
 *     render: function () {
 *       return (
 *         <div class="application">
 *           <RouteHandler/>
 *         </div>
 *       );
 *     }
 *   });
 *
 * If no handler is provided for the route, it will render a matched child route.
 */

var Route = (function (_React$Component) {
  function Route() {
    _classCallCheck(this, Route);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Route, _React$Component);

  _createClass(Route, [{
    key: 'render',
    value: function render() {
      invariant(false, '%s elements are for router configuration only and should not be rendered', this.constructor.name);
    }
  }]);

  return Route;
})(React.Component);

// TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619

Route.propTypes = {
  name: PropTypes.string,
  path: PropTypes.string,
  handler: PropTypes.func,
  ignoreScrollBehavior: PropTypes.bool
};

Route.defaultProps = {
  handler: RouteHandler
};

module.exports = Route;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../PropTypes":131,"./RouteHandler":146,"react/lib/invariant":168}],146:[function(require,module,exports){
(function (global){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var ContextWrapper = require('./ContextWrapper');
var assign = require('react/lib/Object.assign');
var PropTypes = require('../PropTypes');

var REF_NAME = '__routeHandler__';

/**
 * A <RouteHandler> component renders the active child route handler
 * when routes are nested.
 */

var RouteHandler = (function (_React$Component) {
  function RouteHandler() {
    _classCallCheck(this, RouteHandler);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(RouteHandler, _React$Component);

  _createClass(RouteHandler, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        routeDepth: this.context.routeDepth + 1
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._updateRouteComponent(this.refs[REF_NAME]);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._updateRouteComponent(this.refs[REF_NAME]);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._updateRouteComponent(null);
    }
  }, {
    key: '_updateRouteComponent',
    value: function _updateRouteComponent(component) {
      this.context.router.setRouteComponentAtDepth(this.getRouteDepth(), component);
    }
  }, {
    key: 'getRouteDepth',
    value: function getRouteDepth() {
      return this.context.routeDepth;
    }
  }, {
    key: 'createChildRouteHandler',
    value: function createChildRouteHandler(props) {
      var route = this.context.router.getRouteAtDepth(this.getRouteDepth());

      if (route == null) {
        return null;
      }var childProps = assign({}, props || this.props, {
        ref: REF_NAME,
        params: this.context.router.getCurrentParams(),
        query: this.context.router.getCurrentQuery()
      });

      return React.createElement(route.handler, childProps);
    }
  }, {
    key: 'render',
    value: function render() {
      var handler = this.createChildRouteHandler();
      // <script/> for things like <CSSTransitionGroup/> that don't like null
      return handler ? React.createElement(
        ContextWrapper,
        null,
        handler
      ) : React.createElement('script', null);
    }
  }]);

  return RouteHandler;
})(React.Component);

// TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619

RouteHandler.contextTypes = {
  routeDepth: PropTypes.number.isRequired,
  router: PropTypes.router.isRequired
};

RouteHandler.childContextTypes = {
  routeDepth: PropTypes.number.isRequired
};

module.exports = RouteHandler;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../PropTypes":131,"./ContextWrapper":140,"react/lib/Object.assign":166}],147:[function(require,module,exports){
(function (process,global){
/* jshint -W058 */
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var warning = require('react/lib/warning');
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;
var LocationActions = require('./actions/LocationActions');
var ImitateBrowserBehavior = require('./behaviors/ImitateBrowserBehavior');
var HashLocation = require('./locations/HashLocation');
var HistoryLocation = require('./locations/HistoryLocation');
var RefreshLocation = require('./locations/RefreshLocation');
var StaticLocation = require('./locations/StaticLocation');
var ScrollHistory = require('./ScrollHistory');
var createRoutesFromReactChildren = require('./createRoutesFromReactChildren');
var isReactChildren = require('./isReactChildren');
var Transition = require('./Transition');
var PropTypes = require('./PropTypes');
var Redirect = require('./Redirect');
var History = require('./History');
var Cancellation = require('./Cancellation');
var Match = require('./Match');
var Route = require('./Route');
var supportsHistory = require('./supportsHistory');
var PathUtils = require('./PathUtils');

/**
 * The default location for new routers.
 */
var DEFAULT_LOCATION = canUseDOM ? HashLocation : '/';

/**
 * The default scroll behavior for new routers.
 */
var DEFAULT_SCROLL_BEHAVIOR = canUseDOM ? ImitateBrowserBehavior : null;

function hasProperties(object, properties) {
  for (var propertyName in properties) if (properties.hasOwnProperty(propertyName) && object[propertyName] !== properties[propertyName]) {
    return false;
  }return true;
}

function hasMatch(routes, route, prevParams, nextParams, prevQuery, nextQuery) {
  return routes.some(function (r) {
    if (r !== route) return false;

    var paramNames = route.paramNames;
    var paramName;

    // Ensure that all params the route cares about did not change.
    for (var i = 0, len = paramNames.length; i < len; ++i) {
      paramName = paramNames[i];

      if (nextParams[paramName] !== prevParams[paramName]) return false;
    }

    // Ensure the query hasn't changed.
    return hasProperties(prevQuery, nextQuery) && hasProperties(nextQuery, prevQuery);
  });
}

function addRoutesToNamedRoutes(routes, namedRoutes) {
  var route;
  for (var i = 0, len = routes.length; i < len; ++i) {
    route = routes[i];

    if (route.name) {
      invariant(namedRoutes[route.name] == null, 'You may not have more than one route named "%s"', route.name);

      namedRoutes[route.name] = route;
    }

    if (route.childRoutes) addRoutesToNamedRoutes(route.childRoutes, namedRoutes);
  }
}

function routeIsActive(activeRoutes, routeName) {
  return activeRoutes.some(function (route) {
    return route.name === routeName;
  });
}

function paramsAreActive(activeParams, params) {
  for (var property in params) if (String(activeParams[property]) !== String(params[property])) {
    return false;
  }return true;
}

function queryIsActive(activeQuery, query) {
  for (var property in query) if (String(activeQuery[property]) !== String(query[property])) {
    return false;
  }return true;
}

/**
 * Creates and returns a new router using the given options. A router
 * is a ReactComponent class that knows how to react to changes in the
 * URL and keep the contents of the page in sync.
 *
 * Options may be any of the following:
 *
 * - routes           (required) The route config
 * - location         The location to use. Defaults to HashLocation when
 *                    the DOM is available, "/" otherwise
 * - scrollBehavior   The scroll behavior to use. Defaults to ImitateBrowserBehavior
 *                    when the DOM is available, null otherwise
 * - onError          A function that is used to handle errors
 * - onAbort          A function that is used to handle aborted transitions
 *
 * When rendering in a server-side environment, the location should simply
 * be the URL path that was used in the request, including the query string.
 */
function createRouter(options) {
  options = options || {};

  if (isReactChildren(options)) options = { routes: options };

  var mountedComponents = [];
  var location = options.location || DEFAULT_LOCATION;
  var scrollBehavior = options.scrollBehavior || DEFAULT_SCROLL_BEHAVIOR;
  var state = {};
  var nextState = {};
  var pendingTransition = null;
  var dispatchHandler = null;

  if (typeof location === 'string') location = new StaticLocation(location);

  if (location instanceof StaticLocation) {
    warning(!canUseDOM || process.env.NODE_ENV === 'test', 'You should not use a static location in a DOM environment because ' + 'the router will not be kept in sync with the current URL');
  } else {
    invariant(canUseDOM || location.needsDOM === false, 'You cannot use %s without a DOM', location);
  }

  // Automatically fall back to full page refreshes in
  // browsers that don't support the HTML history API.
  if (location === HistoryLocation && !supportsHistory()) location = RefreshLocation;

  var Router = React.createClass({

    displayName: 'Router',

    statics: {

      isRunning: false,

      cancelPendingTransition: function cancelPendingTransition() {
        if (pendingTransition) {
          pendingTransition.cancel();
          pendingTransition = null;
        }
      },

      clearAllRoutes: function clearAllRoutes() {
        Router.cancelPendingTransition();
        Router.namedRoutes = {};
        Router.routes = [];
      },

      /**
       * Adds routes to this router from the given children object (see ReactChildren).
       */
      addRoutes: function addRoutes(routes) {
        if (isReactChildren(routes)) routes = createRoutesFromReactChildren(routes);

        addRoutesToNamedRoutes(routes, Router.namedRoutes);

        Router.routes.push.apply(Router.routes, routes);
      },

      /**
       * Replaces routes of this router from the given children object (see ReactChildren).
       */
      replaceRoutes: function replaceRoutes(routes) {
        Router.clearAllRoutes();
        Router.addRoutes(routes);
        Router.refresh();
      },

      /**
       * Performs a match of the given path against this router and returns an object
       * with the { routes, params, pathname, query } that match. Returns null if no
       * match can be made.
       */
      match: function match(path) {
        return Match.findMatch(Router.routes, path);
      },

      /**
       * Returns an absolute URL path created from the given route
       * name, URL parameters, and query.
       */
      makePath: function makePath(to, params, query) {
        var path;
        if (PathUtils.isAbsolute(to)) {
          path = to;
        } else {
          var route = to instanceof Route ? to : Router.namedRoutes[to];

          invariant(route instanceof Route, 'Cannot find a route named "%s"', to);

          path = route.path;
        }

        return PathUtils.withQuery(PathUtils.injectParams(path, params), query);
      },

      /**
       * Returns a string that may safely be used as the href of a link
       * to the route with the given name, URL parameters, and query.
       */
      makeHref: function makeHref(to, params, query) {
        var path = Router.makePath(to, params, query);
        return location === HashLocation ? '#' + path : path;
      },

      /**
       * Transitions to the URL specified in the arguments by pushing
       * a new URL onto the history stack.
       */
      transitionTo: function transitionTo(to, params, query) {
        var path = Router.makePath(to, params, query);

        if (pendingTransition) {
          // Replace so pending location does not stay in history.
          location.replace(path);
        } else {
          location.push(path);
        }
      },

      /**
       * Transitions to the URL specified in the arguments by replacing
       * the current URL in the history stack.
       */
      replaceWith: function replaceWith(to, params, query) {
        location.replace(Router.makePath(to, params, query));
      },

      /**
       * Transitions to the previous URL if one is available. Returns true if the
       * router was able to go back, false otherwise.
       *
       * Note: The router only tracks history entries in your application, not the
       * current browser session, so you can safely call this function without guarding
       * against sending the user back to some other site. However, when using
       * RefreshLocation (which is the fallback for HistoryLocation in browsers that
       * don't support HTML5 history) this method will *always* send the client back
       * because we cannot reliably track history length.
       */
      goBack: function goBack() {
        if (History.length > 1 || location === RefreshLocation) {
          location.pop();
          return true;
        }

        warning(false, 'goBack() was ignored because there is no router history');

        return false;
      },

      handleAbort: options.onAbort || function (abortReason) {
        if (location instanceof StaticLocation) throw new Error('Unhandled aborted transition! Reason: ' + abortReason);

        if (abortReason instanceof Cancellation) {
          return;
        } else if (abortReason instanceof Redirect) {
          location.replace(Router.makePath(abortReason.to, abortReason.params, abortReason.query));
        } else {
          location.pop();
        }
      },

      handleError: options.onError || function (error) {
        // Throw so we don't silently swallow async errors.
        throw error; // This error probably originated in a transition hook.
      },

      handleLocationChange: function handleLocationChange(change) {
        Router.dispatch(change.path, change.type);
      },

      /**
       * Performs a transition to the given path and calls callback(error, abortReason)
       * when the transition is finished. If both arguments are null the router's state
       * was updated. Otherwise the transition did not complete.
       *
       * In a transition, a router first determines which routes are involved by beginning
       * with the current route, up the route tree to the first parent route that is shared
       * with the destination route, and back down the tree to the destination route. The
       * willTransitionFrom hook is invoked on all route handlers we're transitioning away
       * from, in reverse nesting order. Likewise, the willTransitionTo hook is invoked on
       * all route handlers we're transitioning to.
       *
       * Both willTransitionFrom and willTransitionTo hooks may either abort or redirect the
       * transition. To resolve asynchronously, they may use the callback argument. If no
       * hooks wait, the transition is fully synchronous.
       */
      dispatch: function dispatch(path, action) {
        Router.cancelPendingTransition();

        var prevPath = state.path;
        var isRefreshing = action == null;

        if (prevPath === path && !isRefreshing) {
          return;
        } // Nothing to do!

        // Record the scroll position as early as possible to
        // get it before browsers try update it automatically.
        if (prevPath && action === LocationActions.PUSH) Router.recordScrollPosition(prevPath);

        var match = Router.match(path);

        warning(match != null, 'No route matches path "%s". Make sure you have <Route path="%s"> somewhere in your routes', path, path);

        if (match == null) match = {};

        var prevRoutes = state.routes || [];
        var prevParams = state.params || {};
        var prevQuery = state.query || {};

        var nextRoutes = match.routes || [];
        var nextParams = match.params || {};
        var nextQuery = match.query || {};

        var fromRoutes, toRoutes;
        if (prevRoutes.length) {
          fromRoutes = prevRoutes.filter(function (route) {
            return !hasMatch(nextRoutes, route, prevParams, nextParams, prevQuery, nextQuery);
          });

          toRoutes = nextRoutes.filter(function (route) {
            return !hasMatch(prevRoutes, route, prevParams, nextParams, prevQuery, nextQuery);
          });
        } else {
          fromRoutes = [];
          toRoutes = nextRoutes;
        }

        var transition = new Transition(path, Router.replaceWith.bind(Router, path));
        pendingTransition = transition;

        var fromComponents = mountedComponents.slice(prevRoutes.length - fromRoutes.length);

        Transition.from(transition, fromRoutes, fromComponents, function (error) {
          if (error || transition.abortReason) return dispatchHandler.call(Router, error, transition); // No need to continue.

          Transition.to(transition, toRoutes, nextParams, nextQuery, function (error) {
            dispatchHandler.call(Router, error, transition, {
              path: path,
              action: action,
              pathname: match.pathname,
              routes: nextRoutes,
              params: nextParams,
              query: nextQuery
            });
          });
        });
      },

      /**
       * Starts this router and calls callback(router, state) when the route changes.
       *
       * If the router's location is static (i.e. a URL path in a server environment)
       * the callback is called only once. Otherwise, the location should be one of the
       * Router.*Location objects (e.g. Router.HashLocation or Router.HistoryLocation).
       */
      run: function run(callback) {
        invariant(!Router.isRunning, 'Router is already running');

        dispatchHandler = function (error, transition, newState) {
          if (error) Router.handleError(error);

          if (pendingTransition !== transition) return;

          pendingTransition = null;

          if (transition.abortReason) {
            Router.handleAbort(transition.abortReason);
          } else {
            callback.call(Router, Router, nextState = newState);
          }
        };

        if (!(location instanceof StaticLocation)) {
          if (location.addChangeListener) location.addChangeListener(Router.handleLocationChange);

          Router.isRunning = true;
        }

        // Bootstrap using the current path.
        Router.refresh();
      },

      refresh: function refresh() {
        Router.dispatch(location.getCurrentPath(), null);
      },

      stop: function stop() {
        Router.cancelPendingTransition();

        if (location.removeChangeListener) location.removeChangeListener(Router.handleLocationChange);

        Router.isRunning = false;
      },

      getLocation: function getLocation() {
        return location;
      },

      getScrollBehavior: function getScrollBehavior() {
        return scrollBehavior;
      },

      getRouteAtDepth: function getRouteAtDepth(routeDepth) {
        var routes = state.routes;
        return routes && routes[routeDepth];
      },

      setRouteComponentAtDepth: function setRouteComponentAtDepth(routeDepth, component) {
        mountedComponents[routeDepth] = component;
      },

      /**
       * Returns the current URL path + query string.
       */
      getCurrentPath: function getCurrentPath() {
        return state.path;
      },

      /**
       * Returns the current URL path without the query string.
       */
      getCurrentPathname: function getCurrentPathname() {
        return state.pathname;
      },

      /**
       * Returns an object of the currently active URL parameters.
       */
      getCurrentParams: function getCurrentParams() {
        return state.params;
      },

      /**
       * Returns an object of the currently active query parameters.
       */
      getCurrentQuery: function getCurrentQuery() {
        return state.query;
      },

      /**
       * Returns an array of the currently active routes.
       */
      getCurrentRoutes: function getCurrentRoutes() {
        return state.routes;
      },

      /**
       * Returns true if the given route, params, and query are active.
       */
      isActive: function isActive(to, params, query) {
        if (PathUtils.isAbsolute(to)) {
          return to === state.path;
        }return routeIsActive(state.routes, to) && paramsAreActive(state.params, params) && (query == null || queryIsActive(state.query, query));
      }

    },

    mixins: [ScrollHistory],

    propTypes: {
      children: PropTypes.falsy
    },

    childContextTypes: {
      routeDepth: PropTypes.number.isRequired,
      router: PropTypes.router.isRequired
    },

    getChildContext: function getChildContext() {
      return {
        routeDepth: 1,
        router: Router
      };
    },

    getInitialState: function getInitialState() {
      return state = nextState;
    },

    componentWillReceiveProps: function componentWillReceiveProps() {
      this.setState(state = nextState);
    },

    componentWillUnmount: function componentWillUnmount() {
      Router.stop();
    },

    render: function render() {
      var route = Router.getRouteAtDepth(0);
      return route ? React.createElement(route.handler, this.props) : null;
    }

  });

  Router.clearAllRoutes();

  if (options.routes) Router.addRoutes(options.routes);

  return Router;
}

module.exports = createRouter;
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Cancellation":126,"./History":127,"./Match":128,"./PathUtils":130,"./PropTypes":131,"./Redirect":132,"./Route":133,"./ScrollHistory":134,"./Transition":136,"./actions/LocationActions":137,"./behaviors/ImitateBrowserBehavior":138,"./createRoutesFromReactChildren":148,"./isReactChildren":151,"./locations/HashLocation":152,"./locations/HistoryLocation":153,"./locations/RefreshLocation":154,"./locations/StaticLocation":155,"./supportsHistory":158,"_process":119,"react/lib/ExecutionEnvironment":165,"react/lib/invariant":168,"react/lib/warning":169}],148:[function(require,module,exports){
(function (global){
/* jshint -W084 */
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var assign = require('react/lib/Object.assign');
var warning = require('react/lib/warning');
var DefaultRoute = require('./components/DefaultRoute');
var NotFoundRoute = require('./components/NotFoundRoute');
var Redirect = require('./components/Redirect');
var Route = require('./Route');

function checkPropTypes(componentName, propTypes, props) {
  componentName = componentName || 'UnknownComponent';

  for (var propName in propTypes) {
    if (propTypes.hasOwnProperty(propName)) {
      var error = propTypes[propName](props, propName, componentName);

      if (error instanceof Error) warning(false, error.message);
    }
  }
}

function createRouteOptions(props) {
  var options = assign({}, props);
  var handler = options.handler;

  if (handler) {
    options.onEnter = handler.willTransitionTo;
    options.onLeave = handler.willTransitionFrom;
  }

  return options;
}

function createRouteFromReactElement(element) {
  if (!React.isValidElement(element)) {
    return;
  }var type = element.type;
  var props = assign({}, type.defaultProps, element.props);

  if (type.propTypes) checkPropTypes(type.displayName, type.propTypes, props);

  if (type === DefaultRoute) {
    return Route.createDefaultRoute(createRouteOptions(props));
  }if (type === NotFoundRoute) {
    return Route.createNotFoundRoute(createRouteOptions(props));
  }if (type === Redirect) {
    return Route.createRedirect(createRouteOptions(props));
  }return Route.createRoute(createRouteOptions(props), function () {
    if (props.children) createRoutesFromReactChildren(props.children);
  });
}

/**
 * Creates and returns an array of routes created from the given
 * ReactChildren, all of which should be one of <Route>, <DefaultRoute>,
 * <NotFoundRoute>, or <Redirect>, e.g.:
 *
 *   var { createRoutesFromReactChildren, Route, Redirect } = require('react-router');
 *
 *   var routes = createRoutesFromReactChildren(
 *     <Route path="/" handler={App}>
 *       <Route name="user" path="/user/:userId" handler={User}>
 *         <Route name="task" path="tasks/:taskId" handler={Task}/>
 *         <Redirect from="todos/:taskId" to="task"/>
 *       </Route>
 *     </Route>
 *   );
 */
function createRoutesFromReactChildren(children) {
  var routes = [];

  React.Children.forEach(children, function (child) {
    if (child = createRouteFromReactElement(child)) routes.push(child);
  });

  return routes;
}

module.exports = createRoutesFromReactChildren;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Route":133,"./components/DefaultRoute":141,"./components/NotFoundRoute":143,"./components/Redirect":144,"react/lib/Object.assign":166,"react/lib/warning":169}],149:[function(require,module,exports){
'use strict';

var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;

/**
 * Returns the current scroll position of the window as { x, y }.
 */
function getWindowScrollPosition() {
  invariant(canUseDOM, 'Cannot get current scroll position without a DOM');

  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
}

module.exports = getWindowScrollPosition;
},{"react/lib/ExecutionEnvironment":165,"react/lib/invariant":168}],150:[function(require,module,exports){
'use strict';

exports.DefaultRoute = require('./components/DefaultRoute');
exports.Link = require('./components/Link');
exports.NotFoundRoute = require('./components/NotFoundRoute');
exports.Redirect = require('./components/Redirect');
exports.Route = require('./components/Route');
exports.ActiveHandler = require('./components/RouteHandler');
exports.RouteHandler = exports.ActiveHandler;

exports.HashLocation = require('./locations/HashLocation');
exports.HistoryLocation = require('./locations/HistoryLocation');
exports.RefreshLocation = require('./locations/RefreshLocation');
exports.StaticLocation = require('./locations/StaticLocation');
exports.TestLocation = require('./locations/TestLocation');

exports.ImitateBrowserBehavior = require('./behaviors/ImitateBrowserBehavior');
exports.ScrollToTopBehavior = require('./behaviors/ScrollToTopBehavior');

exports.History = require('./History');
exports.Navigation = require('./Navigation');
exports.State = require('./State');

exports.createRoute = require('./Route').createRoute;
exports.createDefaultRoute = require('./Route').createDefaultRoute;
exports.createNotFoundRoute = require('./Route').createNotFoundRoute;
exports.createRedirect = require('./Route').createRedirect;
exports.createRoutesFromReactChildren = require('./createRoutesFromReactChildren');

exports.create = require('./createRouter');
exports.run = require('./runRouter');
},{"./History":127,"./Navigation":129,"./Route":133,"./State":135,"./behaviors/ImitateBrowserBehavior":138,"./behaviors/ScrollToTopBehavior":139,"./components/DefaultRoute":141,"./components/Link":142,"./components/NotFoundRoute":143,"./components/Redirect":144,"./components/Route":145,"./components/RouteHandler":146,"./createRouter":147,"./createRoutesFromReactChildren":148,"./locations/HashLocation":152,"./locations/HistoryLocation":153,"./locations/RefreshLocation":154,"./locations/StaticLocation":155,"./locations/TestLocation":156,"./runRouter":157}],151:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

function isValidChild(object) {
  return object == null || React.isValidElement(object);
}

function isReactChildren(object) {
  return isValidChild(object) || Array.isArray(object) && object.every(isValidChild);
}

module.exports = isReactChildren;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],152:[function(require,module,exports){
'use strict';

var LocationActions = require('../actions/LocationActions');
var History = require('../History');

var _listeners = [];
var _isListening = false;
var _actionType;

function notifyChange(type) {
  if (type === LocationActions.PUSH) History.length += 1;

  var change = {
    path: HashLocation.getCurrentPath(),
    type: type
  };

  _listeners.forEach(function (listener) {
    listener.call(HashLocation, change);
  });
}

function ensureSlash() {
  var path = HashLocation.getCurrentPath();

  if (path.charAt(0) === '/') {
    return true;
  }HashLocation.replace('/' + path);

  return false;
}

function onHashChange() {
  if (ensureSlash()) {
    // If we don't have an _actionType then all we know is the hash
    // changed. It was probably caused by the user clicking the Back
    // button, but may have also been the Forward button or manual
    // manipulation. So just guess 'pop'.
    var curActionType = _actionType;
    _actionType = null;
    notifyChange(curActionType || LocationActions.POP);
  }
}

/**
 * A Location that uses `window.location.hash`.
 */
var HashLocation = {

  addChangeListener: function addChangeListener(listener) {
    _listeners.push(listener);

    // Do this BEFORE listening for hashchange.
    ensureSlash();

    if (!_isListening) {
      if (window.addEventListener) {
        window.addEventListener('hashchange', onHashChange, false);
      } else {
        window.attachEvent('onhashchange', onHashChange);
      }

      _isListening = true;
    }
  },

  removeChangeListener: function removeChangeListener(listener) {
    _listeners = _listeners.filter(function (l) {
      return l !== listener;
    });

    if (_listeners.length === 0) {
      if (window.removeEventListener) {
        window.removeEventListener('hashchange', onHashChange, false);
      } else {
        window.removeEvent('onhashchange', onHashChange);
      }

      _isListening = false;
    }
  },

  push: function push(path) {
    _actionType = LocationActions.PUSH;
    window.location.hash = path;
  },

  replace: function replace(path) {
    _actionType = LocationActions.REPLACE;
    window.location.replace(window.location.pathname + window.location.search + '#' + path);
  },

  pop: function pop() {
    _actionType = LocationActions.POP;
    History.back();
  },

  getCurrentPath: function getCurrentPath() {
    return decodeURI(
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    window.location.href.split('#')[1] || '');
  },

  toString: function toString() {
    return '<HashLocation>';
  }

};

module.exports = HashLocation;
},{"../History":127,"../actions/LocationActions":137}],153:[function(require,module,exports){
'use strict';

var LocationActions = require('../actions/LocationActions');
var History = require('../History');

var _listeners = [];
var _isListening = false;

function notifyChange(type) {
  var change = {
    path: HistoryLocation.getCurrentPath(),
    type: type
  };

  _listeners.forEach(function (listener) {
    listener.call(HistoryLocation, change);
  });
}

function onPopState(event) {
  if (event.state === undefined) {
    return;
  } // Ignore extraneous popstate events in WebKit.

  notifyChange(LocationActions.POP);
}

/**
 * A Location that uses HTML5 history.
 */
var HistoryLocation = {

  addChangeListener: function addChangeListener(listener) {
    _listeners.push(listener);

    if (!_isListening) {
      if (window.addEventListener) {
        window.addEventListener('popstate', onPopState, false);
      } else {
        window.attachEvent('onpopstate', onPopState);
      }

      _isListening = true;
    }
  },

  removeChangeListener: function removeChangeListener(listener) {
    _listeners = _listeners.filter(function (l) {
      return l !== listener;
    });

    if (_listeners.length === 0) {
      if (window.addEventListener) {
        window.removeEventListener('popstate', onPopState, false);
      } else {
        window.removeEvent('onpopstate', onPopState);
      }

      _isListening = false;
    }
  },

  push: function push(path) {
    window.history.pushState({ path: path }, '', path);
    History.length += 1;
    notifyChange(LocationActions.PUSH);
  },

  replace: function replace(path) {
    window.history.replaceState({ path: path }, '', path);
    notifyChange(LocationActions.REPLACE);
  },

  pop: History.back,

  getCurrentPath: function getCurrentPath() {
    return decodeURI(window.location.pathname + window.location.search);
  },

  toString: function toString() {
    return '<HistoryLocation>';
  }

};

module.exports = HistoryLocation;
},{"../History":127,"../actions/LocationActions":137}],154:[function(require,module,exports){
'use strict';

var HistoryLocation = require('./HistoryLocation');
var History = require('../History');

/**
 * A Location that uses full page refreshes. This is used as
 * the fallback for HistoryLocation in browsers that do not
 * support the HTML5 history API.
 */
var RefreshLocation = {

  push: function push(path) {
    window.location = path;
  },

  replace: function replace(path) {
    window.location.replace(path);
  },

  pop: History.back,

  getCurrentPath: HistoryLocation.getCurrentPath,

  toString: function toString() {
    return '<RefreshLocation>';
  }

};

module.exports = RefreshLocation;
},{"../History":127,"./HistoryLocation":153}],155:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var invariant = require('react/lib/invariant');

function throwCannotModify() {
  invariant(false, 'You cannot modify a static location');
}

/**
 * A location that only ever contains a single path. Useful in
 * stateless environments like servers where there is no path history,
 * only the path that was used in the request.
 */

var StaticLocation = (function () {
  function StaticLocation(path) {
    _classCallCheck(this, StaticLocation);

    this.path = path;
  }

  _createClass(StaticLocation, [{
    key: 'getCurrentPath',
    value: function getCurrentPath() {
      return this.path;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<StaticLocation path="' + this.path + '">';
    }
  }]);

  return StaticLocation;
})();

// TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619

StaticLocation.prototype.push = throwCannotModify;
StaticLocation.prototype.replace = throwCannotModify;
StaticLocation.prototype.pop = throwCannotModify;

module.exports = StaticLocation;
},{"react/lib/invariant":168}],156:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var invariant = require('react/lib/invariant');
var LocationActions = require('../actions/LocationActions');
var History = require('../History');

/**
 * A location that is convenient for testing and does not require a DOM.
 */

var TestLocation = (function () {
  function TestLocation(history) {
    _classCallCheck(this, TestLocation);

    this.history = history || [];
    this.listeners = [];
    this._updateHistoryLength();
  }

  _createClass(TestLocation, [{
    key: 'needsDOM',
    get: function () {
      return false;
    }
  }, {
    key: '_updateHistoryLength',
    value: function _updateHistoryLength() {
      History.length = this.history.length;
    }
  }, {
    key: '_notifyChange',
    value: function _notifyChange(type) {
      var change = {
        path: this.getCurrentPath(),
        type: type
      };

      for (var i = 0, len = this.listeners.length; i < len; ++i) this.listeners[i].call(this, change);
    }
  }, {
    key: 'addChangeListener',
    value: function addChangeListener(listener) {
      this.listeners.push(listener);
    }
  }, {
    key: 'removeChangeListener',
    value: function removeChangeListener(listener) {
      this.listeners = this.listeners.filter(function (l) {
        return l !== listener;
      });
    }
  }, {
    key: 'push',
    value: function push(path) {
      this.history.push(path);
      this._updateHistoryLength();
      this._notifyChange(LocationActions.PUSH);
    }
  }, {
    key: 'replace',
    value: function replace(path) {
      invariant(this.history.length, 'You cannot replace the current path with no history');

      this.history[this.history.length - 1] = path;

      this._notifyChange(LocationActions.REPLACE);
    }
  }, {
    key: 'pop',
    value: function pop() {
      this.history.pop();
      this._updateHistoryLength();
      this._notifyChange(LocationActions.POP);
    }
  }, {
    key: 'getCurrentPath',
    value: function getCurrentPath() {
      return this.history[this.history.length - 1];
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<TestLocation>';
    }
  }]);

  return TestLocation;
})();

module.exports = TestLocation;
},{"../History":127,"../actions/LocationActions":137,"react/lib/invariant":168}],157:[function(require,module,exports){
'use strict';

var createRouter = require('./createRouter');

/**
 * A high-level convenience method that creates, configures, and
 * runs a router in one shot. The method signature is:
 *
 *   Router.run(routes[, location ], callback);
 *
 * Using `window.location.hash` to manage the URL, you could do:
 *
 *   Router.run(routes, function (Handler) {
 *     React.render(<Handler/>, document.body);
 *   });
 * 
 * Using HTML5 history and a custom "cursor" prop:
 * 
 *   Router.run(routes, Router.HistoryLocation, function (Handler) {
 *     React.render(<Handler cursor={cursor}/>, document.body);
 *   });
 *
 * Returns the newly created router.
 *
 * Note: If you need to specify further options for your router such
 * as error/abort handling or custom scroll behavior, use Router.create
 * instead.
 *
 *   var router = Router.create(options);
 *   router.run(function (Handler) {
 *     // ...
 *   });
 */
function runRouter(routes, location, callback) {
  if (typeof location === 'function') {
    callback = location;
    location = null;
  }

  var router = createRouter({
    routes: routes,
    location: location
  });

  router.run(callback);

  return router;
}

module.exports = runRouter;
},{"./createRouter":147}],158:[function(require,module,exports){
'use strict';

function supportsHistory() {
  /*! taken from modernizr
   * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
   * changed to avoid false negatives for Windows Phones: https://github.com/rackt/react-router/issues/586
   */
  var ua = navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) {
    return false;
  }
  return window.history && 'pushState' in window.history;
}

module.exports = supportsHistory;
},{}],159:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],160:[function(require,module,exports){
module.exports = require('./lib/');

},{"./lib/":161}],161:[function(require,module,exports){
// Load modules

var Stringify = require('./stringify');
var Parse = require('./parse');


// Declare internals

var internals = {};


module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":162,"./stringify":163}],162:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&',
    depth: 5,
    arrayLimit: 20,
    parameterLimit: 1000
};


internals.parseValues = function (str, options) {

    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0, il = parts.length; i < il; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[Utils.decode(part)] = '';
        }
        else {
            var key = Utils.decode(part.slice(0, pos));
            var val = Utils.decode(part.slice(pos + 1));

            if (Object.prototype.hasOwnProperty(key)) {
                continue;
            }

            if (!obj.hasOwnProperty(key)) {
                obj[key] = val;
            }
            else {
                obj[key] = [].concat(obj[key]).concat(val);
            }
        }
    }

    return obj;
};


internals.parseObject = function (chain, val, options) {

    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj = {};
    if (root === '[]') {
        obj = [];
        obj = obj.concat(internals.parseObject(chain, val, options));
    }
    else {
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        var indexString = '' + index;
        if (!isNaN(index) &&
            root !== cleanRoot &&
            indexString === cleanRoot &&
            index >= 0 &&
            index <= options.arrayLimit) {

            obj = [];
            obj[index] = internals.parseObject(chain, val, options);
        }
        else {
            obj[cleanRoot] = internals.parseObject(chain, val, options);
        }
    }

    return obj;
};


internals.parseKeys = function (key, val, options) {

    if (!key) {
        return;
    }

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Don't allow them to overwrite object prototype properties

    if (Object.prototype.hasOwnProperty(segment[1])) {
        return;
    }

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {

        ++i;
        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
            keys.push(segment[1]);
        }
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return internals.parseObject(keys, val, options);
};


module.exports = function (str, options) {

    if (str === '' ||
        str === null ||
        typeof str === 'undefined') {

        return {};
    }

    options = options || {};
    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
    var obj = {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var newObj = internals.parseKeys(key, tempObj[key], options);
        obj = Utils.merge(obj, newObj);
    }

    return Utils.compact(obj);
};

},{"./utils":164}],163:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&',
    arrayPrefixGenerators: {
        brackets: function (prefix, key) {
            return prefix + '[]';
        },
        indices: function (prefix, key) {
            return prefix + '[' + key + ']';
        },
        repeat: function (prefix, key) {
            return prefix;
        }
    }
};


internals.stringify = function (obj, prefix, generateArrayPrefix) {

    if (Utils.isBuffer(obj)) {
        obj = obj.toString();
    }
    else if (obj instanceof Date) {
        obj = obj.toISOString();
    }
    else if (obj === null) {
        obj = '';
    }

    if (typeof obj === 'string' ||
        typeof obj === 'number' ||
        typeof obj === 'boolean') {

        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys = Object.keys(obj);
    for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];
        if (Array.isArray(obj)) {
            values = values.concat(internals.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix));
        }
        else {
            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix));
        }
    }

    return values;
};


module.exports = function (obj, options) {

    options = options || {};
    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;

    var keys = [];

    if (typeof obj !== 'object' ||
        obj === null) {

        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in internals.arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    }
    else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    }
    else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

    var objKeys = Object.keys(obj);
    for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];
        keys = keys.concat(internals.stringify(obj[key], key, generateArrayPrefix));
    }

    return keys.join(delimiter);
};

},{"./utils":164}],164:[function(require,module,exports){
// Load modules


// Declare internals

var internals = {};


exports.arrayToObject = function (source) {

    var obj = {};
    for (var i = 0, il = source.length; i < il; ++i) {
        if (typeof source[i] !== 'undefined') {

            obj[i] = source[i];
        }
    }

    return obj;
};


exports.merge = function (target, source) {

    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        }
        else {
            target[source] = true;
        }

        return target;
    }

    if (typeof target !== 'object') {
        target = [target].concat(source);
        return target;
    }

    if (Array.isArray(target) &&
        !Array.isArray(source)) {

        target = exports.arrayToObject(target);
    }

    var keys = Object.keys(source);
    for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];

        if (!target[key]) {
            target[key] = value;
        }
        else {
            target[key] = exports.merge(target[key], value);
        }
    }

    return target;
};


exports.decode = function (str) {

    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};


exports.compact = function (obj, refs) {

    if (typeof obj !== 'object' ||
        obj === null) {

        return obj;
    }

    refs = refs || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0, il = obj.length; i < il; ++i) {
            if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    for (i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        obj[key] = exports.compact(obj[key], refs);
    }

    return obj;
};


exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};


exports.isBuffer = function (obj) {

    if (obj === null ||
        typeof obj === 'undefined') {

        return false;
    }

    return !!(obj.constructor &&
        obj.constructor.isBuffer &&
        obj.constructor.isBuffer(obj));
};

},{}],165:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ExecutionEnvironment
 */

/*jslint evil: true */

"use strict";

var canUseDOM = !!(
  (typeof window !== 'undefined' &&
  window.document && window.document.createElement)
);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners:
    canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;

},{}],166:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

'use strict';

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
}

module.exports = assign;

},{}],167:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyFunction
 */

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() { return this; };
emptyFunction.thatReturnsArgument = function(arg) { return arg; };

module.exports = emptyFunction;

},{}],168:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== "production") {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],169:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule warning
 */

"use strict";

var emptyFunction = require("./emptyFunction");

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== "production") {
  warning = function(condition, format ) {for (var args=[],$__0=2,$__1=arguments.length;$__0<$__1;$__0++) args.push(arguments[$__0]);
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || /^[s\W]*$/.test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function()  {return args[argIndex++];});
      console.warn(message);
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

},{"./emptyFunction":167}]},{},[96]);
