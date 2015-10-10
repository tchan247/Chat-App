var express = require('express');
var io = require('socket.io');

var app = express();
var devPort = 3000;

app.use(express.static(__dirname + '/client'));

app.listen(process.env.PORT || devPort, function(){
  console.log('listening to ' + (process.env.PORT || devPort));
});
