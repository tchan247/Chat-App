var express = require('express');
var io = require('socket.io');

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/client'));

app.listen(port, function(){
  console.log('listening to port: ' + port);
});


/**
* TCP
*/

var net = require('net');
var conn = net.createServer(function(socket) {

  socket.write('Welcome to the GungHo test chat server');
}).listen(3001);

conn.on('connection', function(){
  console.log('Connection :: ready');
});

