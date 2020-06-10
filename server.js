/**
 * Vídeo #1 ao #12: Node.js - Módulo 6 - B7Web
 * Web sockets com Node.js.
 * by: Vagner Pinto
 */

const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server); //habilita a comunicação full duplex com web sockets

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

/*
    Socket lado server.
    Cada cliente conecta um socket, logo, essa chamada responde em sockets separados a cada cliente.
 */
//ao conectar
io.on('connection', (socket)=>{ //listener (ou RX)
    console.log("Conexão detectada...");

    //ao entrar no chat
    socket.on('join-request', (userName)=>{
        socket.username = userName;
        connectedUsers.push(userName);
        console.log(connectedUsers);
        socket.emit('user-added', connectedUsers); //envia uma mensagem no socket para o cliente
        socket.broadcast.emit('list-update', {
            joined: userName,
            list: connectedUsers
        }); //emite uma mensagem de broadcast para os demais clientes (ele não via para o cliente que requisitou) (para atualizar a lista de usuários no chat)
    });

    //ao sair do chat
    socket.on('disconnect', ()=>{
        connectedUsers = connectedUsers.filter( u => u !== socket.username);
        console.log(connectedUsers);
        socket.broadcast.emit('list-update', {
            shift: socket.username,
            list: connectedUsers
        }); //emite uma mensagem de broadcast para os demais clientes (ele não via para o cliente que requisitou) (par
    });

    //processa as menssagens do chat
    socket.on('send-msg', (txt)=>{
        let message = {
          username: socket.username,
          message: txt
        };
        socket.broadcast.emit('show-msg', message);
    });

});
