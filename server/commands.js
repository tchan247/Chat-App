var protocol = require('./protocol');
var utils = require('./utils');
var users = require('./db/user/user');
var rooms = require('./db/room/room');

var commands = {
  '/info': function(session) {
    session.user.socket.write();
  },
  '/join': function(session) {
    var socket = session.socket;
    socket.write(protocol.sData);
    socket.write('Please enter the name of a room you would like to join:\n');
    // display rooms
    this['/rooms'](session);
    // get user input
    socket.once('data', function(data) {
      var input = utils.getInput(data);
      var room = rooms[input];
      if(room !== undefined){
        var user = session.user;
        socket.write(protocol.sData + 'ENTERING ROOM: ' + room.name + ' \n');
        socket.write(protocol.sData + room.joinMessage + '\n');
        user.room = input;
        room.users[user.username] = user;
      } else {
        socket.write(protocol.sData + 'Room does not exist!\n');
      }
      socket.write(protocol.cData);
    });

  },
  '/leave': function() {

  },
  '/login': function(session, input) {
    var socket = session.socket;
    socket.write(protocol.sData);
    socket.write('Please provide user or register with "/reg"\n');

    socket.once('data', function(data) {
      var input = utils.getInput(data);
      if(users[input] && users[input].status !== 'unregistered'){
        socket.write(protocol.sData);
        socket.write('Succesful login!\n');
        users[input] = {username: input, loggedIn: true, socket: socket, status: 'idle', room: 'lobby'};
        session.user = users[input];
        socket.write(protocol.cData);
      }
    });
  },
  '/reg': function(session, input) {
    var socket = session.socket;
    socket.write(protocol.sData + 'Please enter a name: \n');
    session.user.status = 'registering';
    socket.once('data', function(data) {
      var input = utils.getInput(data);
      socket.write(protocol.sData + 'User succesfuly created! Please Login with "/login"\n');
      users[input] = {username: input, loggedIn: true, status: 'offline', room: undefined};
      socket.write(protocol.cData);
    });
  },
  '/rooms': function(session) {
    var socket = session.socket;
    socket.write(protocol.sData + 'Active rooms are:\n');
    for(var key in rooms) {
      var room = rooms[key];
      socket.write(protocol.sData);
      socket.write('*' + room.name +' (' + Object.keys(room.users).length + ')\n');
    }
  },
  '/quit': function(session) {
    var user = session.user;
    var socket = session.socket;
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
