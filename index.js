// var express = require('express');
// var io = require('socket.io');

// var app = express();
var port = process.env.PORT || 3000;

// app.use(express.static(__dirname + '/client'));

// app.listen(port, function(){
//   console.log('listening to port: ' + port);
// });

/**
*  Telnet Module
*/

var telnet = require('telnet');

telnet.createServer(function (client) {

  // make unicode characters work properly
  client.do.transmit_binary();

  // make the client emit 'window size' events
  client.do.window_size();

  // listen for the window size events from the client
  client.on('window size', function (e) {
    if (e.command === 'sb') {
      console.log('telnet window resized to %d x %d', e.width, e.height);
    }
  });

  // listen for the actual data from the client
  client.on('data', function (b) {
    client.write(b);
  });

  client.write('\nConnected to Telnet server!\n');

}).listen(port);

/*
* HTTP test
*/

// var http = require('http');
// var conn = http.createServer(function(req, res) {

//   req.on('data', function(data){
//     console.log(data);
//   });

//   res.on('data', function(data) {
//     console.log(data);
//   });

//   res.write('Welcome to the GungHo test chat server');
//   res.end();
// }).listen(port, function(){
//   console.log('listening to port: ' + port);
// });

// conn.on('data', function(data){
//   console.log(data);
// });




/**
* TCP
*/

// var net = require('net');
// var conn = net.createServer(function(socket) {
//   var sData = '<= ';
//   var cData = '=> ';

//   socket.on('data', function(data) {
//     input = '' + data;

//     if(input.indexOf('\n'))
//     socket.write('=> ' + input);

//     if(input === '/quit') {
//       socket.end('end');
//     }
//   });

//   socket.write(sData + 'Welcome to the GungHo test chat server\n');
//   socket.write(sData + 'Login Name?\n', function(data) {
//     input = '' + data;
//     console.log(input);
//   });

// }).listen(port);

// conn.on('connection', function(){
//   console.log('Connection :: ready');
// });

