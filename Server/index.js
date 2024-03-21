//  Code: Server

const express = require('express');
const app = express();
const socketIO = require('socket.io');

app.use('port', process.env.PORT || 8080) 
const server = app.listen(app.get('port'), ()=>{
   console.log(`Servidor corriendo en el puerto ${app.get('port')}`)
})

app.use(express.static('Client'));

// Configuración de Socket.IO para CORS
const io = socketIO(server, {
	cors: {
	  origin: "*", // Permitir todos los orígenes. Ajusta esto según tus necesidades.
	  methods: ["GET", "POST"]
	}
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

// Manejo de rutas inexistentes
app.use((req, res, next) => {
	res.status(404).send('404 Not Found');
  });