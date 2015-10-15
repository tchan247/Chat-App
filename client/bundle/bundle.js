var username = prompt('please enter a name') || 'annonymous';
var user = {username: username, loggedIn: true, status: 'idle', room: undefined};
var rooms, users;

// client init
var io = io();
io.on('connected', function(data) {
  rooms = data.rooms;
  users = data.users;
  renderRooms();
});

io.on('userCreated', function(data) {
  users[data.username] = data;
});

io.on('message',function(data){
  addMessage(data);
});

// room switch logic
var renderRooms = function() {
  var list = document.getElementsByClassName('rooms')[0].children[1];
  var room, el;
  var switchRoom = function(){
    var room = this.innerText;
    user.room = room;
    if(user.room === undefined) {
      
      joinRoom(room);
      io.emit('ioJoin', user);
    } else {
      io.emit('leave', user);
      leaveRoom(user.room);
      clearMessages();
      joinRoom(room);
      io.emit('join', user);
    }
  };
  for(var key in rooms) {
    room = rooms[key];
    el = document.createElement('li');
    el.className = 'room';
    el.addEventListener('click', switchRoom);
    el.innerHTML = room.name;
    list.appendChild(el);
  }
};

var joinRoom = function(room) {
  user.room = room;
  addMessage('Welcom to the room: ' + room);
  sendMessage('* ' + user.username + ' has joined the room');
};

var leaveRoom = function() {
  user.room = undefined;
  sendMessage('* ' + user.username + ' has left the room');
};

// adds message to chat box
var addMessage = function(message) {
  var list = document.getElementsByClassName('messages')[0].children[0];
  var el = document.createElement('li');
  el.innerHTML = message;
  list.appendChild(el);
};

// removes all messages in chat box
var clearMessages = function() {
  var list = document.getElementsByClassName('messages')[0].children[0];
  list.innerHTML = '';
};

// send message to all clients
var sendMessage = function() {
  var message = document.getElementsByClassName('chat-input')[0].children[0].value;
  message = username + ': ' + message;
  addMessage(message);
  io.emit('ioMessage', message);
};  

