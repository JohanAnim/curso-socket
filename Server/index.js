//  Code: Server

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let messages = [{
	id: 1,
	text: 'Bienvenido al chat privado de Socket.io y NodeJS de JohanG',
	nickname: 'Bot - JohanBot'
}];
const PORT = process.env.PORT || 6677;
server.listen(PORT, () => {
	console.log('Server is running on http://localhost:6677');
});

app.use(express.static('client'));

app.get('/hello', (req, res) => {
	res.status(200).send('Hola mundo desde una ruta');
});

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
