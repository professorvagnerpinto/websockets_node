/**
 * Vídeo #1 ao #12: Node.js - Módulo 6 - B7Web
 * Web sockets com Node.js.
 * by: Vagner Pinto
 */

/*
    Socket lado cliente.
    Cada cliente conectado ao server tem o seu socket com o server.
 */
const socket = io(); //inicializa a conexão socket com o server

//elementos do html globais nesse arquivo
let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');
let loginNameInput = document.querySelector('#loginNameInput');
let chatTextInput = document.querySelector('#chatTextInput');

//inicializa as divs do html
loginPage.style.display = 'flex';
chatPage.style.display = 'none';

//variáveis globais nesse arquivo
let userName = '';

//listener, trata a entrada do usuário no chat
loginNameInput.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){
        let name = loginNameInput.value.trim();
        if(name !== ''){
            userName = name;
            document.title = 'Chat (' + userName + ')';
            socket.emit('join-request', userName); //envia uma mensagem no socket para o server, o usuário que entrou no chat
        }
    }
});

//adiciona um usuário na lista de usuários do chat
function renderUserList(connectedUsers) {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';
    connectedUsers.forEach( u => {
        ul.innerHTML += '<li>'+u+'<\li>';
    });
}

//adiciona mensagens no chat
function addMessage(type, user, msg){
    let ul = document.querySelector('.chatList');
    switch (type) {
        case 'status': //mensagens de sistema
            ul.innerHTML += '<li class="m-status">'+msg+'</li>';
            break;
        case 'msg': //mensagens dos usuários
            if(userName === user){
                ul.innerHTML += '<li class="m-txt"><span class="me">'+user+'</span> '+msg+'</li>';
            }else{
                ul.innerHTML += '<li class="m-txt"><span>'+user+'</span> '+msg+'</li>';
            }
            break;
    }

    ul.scrollTop = ul.scrollHeight; //coloca o scroll no final
}

//listener, pega o retorno do server quando o usuário é adicionado no chat
socket.on('user-added', (connectedUsers)=>{
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    chatTextInput.focus();
    addMessage('status', null, 'Conectado.');
    renderUserList(connectedUsers); //renderiza a lista atualizada no html
});

//listener, pega o update da lista de usuários no chat (atualiza toda vez que um usuário entra ou sai do chat)
socket.on('list-update', (data)=>{
    if(data.joined){
        addMessage('status', null, data.joined+' entrou no chat');
    }
    if(data.shift){
        addMessage('status', null, data.shift+' saiu no chat');
    }
    renderUserList(data.list);
});

//listener, trata o envio de mensagens no chat
chatTextInput.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){
        let txt = chatTextInput.value.trim();
        chatTextInput.value = '';

        if(txt !== ''){
            addMessage('msg', userName, txt);
            socket.emit('send-msg', txt);
        }
    }
});

//listener, processa as mensagens do chat
socket.on('show-msg', (data)=>{
    addMessage('msg', data.username, data.message);
});

/*
    Sockets utilitários
 */
socket.on('disconnect', ()=>{ //quando o socket é desconectado, como, por exemplo, o servidor "cair"
    addMessage('status', null, 'Você foi desconectado.');
    renderUserList([]);
});

socket.on('reconnect_error', ()=>{ //quando o socket tenta reconectar
    addMessage('status', null, 'Reconectando...');
});

socket.on('reconnect', ()=>{ //quando o socket reconecta
    if(userName !== ''){
        socket.emit('join-request', userName);
    }
});
