var messageContainer = document.getElementById('messageContainer');
var messageInput = document.getElementById('messageInput');
var send = document.getElementById('send');

const socket = io();
var username;

socket.on('getName', (name) => {
  username = name;
  socket.emit('serverLog', 'User (' + username + ') connected');
});

socket.on('message', (theirMessageBox) => {
  messageDisplay(theirMessageBox);
  window.scrollTo(0,document.body.scrollHeight);
});

socket.on('write', (myMessageBox) => {
  messageDisplay(myMessageBox);
  window.scrollTo(0,document.body.scrollHeight);
})

send.addEventListener('click', function(){
  if(messageInput.value != ''){
    const message = messageInput.value;
    const messageInfo = {
      msg: message,
      usr: username
    }
    socket.emit('chatMessage', messageInfo);
    messageInput.value = '';
  }
});

messageContainer.addEventListener('click', function(){
  messageInput.blur();
});

function messageDisplay(messageBoxDiv){
  var messageBox = document.createElement('div');
  messageBox.innerHTML = messageBoxDiv;
  messageContainer.appendChild(messageBox);
}
