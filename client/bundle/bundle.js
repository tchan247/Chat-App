var username = prompt('please enter a name') || 'annonymous';
var user = {username: username, loggedIn: true, status: 'idle', room: undefined};
var rooms, users;

var io = io();
io.on('connected', function(data) {
  rooms = data.rooms;
  users = data.users;
});

io.on('userCreated', function(data) {
  users[data.username] = data;
});

io.on('message',function(data){
  addMessage(data);
});

var addMessage = function(message) {
  var list = document.getElementsByClassName('messages')[0].children[0];
  var el = document.createElement('li');
  el.innerHTML = message;
  list.appendChild(el);
  console.log(el);
};

var sendMessage = function() {
  var message = document.getElementsByClassName('chat-input')[0].children[0].value;
  message = username + ': ' + message;
  addMessage(message);
  io.emit('ioMessage', message);
};  

