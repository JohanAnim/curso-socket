# Chat Privado con Socket.io y NodeJS

## Descripción
Una aplicación de chat en tiempo real desarrollada con Node.js y Socket.io. Permite a los usuarios iniciar sesión, enviar mensajes y cerrar sesión.

## Instalación
1. Clona este repositorio en tu máquina local.
2. Abre una terminal en la carpeta del proyecto.
3. Ejecuta `npm install` para instalar las dependencias.
4. Ejecuta `npm start` para iniciar el servidor en producción o `npm run dev` para iniciar en modo de desarrollo con Nodemon.

## Uso
1. Abre un navegador web y visita `http://localhost:80` para acceder al chat.
2. Inicia sesión con un nombre de usuario y elige una voz.
3. Envía mensajes en el chat y cierra sesión cuando desees.

## Estructura del Código
- `Server/index.js`: Contiene el código del servidor.
- `Client/main.js`: Contiene el código del cliente para el chat.

## Dependencias
- Express: `npm install express`
- Socket.io: `npm install socket.io`
- Nodemon (solo para desarrollo): `npm install --save-dev nodemon`

## Funcionalidades
- Iniciar sesión con un nombre de usuario y elegir una voz.
- Enviar mensajes en el chat.
- Cerrar sesión y cambiar la voz.

## Archivos del Cliente
- `index.html`: Página principal del chat con elementos para iniciar y cerrar sesión, mensajes y formulario para enviar mensajes.
- `main.js`: Script JavaScript para manejar la interacción del cliente con el servidor mediante Socket.io.

## Estilos CSS
Se incluyen estilos CSS para la interfaz del chat, incluyendo la caja de mensajes, formularios de inicio y cierre de sesión, y estilo general de la página.

## Notas
- El servidor se ejecuta en el puerto 80 por defecto, pero se puede cambiar utilizando la variable de entorno `PORT`.
- Se requiere una conexión a Internet para cargar la librería de Socket.io desde el servidor.
- La aplicación utiliza la librería de voces para opciones de accesibilidad.

---

Este documento proporciona una descripción general del proyecto, instrucciones de instalación, uso, estructura del código, dependencias, funcionalidades, archivos del cliente, estilos CSS y notas relevantes.
