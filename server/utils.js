var protocol = require('./protocol');
var users = require('./db/user/user');
var utils = {};

utils.login = function(user, input) {
  var socket = user.socket;
  socket.write(protocol.sData);
  console.log(users[input]);
  if(users[input] === undefined) {
    socket.write('Invalid login name - create a new user?(y/n)\n');
    
    socket.once('data', function(data) {
      var input = utils.getInput(data).toLowerCase();
      
      if(input === 'y') {
        socket.write('Please enter a name: \n');
        socket.once('data', function(data) {
          var input2 = utils.getInput(data);
          console.log(input2);
          socket.write('User succesful created!\n');
          users[input2] = {username: input2, loggedIn: true, socket: socket};
          user = users[input2];
          // userCount++;
        });
      }
      console.log('y/n');
    });

  } else {
    socket.write('Succesful login!\n');
    users[input] = {username: input, loggedIn: true, socket: socket};
    user = users[input];
    // userCount++;
  }
};

utils.getInput = function(data) {
  input = data.toString();
  input = input.slice(0, input.length-2);

  return input;
};

utils.postMessage = function() {
  console.log('something');
};

module.exports = utils;
