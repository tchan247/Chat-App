// HTTP modules
var express = require('express');

// TCP modules
var net = require('net');
var protocol = require('./server/protocol');
var utils = require('./server/utils');
var commands = require('./server/commands');
var users = require('./server/db/user/users');
var rooms = require('./server/db/room/rooms');

/**
* HTTP Server
*/
var app = express();
var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function(){
  console.log('listening to port: ' + PORT);
});
var io = require('socket.io').listen(server);
var ioSocket;

app.use(express.static(__dirname + '/client'));

io.on('connection',function(socket){
  console.log('socket.io connected');
  var data = {rooms: rooms, users: users};
  socket.emit('connected', data);
  ioSocket = socket;

  console.log(socket.handshake.url);

  socket.on('disconnect', function() {
    console.log('socket.io: disconnected');
  });
});

// sync web client user data
io.on('ioUserCreated', function(data) {
  users[data.username] = data;
});

/**
* TCP Server
*/
var PORT2 = 3001;

// start server
var conn = net.createServer(function(){
  console.log('TCP server listening to port: ' + PORT2);
}).listen(PORT2);

// Handle user connections
conn.on('connection', function(socket){
  // current user account for connection
  var session = {
    socket: socket,
    ioSocket: ioSocket || {emit: function(){}}, // create fake socket if no socket.io connection
    user: {
      username: 'anonymous', loggedIn: false, status: 'unregistered'
    }
  };

  socket.on('data', function(data) {
    var input = utils.getInput(data);

    // catch user commands
    if(commands[input]) {
      commands[input](session, input);
    } else if(session.user.loggedIn) {
      utils.postMessage(session, input);
    }

    socket.write(protocol.cData);
  });

  // connection messages
  utils.write(socket, [
    '', 
    'Welcome to the GungHo test chat server!',
    'currently ' + utils.userCount().online + ' user(s) online',
    '',
    'Login with "/login" - display available commands with "/help"'
  ]);

  socket.write(protocol.cData);
  console.log('Connection :: ready');
});

conn.on('close', function() {
  console.log('Connection :: close');
});

conn.on('error', function(err) {
  console.log('Connection :: error: ' + err);
});

