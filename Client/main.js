
var socket = io.connect('https://chat-accesible-c3f6ce045512.herokuapp.com/', { 'forceNew': true });

// los elementos
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
// audio para cuando manden un mensaje
var audio_recibido = new Audio('./media/$whatsapp_incoming.wav');
// audio para cuadno se reciba un mensaje
var audio_enviado = new Audio('./media/wa_ptt_sent.wav');

// después que se cargue la página meter todas las voces disponibles en el select
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
	// comprovar si no se a iniciado seción
	if (!localStorage.getItem('nickname')) {
		// colocarle la voz del select
		utterance.voice = speechSynthesis.getVoices().filter(function (voice) {
			return voice.name === select_voz.value;
		})[0];
	} else {
		var voices = speechSynthesis.getVoices();
		voices.forEach(function (voice) {
			if (voice.name === localStorage.getItem('voz')) {
				utterance.voice = voice;
			}
		});
	}
	// reproducir el mensaje
	speechSynthesis.cancel();
	speechSynthesis.speak(utterance);
}

// al iniciar la página, comprobar si el usuario ya inició secióonseción o no, y en función de eso mostrar y ocultar las secciones correspondientes
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
	}
};

// colocarle al select un evento de cambio para que hable la voz seleccionada
select_voz.addEventListener('change', function () {
	Tts('La voz seleccionada es ' + select_voz.value);
});

// evento para iniciar sesión
form_login.addEventListener('submit', function (e) {
	e.preventDefault();
	localStorage.setItem('nickname', nickname.value);
	localStorage.setItem('voz', select_voz.value);
	location.reload();
});

// evento para cerrar sesión
form_logout.addEventListener('submit', function (e) {
	e.preventDefault();
	localStorage.removeItem('nickname');
	location.reload();
});

// embiar el mensaje al servidor
socket.on('messages', function (data) {
	console.log(data);
	render(data);
});

// Reproducir el sonido de mensaje recibido solo cuando se recibe el evento 'message-received'
socket.on('message-received', function (data) {
	audio_recibido.play();
	// leer el mensaje recibido
	Tts("Nuevo mensaje de " + data.nickname + " dice: " + data.text);
	navigator.vibrate([300, 100, 300]);
	// hacer para que no pierda el foco al recibir un mensaje
	var elementoActivo = document.activeElement;
	var indiceElementoActivo = Array.from(messages.children).indexOf(elementoActivo);
	if (indiceElementoActivo === -1) {
		messages.lastChild.focus();
	}

});

function render(data) {
	var html = data.map(function (elem, index) {
		return (`<li tabindex="0" class="mensaje">
			<strong>${elem.nickname}</strong>:
			<em>${elem.text}</em>
		</li>`);
	}).join(' ');

	messages.innerHTML = html;
	messages.scrollTop = messages.scrollHeight;
}

function addMessage(e) {
	// evita que el formulario se envíe
	e.preventDefault();
	var message = {
		nickname: nickname.value,
		text: text.value
	};

	socket.emit('add-message', message);
	text.value = '';
	audio_enviado.play();
	return false;
}
// aplicar el evento al formulario
form.addEventListener('submit', addMessage);

function mejorarAccesibilidadLista() {
	var elementosLista = Array.from(messages.children);
	elementosLista.forEach(function (elemento) {
		elemento.addEventListener('focus', function () {
			elemento.classList.add('focus');
		});
		elemento.addEventListener('blur', function () {
			elemento.classList.remove('focus');
		});
	});
}

// evento de teclado para navegar con las teclas flecha arriba y abajo
messages.addEventListener('keydown', function (e) {
	var elementosLista = Array.from(messages.children);
	var elementoActivo = document.activeElement;
	var indiceElementoActivo = elementosLista.indexOf(elementoActivo);
	if (e.key === 'ArrowDown') {
		if (indiceElementoActivo < elementosLista.length - 1) {
			elementosLista[indiceElementoActivo + 1].focus();
		}
	} else if (e.key === 'ArrowUp') {
		if (indiceElementoActivo > 0) {
			elementosLista[indiceElementoActivo - 1].focus();
		}
	}
});

// ejecutar la funcion para mejorar la accesibilidad de la lista
mejorarAccesibilidadLista();
