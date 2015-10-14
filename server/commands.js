var protocol = require('./protocol');
var users = require('./db/user/user');

var commands = {
  '/info': function(user) {
    user.socket.write();
  },
  'join': function() {

  },
  '/leave': function(user) {

  },
  '/reg': function(user) {

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
