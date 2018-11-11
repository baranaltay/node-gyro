var cube,
	space,
	xElem,
	yElem,
	zElem,
	alphaElem,
	betaElem,
	gammaElem,
	perspective,
	xdeg,
	xdegstring,
	ydeg,
	ydegstring,
	zdeg,
	zdegstring;

var gyroDataMaxTime = 60 * 1000;
var gyroDataMilliSecond = 500;
var gyroMaxDataCount = gyroDataMaxTime / gyroDataMilliSecond;
var gyroDatas = [];
var dataProvider = [];
var gyroLocked = false;

function initSocket () {
	var socket = io('http://192.168.0.26:3000');
	socket.on('connect', function () {
		console.log('server socket connected!');
	});

	var getDataEnable = false;
	socket.on('message', function (data) {
		// console.log('data', data);
		xdeg = (data.beta).toFixed(1);
		ydeg = (data.gamma).toFixed(1);
		zdeg = (data.alpha).toFixed(1);

		xdeg = xdeg - 180;
		ydeg = ydeg - 180;
		zdeg = (zdeg - 180) * -1;

		xdegstring = xdeg + 'deg';
		ydegstring = ydeg + 'deg';
		zdegstring = +zdeg + 'deg';

		betaElem.innerHTML = xdegstring;
		gammaElem.innerHTML = ydegstring;
		alphaElem.innerHTML = zdegstring;

		cube.prefixedStyle('transform', `rotateY(${ydegstring}) rotateX(${xdegstring}) rotateZ(${zdegstring})`);
	});
	socket.on('disconnect', function () {
		console.log('server socket disconnected!');
	});
}

setInterval(function (params) {
	gyroDatas.push({
		beta: xdeg,
		gamma: ydeg,
		alpha: zdeg,
		time: new Date()
	});

	if (gyroDatas.length > gyroMaxDataCount) {
		gyroDatas.splice(0, 1);
		dataProvider.shift();
	}
	dataProvider.push({
		"date": new Date(),
		"beta": xdeg,
		"gamma": ydeg,
		"alpha": zdeg
	});
}, gyroDataMilliSecond);

function initPrototypes () {
	Element.prototype.prefixedStyle = function (p, style) {
		var prefixes = ['webkit', 'moz', 'o'],
			i = 0;
		p = p.charAt(0).toUpperCase() + p.slice(1);
		while (prefix = prefixes[i++]) {
			this.style[prefix + p] = style;
		}
	};
	cube = document.querySelector('.cube');
	space = document.querySelector('.space');

	xElem = document.querySelector('.x-val');
	yElem = document.querySelector('.y-val');
	zElem = document.querySelector('.z-val');

	alphaElem = document.querySelector('.alpha-val');
	betaElem = document.querySelector('.beta-val');
	gammaElem = document.querySelector('.gamma-val');

	perspective = 2000;
}

function initChart () {
	var chart = AmCharts.makeChart("chartdiv", {
		"type": "serial",
		"theme": "light",
		"zoomOutButton": {
			"backgroundColor": '#000000',
			"backgroundAlpha": 0.15
		},
		"dataProvider": [],
		"categoryField": "date",
		"categoryAxis": {
			"parseDates": true,
			"minPeriod": "fff",
			"dashLength": 3,
			"gridAlpha": 0.15,
			"axisColor": "#DADADA"
		},
		"graphs": [{
			"id": "g1",
			"valueField": "beta",
			"bullet": "round",
			"bulletBorderColor": "#cc0000",
			"bulletBorderThickness": 2,
			"lineThickness": 2,
			"lineColor": "#cc0000",
			"negativeLineColor": "#cc0000",
			"hideBulletsCount": 50
		},{
			"id": "g2",
			"valueField": "gamma",
			"bullet": "round",
			"bulletBorderColor": "#00cc00",
			"bulletBorderThickness": 2,
			"lineThickness": 2,
			"lineColor": "#00cc00",
			"negativeLineColor": "#00cc00",
			"hideBulletsCount": 50
		},{
			"id": "g3",
			"valueField": "alpha",
			"bullet": "round",
			"bulletBorderColor": "#0000cc",
			"bulletBorderThickness": 2,
			"lineThickness": 2,
			"lineColor": "#0000cc",
			"negativeLineColor": "#0000cc",
			"hideBulletsCount": 50
		}],
		"chartCursor": {
			"cursorPosition": "mouse"
		}
	});

	chart.addListener("rendered", zoomChart);
	window.myChart = chart;
	zoomChart();

	function zoomChart () {
		chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
	}

	setInterval(() => {
		myChart.dataProvider = dataProvider;
		myChart.validateData();
	}, gyroDataMilliSecond);
}


window.onload = function () {
	initPrototypes();
	initSocket();
	initChart();
};