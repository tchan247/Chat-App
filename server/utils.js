var protocol = require('./protocol');
var user = require('./db/user/user');
var users = require('./db/user/users');
var rooms = require('./db/room/rooms');

var utils = {};

// parse input into string without escaped chars
utils.getInput = function(data) {
  input = data.toString();
  input = input.slice(0, input.length-2);

  return input;
};

// send message to all users
utils.broadcast = function(room, message) {
  var members = rooms[room].members;
  var member;
  for(var key in members) {
    member = members[key];
    member.socket.write(protocol.sData + message + '\n');
    member.socket.write(protocol.cData);
    member.ioSocket.emit('message', message);
  }
};

// create a user
utils.createUser = function(name) {
  var newUser = new user({username: name});
  users[name] = newUser;
};

// post a message
utils.postMessage = function(session, input) {
  var user = session.user;
  console.log(user.room);
  
  if(user.room !== undefined) {
    this.broadcast(user.room, session.user.username + ': ' + input);
  }

};

// get users offline and online
utils.userCount = function() {
  var count = {offline: 0, online: 0};
  for(var user in users) {
    if(users[user].loggedIn) {
      count.online++;
    } else {
      count.offline++;
    }
  }

  return count;
};

/**
* Write messages to a socket
* @param {Object} socket - Socket to write to
* @param {String|String[]} messages - Message or list of messages to write in order
*/
utils.write = function(socket, messages) {
  if(typeof messages === 'string') {
    socket.write(protocol.sData + messages + '\n');
  } else if (Array.isArray(messages)) {
    for(var i = 0, len = messages.length; i < len; i++) {
      socket.write(protocol.sData + messages[i] + '\n');
    }
  }
};

module.exports = utils;
