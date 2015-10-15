// HTTP modules
var express = require('express');
var io = require('socket.io');

// TCP modules
var net = require('net');
var protocol = require('./server/protocol');
var utils = require('./server/utils');
var commands = require('./server/commands');
var users = require('./server/db/user/user');


/**
* HTTP Server
*/
var app = express();
var PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/client'));

app.listen(PORT, function(){
  console.log('listening to port: ' + PORT);
});


/**
* TCP Server
*/
var PORT2 = 3001;

// Temporary implementation of data storage
var rooms = [];
var messages = [];

// start server
var conn = net.createServer(function(){
  console.log('TCP server listening to port: ' + PORT2);
}).listen(PORT2);

// Handle user connections
conn.on('connection', function(socket){
  // current user account for connection
  var session = {
    user: {
      username: 'anonymous', loggedIn: false, socket: socket, status: 'unregistered'
    }
  };

  socket.on('data', function(data) {
    var input = utils.getInput(data);
    console.log(session.user.username);

    // catch user commands
    if(commands[input]) {
      commands[input](session.user, input, session);
    }

    if(session.user.loggedIn) {
      utils.postMessage(input);
    }

    socket.write(protocol.cData);
  });

  // connection messages
  socket.write(protocol.sData + 'Welcome to the GungHo test chat server\n');
  socket.write(protocol.sData + 'currently ' + utils.userCount().online + ' user(s) online\n');
  socket.write(protocol.sData + 'Login with "/login" - display commands with "/help"?\n');
  socket.write(protocol.cData);
  console.log('Connection :: ready');
});

conn.on('close', function() {
  console.log('Connection :: close');
});

conn.on('error', function(err) {
  console.log('Connection :: error: ' + err);
});

