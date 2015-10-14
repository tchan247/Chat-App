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
    socket.write('BYE\n\n', function(){
      socket.end();
    });
    if(user.loggedIn) {
      // userCount--;
    }
  }
};

module.exports = commands;
