const server = require('http').createServer();
const io = require('socket.io')(server);
io.on('connection', client => {
	console.log('client socket connected!');
	client.on('message', data => {
		io.emit('message', data);
	});
	client.on('disconnect', () => {
		console.log('client socket disconnected!');
	});
});
server.listen(3000);