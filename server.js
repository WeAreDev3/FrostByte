//
// # SimpleServer
//
// A simple server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));

io.configure(function() {

    io.set('log level', 0);

    io.set('authorization', function(handshakeData, callback) {
        callback(null, true); // error first callback style
    });

});

io.on('connection', function(client) {
    console.log('Client connected:', client.id);

    client.emit('onconnected', {
        id: client.id
    });

    client.on('input', function(input) {
        console.log(client.id, input);
    });

    client.on('disconnect', function() {
        console.log('Client disconnected:', client.id);
    });
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});
