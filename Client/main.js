
var SOCKET_SERVER_URL = 'http://192.168.10.7:80';
if (window.location.hostname !== '192.168.10.7') {
	SOCKET_SERVER_URL = 'https://chat-accesible-c3f6ce045512.herokuapp.com/';
}
var socket = io.connect(SOCKET_SERVER_URL, { 'forceNew': true });

// Los elementos
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var nickname = document.getElementById('nickname');
var text = document.getElementById('text');
var login = document.getElementById('login');
var logout = document.getElementById('logout');
var form_login = document.getElementById('form_login');
var form_logout = document.getElementById('form_logout');
var nickname_span = document.getElementById('nickname_span');
var select_voz = document.getElementById('select_voz');
var eventos = document.getElementById('eventos');
// Audios
var audio_recibido = new Audio('./media/$whatsapp_incoming.wav');
var audio_enviado = new Audio('./media/wa_ptt_sent.wav');
var audio_inicio = new Audio('./media/inicio.mp3');
var audio_unirse = new Audio('./media/unirse.mp3');
var audio_fondo = new Audio('./media/fondo.mp3');

// setInterval vaciar los eventos después de tres segundos
setInterval(() => {
	eventos.innerHTML = '';
}, 3000);

// Después de que se cargue la página, meter todas las voces disponibles en el select
window.speechSynthesis.onvoiceschanged = function () {
	var voices = speechSynthesis.getVoices();
	voices.forEach(function (voice) {
		var option = document.createElement('option');
		option.value = voice.name;
		option.innerHTML = voice.name;
		select_voz.appendChild(option);
	});
};

function Tts(texto) {
	var utterance = new SpeechSynthesisUtterance();
	utterance.text = texto;
	// Comprobar si no se ha iniciado sesión
	if (!localStorage.getItem('nickname')) {
		// Colocarle la voz del select
		utterance.voice = speechSynthesis.getVoices().find(function (voice) {
			return voice.name === select_voz.value;
		});
	} else {
		var voices = speechSynthesis.getVoices();
		utterance.voice = voices.find(function (voice) {
			return voice.name === localStorage.getItem('voz');
		});
	}
	// Reproducir el mensaje
	speechSynthesis.cancel();
	speechSynthesis.speak(utterance);
}

// Al iniciar la página, comprobar si el usuario ya inició sesión o no, y en función de eso mostrar y ocultar las secciones correspondientes
window.onload = function () {
	if (localStorage.getItem('nickname')) {
		login.style.display = 'none';
		logout.style.display = 'block';
		form.style.display = 'block';
		nickname.value = localStorage.getItem('nickname');
		nickname_span.innerHTML = localStorage.getItem('nickname');
	} else {
		login.style.display = 'block';
		logout.style.display = 'none';
		form.style.display = 'none';
		audio_inicio.play();
	}
};

// Colocarle al select un evento de cambio para que hable la voz seleccionada
select_voz.addEventListener('change', function () {
	Tts('La voz seleccionada es ' + select_voz.value);
});

// Evento para iniciar sesión
form_login.addEventListener('submit', function (e) {
	e.preventDefault();
	var username = nickname.value.trim(); // Obtener el nombre de usuario y limpiar espacios en blanco
	if (username === '') {
		Tts('Debes ingresar un nombre de usuario');
		return;
	}
	localStorage.setItem('nickname', username);
	localStorage.setItem('voz', select_voz.value);
	// Emitir el evento 'add-user' al servidor solo si el nombre de usuario es válido
	socket.emit('add-user', username);
	location.reload();
	// el sonido fondo
	audio_fondo.play();
	audio_fondo.loop = true;
});

// Evento para cerrar sesión
form_logout.addEventListener('submit', function (e) {
	e.preventDefault();
	localStorage.removeItem('nickname');
	location.reload();
});

// Enviar el mensaje al servidor
socket.on('messages', function (data) {
	console.log(data);
	render(data);

});

// Reproducir el sonido de mensaje recibido solo cuando se recibe el evento 'message-received'
socket.on('message-received', function (data) {
	audio_recibido.play();
	// Leer el mensaje recibido
	Tts("Nuevo mensaje de " + data.nickname + " dice: " + data.text);
	navigator.vibrate([300, 100, 300]);
	// enfocar al elemento de el localStorage
	let currentIndex = localStorage.getItem('currentIndex');
	if (currentIndex) {
		document.querySelectorAll('.mensaje')[currentIndex].tabIndex = 0;
		document.querySelectorAll('.mensaje')[currentIndex].ariaSelected = 'true';
	}
});
// el evento user-joined
socket.on('user-joined', function (username) {
	audio_unirse.play();
	eventos.innerHTML = username + ' se ha unido al chat';
}	);

function render(data) {
	var html = data.map(function (elem, index) {
		return (`<li tabindex="-1" class="mensaje" aria-selected="false" onkeydown="handleKeyDown(event)" role="option">
      <strong>${elem.nickname}</strong>:
      <em>${elem.text}</em>
    </li>`);
	}).join(' ');

	messages.innerHTML = html;
	messages.scrollTop = messages.scrollHeight;

		// obtener el indice del mensaje enfocado del localStorage
		let currentIndex = localStorage.getItem('currentIndex');
		// si el indice existe, enfocar el mensaje correspondiente
		if (currentIndex) {
			document.querySelectorAll('.mensaje')[currentIndex].tabIndex = 0;
			document.querySelectorAll('.mensaje')[currentIndex].ariaSelected = 'true';
		} else {
			// si no, enfocar el último mensaje
			document.querySelectorAll('.mensaje')[document.querySelectorAll('.mensaje').length - 1].focus();
			document.querySelectorAll('.mensaje')[document.querySelectorAll('.mensaje').length - 1].tabIndex = 0;
			document.querySelectorAll('.mensaje')[document.querySelectorAll('.mensaje').length - 1].ariaSelected = 'true';
		}
}

// evento para guardar el indice de la posición del mensaje enfocado en el localStorage
messages.addEventListener('focus', function (event) {
	let currentMessage = event.target;
	let allMessages = document.querySelectorAll('.mensaje');
	let currentIndex = Array.from(allMessages).indexOf(currentMessage);
	localStorage.setItem('currentIndex', currentIndex);
}, true);

function handleKeyDown(event) {
	var currentMessage = document.activeElement;
	var allMessages = document.querySelectorAll('.mensaje');
	var currentIndex = Array.from(allMessages).indexOf(currentMessage);

	switch (event.key) {
		case 'ArrowUp':
			event.preventDefault();
			if (currentIndex > 0) {
				allMessages[currentIndex].ariaSelected = 'false';
				allMessages[currentIndex].tabIndex = -1;
				allMessages[currentIndex - 1].ariaSelected = 'true';
				allMessages[currentIndex - 1].tabIndex = 0;
				allMessages[currentIndex - 1].focus();
			}
			break;
		case 'ArrowDown':
			event.preventDefault();
			if (currentIndex < allMessages.length - 1) {
				allMessages[currentIndex].ariaSelected = 'false';
				allMessages[currentIndex].tabIndex = -1;
				allMessages[currentIndex + 1].ariaSelected = 'true';
				allMessages[currentIndex + 1].tabIndex = 0;
				allMessages[currentIndex + 1].focus();
			}
			break;
			// la tecla de inicio
		case 'Home':
			event.preventDefault();
			allMessages[currentIndex].ariaSelected = 'false';
			allMessages[currentIndex].tabIndex = -1;
			allMessages[0].ariaSelected = 'true';
			allMessages[0].tabIndex = 0;
			allMessages[0].focus();
			break;
			// la tecla de fin
		case 'End':
			event.preventDefault();
			allMessages[currentIndex].ariaSelected = 'false';
			allMessages[currentIndex].tabIndex = -1;
			allMessages[allMessages.length - 1].ariaSelected = 'true';
			allMessages[allMessages.length - 1].tabIndex = 0;
			allMessages[allMessages.length - 1].focus();
			break;
		default:
			break;
	}
}

function addMessage(e) {
	e.preventDefault();
	if (text.value.trim() === '') {
		Tts('No puedes enviar un mensaje vacío');
		return;
	}
	var message = {
		nickname: nickname.value,
		text: text.value
	};

	socket.emit('add-message', message);
	text.value = '';
	audio_enviado.play();
	return false;
}
form.addEventListener('submit', addMessage);

text.addEventListener('keydown', function (e) {
	if (e.key === 'Enter' && !e.ctrlKey) {
		e.preventDefault();
		addMessage(e);
	}
	if (e.key === 'Enter' && e.ctrlKey) {
		text.value += '\n';
	}
});
