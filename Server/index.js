//  Code: Server

/**
 * Importar módulos
 */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

/**
 * Configurar el puerto
 * @type {number}
 */
const port = process.env.PORT || 80;

/**
 * Configurar el directorio de archivos estáticos
 */
app.use(express.static('Client'));

/**
 * Iniciar el servidor
 */
server.listen(port, () => {
	console.log('Servidor corriendo en http://localhost:' + port);
});

/**
 * Crear un array para almacenar los mensajes
 * @type {Array}
 */
let messages = [{
	id: 1,
	text: 'Bienvenido al chat privado de Socket.io y NodeJS de JohanG',
	nickname: 'Bot - JohanBot'
}];

/**
 * Evento de conexión del socket
 * @param {object} socket - El objeto socket que representa la conexión
 */
io.on('connection', (socket) => {
	console.log('El nodo con IP: ' + socket.handshake.address + ' se ha conectado al servidor con el ID: ' + socket.id);

	/**
	 * Manejar el evento 'add-user' para recibir y almacenar el nombre de usuario
	 * @param {string} username - El nombre de usuario a almacenar
	 */
	socket.on('add-user', (username) => {
		socket.username = username;
		console.log('Nuevo usuario añadido: ' + username);
		// Emitir un evento 'user-joined' solo después de establecer socket.username
		socket.broadcast.emit('user-joined', socket.username);
	});

	/**
	 * Emitir un evento 'messages' a todos los sockets y pasarle el array de mensajes
	 */
	socket.emit('messages', messages);

	/**
	 * Manejar el evento 'add-message' para recibir y almacenar un nuevo mensaje
	 * @param {object} data - La información del mensaje a almacenar
	 */
	socket.on('add-message', (data) => {
		messages.push(data);
		io.sockets.emit('messages', messages);
		// Emitir un nuevo evento 'message-received' a todos los sockets excepto al que envió el mensaje y pasarle la información del mensaje
		socket.broadcast.emit('message-received', data);
	});

});

/**
 * Manejo de rutas inexistentes
 */
app.use((req, res, next) => {
	res.status(404).send('404 Not Found');
});
