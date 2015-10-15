var protocol = require('./protocol');
var users = require('./db/user/user');
var utils = {};

utils.getInput = function(data) {
  input = data.toString();
  input = input.slice(0, input.length-2);

  return input;
};

utils.postMessage = function() {
  console.log('something');
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
