var protocol = require('./protocol');
var users = require('./db/user/user');
var utils = require('./utils');

var commands = {
  '/info': function(session) {
    session.user.socket.write();
  },
  '/join': function() {

  },
  '/leave': function() {

  },
  '/login': function(session, input) {
    var socket = session.user.socket;
    socket.write(protocol.sData);
    socket.write('Please provide user or register with "/reg"\n');

    socket.once('data', function(data) {
      var input = utils.getInput(data);
      if(users[input] && users[input].status !== 'unregistered'){
        socket.write(protocol.sData);
        socket.write('Succesful login!\n');
        users[input] = {username: input, loggedIn: true, socket: socket};
        session.user = users[input];
        socket.write(protocol.cData);
      }
    });
    return user;
  },
  '/reg': function(session, input) {
    var socket = session.user.socket;
    socket.write(protocol.sData + 'Please enter a name: \n');
    session.user.status = 'registering';
    socket.once('data', function(data) {
      var input = utils.getInput(data);
      socket.write(protocol.sData + 'User succesfuly created! Please Login with "/login"\n');
      users[input] = {username: input, loggedIn: true, socket: socket, status: 'idle'};
      session.user = users[input];
      socket.write(protocol.cData);
    });
  },
  '/rooms': function(session) {

  },
  '/quit': function(session) {
    var user = session.user;
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
