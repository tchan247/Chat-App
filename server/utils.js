var protocol = require('./protocol');
var users = require('./db/user/user');
var rooms = require('./db/room/room');
var utils = {};

utils.getInput = function(data) {
  input = data.toString();
  input = input.slice(0, input.length-2);

  return input;
};

utils.postMessage = function(session, input) {
  var user = session.user;
  console.log(user.room);
  
  if(user.room !== undefined) {
    var members = rooms[user.room].members;
    for(var key in members) {
      member = members[key];
      member.socket.write(protocol.sData + session.user.username + ': ' + input + '\n');
      member.socket.write(protocol.cData);
    }
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
