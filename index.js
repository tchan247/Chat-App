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
* TCP Server
*/
var PORT2 = 3001;

// Temporary implementation of data storage
var users = {'terry': {username: 'terry', loggedIn: false, socket: null}};
var userCount = 0;
var rooms = [];
var messages = [];

// 
var conn = net.createServer(function(){
  console.log('TCP server listening to port: ' + PORT2);
}).listen(PORT2);

// Handle user connections
conn.on('connection', function(socket){
  // current user account for connection
  var user = {username: 'anonymous', loggedIn: false, socket: socket};
  // server/client sending data
  var sData = '\r<= ';
  var cData = '\r=> ';
  // user commands
  var commands = {
    '/info': function(socket) {
      socket.write();
    },
    'join': function() {

    },
    '/leave': function(socket) {

    },
    '/reg': function(socket) {

    },
    '/rooms': function(socket) {

    },
    '/quit': function(socket) {
      socket.write(sData);
      socket.write('BYE\n\n', function(){
        socket.end();
      });
      if(user.loggedIn) {
        userCount--;
      }
    }
  };
  var login = function(input) {
    socket.write(sData);
    console.log(users[input]);
    if(users[input] === undefined) {
      socket.write('Invalid login name - create a new user?(y/n)\n');
      
      socket.once('data', function(data) {
        var input = getInput(data).toLowerCase();
        
        if(input === 'y') {
          socket.write('Please enter a name: \n');
          socket.once('data', function(data) {
            var input2 = getInput(data);
            console.log(input2);
            socket.write('User succesful created!\n');
            users[input2] = {username: input2, loggedIn: true, socket: socket};
            user = users[input2];
            userCount++;
          });
        } else if (input === 'n') {
          
        }
        console.log('y/n');
      });

    } else {
      userCount++;
      socket.write('Succesful login!\n');
      users[input] = {username: input, loggedIn: true, socket: socket};
      user = users[input];
    }
  };
  var postMessage = function(input) {
    console.log(users);
  };
  var getInput = function(data) {
    input = data.toString();
    input = input.slice(0, input.length-2);

    return input;
  };

  socket.on('data', function(data) {
    var input = getInput(data);

    if(commands[input]) {
      commands[input](socket);
    }

    if(user.loggedIn) {
      postMessage(input);
    } else {
      login(input);
    }
    socket.write(cData);
  });

  socket.write(sData + 'Welcome to the GungHo test chat server\n');
  socket.write(sData + 'currently ' + userCount + (userCount === 1? ' user' : ' users') + ' online\n');
  socket.write(sData + 'Login Name?\n');
  socket.write(cData);
  console.log('Connection :: ready');
});

conn.on('close', function() {
  console.log('Connection :: close');
});

conn.on('error', function(err) {
  console.log('Connection :: error: ' + err);
});

