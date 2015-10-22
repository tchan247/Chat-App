var _ = require('lodash/object');
var protocol = require('./protocol');
var utils = require('./utils');
var users = require('./db/user/users');
var rooms = require('./db/room/rooms');

var commands = {
  '/help': function(session) {
    var socket = session.socket;

    utils.write(socket, [
      '',
      '------------- HELP -------------',
      '/help: Displays available commands',
      '/info: Displays information about the user',
      '/join: Allows the user to join a room',
      '/leave: User leaves room if currently in one',
      '/login: Allows user to login with a username',
      '/quit: Closes the current session',
      '/reg: Allows the user to register a new user with a username',
      '/rooms: displays currently available rooms. /join command also uses this feature',
      '--------------------------------',
      ''
    ]);

  },

  '/info': function(session) {
    var socket = session.socket;
    var user = session.user;

    utils.write(socket, [
      '',
      '------------- INFO -------------',
      'USER: ' + user.username,
      'STATUS: ' + user.status,
      'ROOM: ' + (user.room !== undefined? user.room : '* none *'),
      '--------------------------------',
      ''
    ]);

  },

  '/join': function(session) {
    var socket = session.socket;
    // can only be in one room
    if(session.user.room !== undefined) {
      utils.write(socket, 'You\'re already in a room! Type /leave to leave current room');
      return ;
    }

    utils.write(socket, ['', 'Please enter the name of a room you would like to join:']);

    // display rooms
    this['/rooms'](session);

    socket.once('data', function(data) {
      var input = utils.getInput(data);
      var room = rooms[input];

      // make sure room exists
      if(room !== undefined){
        var user = session.user;
        var member;

        utils.write(socket, [
          '',
          'ENTERING ROOM: ' + room.name,
          'Current users:'
        ]);

        for(var key in room.members) {
          username = room.members[key].user.username;
          socket.write(protocol.sData + '* ' + username + '\n');
        }
        socket.write(protocol.sData + room.joinMessage + '\n');
        user.room = input;
        user.status = 'chatting';

        // instead of just adding users, we need to include user sockets to broadcast messages
        room.members[user.username] = session;

        // broadcast user join event
        utils.broadcast(room.name, '* ' + user.username + ' has joined the room');
      } else {
        utils.write(socket, 'Room does not exist!');
      }
      socket.write(protocol.cData);
    });

  },

  '/leave': function(session) {
    var socket = session.socket;
    var user = session.user;
    if(user.room !== undefined) {  
      utils.write(socket, '* leaving ' + user.room + '...');
      utils.broadcast(user.room, '* ' + user.username + ' has left the room');
      utils.write(socket, '');
      delete rooms[user.room].members[user.username];
      user.room = undefined;
      user.status = 'idle';
    }
  },

  '/login': function(session, input) {
    var socket = session.socket;
    utils.write(socket, ['', 'Please provide existing user name or register one with "/reg"']);

    socket.once('data', function(data) {
      var input = utils.getInput(data);
      if(users[input] && users[input].status !== 'unregistered'){
        utils.write(socket, ['', 'Succesful login!', 'Join a room by typing /join']);
        _.extend(users[input], {loggedIn: true, status: 'idle'});
        session.user = users[input];
        socket.write(protocol.cData);
      }
    });
  },

  '/quit': function(session) {
    var user = session.user;
    var socket = session.socket;

    // exit any rooms
    this['/leave'](session);
    
    if(user.loggedIn) {
      users[user.username].loggedIn = false;
    }

    socket.write(protocol.sData + 'BYE\n\n', function(){
      socket.end();
    });
  },

  '/reg': function(session, input) {
    var socket = session.socket;
    utils.write(socket, ['', 'Please enter a name:']);
    session.user.status = 'registering';
    socket.once('data', function(data) {
      var input = utils.getInput(data);
      utils.write(socket, ['', 'User succesfuly created! Please Login with "/login"']);
      utils.createUser(input);
      socket.write(protocol.cData);
      session.ioSocket.emit('userCreated', users[input]);
    });
  },

  '/rooms': function(session) {
    var socket = session.socket;
    var room;
    utils.write(socket, 'Active rooms are:');
    for(var key in rooms) {
      room = rooms[key];
      socket.write(protocol.sData);
      socket.write('*' + room.name +' (' + Object.keys(room.members).length + ')\n');
    }
  }
};

module.exports = commands;
