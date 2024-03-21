//  Code: Server

const express = require('express'), app = expres()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/Client/index.html');
});

let messages = [{
	id: 1,
	text: 'Bienvenido al chat privado de Socket.io y NodeJS de JohanG',
	nickname: 'Bot - JohanBot'
}];

// ahora, vamos a crear un evento para el socket
io.on('connection', (socket) => {
	console.log('El nodo con IP: ' + socket.handshake.address + ' se ha conectado');
	socket.emit('messages', messages);

	socket.on('add-message', (data) => {
		messages.push(data);
		io.sockets.emit('messages', messages);
		// Emitir un nuevo evento 'message-received' a todos los sockets excepto al que envió el mensaje y pasarle la información del mensaje
		socket.broadcast.emit('message-received', data);
	});

});

http.listen(3000, () => {
	console.log('Servidor corriendo en http://localhost:3000');
});
