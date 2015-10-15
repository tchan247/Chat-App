var protocol = require('./protocol');
var users = require('./db/user/user');
var rooms = require('./db/room/room');
var utils = {};

utils.getInput = function(data) {
  input = data.toString();
  input = input.slice(0, input.length-2);

  return input;
};

utils.broadcast = function(room, message) {
  var members = rooms[room].members;
  for(var key in members) {
    member = members[key];
    member.socket.write(protocol.sData + message + '\n');
    member.socket.write(protocol.cData);
  }
};

utils.postMessage = function(session, input) {
  var user = session.user;
  console.log(user.room);
  
  if(user.room !== undefined) {
    this.broadcast(user.room, session.user.username + ': ' + input);
  }

};

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

module.exports = utils;
