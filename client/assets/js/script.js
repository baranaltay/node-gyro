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


window.onload = function () {
	initPrototypes();
	initSocket();
};


function initSocket () {
	var socket = io('http://192.168.43.45:3000');
	socket.on('connect', function () {
		console.log('server socket connected!');
	});
	socket.on('message', function (data) {
		// console.log('data', data);
		xdeg = (data.beta).toFixed(1);
		ydeg = (data.gamma).toFixed(1);
		zdeg = (data.alpha).toFixed(1);

		xdegstring = (+xdeg - 180) + 'deg';
		ydegstring = (+ydeg - 180) + 'deg';
		zdegstring = ((+zdeg - 180) * - 1) + 'deg';

		betaElem.innerHTML = xdegstring;
		gammaElem.innerHTML = ydegstring;
		alphaElem.innerHTML = zdegstring;

		cube.prefixedStyle('transform', `rotateY(${ydegstring}) rotateX(${xdegstring}) rotateZ(${zdegstring})`);
		// o.x, o.y, o.z for accelerometer
		// o.alpha, o.beta, o.gamma for gyro
		// transform: rotate3d(0.1, 0, 0, 0.5rad)
	});
	socket.on('disconnect', function () {
		console.log('server socket disconnected!');
	});
}

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