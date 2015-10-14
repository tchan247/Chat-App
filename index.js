var express = require('express');
var io = require('socket.io');

var net = require('net');

var app = express();
var PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/client'));

app.listen(PORT, function(){
  console.log('listening to port: ' + PORT);
});

/**
* TCP
*/
var users = [];
var rooms = [];

var conn = net.createServer(function(){
  
}).listen(3001);

conn.on('connection', function(socket){
  var user = {};
  var sData = '\r<= ';
  var cData = '\r=> ';
  var loginStatus = false;
  var commands = {
    '/quit': function() {
      socket.end('end');
    }
  };
  var login = function(input) {
    socket.write(sData);
    if(input) {
      socket.write('Invalid login name - Please enter a login name\n');
    } else {
      socket.write('Login Name?\n');
    }
  };
  var postMessage = function(input) {

    if(input.indexOf('/quit') > -1) {
    }
  };

  socket.on('data', function(data) {
    input = data.toString();
    input = input.slice(0, input.length-2);

    if(commands[input]) {
      commands[input]();
    }

    if(loginStatus) {
      postMessage(input);
    } else {
      login(input);
    }
    socket.write(cData);
  });

  socket.write(sData + 'Welcome to the GungHo test chat server\n');
  socket.write(sData + 'currently ' + users.length + ' users online\n');
  login();
  socket.write(cData);
  console.log('Connection :: ready');
});

conn.on('close', function() {
  console.log('Connection :: close');
});

conn.on('error', function(err) {
  console.log('Connection :: error: ' + err);
});

