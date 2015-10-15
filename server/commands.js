var protocol = require('./protocol');
var utils = require('./utils');
var users = require('./db/user/user');
var rooms = require('./db/room/room');

var commands = {
  '/help': function(session) {
    var socket = session.socket;
    socket.write(protocol.sData + '\n');
    socket.write(protocol.sData + '------------- HELP -------------'+ '\n');
    socket.write(protocol.sData + '/help: Displays available commands\n');
    socket.write(protocol.sData + '/info: Displays information about the user\n');
    socket.write(protocol.sData + '/join: Allows the user to join a room\n');
    socket.write(protocol.sData + '/leave: User leaves room if currently in one\n');
    socket.write(protocol.sData + '/login: Allows user to login with a username\n');
    socket.write(protocol.sData + '/quit: Closes the current session\n');
    socket.write(protocol.sData + '/reg: Allows the user to register a new user with a username\n');
    socket.write(protocol.sData + '/rooms: displays currently available rooms. /join command also uses this feature\n');
    socket.write(protocol.sData + '--------------------------------'+ '\n');
    socket.write(protocol.sData + '\n');
  },
  '/info': function(session) {
    var socket = session.socket;
    var user = session.user;
    socket.write(protocol.sData + '\n');
    socket.write(protocol.sData + '------------- INFO -------------'+ '\n');
    session.socket.write(protocol.sData + 'USER: ' + user.username + '\n');
    session.socket.write(protocol.sData + 'STATUS: ' + user.status + '\n');
    session.socket.write(protocol.sData + 'ROOM: ' + (user.room !== undefined? user.room : '* none *') + '\n');
    socket.write(protocol.sData + '--------------------------------'+ '\n');
    socket.write(protocol.sData + '\n');
  },
  '/join': function(session) {
    var socket = session.socket;
    // can only be in one room
    if(session.user.room !== undefined) {
      socket.write(protocol.sData + 'You\'re already in a room! Type /leave to leave current room\n');
      return ;
    }

    socket.write(protocol.sData + '\n');
    socket.write(protocol.sData + 'Please enter the name of a room you would like to join:\n');
    // display rooms
    this['/rooms'](session);
    socket.once('data', function(data) {
      var input = utils.getInput(data);
      var room = rooms[input];
      // make sure room exists
      if(room !== undefined){
        var user = session.user;
        var member;
        socket.write(protocol.sData + '\n');
        socket.write(protocol.sData + 'ENTERING ROOM: ' + room.name + ' \n');
        socket.write(protocol.sData + 'Current users:\n');
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
        socket.write(protocol.sData + 'Room does not exist!\n');
      }
      socket.write(protocol.cData);
    });

  },
  '/leave': function(session) {
    var socket = session.socket;
    var user = session.user;
    if(user.room !== undefined) {  
      socket.write(protocol.sData + '* leaving ' + user.room + '...\n');
      utils.broadcast(user.room, '* ' + user.username + ' has left the room');
      socket.write(protocol.sData + '\n');
      delete rooms[user.room].members[user.username];
      user.room = undefined;
      user.status = 'idle';
    }
  },
  '/login': function(session, input) {
    var socket = session.socket;
    socket.write(protocol.sData + '\n');
    socket.write(protocol.sData + 'Please provide existing user name or register one with "/reg"\n');

    socket.once('data', function(data) {
      var input = utils.getInput(data);
      if(users[input] && users[input].status !== 'unregistered'){
        socket.write(protocol.sData + '\n');
        socket.write(protocol.sData + 'Succesful login!\n');
        socket.write(protocol.sData + 'Join a room by typing /join\n');
        users[input] = {username: input, loggedIn: true, socket: socket, status: 'idle', room: undefined};
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
    socket.write(protocol.sData + '\n');
    socket.write(protocol.sData + 'Please enter a name: \n');
    session.user.status = 'registering';
    socket.once('data', function(data) {
      var input = utils.getInput(data);
      socket.write(protocol.sData + '\n');
      socket.write(protocol.sData + 'User succesfuly created! Please Login with "/login"\n');
      users[input] = {username: input, loggedIn: true, status: 'offline', room: undefined};
      socket.write(protocol.cData);
      session.ioSocket.emit('userCreated', users[input]);
    });
  },
  '/rooms': function(session) {
    var socket = session.socket;
    var room;
    socket.write(protocol.sData + 'Active rooms are:\n');
    for(var key in rooms) {
      room = rooms[key];
      socket.write(protocol.sData);
      socket.write('*' + room.name +' (' + Object.keys(room.members).length + ')\n');
    }
  }
};

module.exports = commands;
