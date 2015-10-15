var protocol = require('./protocol');
var users = require('./db/user/user');
var utils = require('./utils');

var commands = {
  '/info': function(user) {
    user.socket.write();
  },
  '/join': function() {

  },
  '/leave': function(user) {

  },
  '/login': function(user, input, session) {
    var socket = user.socket;
    socket.write(protocol.sData);
    socket.write('Please provide user or register with "/reg"\n');

    socket.once('data', function(data) {
      var input = utils.getInput(data);
      if(users[input] && users[input].status !== 'unregistered'){
        socket.write(protocol.sData);
        socket.write('Succesful login!\n');
        users[input] = {username: input, loggedIn: true, socket: socket};
        user = users[input];
        socket.write(protocol.cData);
      }
    });
    return user;
  },
  '/reg': function(user, input, session) {
    var socket = user.socket;
    socket.write(protocol.sData + 'Please enter a name: \n');
    user.status = 'registering';
    socket.once('data', function(data) {
      var input2 = utils.getInput(data);
      socket.write(protocol.sData + 'User succesfuly created! Please Login with "/login"\n');
      users[input2] = {username: input2, loggedIn: true, socket: socket, status: 'idle'};
      session.user = users[input2];
      socket.write(protocol.cData);
    });
  },
  '/rooms': function(user) {

  },
  '/quit': function(user) {
    var socket = user.socket;
    socket.write(protocol.sData);

    if(user.loggedIn) {
      users[user.username].loggedIn = false;
    }

    socket.write('BYE\n\n', function(){
      socket.end();
    });
  }
};

module.exports = commands;
