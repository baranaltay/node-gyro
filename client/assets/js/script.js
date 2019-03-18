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
	var socket = io('http://192.168.0.10:3000');
	socket.on('connect', function () {
		console.log('server socket connected!');

		setTimeout(() => {
			initChart();
		}, 1000);
	});

	var getDataEnable = false;
	socket.on('message', function (data) {
		// console.log('data', data);
		xdeg = (data.beta).toFixed(2);
		ydeg = (data.gamma).toFixed(2);
		zdeg = (data.alpha).toFixed(2);

		// xdegstring = xdeg + 'deg';
		// ydegstring = ydeg + 'deg';
		// zdegstring = +zdeg + 'deg';

		// betaElem.innerHTML = xdegstring;
		// gammaElem.innerHTML = ydegstring;
		// alphaElem.innerHTML = zdegstring;

		var yawAngle = data.gamma * Math.PI / 180;
		var pitchAngle = data.beta * Math.PI / 180;
		var rollAngle = data.alpha * Math.PI / 180;
		var mvMatrix = mat4.create();

		var rotYaw = mat4.create();
		mat4.identity(rotYaw);
		mat4.rotateY(rotYaw, rotYaw, yawAngle);
		mat4.multiply(mvMatrix, mvMatrix, rotYaw);

		var rotPitch = mat4.create();
		mat4.identity(rotPitch);
		mat4.rotateX(rotPitch, rotPitch, -pitchAngle);
		mat4.multiply(mvMatrix, mvMatrix, rotPitch);

		var rotRoll = mat4.create();
		mat4.identity(rotRoll);
		mat4.rotateZ(rotRoll, rotRoll, -rollAngle);
		mat4.multiply(mvMatrix, mvMatrix, rotRoll);

		document.getElementById('plane').style.transform = `matrix3d(${mvMatrix.toString()})`;
		// cube.prefixedStyle('transform', `rotateY(${ydegstring}) rotateX(${xdegstring}) rotateZ(${zdegstring})`);
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
	var startTime = new Date().getTime();

	var timerMillisecond = 100;
	var timeRange = 10 * 1000;

	var myChart = new dmuka.Analysis({
		element: document.querySelector("#dmuka-analisis"),
		width: "100%",
		height: "100%",
		minX: startTime,
		maxX: startTime + timeRange,
		minY: -360,
		maxY: 360,
		// centerLineX: true,
		centerLineY: true,
		labelsX: true,
		labelsXFormat: function (value) {
			var date = new Date(value);
			return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
		},
		labelsY: true,
		labelsYStep: 12,
		data: []
	});

	function addData () {
		if (myChart.analysis.data.length > timeRange / timerMillisecond) {
			myChart.analysis.data.shift();
		}

		var time = new Date().getTime();
		if (xdeg !== undefined) {
			myChart.analysis.data.push({
				beta: {
					y: xdeg,
					x: time
				},
				gamma: {
					y: ydeg,
					x: time
				},
				alpha: {
					y: zdeg,
					x: time
				}
			});
			startTime = myChart.analysis.data[0].beta.x;
		}

		myChart.analysis.minX = startTime;
		myChart.analysis.maxX = startTime + timeRange;
		myChart.analysis.update();
	}
	addData();
	var timer = setInterval(addData, timerMillisecond);
}

window.onload = function () {
	// initPrototypes();
	initSocket();
	// initChart();
};