var http = require('http'),
    path = require('path'),
    socketio = require('socket.io'),
    express = require('express'),
    lobby = require('./server/lobby')
    router = express(),
    server = http.createServer(router),
    io = socketio.listen(server);

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

    lobby.join(client);

    client.on('input', function(input) {
        console.log(client.id, input);
    });

    client.on('disconnect', function() {
        console.log('Client disconnected:', client.id);
    });
});

server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
    var addr = server.address();
    console.log('Server listening at', addr.address + ':' + addr.port);
});
