// HTTP modules
var express = require('express');
var io = require('socket.io');

// TCP modules
var net = require('net');
var protocol = require('./server/protocol');
var utils = require('./server/utils');
var commands = require('./server/commands');


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
var userCount = 0;
var rooms = [];
var messages = [];

// start server
var conn = net.createServer(function(){
  console.log('TCP server listening to port: ' + PORT2);
}).listen(PORT2);

// Handle user connections
conn.on('connection', function(socket){
  // current user account for connection
  var user = {username: 'anonymous', loggedIn: false, socket: socket};

  socket.on('data', function(data) {
    var input = utils.getInput(data);

    // catch user commands
    if(commands[input]) {
      commands[input](user);
    }

    if(user.loggedIn) {
      utils.postMessage(input);
    } else {
      utils.login(user, input);
    }
    socket.write(protocol.cData);
  });

  socket.write(protocol.sData + 'Welcome to the GungHo test chat server\n');
  socket.write(protocol.sData + 'currently ' + userCount + (userCount === 1? ' user' : ' users') + ' online\n');
  socket.write(protocol.sData + 'Login Name?\n');
  socket.write(protocol.cData);
  console.log('Connection :: ready');
});

conn.on('close', function() {
  console.log('Connection :: close');
});

conn.on('error', function(err) {
  console.log('Connection :: error: ' + err);
});

