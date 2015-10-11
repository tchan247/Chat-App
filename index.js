var express = require('express');
var io = require('socket.io');

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/client'));

app.listen(port, function(){
  console.log('listening to ' + port);
});
